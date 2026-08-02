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
      aboutLanguage: "Česky se domluvím, ale čeština není můj mateřský jazyk. U technických detailů proto preferuji písemnou komunikaci přes WhatsApp, aby byly požadavky, rozsah práce a dohoda vždy přesné. Německy a anglicky mluvím dobře.",
      message: "Dobrý den, mám zájem o diagnostiku nebo opravu vozidla. Značka a model: … Rok výroby: … VIN: … Popis problému: …"
    },
    de: {
      title: "Kontakt ausschließlich schriftlich über WhatsApp",
      body: "Neue Anfragen, technische Fragen und Terminabsprachen nehme ich ausschließlich schriftlich über WhatsApp entgegen. Bitte nennen Sie Marke und Modell, Baujahr, VIN und eine kurze Problembeschreibung.",
      note: "Telefonische Aufträge nehme ich nicht an. Arbeitsumfang, Preis und Termin werden vor Arbeitsbeginn schriftlich bestätigt.",
      button: "Über WhatsApp schreiben",
      phoneLabel: "WhatsApp-Nummer",
      phonePlaceholder: "Ihre bei WhatsApp verwendete Nummer",
      aboutLanguage: "Tschechisch ist nicht meine Muttersprache; im Alltag kann ich mich verständigen. Bei technischen Details bevorzuge ich deshalb die schriftliche Kommunikation über WhatsApp, damit Anforderungen, Arbeitsumfang und Vereinbarungen eindeutig bleiben. Deutsch und Englisch spreche ich gut.",
      message: "Guten Tag, ich interessiere mich für eine Fahrzeugdiagnose oder Reparatur. Marke und Modell: … Baujahr: … VIN: … Problembeschreibung: …"
    },
    en: {
      title: "Written contact only via WhatsApp",
      body: "I accept new requests, technical questions and appointment arrangements only in writing via WhatsApp. Please include the vehicle make and model, year, VIN and a brief description of the problem.",
      note: "I do not accept bookings by telephone. The scope of work, price and appointment will be confirmed in writing before work begins.",
      button: "Write on WhatsApp",
      phoneLabel: "WhatsApp number",
      phonePlaceholder: "Enter the number you use on WhatsApp",
      aboutLanguage: "Czech is not my native language, although I can communicate in everyday situations. For technical details, I therefore prefer written communication via WhatsApp so that requirements, the scope of work and all agreements remain precise. I speak German and English well.",
      message: "Hello, I am interested in vehicle diagnostics or repair. Make and model: … Year: … VIN: … Problem description: …"
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

  const updateAboutLanguage = () => {
    const aboutContainer = Array.from(document.querySelectorAll(".service-container")).find((item) =>
      /O mně|Über mich|About me/i.test(item.textContent || "")
    );
    const panel = aboutContainer?.nextElementSibling;
    if (!panel?.classList.contains("accordion-panel")) return;

    const paragraphs = panel.querySelectorAll("p");
    if (paragraphs.length) {
      paragraphs[paragraphs.length - 1].textContent = t.aboutLanguage;
      paragraphs[0].style.marginTop = "18px";
    } else {
      const paragraph = document.createElement("p");
      paragraph.textContent = t.aboutLanguage;
      paragraph.style.cssText = "margin:18px 0;color:#EBDBB1;font-size:16px;line-height:1.7;";
      panel.appendChild(paragraph);
    }

    /* Keep the closed accordion at zero visual height. Vertical spacing is placed on the content. */
    panel.style.padding = "0 20px";
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
    updateAboutLanguage();
    addWhatsAppContact();
    disableTelephoneContact();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.setTimeout(applyPolicy, 0));
  } else {
    window.setTimeout(applyPolicy, 0);
  }
})();