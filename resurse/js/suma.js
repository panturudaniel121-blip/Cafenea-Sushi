document.addEventListener("DOMContentLoaded", function() {
    document.addEventListener("keydown", function(e) {
        if (e.key === "c" && e.altKey) {
            faceSuma();
        }
    });

    let btnCalcul = document.getElementById("calculPret");
    
    if (btnCalcul) {
        btnCalcul.addEventListener("click", faceSuma);
    } else {
        console.error("Eroare: Butonul cu id-ul 'calculPret' nu există în HTML.");
    }

    let timerId = null;

    function faceSuma() {
        let suma = 0;
        let produse = document.getElementsByClassName("produs");
        
        for (let prod of produse) {
            let stil = window.getComputedStyle(prod);
            if (stil.display !== "none") {
                let elementPret = prod.querySelector(".val-pret, .valoare");
                if (elementPret) {
                    let textPret = elementPret.textContent.replace(/[^0-9.,]/g, "").replace(",", ".");
                    let valoare = parseFloat(textPret);
                    if (!isNaN(valoare)) {
                        suma += valoare;
                    }
                }
            }
        }
        
        let sectiuneProduse = document.getElementById("produse") || document.querySelector(".grid-produse");
        
        if (!sectiuneProduse) {
            console.error("Eroare: Nu s-a găsit elementul cu id='produse' sau clasa='grid-produse'.");
            return;
        }
        
        let p = document.getElementById("infoSuma");
        
        if (!p) {
            p = document.createElement("p");
            p.id = "infoSuma";
            p.classList.add("stil-suma");
            sectiuneProduse.parentElement.insertBefore(p, sectiuneProduse);
        } 
        
        p.innerHTML = suma;

        if (timerId) {
            clearTimeout(timerId);
        }

        timerId = setTimeout(function() {
            let p1 = document.getElementById("infoSuma");
            if (p1) {
                p1.remove();
            }
        }, 2000);
    }
});