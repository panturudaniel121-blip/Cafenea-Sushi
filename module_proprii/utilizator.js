const AccesBD = require('./accesbd.js');
const parole = require('./parole.js');
const { RolFactory } = require('./roluri.js');
const crypto = require("crypto");
const nodemailer = require("nodemailer");

/**
 * Clasa pentru gestionarea utilizatorilor si interactiunea cu tabela "utilizatori".
 * @class
 */
class Utilizator {
    static tipConexiune = "local";
    static tabel = "utilizatori";
    static parolaCriptare = "tehniciweb";
    static emailServer = "test.tweb.node@gmail.com";
    static lungimeCod = 64;
    static numeDomeniu = "localhost:8080";
    #eroare;

    /**
     * Seteaza proprietatile utilizatorului pe baza unui obiect furnizat.
     * @param {Object} [parametri={}] - Obiect continand datele de initializare.
     * @param {number} [parametri.id] - ID-ul utilizatorului.
     * @param {string} [parametri.username] - Numele de utilizator.
     * @param {string} [parametri.nume] - Numele de familie.
     * @param {string} [parametri.prenume] - Prenumele.
     * @param {string} [parametri.email] - Adresa de email.
     * @param {string} [parametri.parola] - Parola in clar.
     * @param {Object|string} [parametri.rol] - Rolul utilizatorului (obiect sau cod).
     * @param {string} [parametri.culoare_chat="black"] - Culoarea pentru chat.
     * @param {string} [parametri.poza] - Calea catre poza de profil.
     */
    constructor({id, username, nume, prenume, email, parola, rol, culoare_chat="black", poza} = {}) {
        this.id = id;
        
        try {
            if (this.verificaUsername(username)) {
                this.username = username;
            } else {
                throw new Error("Username incorect");
            }
        } catch(e) { 
            this.#eroare = e.message; 
        }

        for (let prop in arguments[0]) {
            this[prop] = arguments[0][prop];
        }

        if (this.rol) {
            this.rol = this.rol.cod ? RolFactory.creeazaRol(this.rol.cod) : RolFactory.creeazaRol(this.rol);
        }
        
        this.#eroare = "";
    }

    /**
     * Verifica daca numele respecta formatul cerut (Incepe cu litera mare, continuat cu litere mici).
     * @param {string} nume - Numele de verificat.
     * @returns {boolean} Rezultatul validarii.
     */
    verificaNume(nume) {
        return nume != "" && nume.match(new RegExp("^[A-Z][a-z]+$"));
    }

    /**
     * Seteaza numele daca acesta trece de validare.
     * @param {string} nume - Numele nou.
     * @throws {Error} Daca formatul numelui este invalid.
     */
    set setareNume(nume) {
        if (this.verificaNume(nume)) this.nume = nume;
        else throw new Error("Nume gresit");
    }

    /**
     * Seteaza username-ul daca acesta trece de validare.
     * @param {string} username - Username-ul nou.
     * @throws {Error} Daca formatul username-ului este invalid.
     */
    set setareUsername(username) {
        if (this.verificaUsername(username)) this.username = username;
        else throw new Error("Username gresit");
    }

    /**
     * Verifica daca username-ul respecta formatul cerut.
     * @param {string} username - Username-ul de verificat.
     * @returns {boolean} Rezultatul validarii.
     */
    verificaUsername(username) {
        return username != "" && username.match(new RegExp("^[A-Za-z0-9#_./]+$"));
    }

    /**
     * Cripteaza parola folosind scryptSync.
     * @param {string} parola - Parola in format clar.
     * @returns {string} Parola criptata (hex).
     */
    static criptareParola(parola) {
        return crypto.scryptSync(parola, Utilizator.parolaCriptare, Utilizator.lungimeCod).toString("hex");
    }

    /**
     * Inregistreaza utilizatorul in baza de date si trimite un e-mail de confirmare.
     * @throws {Error} Daca username-ul exista deja.
     */
    salvareUtilizator() {
        let utiliz = this;
        
        Utilizator.getUtilizDupaUsername(this.username, {}, (u, obparam, eroare) => {
            if (eroare === null && u && u.id) {
                throw new Error("Username-ul exista deja");
            } else {
                let parolaCriptata = Utilizator.criptareParola(utiliz.parola);
                let token = parole.genereazaToken(100);
                
                AccesBD.getInstanta(Utilizator.tipConexiune).insert({
                    tabel: Utilizator.tabel,
                    campuri: {
                        username: utiliz.username,
                        nume: utiliz.nume,
                        prenume: utiliz.prenume,
                        parola: parolaCriptata,
                        email: utiliz.email,
                        culoare_chat: utiliz.culoare_chat,
                        cod: token,
                        poza: utiliz.poza
                    }
                }, function(err, rez) {
                    if (err) {
                        console.log(err);
                    } else {
                        utiliz.trimiteMail(
                            "Te-ai inregistrat cu succes",
                            "Username-ul tau este " + utiliz.username,
                            `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${utiliz.username}.</p> <p><a href='http://${Utilizator.numeDomeniu}/cod/${utiliz.username}/${token}'>Click aici pentru confirmare</a></p>`
                        );
                    }
                });
            }
        });
    }

    /**
     * Modifica datele utilizatorului in baza de date.
     * @param {Object} obiect - Un obiect care contine coloanele si noile valori.
     * @throws {Error} Daca utilizatorul nu are ID definit sau exista o eroare la actualizare.
     */
    modifica(obiect) {
        if (!this.id) throw new Error("Utilizatorul nu exista");
        
        let campuri = Object.keys(obiect);
        let valori = Object.values(obiect);
        
        AccesBD.getInstanta(Utilizator.tipConexiune).update({
            tabel: Utilizator.tabel,
            campuri: campuri,
            valori: valori,
            conditiiAnd: [`id=${this.id}`]
        }, (err, rez) => {
            if (err) throw new Error("Eroare la modificare");
        });
    }

    /**
     * Sterge utilizatorul curent din baza de date.
     * @throws {Error} Daca utilizatorul nu are ID definit sau exista o eroare la stergere.
     */
    sterge() {
        if (!this.id) throw new Error("Utilizatorul nu exista");
        
        AccesBD.getInstanta(Utilizator.tipConexiune).delete({
            tabel: Utilizator.tabel,
            conditiiAnd: [`id=${this.id}`]
        }, (err, rez) => {
            if (err) throw new Error("Eroare la stergere");
        });
    }

    /**
     * Trimite un e-mail utilizatorului curent.
     * @param {string} subiect - Subiectul mesajului.
     * @param {string} mesajText - Mesajul in format text simplu (plain text).
     * @param {string} mesajHtml - Mesajul in format HTML.
     * @param {Object[]} [atasamente=[]] - Lista cu fisiere atasate.
     */
    async trimiteMail(subiect, mesajText, mesajHtml, atasamente = []) {
        var transp = nodemailer.createTransport({
            service: "gmail",
            secure: false,
            auth: {
                user: Utilizator.emailServer,
                pass: "rwgmgkldxnarxrgu"
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        await transp.sendMail({
            from: Utilizator.emailServer,
            to: this.email,
            subject: subiect,
            text: mesajText,
            html: mesajHtml,
            attachments: atasamente
        });
    }

    /**
     * Metoda statica asincrona care returneaza un utilizator dupa username.
     * @param {string} username - Username-ul de cautat.
     * @returns {Promise<Utilizator|null>} Instanta Utilizator daca e gasit, altfel null.
     */
    static async getUtilizDupaUsernameAsync(username) {
        if (!username) return null;
        try {
            let rezSelect = await AccesBD.getInstanta(Utilizator.tipConexiune).selectAsync({
                tabel: "utilizatori",
                campuri: ['*'],
                conditiiAnd: [`username='${username}'`]
            });
            
            if (rezSelect.rowCount != 0) {
                return new Utilizator(rezSelect.rows[0]);
            } else {
                return null;
            }
        } catch (e) {
            return null;
        }
    }

    /**
     * Metoda statica care cauta sincron un utilizator si apeleaza un callback.
     * @param {string} username - Username-ul de cautat.
     * @param {Object} obparam - Obiect folosit de callback pentru verificari externe (ex: parola).
     * @param {Function} proceseazaUtiliz - Callback-ul apelat cu rezultatul (utilizator, obparam, eroare).
     */
    static getUtilizDupaUsername(username, obparam, proceseazaUtiliz) {
        if (!username) return null;
        let eroare = null;
        
        AccesBD.getInstanta(Utilizator.tipConexiune).select({
            tabel: "utilizatori",
            campuri: ['*'],
            conditiiAnd: [`username='${username}'`]
        }, function (err, rezSelect) {
            if (err) {
                eroare = -2;
            } else if (rezSelect.rowCount == 0) {
                eroare = -1;
            }
            
            let u = eroare === null ? new Utilizator(rezSelect.rows[0]) : null;
            proceseazaUtiliz(u, obparam, eroare);
        });
    }

    /**
     * Cauta sincron o lista de utilizatori dupa diverse criterii pasate intr-un obiect.
     * @param {Object} obParam - Obiect ale carui proprietati sunt conditii de filtrare (ex: {username: "test"}).
     * @param {Function} callback - Callback-ul apelat cu rezultatul (err, listaUtilizatori).
     */
    static cauta(obParam, callback) {
        let conditii = [];
        for (let prop in obParam) {
            if (obParam[prop] !== undefined) {
                conditii.push(`${prop}='${obParam[prop]}'`);
            }
        }
        
        AccesBD.getInstanta(Utilizator.tipConexiune).select({
            tabel: Utilizator.tabel,
            campuri: ['*'],
            conditiiAnd: conditii
        }, function(err, rez) {
            if (err) {
                callback(err, []);
            } else {
                let utilizatori = rez.rows.map(row => new Utilizator(row));
                callback(null, utilizatori);
            }
        });
    }

    /**
     * Cauta asincron o lista de utilizatori dupa diverse criterii pasate intr-un obiect.
     * @param {Object} obParam - Obiect ale carui proprietati sunt conditii de filtrare.
     * @returns {Promise<Utilizator[]>} Un vector continand instante de tip Utilizator (poate fi vid).
     */
    static async cautaAsync(obParam) {
        let conditii = [];
        for (let prop in obParam) {
            if (obParam[prop] !== undefined) {
                conditii.push(`${prop}='${obParam[prop]}'`);
            }
        }
        
        try {
            let rez = await AccesBD.getInstanta(Utilizator.tipConexiune).selectAsync({
                tabel: Utilizator.tabel,
                campuri: ['*'],
                conditiiAnd: conditii
            });
            
            if (rez && rez.rowCount > 0) {
                return rez.rows.map(row => new Utilizator(row));
            }
            return [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Verifica daca utilizatorul curent are un anumit drept (pe baza rolului sau).
     * @param {Symbol} drept - Dreptul de verificat extras din obiectul Drepturi.
     * @returns {boolean} True daca are dreptul, altfel false.
     */
    areDreptul(drept) {
        return this.rol.areDreptul(drept);
    }
}

module.exports = Utilizator;v