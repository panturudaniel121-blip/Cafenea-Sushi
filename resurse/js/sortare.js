/**
 * Sortează elementele HTML cu clasa "produs" în funcție de preț și nume.
 *
 * @param {number} semn - Multiplicator pentru direcția de sortare (ex: 1 pentru crescător, -1 pentru descrescător)
 * @returns {void}
 */
function sorteaza(semn) {
    let produse = document.getElementsByClassName("produs");
    let vProduse = Array.from(produse);
    
    vProduse.sort(function(a, b) {
        let pretA = parseFloat(a.getElementsByClassName("val-pret")[0].innerHTML.trim());
        let pretB = parseFloat(b.getElementsByClassName("val-pret")[0].innerHTML.trim());
        
        if (pretA == pretB) {
            let numeA = a.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase();
            let numeB = b.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase();
            return semn * numeA.localeCompare(numeB);
        }
        return semn * (pretA - pretB);
    });
    
    for (let prod of vProduse) {
        prod.parentNode.appendChild(prod);
    }
}    

window.addEventListener("DOMContentLoaded", function() {
    document.getElementById("sortCrescNume").onclick = function() {
        sorteaza(1);
    };
    document.getElementById("sortDescrescNume").onclick = function() {
        sorteaza(-1);
    };
});