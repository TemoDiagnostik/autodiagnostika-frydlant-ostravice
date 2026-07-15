(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const config = window.TEMO_BOOKING_CONFIG || {};
    const apiUrl = config.apiUrl;
    const allTimes = Array.isArray(config.allTimes) && config.allTimes.length
      ? config.allTimes
      : ["10:00", "11:30", "13:00", "14:30", "16:00", "17:30", "19:00"];

    const form = document.getElementById("booking-form");
    const dateInput = document.getElementById("datepicker");
    const timeSelect = document.getElementById("timepicker");
    const vinInput = document.getElementById("vin");
    const vinError = document.getElementById("vin-error");

    if (!form || !dateInput || !timeSelect || !vinInput || !vinError) {
      console.error("Booking form initialization failed: required form elements are missing.");
      return;
    }

    if (typeof window.flatpickr !== "function") {
      console.error("Booking form initialization failed: Flatpickr is not available.");
      return;
    }

    const submitBtn = form.querySelector("button[type='submit']");
    let bookedSlots = { fullDays: [], timeSlots: {} };
    let calendar = null;

    const toDateKey = (date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const normalizeBookedSlots = (data) => {
      const fullDays = Array.isArray(data && data.fullDays)
        ? data.fullDays.map(String)
        : [];

      const sourceSlots = data && data.timeSlots && typeof data.timeSlots === "object"
        ? data.timeSlots
        : {};

      const timeSlots = {};
      Object.keys(sourceSlots).forEach((dateKey) => {
        timeSlots[dateKey] = Array.isArray(sourceSlots[dateKey])
          ? sourceSlots[dateKey].map(String)
          : [];
      });

      return { fullDays, timeSlots };
    };

    const isDateDisabled = (date) => {
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      return isWeekend || bookedSlots.fullDays.includes(toDateKey(date));
    };

    const resetTimeSelect = () => {
      timeSelect.innerHTML = "";
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = config.timePlaceholder || "Select time";
      timeSelect.appendChild(placeholder);
      timeSelect.value = "";
    };

    const populateTimes = (date) => {
      resetTimeSelect();

      if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        timeSelect.disabled = true;
        return;
      }

      const bookedTimes = bookedSlots.timeSlots[toDateKey(date)] || [];

      allTimes.forEach((time) => {
        const option = document.createElement("option");
        option.value = time;

        if (bookedTimes.includes(time)) {
          option.textContent = `${time} (${config.busyLabel || "Busy"})`;
          option.disabled = true;
          option.style.color = "red";
          option.style.fontWeight = "bold";
        } else {
          option.textContent = time;
        }

        timeSelect.appendChild(option);
      });

      timeSelect.disabled = false;
    };

    const calendarOptions = {
      enableTime: false,
      dateFormat: "d.m.Y",
      minDate: "today",
      disableMobile: true,
      allowInput: false,
      disable: [isDateDisabled],
      onChange(selectedDates) {
        populateTimes(selectedDates[0]);
      }
    };

    if (config.locale && config.locale !== "default") {
      calendarOptions.locale = config.locale;
    }

    resetTimeSelect();
    timeSelect.disabled = true;
    calendar = window.flatpickr(dateInput, calendarOptions);

    if (apiUrl) {
      fetch(apiUrl, { method: "GET", cache: "no-store" })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Availability request failed with status ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          bookedSlots = normalizeBookedSlots(data);
          calendar.set("disable", [isDateDisabled]);
          calendar.redraw();

          const selectedDate = calendar.selectedDates[0];
          if (selectedDate && isDateDisabled(selectedDate)) {
            calendar.clear();
            populateTimes(null);
          } else if (selectedDate) {
            populateTimes(selectedDate);
          }
        })
        .catch((error) => {
          console.warn("Booked appointments could not be loaded; the booking form remains usable.", error);
        });
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const date = dateInput.value.trim();
      const time = timeSelect.value;
      const vin = vinInput.value.trim().toUpperCase();

      vinInput.value = vin;
      vinInput.style.borderColor = "#ccc";
      vinError.style.display = "none";

      if (!date || !time) {
        window.alert(config.dateTimeError || "Please select a date and time.");
        if (!date) {
          dateInput.focus();
        } else {
          timeSelect.focus();
        }
        return;
      }

      if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) {
        vinInput.style.borderColor = "red";
        vinError.textContent = config.vinError || "The VIN is invalid.";
        vinError.style.display = "block";
        vinInput.focus();
        return;
      }

      if (!apiUrl) {
        window.alert(config.submitError || "The reservation could not be sent. Please try again.");
        return;
      }

      const originalButtonText = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = config.sendingLabel || "Sending...";
      }

      fetch(apiUrl, {
        method: "POST",
        body: new FormData(form)
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Booking request failed with status ${response.status}`);
          }
          window.location.href = config.thankYouUrl || "thankyou.html";
        })
        .catch((error) => {
          console.error("Booking submission failed.", error);
          window.alert(config.submitError || "The reservation could not be sent. Please try again.");
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalButtonText;
          }
        });
    });
  });
})();
