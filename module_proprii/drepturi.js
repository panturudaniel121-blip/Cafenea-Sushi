/**
 * @typedef Drepturi
 * @type {Object}
 * @property {Symbol} vizualizareUtilizatori Dreptul de a intra pe pagina cu tabelul de utilizatori.
 * @property {Symbol} stergereUtilizatori Dreptul de a sterge un utilizator.
 * @property {Symbol} cumparareProduse Dreptul de a cumpara produse.
 * @property {Symbol} vizualizareGrafice Dreptul de a vizualiza graficele de vanzari.
 * @property {Symbol} adaugareProduse Dreptul de a adauga produse noi in sistem.
 * @property {Symbol} modificareProduse Dreptul de a modifica detaliile produselor existente.
 * @property {Symbol} modificareUtilizatori Dreptul de a modifica datele sau rolurile utilizatorilor.
 */

/**
 * @name module.exports.Drepturi
 * @type {Drepturi}
 */
const Drepturi = {
    vizualizareUtilizatori: Symbol("vizualizareUtilizatori"),
    stergereUtilizatori: Symbol("stergereUtilizatori"),
    cumparareProduse: Symbol("cumparareProduse"),
    vizualizareGrafice: Symbol("vizualizareGrafice"),
    adaugareProduse: Symbol("adaugareProduse"),
    modificareProduse: Symbol("modificareProduse"),
    modificareUtilizatori: Symbol("modificareUtilizatori")
};

module.exports = Drepturi;