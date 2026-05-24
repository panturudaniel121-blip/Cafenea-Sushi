const Drepturi = require('./drepturi.js');

/**
 * Clasa de bază pentru gestionarea rolurilor utilizatorilor.
 */
class Rol {
    /**
     * Obține tipul rolului.
     * @returns {string} Identificatorul tipului de rol.
     */
    static get tip() { return "generic" }

    /**
     * Obține lista de drepturi asociate rolului.
     * @returns {Symbol[]} Lista drepturilor permise.
     */
    static get drepturi() { return [] }
    
    /**
     * Creează o instanță a clasei Rol.
     */
    constructor() {
        this.cod = this.constructor.tip;
    }

    /**
     * Verifică dacă rolul curent deține un anumit drept.
     * @param {Symbol} drept - Dreptul care trebuie verificat.
     * @returns {boolean} True dacă rolul are dreptul, altfel false.
     */
    areDreptul(drept) { 
        console.log("in metoda rol!!!!")
        return this.constructor.drepturi.includes(drept);
    }
}

/**
 * Clasa pentru rolul de administrator.
 * @extends Rol
 */
class RolAdmin extends Rol {
    /**
     * Obține tipul rolului de admin.
     * @returns {string} Tipul rolului.
     */
    static get tip() { return "admin" }
    
    /**
     * Creează o instanță a clasei RolAdmin.
     */
    constructor() {
        super();
    }

    /**
     * Verifică drepturile administratorului. Un admin are automat toate drepturile.
     * @returns {boolean} Întotdeauna returnează true.
     */
    areDreptul() {
        return true; 
    }
}

/**
 * Clasa pentru rolul de moderator.
 * @extends Rol
 */
class RolModerator extends Rol {
    /**
     * Obține tipul rolului de moderator.
     * @returns {string} Tipul rolului.
     */
    static get tip() { return "moderator" }

    /**
     * Obține lista specifică de drepturi pentru moderator.
     * @returns {Symbol[]} Lista drepturilor.
     */
    static get drepturi() { return [
        Drepturi.vizualizareUtilizatori,
        Drepturi.stergereUtilizatori,
        Drepturi.modificareUtilizatori
    ] }
    
    /**
     * Creează o instanță a clasei RolModerator.
     */
    constructor() {
        super();
    }
}

/**
 * Clasa pentru rolul standard de client.
 * @extends Rol
 */
class RolClient extends Rol {
    /**
     * Obține tipul rolului de client comun.
     * @returns {string} Tipul rolului.
     */
    static get tip() { return "comun" }

    /**
     * Obține lista specifică de drepturi pentru client.
     * @returns {Symbol[]} Lista drepturilor.
     */
    static get drepturi() { return [
        Drepturi.cumparareProduse
    ] }
    
    /**
     * Creează o instanță a clasei RolClient.
     */
    constructor() {
        super();
    }
}

/**
 * Clasă de tip Factory pentru instanțierea rolurilor.
 */
class RolFactory {
    /**
     * Creează și returnează instanța corespunzătoare unui tip de rol.
     * @param {string} tip - Identificatorul rolului ("admin", "moderator", "comun").
     * @returns {RolAdmin|RolModerator|RolClient|undefined} Instanța creată pe baza tipului.
     */
    static creeazaRol(tip) {
        switch(tip) {
            case RolAdmin.tip: return new RolAdmin();
            case RolModerator.tip: return new RolModerator();
            case RolClient.tip: return new RolClient();
        }
    }
}

module.exports = {
    Rol: Rol,
    RolFactory: RolFactory
};