function setCookie(name, value, ms) {
    document.cookie = `${name}=${encodeURIComponent(typeof value === 'object' ? JSON.stringify(value) : value)};expires=${new Date(Date.now() + ms).toUTCString()};path=/`;
}

function getCookie(name) {
    let match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    if (!match) return null;
    let val = decodeURIComponent(match[2]);
    try { return JSON.parse(val); } catch(e) { return val; }
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

function getFilterState() {
    return {
        nume: document.getElementById("inp-nume")?.value.trim().toLowerCase() || "",
        descriere: document.getElementById("inp-descriere")?.value.trim().toLowerCase() || "",
        subcategorie: document.getElementById("inp-subcategorie")?.value.trim().toLowerCase() || "",
        categorie: document.getElementById("inp-categorie")?.value.trim().toLowerCase() || "toate",
        pret: parseFloat(document.getElementById("inp-pret")?.value) || 999999,
        vegan: document.getElementById("inp-vegan")?.checked || false,
        noutati: document.getElementById("inp-noutati")?.checked || false,
        calorii: Array.from(document.getElementsByName("gr_rad")).find(r => r.checked)?.value || "toate",
        temperaturi: Array.from(document.getElementById("inp-temperatura")?.options || []).filter(o => o.selected).map(o => o.value.trim().toLowerCase())
    };
}

function setFilterState(state) {
    if (!state) return;
    
    let elNume = document.getElementById("inp-nume");
    if (elNume) elNume.value = state.nume;
    
    let elDescriere = document.getElementById("inp-descriere");
    if (elDescriere) elDescriere.value = state.descriere;
    
    let elSub = document.getElementById("inp-subcategorie");
    if (elSub) elSub.value = state.subcategorie;
    
    let elCat = document.getElementById("inp-categorie");
    if (elCat) elCat.value = state.categorie;
    
    let elPret = document.getElementById("inp-pret");
    if (elPret && state.pret !== 999999) {
        elPret.value = state.pret;
        let infoRange = document.getElementById("infoRange");
        if (infoRange) infoRange.innerHTML = `(${state.pret})`;
    }
    
    let elVegan = document.getElementById("inp-vegan");
    if (elVegan) elVegan.checked = state.vegan;
    
    let elNoutati = document.getElementById("inp-noutati");
    if (elNoutati) elNoutati.checked = state.noutati;
    
    Array.from(document.getElementsByName("gr_rad")).forEach(r => r.checked = (r.value === state.calorii));
    
    let elTemp = document.getElementById("inp-temperatura");
    if (elTemp && state.temperaturi) {
        Array.from(elTemp.options).forEach(o => {
            o.selected = state.temperaturi.includes(o.value.trim().toLowerCase());
        });
    }
}

function valideazaFiltre(state) {
    let err = false;
    let elNume = document.getElementById("inp-nume");
    let elPret = document.getElementById("inp-pret");
    let elSub = document.getElementById("inp-subcategorie");

    if (elNume) {
        let inv = state.nume && /\d/.test(state.nume);
        elNume.style.border = inv ? "2px solid red" : "";
        err = err || inv;
    }

    if (elPret) {
        let inv = state.pret !== 999999 && state.pret < 10;
        elPret.style.outline = inv ? "2px solid red" : "";
        err = err || inv;
    }

    if (elSub && state.subcategorie) {
        let gasit = Array.from(document.querySelectorAll(".lista-caracteristici li")).some(li => {
            let lbl = li.querySelector(".label")?.textContent.toLowerCase() || "";
            let val = li.querySelector(".valoare")?.textContent.toLowerCase() || "";
            return (lbl.includes("secundara") || lbl.includes("secundară")) && val.includes(state.subcategorie);
        });
        elSub.style.border = !gasit ? "2px solid red" : "";
        err = err || !gasit;
    } else if (elSub) elSub.style.border = "";

    return !(err && !confirm("Unele câmpuri par introduse greșit. Ești sigur că vrei să continui cu aceste filtre?"));
}

function parseProduct(prod) {
    let data = {
        nume: prod.querySelector(".val-nume")?.textContent.toLowerCase() || "",
        descriere: prod.querySelector(".descriere")?.textContent.toLowerCase() || "",
        categorie: prod.querySelector(".val-categorie")?.textContent.toLowerCase() || "",
        pret: 0, calorii: 0, veganTxt: "nu", temperatura: "", subcategorie: "", dataProdus: new Date('1970-01-01')
    };
    prod.querySelectorAll(".lista-caracteristici li").forEach(li => {
        let label = li.querySelector(".label")?.textContent.toLowerCase() || "";
        let val = li.querySelector(".valoare")?.textContent.toLowerCase() || "";
        let timp = li.querySelector("time");

        if (label.includes("adăugat") || label.includes("adaugat")) data.dataProdus = timp ? new Date(timp.getAttribute("datetime")) : data.dataProdus;
        else if (label.includes("preț") || label.includes("pret")) data.pret = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
        else if (label.includes("calorii")) data.calorii = parseInt(val.replace(/[^0-9]/g, '')) || 0;
        else if (label.includes("vegan")) data.veganTxt = val;
        else if (label.includes("servire")) data.temperatura = val;
        else if (label.includes("secundara") || label.includes("secundară")) data.subcategorie = val;
    });
    return data;
}

function aplicaFiltre() {
    let state = getFilterState();
    if (!valideazaFiltre(state)) return;

    let checkboxSalvare = document.getElementById("salveaza-filtrare");
    if (checkboxSalvare && checkboxSalvare.checked) {
        setCookie("filtre_salvate", state, 7 * 24 * 60 * 60 * 1000);
    } else {
        deleteCookie("filtre_salvate");
    }

    let [cMin, cMax] = state.calorii !== "toate" ? state.calorii.split(":").map(Number) : [0, 9999999];
    let produse = Array.from(document.getElementsByClassName("produs"));
    let afisate = 0;

    produse.forEach(prod => {
        let d = prod.pData || (prod.pData = parseProduct(prod));
        let vizibil = d.nume.includes(state.nume) &&
                      d.descriere.includes(state.descriere) &&
                      (state.categorie === "toate" || d.categorie === state.categorie) &&
                      (state.subcategorie === "" || d.subcategorie.includes(state.subcategorie)) &&
                      (state.calorii === "toate" || (d.calorii >= cMin && d.calorii < cMax)) &&
                      d.pret <= state.pret &&
                      (!state.vegan || d.veganTxt === "da") &&
                      (state.temperaturi.length === 0 || state.temperaturi.includes(d.temperatura)) &&
                      (!state.noutati || d.dataProdus >= new Date('2026-04-01'));

        prod.style.display = vizibil ? "block" : "none";
        if (vizibil) afisate++;
    });

    let info = document.getElementById("info-produse");
    let lipsa = document.getElementById("mesaj-lipsa");
    if (info) { info.style.display = afisate > 0 ? "block" : "none"; info.textContent = `Produse afișate: ${afisate}`; }
    if (lipsa) lipsa.style.display = afisate === 0 ? "block" : "none";
}

function setupDOM() {
    let grid = document.querySelector(".grid-produse");
    if (!grid) return;
    if (!document.getElementById("info-produse")) {
        let info = document.createElement("div");
        info.id = "info-produse";
        info.className = "contor-produse";
        grid.parentNode.insertBefore(info, grid);
    }
    if (!document.getElementById("mesaj-lipsa")) {
        let msg = document.createElement("p");
        msg.id = "mesaj-lipsa";
        msg.className = "mesajLipsa";
        grid.appendChild(msg);
    }
}

function initBanner() {
    let banner = document.getElementById('banner-cookie');
    let btn = document.getElementById('accept-cookies');
    
    if (!banner || !btn) return;

    if (getCookie('cookies_accepted')) {
        banner.style.display = 'none';
    }

    btn.addEventListener('click', function() {
        setCookie('cookies_accepted', 'true', 5000);
        banner.style.display = 'none';
    });
}

function initEvents() {
    ["inp-nume", "inp-descriere", "inp-subcategorie", "inp-categorie", "inp-vegan", "inp-temperatura", "inp-noutati", "inp-pret", "salveaza-filtrare"].forEach(id => {
        let el = document.getElementById(id);
        if (el) el.addEventListener(el.tagName === "INPUT" && ["text", "range", "checkbox"].includes(el.type) ? "input" : "change", aplicaFiltre);
    });

    document.getElementsByName("gr_rad").forEach(rad => rad.addEventListener("change", aplicaFiltre));

    let pret = document.getElementById("inp-pret");
    if (pret) pret.addEventListener("input", function() {
        let info = document.getElementById("infoRange");
        if (info) info.innerHTML = `(${this.value.trim()})`;
    });

    let resetBtn = document.getElementById("resetare");
    if (resetBtn) resetBtn.addEventListener("click", () => {
        if (confirm("Sigur vrei sa resetezi filtrele?")) {
            let checkboxSalvare = document.getElementById("salveaza-filtrare");
            if (checkboxSalvare) checkboxSalvare.checked = false;
            deleteCookie("filtre_salvate");
            
            setFilterState({ nume: "", descriere: "", subcategorie: "", categorie: "toate", pret: pret?.max || 70, vegan: false, noutati: false, calorii: "toate", temperaturi: [] });
            let rad4 = document.getElementById("i_rad4");
            if (rad4) rad4.checked = true;
            
            let afisaj = document.getElementById("afisaj-cookie-filtre");
            if (afisaj) afisaj.style.display = "none";
            
            aplicaFiltre();
        }
    });
}

window.addEventListener('load', function() {
    setupDOM();
    initBanner();
    
    let savedState = getCookie("filtre_salvate");
    let afisaj = document.getElementById("afisaj-cookie-filtre");
    let checkboxSalvare = document.getElementById("salveaza-filtrare");
    
    if (savedState) {
        setFilterState(savedState);
        if (checkboxSalvare) checkboxSalvare.checked = true;
        
        if (afisaj) {
            afisaj.innerHTML = "Ultimele filtre au fost aplicate automat.";
            afisaj.style.display = "block";
        }
    } else {
        if (checkboxSalvare) checkboxSalvare.checked = false;
    }
    
    initEvents();
    aplicaFiltre();
});