(() => {
  "use strict";

  const language = (document.documentElement.lang || "cs").toLowerCase().slice(0, 2);

  const copy = {
    cs: {
      title: "Kontakt pouze písemně přes WhatsApp",
      body: "Nové požadavky, technické dotazy a domluvu termínu přijímám pouze písemně přes WhatsApp. Uveďte prosím značku a model vozidla, rok výroby, VIN a stručný popis problému.",
      note: "Telefonické objednávky nepřijímám. Rozsah práce, cena a termín budou potvrzeny písemně před zahájením práce.",
      button: "Napsat na WhatsApp",
      phoneLabel: "WhatsApp číslo",
      phonePlaceholder: "Zadejte číslo používané na WhatsApp",
      aboutSubtitle: "35 let zkušeností s automechanikou a diagnostikou vozidel",
      aboutParagraphs: [
        "Jsem automechanik a diagnostik vozidel s více než 35 lety odborné praxe, z toho 14 let v Německu, převážně v oblasti Stuttgartu. Propojuji zkušenosti z klasické automobilové mechaniky se znalostmi moderní elektroniky a diagnostické techniky. Díky tomu dokážu závadu přesněji lokalizovat a navrhnout vhodný postup opravy.",
        "V Malenovicích u Frýdlantu nad Ostravicí nabízím diagnostiku vozidel, údržbu a opravy po předchozí domluvě. Rozsah práce a předběžná cena jsou vždy písemně dohodnuty před zahájením práce. Vozidlo u mě může po dohodě během opravy zůstat a po dokončení zákazníka informuji.",
        "Česky se domluvím, ale čeština není můj mateřský jazyk. U technických detailů proto preferuji písemnou komunikaci přes WhatsApp, aby byly požadavky zákazníka, rozsah práce a dohoda vždy jasné a přesné. Německy a anglicky mluvím dobře."
      ],
      message: "Dobrý den, mám zájem o diagnostiku nebo opravu vozidla. Značka a model: … Rok výroby: … VIN: … Popis problému: …",
      contactTitle: "Kontaktujte mě",
      contactNote: "Pro dotazy a domluvu termínu mě prosím kontaktujte písemně.",
      contactWhatsapp: "WhatsApp",
      contactEmail: "E-mail"
    },
    de: {
      title: "Kontakt ausschließlich schriftlich über WhatsApp",
      body: "Neue Anfragen, technische Fragen und Terminabsprachen nehme ich ausschließlich schriftlich über WhatsApp entgegen. Bitte nennen Sie Marke und Modell, Baujahr, VIN und eine kurze Problembeschreibung.",
      note: "Telefonische Aufträge nehme ich nicht an. Arbeitsumfang, Preis und Termin werden vor Arbeitsbeginn schriftlich bestätigt.",
      button: "Über WhatsApp schreiben",
      phoneLabel: "WhatsApp-Nummer",
      phonePlaceholder: "Ihre bei WhatsApp verwendete Nummer",
      aboutSubtitle: "35 Jahre Erfahrung in Fahrzeugmechanik und Fahrzeugdiagnose",
      aboutParagraphs: [
        "Ich bin Kfz-Mechaniker und Fahrzeugdiagnostiker mit mehr als 35 Jahren Berufserfahrung, davon 14 Jahre in Deutschland, überwiegend im Raum Stuttgart. Ich verbinde meine Erfahrung in der klassischen Fahrzeugmechanik mit Kenntnissen moderner Elektronik und Diagnosetechnik. Dadurch kann ich Fehler genauer eingrenzen und einen geeigneten Reparaturweg empfehlen.",
        "In Malenovice bei Frýdlant nad Ostravicí biete ich Fahrzeugdiagnose, Wartung und Reparaturen nach vorheriger Absprache an. Arbeitsumfang und voraussichtlicher Preis werden vor Beginn der Arbeiten stets schriftlich vereinbart. Nach Absprache kann das Fahrzeug während der Reparatur bei mir bleiben; nach Abschluss informiere ich den Kunden.",
        "Ich kann mich auf Tschechisch verständigen, aber Tschechisch ist nicht meine Muttersprache. Bei technischen Details bevorzuge ich deshalb die schriftliche Kommunikation über WhatsApp, damit Kundenwünsche, Arbeitsumfang und Vereinbarungen stets klar und präzise bleiben. Deutsch und Englisch spreche ich gut."
      ],
      message: "Guten Tag, ich interessiere mich für eine Fahrzeugdiagnose oder Reparatur. Marke und Modell: … Baujahr: … VIN: … Problembeschreibung: …",
      contactTitle: "Kontaktieren Sie mich",
      contactNote: "Bitte kontaktieren Sie mich für Anfragen und Terminabsprachen schriftlich.",
      contactWhatsapp: "WhatsApp",
      contactEmail: "E-Mail"
    },
    en: {
      title: "Written contact only via WhatsApp",
      body: "I accept new requests, technical questions and appointment arrangements only in writing via WhatsApp. Please include the vehicle make and model, year, VIN and a brief description of the problem.",
      note: "I do not accept bookings by telephone. The scope of work, price and appointment will be confirmed in writing before work begins.",
      button: "Write on WhatsApp",
      phoneLabel: "WhatsApp number",
      phonePlaceholder: "Enter the number you use on WhatsApp",
      aboutSubtitle: "35 years of experience in vehicle mechanics and diagnostics",
      aboutParagraphs: [
        "I am an automotive mechanic and vehicle diagnostics specialist with more than 35 years of professional experience, including 14 years in Germany, mainly in the Stuttgart area. I combine experience in traditional vehicle mechanics with knowledge of modern electronics and diagnostic technology. This enables me to locate faults more precisely and recommend an appropriate repair procedure.",
        "In Malenovice near Frýdlant nad Ostravicí, I provide vehicle diagnostics, maintenance and repairs by prior arrangement. The scope of work and estimated price are always agreed in writing before work begins. By arrangement, the vehicle may remain with me during the repair, and I inform the customer when the work is complete.",
        "I can communicate in Czech, but Czech is not my native language. For technical details, I therefore prefer written communication via WhatsApp so that the customer's requirements, the scope of work and all agreements remain clear and precise. I speak German and English well."
      ],
      message: "Hello, I am interested in vehicle diagnostics or repair. Make and model: … Year: … VIN: … Problem description: …",
      contactTitle: "Contact me",
      contactNote: "Please contact me in writing for enquiries and appointment arrangements.",
      contactWhatsapp: "WhatsApp",
      contactEmail: "Email"
    }
  };

  const t = copy[language] || copy.cs;
  const whatsappNumber = "420730443768";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(t.message)}`;

  const removePriceSection = () => {
    const containers = Array.from(document.querySelectorAll(".service-container"));
    containers.forEach((container) => {
      if (!/Ceník|Preisliste|Price list/i.test(container.textContent || "")) return;
      const panel = container.nextElementSibling;
      if (panel?.classList.contains("accordion-panel")) panel.remove();
      container.remove();
    });
  };

  const updateAboutSection = () => {
    const aboutContainer = Array.from(document.querySelectorAll(".service-container")).find((item) =>
      /O mně|Über mich|About me/i.test(item.textContent || "")
    );
    if (!aboutContainer) return;

    const subtitle = aboutContainer.querySelector(".service-button > span");
    if (subtitle) subtitle.textContent = t.aboutSubtitle;

    const panel = aboutContainer.nextElementSibling;
    if (!panel?.classList.contains("accordion-panel")) return;

    panel.innerHTML = t.aboutParagraphs
      .map((paragraph) => `<p style="margin:18px 0;color:#EBDBB1;font-size:16px;line-height:1.7;">${paragraph}</p>`)
      .join("");
    panel.style.padding = "0 20px";
    panel.style.maxWidth = "500px";
    panel.style.margin = "0 auto 18px auto";
  };

  const addWhatsAppContact = () => {
    const reservation = document.querySelector(".reservation-form");
    if (!reservation) return;

    if (!document.getElementById("whatsapp-written-contact")) {
      const box = document.createElement("div");
      box.id = "whatsapp-written-contact";
      box.style.cssText = "background:rgba(0,0,0,.72);border:1px solid rgba(235,219,177,.88);border-radius:12px;padding:18px;margin:0 auto 22px;color:#EBDBB1;text-align:center;line-height:1.6;box-shadow:0 2px 8px rgba(0,0,0,.25);";
      box.innerHTML = `
        <div style="font-size:20px;font-weight:700;margin-bottom:8px;">💬 ${t.title}</div>
        <div style="font-size:15px;margin-bottom:10px;">${t.body}</div>
        <div style="font-size:13px;margin-bottom:14px;opacity:.94;">${t.note}</div>
        <a href="${whatsappUrl}" target="_blank" rel="noopener" aria-label="${t.button}" style="display:inline-block;background:#EBDBB1;color:#2b2b2b;text-decoration:none;font-weight:700;padding:11px 18px;border-radius:9px;border:1px solid rgba(255,255,255,.28);box-shadow:0 2px 5px rgba(0,0,0,.22);">${t.button}</a>`;

      const heading = reservation.querySelector("h2");
      if (heading) heading.insertAdjacentElement("afterend", box);
      else reservation.insertBefore(box, reservation.firstChild);
    }

    const phoneInput = document.getElementById("clientPhone");
    if (phoneInput) {
      const label = document.querySelector('label[for="clientPhone"]');
      if (label) label.textContent = t.phoneLabel;
      phoneInput.placeholder = t.phonePlaceholder;
      phoneInput.setAttribute("autocomplete", "tel");
    }

    const emailLink = reservation.querySelector('a[href^="mailto:"]');
    const contactLine = emailLink?.parentElement;
    if (contactLine) {
      contactLine.innerHTML = `💬 <a href="${whatsappUrl}" target="_blank" rel="noopener" style="color:#EBDBB1;text-decoration:none;font-weight:700;">${t.button}</a>`;
    }
  };

  const addBottomContactCard = () => {
    if (document.getElementById("temo-bottom-contact")) return;

    const email = "diagnostika@temosliving.de";
    const section = document.createElement("section");
    section.id = "temo-bottom-contact";
    section.setAttribute("aria-label", t.contactTitle);
    section.style.cssText = "max-width:500px;margin:26px auto 100px;padding:18px;background:rgba(0,0,0,.72);border:1px solid rgba(235,219,177,.88);border-radius:12px;color:#EBDBB1;text-align:center;box-shadow:0 3px 10px rgba(0,0,0,.28);";
    section.innerHTML = `
      <div style="font-size:22px;font-weight:700;margin-bottom:8px;">💬 ${t.contactTitle}</div>
      <div style="font-size:14px;line-height:1.55;margin-bottom:16px;opacity:.95;">${t.contactNote}</div>
      <a href="${whatsappUrl}" target="_blank" rel="noopener" style="display:block;margin:0 0 10px;padding:12px 14px;border:1px solid rgba(235,219,177,.72);border-radius:9px;background:rgba(43,43,43,.92);color:#EBDBB1;text-decoration:none;font-weight:700;line-height:1.35;">
        <span style="display:block;font-size:13px;font-weight:400;opacity:.88;">${t.contactWhatsapp}</span>
        <span style="font-size:17px;">+420 730 443 768</span>
      </a>
      <a href="mailto:${email}" style="display:block;padding:12px 14px;border:1px solid rgba(235,219,177,.72);border-radius:9px;background:rgba(43,43,43,.92);color:#EBDBB1;text-decoration:none;font-weight:700;line-height:1.35;">
        <span style="display:block;font-size:13px;font-weight:400;opacity:.88;">${t.contactEmail}</span>
        <span style="font-size:16px;overflow-wrap:anywhere;">${email}</span>
      </a>`;

    document.body.appendChild(section);
  };

  const disableTelephoneContact = () => {
    document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
      link.href = whatsappUrl;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = t.button;
      link.setAttribute("aria-label", t.button);
    });

    document.querySelectorAll("a, button").forEach((element) => {
      const label = (element.textContent || "").trim();
      if (!/^(Zavolat|Volat|Anrufen|Call|Call now)$/i.test(label)) return;
      if (element.tagName === "A") {
        element.href = whatsappUrl;
        element.target = "_blank";
        element.rel = "noopener";
      }
      element.textContent = t.button;
    });
  };

  const applyPolicy = () => {
    removePriceSection();
    updateAboutSection();
    addWhatsAppContact();
    addBottomContactCard();
    disableTelephoneContact();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.setTimeout(applyPolicy, 0));
  } else {
    window.setTimeout(applyPolicy, 0);
  }
})();