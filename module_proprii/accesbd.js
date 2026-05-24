const { Client, Pool } = require("pg");

/**
 * @typedef {object} ObiectConexiune
 * @property {string} init - Tipul de conexiune ("local" etc.)
 */

/**
 * @typedef {object} ObiectQuerySelect
 * @property {string} tabel - Numele tabelului
 * @property {string[]} campuri - Lista cu numele coloanelor afectate de query (poate cuprinde "*")
 * @property {string[]} conditiiAnd - Lista cu condiții pentru WHERE concatenate cu AND
 */

/**
 * @typedef {object} ObiectQueryInsert
 * @property {string} tabel - Numele tabelului
 * @property {Object} campuri - Perechi cheie-valoare pentru coloane și datele de inserat
 */

/**
 * @typedef {object} ObiectQueryUpdate
 * @property {string} tabel - Numele tabelului
 * @property {string[]} campuri - Lista numelor de coloane ce trebuie actualizate
 * @property {any[]} valori - Lista valorilor noi pentru coloanele respective
 * @property {string[]} conditiiAnd - Lista cu condiții pentru WHERE
 */

/**
 * @typedef {object} ObiectQueryDelete
 * @property {string} tabel - Numele tabelului
 * @property {string[]} conditiiAnd - Lista cu condiții pentru WHERE
 */

/**
 * @callback QueryCallBack
 * @param {Error} err Eventuala eroare în urma query-ului
 * @param {Object} rez Rezultatul query-ului
 */

/**
 * Clasă de tip Singleton pentru gestionarea conexiunii și operațiunilor cu baza de date PostgreSQL.
 */
class AccesBD {
    static #instanta = null;
    static #initializat = false;

    /**
     * Constructorul clasei AccesBD.
     * @throws {Error} Dacă se încearcă instanțierea directă în afara metodei getInstanta.
     */
    constructor() {
        if (AccesBD.#instanta) {
            throw new Error("Deja a fost instantiat");
        } else if (!AccesBD.#initializat) {
            throw new Error("Trebuie apelat doar din getInstanta; fara sa fi aruncat vreo eroare");
        }
    }

    /**
     * Inițializează și conectează clientul de bază de date cu setările locale.
     * @returns {void}
     */
    initLocal() {
        this.client = new Client({
            database: "cti_2026",
            user: "daniel",
            password: "daniel",
            host: "localhost",
            port: 5432
        });
        this.client.connect();
    }

    /**
     * Returnează clientul de bază de date curent.
     * @returns {Client} Clientul conectat.
     * @throws {Error} Dacă clasa nu a fost instanțiată.
     */
    getClient() {
        if (!AccesBD.#instanta) {
            throw new Error("Nu a fost instantiata clasa");
        }
        return this.client;
    }

    /**
     * Returnează instanța unică a clasei.
     *
     * @param {ObiectConexiune} [config={init: "local"}] - Un obiect cu datele pentru inițializarea conexiunii.
     * @returns {AccesBD} Instanța de conexiune la baza de date.
     */
    static getInstanta({ init = "local" } = {}) {
        console.log(this);
        if (!this.#instanta) {
            this.#initializat = true;
            this.#instanta = new AccesBD();
            try {
                switch (init) {
                    case "local": this.#instanta.initLocal();
                }
            } catch (e) {
                console.error("Eroare la initializarea bazei de date!");
            }
        }
        return this.#instanta;
    }

    /**
     * Selectează înregistrări din baza de date.
     *
     * @param {ObiectQuerySelect} [obj={tabel: "", campuri: [], conditiiAnd: []}] - Obiectul conținând datele pentru interogare.
     * @param {QueryCallBack} callback - Funcția callback executată la finalizarea query-ului.
     * @param {any[]} [parametriQuery=[]] - Array de parametri opționali pentru query.
     * @returns {void}
     */
    select({ tabel = "", campuri = [], conditiiAnd = [] } = {}, callback, parametriQuery = []) {
        let conditieWhere = "";
        if (conditiiAnd.length > 0)
            conditieWhere = `where ${conditiiAnd.join(" and ")}`;
        let comanda = `select ${campuri.join(",")} from ${tabel} ${conditieWhere}`;
        console.error(comanda);
        this.client.query(comanda, parametriQuery, callback)
    }

    /**
     * Selectează asincron înregistrări din baza de date.
     *
     * @param {ObiectQuerySelect} [obj={tabel: "", campuri: [], conditiiAnd: []}] - Obiectul conținând datele pentru interogare.
     * @returns {Promise<Object|null>} Un obiect Promise ce se rezolvă cu rezultatul query-ului sau null în caz de eroare.
     */
    async selectAsync({ tabel = "", campuri = [], conditiiAnd = [] } = {}) {
        let conditieWhere = "";
        if (conditiiAnd.length > 0)
            conditieWhere = `where ${conditiiAnd.join(" and ")}`;

        let comanda = `select ${campuri.join(",")} from ${tabel} ${conditieWhere}`;
        console.error("selectAsync:", comanda);
        try {
            let rez = await this.client.query(comanda);
            console.log("selectasync: ", rez);
            return rez;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    /**
     * Inserează o nouă înregistrare în baza de date.
     *
     * @param {ObiectQueryInsert} [obj={tabel: "", campuri: {}}] - Obiectul conținând datele pentru inserare.
     * @param {QueryCallBack} callback - Funcția callback executată la finalizarea query-ului.
     * @returns {void}
     */
    insert({ tabel = "", campuri = {} } = {}, callback) {
        console.log("-------------------------------------------")
        console.log(Object.keys(campuri).join(","));
        console.log(Object.values(campuri).join(","));
        let comanda = `insert into ${tabel}(${Object.keys(campuri).join(",")}) values ( ${Object.values(campuri).map((x) => `'${x}'`).join(",")})`;
        console.log(comanda);
        this.client.query(comanda, callback)
    }

    /**
     * Actualizează înregistrări în baza de date.
     *
     * @param {ObiectQueryUpdate} [obj={tabel: "", campuri: [], valori: [], conditiiAnd: []}] - Obiectul conținând datele pentru actualizare.
     * @param {QueryCallBack} callback - Funcția callback executată la finalizarea query-ului.
     * @param {any[]} [parametriQuery] - Array de parametri opționali pentru query.
     * @throws {Error} Dacă numărul de câmpuri nu coincide cu numărul de valori.
     * @returns {void}
     */
    update({ tabel = "", campuri = [], valori = [], conditiiAnd = [] } = {}, callback, parametriQuery) {
        if (campuri.length != valori.length)
            throw new Error("Numarul de campuri difera de nr de valori")
        let campuriActualizate = [];
        for (let i = 0; i < campuri.length; i++)
            campuriActualizate.push(`${campuri[i]}='${valori[i]}'`);
        let conditieWhere = "";
        if (conditiiAnd.length > 0)
            conditieWhere = `where ${conditiiAnd.join(" and ")}`;
        let comanda = `update ${tabel} set ${campuriActualizate.join(", ")}  ${conditieWhere}`;
        console.log(comanda);
        this.client.query(comanda, callback)
    }

    /**
     * Actualizează înregistrări utilizând query parametrizat ($1, $2 etc.).
     *
     * @param {ObiectQueryUpdate} [obj={tabel: "", campuri: [], valori: [], conditiiAnd: []}] - Obiectul conținând datele pentru actualizare.
     * @param {QueryCallBack} callback - Funcția callback executată la finalizarea query-ului.
     * @param {any[]} [parametriQuery] - Array de parametri opționali pentru query.
     * @throws {Error} Dacă numărul de câmpuri nu coincide cu numărul de valori.
     * @returns {void}
     */
    updateParametrizat({ tabel = "", campuri = [], valori = [], conditiiAnd = [] } = {}, callback, parametriQuery) {
        if (campuri.length != valori.length)
            throw new Error("Numarul de campuri difera de nr de valori")
        let campuriActualizate = [];
        for (let i = 0; i < campuri.length; i++)
            campuriActualizate.push(`${campuri[i]}=$${i + 1}`);
        let conditieWhere = "";
        if (conditiiAnd.length > 0)
            conditieWhere = `where ${conditiiAnd.join(" and ")}`;
        let comanda = `update ${tabel} set ${campuriActualizate.join(", ")}  ${conditieWhere}`;
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1111", comanda);
        this.client.query(comanda, valori, callback)
    }

    /**
     * Șterge înregistrări din baza de date.
     *
     * @param {ObiectQueryDelete} [obj={tabel: "", conditiiAnd: []}] - Obiectul conținând datele pentru ștergere.
     * @param {QueryCallBack} callback - Funcția callback executată la finalizarea query-ului.
     * @returns {void}
     */
    delete({ tabel = "", conditiiAnd = [] } = {}, callback) {
        let conditieWhere = "";
        if (conditiiAnd.length > 0)
            conditieWhere = `where ${conditiiAnd.join(" and ")}`;

        let comanda = `delete from ${tabel} ${conditieWhere}`;
        console.log(comanda);
        this.client.query(comanda, callback)
    }

    /**
     * Execută o comandă SQL custom.
     *
     * @param {string} comanda - Comanda SQL brută ce trebuie executată.
     * @param {QueryCallBack} callback - Funcția callback executată la finalizarea query-ului.
     * @returns {void}
     */
    query(comanda, callback) {
        this.client.query(comanda, callback);
    }
}

module.exports = AccesBD;