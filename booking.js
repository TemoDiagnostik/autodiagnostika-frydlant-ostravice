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

    const submitThroughHiddenFrame = (submitUrl) => {
      const frameName = "temo-booking-submit-frame";
      let frame = document.querySelector(`iframe[name='${frameName}']`);

      if (!frame) {
        frame = document.createElement("iframe");
        frame.name = frameName;
        frame.style.display = "none";
        frame.setAttribute("aria-hidden", "true");
        document.body.appendChild(frame);
      }

      form.action = submitUrl;
      form.method = "POST";
      form.target = frameName;

      HTMLFormElement.prototype.submit.call(form);
    };

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

      const submitUrl = config.submitUrl || apiUrl || form.getAttribute("action");
      if (!submitUrl) {
        window.alert(config.submitError || "The reservation could not be sent. Please try again.");
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = config.sendingLabel || "Sending...";
      }

      try {
        submitThroughHiddenFrame(submitUrl);
        window.setTimeout(() => {
          window.location.href = config.thankYouUrl || "thankyou.html";
        }, 1400);
      } catch (error) {
        console.error("Booking submission failed.", error);
        window.alert(config.submitError || "The reservation could not be sent. Please try again.");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = config.submitButtonLabel || "Send";
        }
      }
    });
  });
})();

(() => {
  "use strict";

  const applyServiceContent = () => {
    const lang = (document.documentElement.lang || "cs").toLowerCase().slice(0, 2);
    const content = {
      cs: {
        title: "Soukromá diagnostika, servis a opravy vozidel | Malenovice",
        meta: "Diagnostika, servis, údržba a opravy vozidel v Malenovicích u Frýdlantu nad Ostravicí. 35 let zkušeností, férové ceny a individuální přístup.",
        hero: "🛠️ Soukromá diagnostika, servis a opravy vozidel",
        tagline: "Bez stresu – v přírodě",
        intro: "Diagnostika, servis a opravy vozidel v klidném prostředí Malenovic (Frýdlant nad Ostravicí)",
        benefits: "Profesionální přístup • 35 let zkušeností • Férové ceny •",
        coffee: "Zatímco se postarám o Váš vůz, můžete si vychutnat kávu nebo čaj.",
        servicesHeading: "🔧 Diagnostika a servis",
        sectionHeading: "🔧 Servis a údržba vozidel",
        serviceTitle: "Servis a údržba vozidel",
        serviceSubtitle: "Servis, údržba a opravy po předchozí domluvě",
        serviceP1: "Provádím servis, údržbu a opravy vozidel po předchozí domluvě.",
        serviceP2: "Rozsah práce a cena jsou vždy stanoveny individuálně podle technického stavu vozidla a po dohodě se zákazníkem.",
        serviceP3: "Pro objednání prosím uveďte typ vozidla, rok výroby, VIN a stručný popis problému.",
        bookingTitle: "Důležité upozornění – Servisní práce:",
        bookingP1: "Pokud se Vaše rezervace týká servisu nebo opravy, uveďte prosím co nejpřesnější popis problému a VIN vozidla.",
        bookingP2: "Termín bude potvrzen po ověření rozsahu práce a dostupnosti.",
        about: "Dnes působím v klidném prostředí přírody v oblasti Frýdlant nad Ostravicí – Malenovice, kde může zákazník využít profesionálních služeb v oblasti diagnostiky, servisu a oprav vozidel a zároveň si vychutnat šálek kávy nebo čaje na zahradě, případně se projít po okolí.",
        price: "Servis, údržba a opravy vozidel: cena podle rozsahu práce a technického stavu vozidla"
      },
      de: {
        title: "Private Fahrzeugdiagnose, Wartung und Reparaturen | Malenovice",
        meta: "Fahrzeugdiagnose, Wartung und Reparaturen in Malenovice bei Frýdlant nad Ostravicí. 35 Jahre Erfahrung, faire Preise und individuelle Betreuung.",
        hero: "🛠️ Private Fahrzeugdiagnose, Wartung und Reparaturen",
        tagline: "Ganz ohne Stress – in der Natur",
        intro: "Fahrzeugdiagnose, Wartung und Reparaturen in der ruhigen Umgebung von Malenovice (Frýdlant nad Ostravicí)",
        benefits: "Professionelles Auftreten • 35 Jahre Erfahrung • Faire Preise •",
        coffee: "Während ich mich um Ihr Fahrzeug kümmere, können Sie eine Tasse Kaffee oder Tee genießen.",
        servicesHeading: "🔧 Diagnose und Fahrzeugservice",
        sectionHeading: "🔧 Fahrzeugservice und Wartung",
        serviceTitle: "Fahrzeugservice und Wartung",
        serviceSubtitle: "Service, Wartung und Reparaturen nach vorheriger Absprache",
        serviceP1: "Ich führe Service-, Wartungs- und Reparaturarbeiten nach vorheriger Absprache durch.",
        serviceP2: "Arbeitsumfang und Preis werden individuell nach dem technischen Zustand des Fahrzeugs und in Abstimmung mit dem Kunden festgelegt.",
        serviceP3: "Bitte geben Sie bei der Anfrage Fahrzeugtyp, Baujahr, VIN und eine kurze Beschreibung des Problems an.",
        bookingTitle: "Wichtiger Hinweis – Servicearbeiten:",
        bookingP1: "Wenn Ihre Anfrage Service- oder Reparaturarbeiten betrifft, geben Sie bitte eine möglichst genaue Problembeschreibung und die VIN des Fahrzeugs an.",
        bookingP2: "Der Termin wird nach Prüfung des Arbeitsumfangs und der Verfügbarkeit bestätigt.",
        about: "Heute arbeite ich in der ruhigen Naturumgebung von Frýdlant nad Ostravicí – Malenovice, wo Kunden professionelle Diagnose-, Wartungs- und Reparaturleistungen in Anspruch nehmen und gleichzeitig eine Tasse Kaffee oder Tee im Garten genießen oder einen Spaziergang in der Umgebung machen können.",
        price: "Fahrzeugservice, Wartung und Reparaturen: Preis nach Arbeitsumfang und technischem Zustand des Fahrzeugs"
      },
      en: {
        title: "Private Vehicle Diagnostics, Servicing and Repairs | Malenovice",
        meta: "Vehicle diagnostics, servicing, maintenance and repairs in Malenovice near Frýdlant nad Ostravicí. 35 years of experience, fair prices and personal service.",
        hero: "🛠️ Private vehicle diagnostics, servicing and repairs",
        tagline: "Without stress – in nature",
        intro: "Vehicle diagnostics, servicing and repairs in the calm surroundings of Malenovice (Frýdlant nad Ostravicí)",
        benefits: "Professional service • 35 years of experience • Fair prices •",
        coffee: "While I take care of your vehicle, you can enjoy a cup of coffee or tea.",
        servicesHeading: "🔧 Diagnostics and vehicle service",
        sectionHeading: "🔧 Vehicle service and maintenance",
        serviceTitle: "Vehicle service and maintenance",
        serviceSubtitle: "Servicing, maintenance and repairs by prior arrangement",
        serviceP1: "I provide vehicle servicing, maintenance and repairs by prior arrangement.",
        serviceP2: "The scope of work and price are always determined individually according to the vehicle’s technical condition and in agreement with the customer.",
        serviceP3: "When booking, please provide the vehicle type, year, VIN and a brief description of the problem.",
        bookingTitle: "Important notice – Service work:",
        bookingP1: "If your booking concerns servicing or repairs, please provide the most accurate possible description of the problem and the vehicle VIN.",
        bookingP2: "The appointment will be confirmed after reviewing the scope of work and availability.",
        about: "Today, I operate in the peaceful natural surroundings of Frýdlant nad Ostravicí – Malenovice, where customers can benefit from professional diagnostics, servicing and vehicle repairs while enjoying a cup of coffee or tea in the garden, or taking a walk nearby.",
        price: "Vehicle servicing, maintenance and repairs: price according to the scope of work and the vehicle’s technical condition"
      }
    };

    const t = content[lang] || content.cs;
    document.title = t.title;

    const setMeta = (selector, value) => {
      const element = document.querySelector(selector);
      if (element) element.setAttribute("content", value);
    };

    setMeta('meta[name="description"]', t.meta);
    setMeta('meta[property="og:title"]', t.title);
    setMeta('meta[property="og:description"]', t.meta);

    const hero = document.querySelector("h1");
    if (hero) {
      hero.innerHTML = `${t.hero}<br>${t.tagline}`;
      const intro = hero.parentElement && hero.parentElement.querySelector("p");
      if (intro) {
        intro.innerHTML = `${t.intro}<br>${t.benefits}<br>${t.coffee}`;
      }
    }

    const headings = Array.from(document.querySelectorAll("h3"));
    const diagnosticHeading = headings.find((heading) =>
      /Diagnostické služby|Diagnose-Dienstleistungen|Diagnostic Services/i.test(heading.textContent)
    );
    if (diagnosticHeading) diagnosticHeading.textContent = t.servicesHeading;

    const navigationHeading = headings.find((heading) =>
      /Navigace|Navigation/i.test(heading.textContent)
    );

    if (navigationHeading) {
      navigationHeading.textContent = t.sectionHeading;
      const serviceContainer = navigationHeading.nextElementSibling;
      const servicePanel = serviceContainer && serviceContainer.nextElementSibling;

      if (serviceContainer) {
        const icon = serviceContainer.querySelector("img");
        if (icon) {
          icon.src = "icons/reset.png";
          icon.alt = t.serviceTitle;
          icon.style.width = "52px";
          icon.style.height = "52px";
        }

        const titleElement = serviceContainer.querySelector(".service-button > div span");
        const subtitleElement = serviceContainer.querySelector(".service-button > span");
        if (titleElement) {
          titleElement.innerHTML = `${t.serviceTitle} <span style="font-size: 16px;">▼</span>`;
        }
        if (subtitleElement) subtitleElement.textContent = t.serviceSubtitle;
      }

      if (servicePanel) {
        servicePanel.innerHTML = `
          <div style="color:#EBDBB1; font-size:15px; line-height:1.7; padding:10px 0;">
            <p>${t.serviceP1}</p>
            <p>${t.serviceP2}</p>
            <p>${t.serviceP3}</p>
          </div>`;
      }
    }

    const warningStrong = Array.from(document.querySelectorAll(".reservation-form strong")).find((element) =>
      /map|kart|naviga/i.test(element.textContent)
    );
    const warningBox = warningStrong && warningStrong.parentElement;
    if (warningBox) {
      warningBox.innerHTML = `
        <strong style="color:#cc0000;">${t.bookingTitle}</strong><br>
        ${t.bookingP1}<br>
        ${t.bookingP2}`;
    }

    const aboutParagraph = Array.from(document.querySelectorAll("p")).find((paragraph) =>
      /Malenovice/i.test(paragraph.textContent) &&
      /Dnes|Heute|Today/i.test(paragraph.textContent) &&
      /diagnost|Diagnose/i.test(paragraph.textContent)
    );
    if (aboutParagraph) aboutParagraph.textContent = t.about;

    const priceContainers = Array.from(document.querySelectorAll(".service-container"));
    const priceContainer = priceContainers.find((container) =>
      /Ceník|Preisliste|Price list/i.test(container.textContent)
    );
    const pricePanel = priceContainer && priceContainer.nextElementSibling;
    const priceList = pricePanel && pricePanel.querySelector("ul");
    if (priceList && !Array.from(priceList.querySelectorAll("li")).some((item) =>
      /Servis, údržba|Fahrzeugservice|Vehicle servicing/i.test(item.textContent)
    )) {
      const item = document.createElement("li");
      item.textContent = t.price;
      priceList.appendChild(item);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyServiceContent);
  } else {
    applyServiceContent();
  }
})();