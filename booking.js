(() => {
  "use strict";

  const moveVehicleServiceFirst = () => {
    const headings = Array.from(document.querySelectorAll("h3"));
    const mainHeading = headings.find((heading) =>
      /Diagnostické služby|Diagnose-Dienstleistungen|Diagnostic Services|Servis a diagnostika|Fahrzeugservice und Diagnose|Vehicle servicing and diagnostics/i.test(heading.textContent)
    );

    const serviceHeading = headings.find((heading) =>
      /Navigace a software|Navigation und Software|Navigation and software|Opravy vozidel|Fahrzeugreparaturen|Vehicle repairs/i.test(heading.textContent)
    );

    if (!mainHeading || !serviceHeading) return;

    const serviceContainer = serviceHeading.nextElementSibling;
    const servicePanel = serviceContainer && serviceContainer.nextElementSibling;
    if (!serviceContainer || !serviceContainer.classList.contains("service-container") || !servicePanel) return;

    const firstService = Array.from(document.querySelectorAll(".service-container")).find((container) =>
      /Resetování systémových funkcí|Systemfunktionen zurücksetzen|Reset system functions/i.test(container.textContent)
    );

    if (!firstService || !firstService.parentNode) return;

    firstService.parentNode.insertBefore(serviceContainer, firstService);
    firstService.parentNode.insertBefore(servicePanel, firstService);
    serviceHeading.remove();
  };

  moveVehicleServiceFirst();

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

    if (!form || !dateInput || !timeSelect || !vinInput || !vinError) return;
    if (typeof window.flatpickr !== "function") return;

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
      const fullDays = Array.isArray(data && data.fullDays) ? data.fullDays.map(String) : [];
      const sourceSlots = data && data.timeSlots && typeof data.timeSlots === "object" ? data.timeSlots : {};
      const timeSlots = {};

      Object.keys(sourceSlots).forEach((dateKey) => {
        timeSlots[dateKey] = Array.isArray(sourceSlots[dateKey]) ? sourceSlots[dateKey].map(String) : [];
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

    if (config.locale && config.locale !== "default") calendarOptions.locale = config.locale;

    resetTimeSelect();
    timeSelect.disabled = true;
    calendar = window.flatpickr(dateInput, calendarOptions);

    if (apiUrl) {
      fetch(apiUrl, { method: "GET", cache: "no-store" })
        .then((response) => {
          if (!response.ok) throw new Error(`Availability request failed with status ${response.status}`);
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
        .catch((error) => console.warn("Booked appointments could not be loaded.", error));
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
        if (!date) dateInput.focus();
        else timeSelect.focus();
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

  const applyServiceContent = () => {
    const lang = (document.documentElement.lang || "cs").toLowerCase().slice(0, 2);
    const content = {
      cs: {
        title: "Soukromý servis, opravy a diagnostika vozidel | Malenovice",
        meta: "Servis, údržba, opravy a diagnostika vozidel v Malenovicích u Frýdlantu nad Ostravicí. 35 let zkušeností, férové ceny a individuální přístup.",
        hero: "🛠️ Soukromý servis, opravy a diagnostika vozidel",
        tagline: "Bez stresu – v přírodě",
        intro: "Servis, opravy a diagnostika vozidel v klidném prostředí Malenovic (Frýdlant nad Ostravicí)",
        benefits: "Profesionální přístup • 35 let zkušeností • Férové ceny •",
        dropoff: "Vozidlo u mě můžete po předchozí domluvě ponechat. Po dokončení práce Vás budu kontaktovat.",
        servicesHeading: "🔧 Servis a diagnostika vozidel",
        serviceTitle: "Servis a opravy vozidel",
        serviceSubtitle: "Servis, údržba a opravy po předchozí domluvě",
        serviceP1: "Provádím servis, údržbu a opravy vozidel po předchozí domluvě.",
        serviceP2: "Rozsah práce a cena jsou vždy stanoveny individuálně podle technického stavu vozidla a po dohodě se zákazníkem.",
        serviceP3: "Pro objednání prosím uveďte typ vozidla, rok výroby, VIN a stručný popis problému.",
        bookingTitle: "Důležité upozornění – Servisní práce:",
        bookingP1: "Pokud se Vaše rezervace týká servisu nebo opravy, uveďte prosím co nejpřesnější popis problému a VIN vozidla.",
        bookingP2: "Termín bude potvrzen po ověření rozsahu práce a dostupnosti.",
        experience: "Jsem profesionální automechanik s více než 35 lety zkušeností v oblasti oprav a diagnostiky vozidel, z toho 14 let praxe v Německu (Stuttgart). Během své kariéry jsem se specializoval na propojení klasických mechanických znalostí s moderními elektronickými systémy, což mi umožňuje přesně identifikovat závady a navrhnout účinná řešení.",
        about: "Dnes působím v klidném prostředí přírody v oblasti Frýdlant nad Ostravicí – Malenovice, kde nabízím profesionální servis, opravy a diagnostiku vozidel. Vozidlo lze po předchozí domluvě ponechat a po dokončení práce zákazníka kontaktuji.",
        price: "Servis, údržba a opravy vozidel: cena podle rozsahu práce a technického stavu vozidla"
      },
      de: {
        title: "Privater Fahrzeugservice, Reparaturen und Diagnose | Malenovice",
        meta: "Fahrzeugservice, Wartung, Reparaturen und Diagnose in Malenovice bei Frýdlant nad Ostravicí. 35 Jahre Erfahrung und faire Preise.",
        hero: "🛠️ Privater Fahrzeugservice, Reparaturen und Diagnose",
        tagline: "Ganz ohne Stress – in der Natur",
        intro: "Fahrzeugservice, Reparaturen und Diagnose in der ruhigen Umgebung von Malenovice (Frýdlant nad Ostravicí)",
        benefits: "Professioneller Service • 35 Jahre Erfahrung • Faire Preise •",
        dropoff: "Sie können Ihr Fahrzeug nach vorheriger Absprache bei mir abstellen. Nach Abschluss der Arbeiten werde ich Sie kontaktieren.",
        servicesHeading: "🔧 Fahrzeugservice und Diagnose",
        serviceTitle: "Fahrzeugservice und Reparaturen",
        serviceSubtitle: "Service, Wartung und Reparaturen nach vorheriger Absprache",
        serviceP1: "Ich führe Service-, Wartungs- und Reparaturarbeiten nach vorheriger Absprache durch.",
        serviceP2: "Arbeitsumfang und Preis werden individuell nach dem technischen Zustand des Fahrzeugs und in Abstimmung mit dem Kunden festgelegt.",
        serviceP3: "Bitte geben Sie bei der Anfrage Fahrzeugtyp, Baujahr, VIN und eine kurze Beschreibung des Problems an.",
        bookingTitle: "Wichtiger Hinweis – Servicearbeiten:",
        bookingP1: "Wenn Ihre Anfrage Service- oder Reparaturarbeiten betrifft, geben Sie bitte eine möglichst genaue Problembeschreibung und die VIN des Fahrzeugs an.",
        bookingP2: "Der Termin wird nach Prüfung des Arbeitsumfangs und der Verfügbarkeit bestätigt.",
        experience: "Ich bin professioneller Kfz-Mechaniker mit mehr als 35 Jahren Erfahrung in der Fahrzeugreparatur und -diagnose, davon 14 Jahre Berufserfahrung in Deutschland (Stuttgart). Im Laufe meiner Karriere habe ich mich auf die Verbindung klassischer mechanischer Kenntnisse mit modernen elektronischen Systemen spezialisiert, um Fehler präzise zu erkennen und wirksame Lösungen vorzuschlagen.",
        about: "Heute arbeite ich in der ruhigen Naturumgebung von Frýdlant nad Ostravicí – Malenovice und biete professionellen Fahrzeugservice, Reparaturen und Diagnose an. Das Fahrzeug kann nach vorheriger Absprache abgestellt werden; nach Abschluss der Arbeiten kontaktiere ich den Kunden.",
        price: "Fahrzeugservice, Wartung und Reparaturen: Preis nach Arbeitsumfang und technischem Zustand des Fahrzeugs"
      },
      en: {
        title: "Private Vehicle Servicing, Repairs and Diagnostics | Malenovice",
        meta: "Vehicle servicing, maintenance, repairs and diagnostics in Malenovice near Frýdlant nad Ostravicí. 35 years of experience and fair prices.",
        hero: "🛠️ Private vehicle servicing, repairs and diagnostics",
        tagline: "Without stress – in nature",
        intro: "Vehicle servicing, repairs and diagnostics in the calm surroundings of Malenovice (Frýdlant nad Ostravicí)",
        benefits: "Professional service • 35 years of experience • Fair prices •",
        dropoff: "You may leave your vehicle with me by prior arrangement. I will contact you when the work is completed.",
        servicesHeading: "🔧 Vehicle servicing and diagnostics",
        serviceTitle: "Vehicle servicing and repairs",
        serviceSubtitle: "Servicing, maintenance and repairs by prior arrangement",
        serviceP1: "I provide vehicle servicing, maintenance and repairs by prior arrangement.",
        serviceP2: "The scope of work and price are determined individually according to the vehicle’s technical condition and in agreement with the customer.",
        serviceP3: "When booking, please provide the vehicle type, year, VIN and a brief description of the problem.",
        bookingTitle: "Important notice – Service work:",
        bookingP1: "If your booking concerns servicing or repairs, please provide the most accurate possible description of the problem and the vehicle VIN.",
        bookingP2: "The appointment will be confirmed after reviewing the scope of work and availability.",
        experience: "I am a professional vehicle mechanic with more than 35 years of experience in vehicle repairs and diagnostics, including 14 years of professional experience in Germany (Stuttgart). Throughout my career, I have specialised in combining traditional mechanical expertise with modern electronic systems, allowing me to identify faults accurately and propose effective solutions.",
        about: "I operate in the peaceful surroundings of Frýdlant nad Ostravicí – Malenovice and provide professional vehicle servicing, repairs and diagnostics. The vehicle may be left by prior arrangement, and I will contact the customer when the work is completed.",
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
      if (intro) intro.innerHTML = `${t.intro}<br>${t.benefits}<br>${t.dropoff}`;
    }

    const headings = Array.from(document.querySelectorAll("h3"));
    const mainHeading = headings.find((heading) =>
      /Diagnostické služby|Diagnose-Dienstleistungen|Diagnostic Services|Servis a diagnostika|Fahrzeugservice und Diagnose|Vehicle servicing and diagnostics/i.test(heading.textContent)
    );
    if (mainHeading) mainHeading.textContent = t.servicesHeading;

    const serviceContainer = Array.from(document.querySelectorAll(".service-container")).find((container) =>
      /Aktualizace map a systémů|Karten- und Systemaktualisierung|Map and system updates|Opravy a údržba vozidel|Fahrzeugservice und Wartung|Vehicle service and maintenance|Servis a opravy vozidel|Fahrzeugservice und Reparaturen|Vehicle servicing and repairs/i.test(container.textContent)
    );

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
      if (titleElement) titleElement.innerHTML = `${t.serviceTitle} <span style="font-size:16px;">▼</span>`;
      if (subtitleElement) subtitleElement.textContent = t.serviceSubtitle;
    }

    if (servicePanel && servicePanel.classList.contains("accordion-panel")) {
      servicePanel.innerHTML = `<div style="color:#EBDBB1;font-size:15px;line-height:1.7;padding:10px 0;"><p>${t.serviceP1}</p><p>${t.serviceP2}</p><p>${t.serviceP3}</p></div>`;
    }

    const warningBox = document.querySelector(".reservation-form div[style*='fffacd']");
    if (warningBox) {
      warningBox.innerHTML = `<strong style="color:#cc0000;">${t.bookingTitle}</strong><br>${t.bookingP1}<br>${t.bookingP2}`;
    }

    const aboutContainer = Array.from(document.querySelectorAll(".service-container")).find((container) =>
      /O mně|Über mich|About me/i.test(container.textContent)
    );
    const aboutPanel = aboutContainer && aboutContainer.nextElementSibling;
    const aboutParagraphs = aboutPanel ? Array.from(aboutPanel.querySelectorAll("p")) : [];
    if (aboutParagraphs[0]) aboutParagraphs[0].textContent = t.experience;
    const locationParagraph = aboutParagraphs.find((paragraph) => /Malenovice/i.test(paragraph.textContent));
    if (locationParagraph) locationParagraph.textContent = t.about;

    const priceContainer = Array.from(document.querySelectorAll(".service-container")).find((container) =>
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