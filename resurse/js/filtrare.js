window.onload = function() {
    function aplicaFiltre() {
        let elementNume = document.getElementById("inp-nume");
        let elementDescriere = document.getElementById("inp-descriere");
        let elementSubcategorie = document.getElementById("inp-subcategorie");
        let elementPret = document.getElementById("inp-pret");
        
        let dateIncorecte = false;

        if (elementNume && elementNume.value.trim() !== "" && /\d/.test(elementNume.value)) {
            dateIncorecte = true;
            elementNume.style.border = "2px solid red";
        } else if (elementNume) {
            elementNume.style.border = "";
        }

        if (elementPret && parseFloat(elementPret.value) < 10) {
            dateIncorecte = true;
            elementPret.style.outline = "2px solid red";
        } else if (elementPret) {
            elementPret.style.outline = "";
        }

        if (elementSubcategorie && elementSubcategorie.value.trim() !== "") {
            let valSubcategorie = elementSubcategorie.value.trim().toLowerCase();
            let subcategorieGasita = false;
            let produseVerificare = document.getElementsByClassName("produs");

            for (let prod of produseVerificare) {
                let listaCaracteristici = prod.querySelectorAll(".lista-caracteristici li");
                for (let li of listaCaracteristici) {
                    let eticheta = li.querySelector(".label");
                    let valoare = li.querySelector(".valoare");

                    if (eticheta && valoare) {
                        let textEticheta = eticheta.textContent.trim().toLowerCase();
                        if (textEticheta.includes("secundara") || textEticheta.includes("secundară")) {
                            if (valoare.textContent.trim().toLowerCase().includes(valSubcategorie)) {
                                subcategorieGasita = true;
                            }
                        }
                    }
                }
                if (subcategorieGasita) break;
            }

            if (!subcategorieGasita) {
                dateIncorecte = true;
                elementSubcategorie.style.border = "2px solid red";
            } else {
                elementSubcategorie.style.border = "";
            }
        } else if (elementSubcategorie) {
            elementSubcategorie.style.border = "";
        }

        if (dateIncorecte) {
            let confirmare = confirm("Unele câmpuri par introduse greșit (ex: cifre în nume, subcategorie inexistentă sau preț sub 10). Ești sigur că vrei să continui cu aceste filtre?");
            if (!confirmare) {
                return;
            }
        }

        let inpNume = elementNume ? elementNume.value.trim().toLowerCase() : "";
        let inpDescriere = elementDescriere ? elementDescriere.value.trim().toLowerCase() : "";
        let inpCategorie = document.getElementById("inp-categorie") ? document.getElementById("inp-categorie").value.trim().toLowerCase() : "toate";
        let inpSubcategorie = elementSubcategorie ? elementSubcategorie.value.trim().toLowerCase() : "";

        let inpPretMax = elementPret ? parseFloat(elementPret.value) : 999999;
        
        let inpVeganElement = document.getElementById("inp-vegan");
        let isVegan = inpVeganElement ? inpVeganElement.checked : false;

        let selectTemperatura = document.getElementById("inp-temperatura");
        let temperaturiSelectate = [];
        if (selectTemperatura) {
            for (let opt of selectTemperatura.options) {
                if (opt.selected) {
                    temperaturiSelectate.push(opt.value.trim().toLowerCase());
                }
            }
        }

        let grupRadio = document.getElementsByName("gr_rad");
        let caloriiMin = 0, caloriiMax = 9999999, isToateCalorii = true;
        for (let rad of grupRadio) {
            if (rad.checked) {
                if (rad.value !== "toate") {
                    let valori = rad.value.split(":");
                    caloriiMin = parseInt(valori[0]);
                    caloriiMax = parseInt(valori[1]);
                    isToateCalorii = false;
                }
                break;
            }
        }

        let inpNoutatiElement = document.getElementById("inp-noutati");
        let isNoutati = inpNoutatiElement ? inpNoutatiElement.checked : false;
        let dataReferinta = new Date('2026-04-01');

        let produse = document.getElementsByClassName("produs");
        let produseAfisate = 0;

        for (let prod of produse) {
            prod.style.display = "none";

            let numeElement = prod.querySelector(".val-nume");
            let nume = numeElement ? numeElement.textContent.trim().toLowerCase() : "";
            let cond1 = nume.includes(inpNume);

            let descriereElement = prod.querySelector(".descriere");
            let descriere = descriereElement ? descriereElement.textContent.trim().toLowerCase() : "";
            let cond2 = descriere.includes(inpDescriere);

            let categorieElement = prod.querySelector(".val-categorie");
            let categorie = categorieElement ? categorieElement.textContent.trim().toLowerCase() : "";
            let cond3 = (inpCategorie === "toate" || categorie === inpCategorie);

            let listaCaracteristici = prod.querySelectorAll(".lista-caracteristici li");
            let pret = 0, calorii = 0, veganTxt = "nu", temperatura = "", subcategorie = "", dataProdus = new Date('1970-01-01');

            for (let li of listaCaracteristici) {
                let eticheta = li.querySelector(".label");
                let valoare = li.querySelector(".valoare");
                let timp = li.querySelector("time");

                if (eticheta) {
                    let textEticheta = eticheta.textContent.trim().toLowerCase();

                    if (textEticheta.includes("adăugat") || textEticheta.includes("adaugat")) {
                        if (timp) {
                            dataProdus = new Date(timp.getAttribute("datetime"));
                        }
                    } else if (valoare) {
                        let textValoare = valoare.textContent.trim().toLowerCase();

                        if (textEticheta.includes("preț") || textEticheta.includes("pret")) {
                            pret = parseFloat(textValoare.replace(/[^0-9.]/g, '')) || 0;
                        } else if (textEticheta.includes("calorii")) {
                            calorii = parseInt(textValoare.replace(/[^0-9]/g, '')) || 0;
                        } else if (textEticheta.includes("vegan")) {
                            veganTxt = textValoare;
                        } else if (textEticheta.includes("servire")) {
                            temperatura = textValoare;
                        } else if (textEticheta.includes("secundara") || textEticheta.includes("secundară")) {
                            subcategorie = textValoare;
                        }
                    }
                }
            }

            let cond4 = (inpSubcategorie === "" || inpSubcategorie === "toate" || subcategorie.includes(inpSubcategorie));
            let cond5 = isToateCalorii || (calorii >= caloriiMin && calorii < caloriiMax);
            let cond6 = pret <= inpPretMax;
            let cond7 = !isVegan || (isVegan && veganTxt === "da");
            let cond8 = temperaturiSelectate.length === 0 || temperaturiSelectate.includes(temperatura);
            let cond9 = !isNoutati || (isNoutati && dataProdus >= dataReferinta);

            if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8 && cond9) {
                prod.style.display = "block";
                produseAfisate++;
            }
        }

        let infoProduse = document.getElementById("info-produse");
        if (!infoProduse) {
            infoProduse = document.createElement("div");
            infoProduse.id = "info-produse";
            infoProduse.className = "contor-produse";
            let gridProduse = document.querySelector(".grid-produse");
            if (gridProduse) {
                gridProduse.parentNode.insertBefore(infoProduse, gridProduse);
            }
        }
        
        if (produseAfisate === 0) {
            infoProduse.style.display = "none";
        } else {
            infoProduse.style.display = "block";
            infoProduse.textContent = `Produse afișate: ${produseAfisate}`;
        }

        let mesajLipsa = document.getElementById("mesaj-lipsa");
        if (!mesajLipsa) {
            mesajLipsa = document.createElement("p");
            mesajLipsa.id = "mesaj-lipsa";
            mesajLipsa.textContent = "Nu există produse conform filtrării curente.";
            mesajLipsa.classList.add("mesajLipsa");
            
            let gridProduse = document.querySelector(".grid-produse");
            if (gridProduse) {
                gridProduse.appendChild(mesajLipsa);
            }
        }

        if (produseAfisate === 0) {
            mesajLipsa.style.display = "block";
        } else {
            mesajLipsa.style.display = "none";
        }
    }

    let produseInitiale = document.getElementsByClassName("produs").length;
    let infoProduseInit = document.getElementById("info-produse");
    if (!infoProduseInit) {
        infoProduseInit = document.createElement("div");
        infoProduseInit.id = "info-produse";
        infoProduseInit.className = "contor-produse";
        let gridProduse = document.querySelector(".grid-produse");
        if (gridProduse) {
            gridProduse.parentNode.insertBefore(infoProduseInit, gridProduse);
        }
    }
    
    if (produseInitiale === 0) {
        infoProduseInit.style.display = "none";
    } else {
        infoProduseInit.style.display = "block";
        infoProduseInit.textContent = `Produse afișate: ${produseInitiale}`;
    }

    let inputuri = [
        "inp-nume", "inp-descriere", "inp-subcategorie", 
        "inp-categorie", "inp-vegan", "inp-temperatura", "inp-noutati"
    ];

    for (let id of inputuri) {
        let element = document.getElementById(id);
        if (element) {
            if (element.tagName === "TEXTAREA" || (element.tagName === "INPUT" && element.type === "text")) {
                element.oninput = aplicaFiltre;
            } else {
                element.onchange = aplicaFiltre;
            }
        }
    }

    let grupRadio = document.getElementsByName("gr_rad");
    for (let rad of grupRadio) {
        rad.onchange = aplicaFiltre;
    }

    let rangePret = document.getElementById("inp-pret");
    if (rangePret) {
        let infoRange = document.getElementById("infoRange");
        if (infoRange) infoRange.innerHTML = `(${rangePret.value.trim()})`;
        
        rangePret.addEventListener("input", function() {
            let val = this.value.trim();
            if (infoRange) infoRange.innerHTML = `(${val})`;
            aplicaFiltre();
        });
    }

    let btnResetare = document.getElementById("resetare");
    if (btnResetare) {
        btnResetare.onclick = function() {
            if (confirm("Sigur vrei sa resetezi filtrele?")) {
                let elementNume = document.getElementById("inp-nume");
                if (elementNume) {
                    elementNume.value = "";
                    elementNume.style.border = "";
                }
                
                let elementDescriere = document.getElementById("inp-descriere");
                if (elementDescriere) {
                    elementDescriere.value = "";
                }

                let elementSubcategorie = document.getElementById("inp-subcategorie");
                if (elementSubcategorie) {
                    elementSubcategorie.value = "";
                    elementSubcategorie.style.border = "";
                }

                if (document.getElementById("inp-categorie")) document.getElementById("inp-categorie").value = "toate";
                
                if (rangePret) {
                    rangePret.value = rangePret.max || "70";
                    rangePret.style.outline = "";
                    let infoRange = document.getElementById("infoRange");
                    if (infoRange) infoRange.innerHTML = `(${rangePret.value})`;
                }
                
                if (document.getElementById("i_rad4")) document.getElementById("i_rad4").checked = true;
                if (document.getElementById("inp-vegan")) document.getElementById("inp-vegan").checked = false;
                if (document.getElementById("inp-noutati")) document.getElementById("inp-noutati").checked = false;

                let selectTemperatura = document.getElementById("inp-temperatura");
                if (selectTemperatura) {
                    for (let opt of selectTemperatura.options) {
                        opt.selected = false;
                    }
                }

                let produse = document.getElementsByClassName("produs");
                for (let prod of produse) {
                    prod.style.display = "block";
                }

                let infoProduse = document.getElementById("info-produse");
                if (infoProduse) {
                    infoProduse.style.display = "block";
                    infoProduse.textContent = `Produse afișate: ${produse.length}`;
                }

                let mesajLipsa = document.getElementById("mesaj-lipsa");
                if (mesajLipsa) {
                    mesajLipsa.style.display = "none";
                }
            }
        }
    }
}