const express = require("express");
const path = require("path");
const fs = require("fs");
const sass = require("sass");
const sharp = require('sharp');

const app = express();
app.set("view engine", "ejs");

const pg = require("pg");

const AccesBD = require("./module_proprii/accesbd.js");
const Drepturi = require("./module_proprii/drepturi.js");

obGlobal = {
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname, "/resurse/scss"),
    folderCss: path.join(__dirname, "/resurse/css"),
    folderBackup: path.join(__dirname, "backup"),
}

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

client = new pg.Client({
    database: "cti_2026",
    user: "daniel",
    password: "daniel",
    host: "localhost",
    port: 5432
})

client.connect()

query = AccesBD.getInstanta();

/**
 * Generează intervale de calorii pe baza valorilor minimă și maximă pentru generarea butoanelor radio de filtrare.
 *
 * @param {number|null} minCal - Valoarea minimă a caloriilor.
 * @param {number|null} maxCal - Valoarea maximă a caloriilor.
 * @returns {Object[]} Un array de obiecte reprezentând intervalele (id, value, label).
 */
function getCaloriiRanges(minCal, maxCal) {
    const ranges = [];
    if (minCal == null || maxCal == null) {
        return [{ id: "i_rad1", value: "toate", label: "Toate" }];
    }

    const total = maxCal - minCal;
    if (total <= 0) {
        return [{ id: "i_rad1", value: "toate", label: "Toate" }];
    }

    const steps = 3;
    const step = Math.max(1, Math.ceil(total / steps));
    let start = minCal;

    for (let i = 0; i < steps; i++) {
        let end = start + step;
        const isLast = i === steps - 1;
        if (isLast) {
            end = maxCal + 1;
        }
        const displayEnd = end - 1;
        let label;

        if (i === 0) {
            label = `Până la ${displayEnd} kcal`;
        } else if (isLast) {
            label = `Peste ${start} kcal`;
        } else {
            label = `${start} - ${displayEnd} kcal`;
        }

        ranges.push({
            id: `i_rad${i + 1}`,
            value: `${start}:${end}`,
            label: label
        });
        start = end;
    }

    ranges.push({ id: `i_rad${ranges.length + 1}`, value: "toate", label: "Toate" });
    return ranges;
}

let vect_folder = ["temp", "logs", "backup", "fisiere_uploadate"];
for (let folder of vect_folder) {
    let caleFolder = path.join(__dirname, folder);
    if (!fs.existsSync(caleFolder)) {
        fs.mkdirSync(caleFolder);
    }
}

app.use("/resurse", express.static(path.join(__dirname, "resurse")));

app.use("/dist", express.static(path.join(__dirname, "node_modules/bootstrap/dist")));

app.get("/favicon.ico", function(req, res) {
    res.sendFile(path.join(__dirname, "resurse/imagini/favicon/favicon.ico"))
})

app.use(function(req, res, next) {
    client.query("select unnest(enum_range(null::tip_produs)) as tip", function(err, rezOptiuni) {
        if (err) {
            console.log(err);
            afisareEroare(res, 2);
        } else {
            res.locals.optiuni = rezOptiuni.rows;
            next();
        }
    });
});

app.get(["/", "/index", "/home"], function(req, res) {
    const db = AccesBD.getInstanta();

    db.select({
        tabel: "produse",
        campuri: ["COUNT(*) AS total"]
    }, function(err, rezTotal) {
        if (err || !rezTotal || rezTotal.rows.length === 0 || parseInt(rezTotal.rows[0].total) === 0) {
            return res.render("pagini/index", {
                ip: req.ip,
                imagini: obGlobal.obImagini.imagini,
                produseCarousel: []
            });
        }

        let total = parseInt(rezTotal.rows[0].total);
        let limit = Math.min(5, total);
        let randomIds = [];

        while (randomIds.length < limit) {
            let rand = Math.floor(Math.random() * total) + 1;
            if (!randomIds.includes(rand)) {
                randomIds.push(rand);
            }
        }

        let queryIn = randomIds.join(',');

        db.select({
            tabel: "produse",
            campuri: ["*"],
            conditiiAnd: [`id IN (${queryIn})`]
        }, function(err, rezProduse) {
            let arrayProduseCarousel = [];
            if (!err && rezProduse) {
                arrayProduseCarousel = rezProduse.rows;
            }

            res.render("pagini/index", {
                ip: req.ip,
                imagini: obGlobal.obImagini.imagini,
                produseCarousel: arrayProduseCarousel
            });
        });
    });
});

app.get("/galerie", function(req, res) {
    res.render("pagini/galerie", {
        imagini: obGlobal.obImagini.imagini
    });
});

app.get("/despre", function(req, res) {
    res.render("pagini/despre");
});

app.get("/produse", function(req, res) {
    let clauzaWhere = ""
    
    if (req.query.tip) {
        clauzaWhere = `where tip_produs = '${req.query.tip}'`
    }
    
    client.query(`select * from produse ${clauzaWhere}`, function(err, rez) {
        if (err) {
            console.log(err)
            afisareEroare(res, 2)
        } else {
            client.query("select unnest(enum_range(null::tip_produs)) as tip", function(err, rezOptiuni) {
                if (err) {
                    console.log(err)
                    afisareEroare(res, 2)
                } else {
                    client.query("select unnest(enum_range(null::categorie_secundara)) as subcat", function(err, rezSubcat) {
                        if (err) {
                            console.log(err)
                            afisareEroare(res, 2)
                        } else {
                            client.query("select unnest(enum_range(null::temp_servire)) as temp", function(err, rezTemp) {
                                if (err) {
                                    console.log(err)
                                    afisareEroare(res, 2)
                                } else {
                                    client.query(`select min(pret) as minpret, max(pret) as maxpret, min(calorii) as mincal, max(calorii) as maxcal from produse ${clauzaWhere}`, function(err, rezPret) {
                                        if (err) {
                                            console.log(err)
                                            afisareEroare(res, 2)
                                        } else {
                                            let minPret = rezPret.rows[0].minpret || 0;
                                            let maxPret = rezPret.rows[0].maxpret || 0;
                                            let minCal = rezPret.rows[0].mincal || 0;
                                            let maxCal = rezPret.rows[0].maxcal || 0;
                                            let caloriiRanges = getCaloriiRanges(minCal, maxCal);
                                            res.render("pagini/produse", {
                                                produse: rez.rows,
                                                optiuni: rezOptiuni.rows,
                                                subcategorii: rezSubcat.rows,
                                                temperaturi: rezTemp.rows,
                                                minPret: minPret,
                                                maxPret: maxPret,
                                                caloriiRanges: caloriiRanges
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            }) 
        }
    })
})

app.get("/produs/:id", function(req, res) {
    client.query(`select * from produse where id=${req.params.id}`, function(err, rez) {
        if (err) {
            console.log(err);
            afisareEroare(res, 2);
        } else if (rez.rowCount == 0) {
            afisareEroare(res, 404, "Produs inexistent");
        } else {
            let prodDetails = rez.rows[0];
            let qSeturi = `
                SELECT s.id, s.nume_set,
                       json_agg(json_build_object('id', p.id, 'nume', p.nume, 'pret', p.pret, 'imagine', p.imagine)) as produse
                FROM seturi s
                JOIN asociere_set as1 ON s.id = as1.id_set
                JOIN asociere_set as2 ON s.id = as2.id_set
                JOIN produse p ON as2.id_produs = p.id
                WHERE as1.id_produs = ${req.params.id}
                GROUP BY s.id, s.nume_set
            `;

            client.query(qSeturi, function(errSet, rezSet) {
                if (errSet) {
                    console.log(errSet);
                    afisareEroare(res, 2);
                } else {
                    let seturiDate = rezSet.rows.map(set => {
                        let n = set.produse.length;
                        let reducereProcent = Math.min(5, n) * 5;
                        let sumaPreturi = set.produse.reduce((sum, p) => sum + parseFloat(p.pret), 0);
                        let pretRedus = sumaPreturi - (sumaPreturi * (reducereProcent / 100));
                        
                        set.pret_final = pretRedus.toFixed(2);
                        return set;
                    });

                    res.render("pagini/produs", {
                        prod: prodDetails,
                        seturi: seturiDate
                    });
                }
            });
        }
    });
});

app.get("/seturi", function(req, res) {
    let querySeturi = `
        SELECT s.id, s.nume_set, s.descriere_set,
               json_agg(json_build_object('id', p.id, 'nume', p.nume, 'pret', p.pret, 'imagine', p.imagine)) as produse
        FROM seturi s
        JOIN asociere_set asoc ON s.id = asoc.id_set
        JOIN produse p ON asoc.id_produs = p.id
        GROUP BY s.id, s.nume_set, s.descriere_set
    `;

    client.query(querySeturi, function(err, rez) {
        if (err) {
            console.log(err);
            afisareEroare(res, 2);
        } else {
            let seturiDate = rez.rows.map(set => {
                let n = set.produse.length;
                let reducereProcent = Math.min(5, n) * 5;
                let sumaPreturi = set.produse.reduce((sum, p) => sum + parseFloat(p.pret), 0);
                let pretRedus = sumaPreturi - (sumaPreturi * (reducereProcent / 100));
                
                set.pret_final = pretRedus.toFixed(2);
                set.suma_initiala = sumaPreturi.toFixed(2);
                return set;
            });

            res.render("pagini/seturi", {
                seturi: seturiDate
            });
        }
    });
});

app.get("/set/:id", function(req, res) {
    let querySet = `
        SELECT s.id, s.nume_set, s.descriere_set,
               json_agg(json_build_object('id', p.id, 'nume', p.nume, 'pret', p.pret, 'imagine', p.imagine)) as produse
        FROM seturi s
        JOIN asociere_set asoc ON s.id = asoc.id_set
        JOIN produse p ON asoc.id_produs = p.id
        WHERE s.id = ${req.params.id}
        GROUP BY s.id, s.nume_set, s.descriere_set
    `;

    client.query(querySet, function(err, rez) {
        if (err) {
            console.log(err);
            afisareEroare(res, 2);
        } else if (rez.rowCount == 0) {
            afisareEroare(res, 404, "Set inexistent");
        } else {
            let setDetail = rez.rows[0];
            let n = setDetail.produse.length;
            let reducereProcent = Math.min(5, n) * 5;
            let sumaPreturi = setDetail.produse.reduce((sum, p) => sum + parseFloat(p.pret), 0);
            let pretRedus = sumaPreturi - (sumaPreturi * (reducereProcent / 100));

            setDetail.pret_final = pretRedus.toFixed(2);
            setDetail.suma_initiala = sumaPreturi.toFixed(2);

            res.render("pagini/set", {
                set: setDetail
            });
        }
    });
});

/**
 * Validează existența fișierului galerie.json și integritatea fișierelor de imagini specificate în acesta.
 *
 * @returns {void}
 */
function verificaGalerie() {
    const caleGalerieJson = path.join(__dirname, "resurse/json/galerie.json");
    
    if (!fs.existsSync(caleGalerieJson)) {
        console.error("Eroare critica: Fisierul galerie.json nu a fost gasit la calea:", caleGalerieJson);
        return;
    }

    const dateGalerie = JSON.parse(fs.readFileSync(caleGalerieJson, "utf-8"));
    const caleGalerie = dateGalerie.cale_galerie;
    const vImagini = dateGalerie.imagini;

    const caleAbsolutaGalerie = path.join(__dirname, caleGalerie);
    if (!fs.existsSync(caleAbsolutaGalerie)) {
        console.error(`Eroare: Folderul specificat in "cale_galerie" (${caleGalerie}) nu exista pe disc. Calea cautata: ${caleAbsolutaGalerie}`);
        process.exit(1);
    } else {
        if (vImagini && Array.isArray(vImagini)) {
            vImagini.forEach((imag) => {
                const caleFisAbs = path.join(caleAbsolutaGalerie, imag.fisier_imagine);
                if (!fs.existsSync(caleFisAbs)) {
                    console.error(`Eroare: Imaginea "${imag.fisier_imagine}" specificata in JSON nu a fost gasita in folderul de resurse. Calea lipsa: ${caleFisAbs}`);
                    process.exit(1);
                }
            });
        }
    }
}
verificaGalerie();

const caleEroriJson = path.join(__dirname, "resurse/json/erori.json");

/**
 * Verifică existența fișierului JSON care conține configurația erorilor.
 *
 * @param {string} cale - Calea absolută către fișierul erori.json.
 * @returns {void}
 */
function verificaExistentaFisierErori(cale) {
    if (!fs.existsSync(cale)) {
        console.error("Eroare: Fișierul erori.json nu există.");
        process.exit();
    }
}
verificaExistentaFisierErori(caleEroriJson);

const textJsonErori = fs.readFileSync(caleEroriJson).toString("utf-8");

const obiectEroriParsed = JSON.parse(textJsonErori);

/**
 * Validează existența proprietăților fundamentale dintr-un obiect de configurare a erorilor.
 *
 * @param {Object} obiectJson - Obiectul JSON conținând configurarea erorilor.
 * @returns {void}
 */
function verificaProprietatiPrincipale(obiectJson) {
    if (!obiectJson.info_erori || !obiectJson.cale_baza || !obiectJson.eroare_default) {
        console.error("Eroare: Lipsesc una sau mai multe dintre proprietățile: info_erori, cale_baza, eroare_default.");
    }
}
verificaProprietatiPrincipale(obiectEroriParsed);

/**
 * Validează formatul obiectului eroare_default pentru a se asigura că are toate proprietățile necesare.
 *
 * @param {Object} eroareDefault - Obiectul ce definește eroarea standard.
 * @returns {void}
 */
function verificaProprietatiEroareDefault(eroareDefault) {
    if (eroareDefault) {
        if (!eroareDefault.titlu || !eroareDefault.text || !eroareDefault.imagine) {
            console.error("Eroare: Pentru eroarea default lipsește una dintre proprietățile: titlu, text sau imagine.");
        }
    }
}
verificaProprietatiEroareDefault(obiectEroriParsed.eroare_default);

/**
 * Verifică dacă folderul specificat ca bază pentru resursele erorilor există fizic.
 *
 * @param {string} caleBaza - Calea relativă declarată în erori.json.
 * @returns {void}
 */
function verificaExistentaFolderCaleBaza(caleBaza) {
    if (caleBaza) {
        let caleAbsoluta = path.join(__dirname, caleBaza);
        if (!fs.existsSync(caleAbsoluta)) {
            console.error(`Eroare: Folderul specificat în "cale_baza" (${caleBaza}) nu există în sistemul de fișiere.`);
        }
    }
}
verificaExistentaFolderCaleBaza(obiectEroriParsed.cale_baza);

/**
 * Asigură integritatea căilor către imaginile asociate erorilor din configurare.
 *
 * @param {string} caleBaza - Calea folderului de bază pentru imagini de eroare.
 * @param {Object} eroareDefault - Obiectul de configurare a erorii implicite.
 * @param {Object[]} infoErori - Array-ul de obiecte de configurare pentru erori specifice.
 * @returns {void}
 */
function verificaExistentaImagini(caleBaza, eroareDefault, infoErori) {
    if (caleBaza) {
        let caleAbsolutaBaza = path.join(__dirname, caleBaza);
        
        if (eroareDefault && eroareDefault.imagine) {
            let caleImgDefault = path.join(caleAbsolutaBaza, eroareDefault.imagine);
            if (!fs.existsSync(caleImgDefault)) {
                console.error(`Eroare: Fișierul imagine pentru eroarea default (${eroareDefault.imagine}) nu există.`);
            }
        }

        if (infoErori) {
            for (let eroare of infoErori) {
                if (eroare.imagine) {
                    let caleImg = path.join(caleAbsolutaBaza, eroare.imagine);
                    if (!fs.existsSync(caleImg)) {
                        console.error(`Eroare: Fișierul imagine (${eroare.imagine}) pentru eroarea cu identificatorul ${eroare.identificator} nu există.`);
                    }
                }
            }
        }
    }
}
verificaExistentaImagini(obiectEroriParsed.cale_baza, obiectEroriParsed.eroare_default, obiectEroriParsed.info_erori);

/**
 * Validează strict stringul JSON pentru a identifica chei duplicate la nivelul aceluiași obiect.
 *
 * @param {string} textJson - Conținutul brut citit din fișierul JSON.
 * @returns {void}
 */
function verificaProprietatiDuplicateString(textJson) {
    const regexObiecte = /\{[^{}]*\}/g;
    const obiecte = textJson.match(regexObiecte);
    
    if (obiecte) {
        for (let obiectStr of obiecte) {
            let chei = [...obiectStr.matchAll(/"([^"]+)"\s*:/g)].map(match => match[1]);
            let cheiUnice = new Set(chei);
            
            if (chei.length !== cheiUnice.size) {
                console.error("Eroare: Există o proprietate specificată de mai multe ori într-un obiect din fișierul JSON.");
            }
        }
    }
}
verificaProprietatiDuplicateString(textJsonErori);

/**
 * Identifică erorile de tip duplicat având același HTTP status/identificator intern.
 *
 * @param {Object[]} infoErori - Array de obiecte conținând erorile specifice din fișierul JSON.
 * @returns {void}
 */
function verificaIdentificatoriDuplicati(infoErori) {
    if (infoErori) {
        let dictionarId = {};
        
        for (let eroare of infoErori) {
            if (!dictionarId[eroare.identificator]) {
                dictionarId[eroare.identificator] = [];
            }
            dictionarId[eroare.identificator].push(eroare);
        }

        for (let id in dictionarId) {
            if (dictionarId[id].length > 1) {
                console.error(`Eroare: Există mai multe erori cu identificatorul ${id}.`);
            }
        }
    }
}
verificaIdentificatoriDuplicati(obiectEroriParsed.info_erori);

/**
 * Procesează datele de eroare din fișierul JSON și normalizează căile imaginilor în contextul global al aplicației.
 *
 * @returns {void}
 */
function initErori() {
    let continut = fs.readFileSync(path.join(__dirname, "resurse/json/erori.json")).toString("utf-8");
    let erori = obGlobal.obErori = JSON.parse(continut)
    let err_default = erori.eroare_default
    err_default.imagine = path.join(erori.cale_baza, err_default.imagine)
    for (let eroare of erori.info_erori) {
        eroare.imagine = path.join(erori.cale_baza, eroare.imagine)
    }
}
initErori()

/**
 * Randează și returnează pagina aferentă unei erori HTTP/Interne.
 *
 * @param {Object} res - Obiectul Express Response utilizat pentru a randa view-ul.
 * @param {number|string} identificator - Codul/ID-ul specific erorii.
 * @param {string} [titlu] - Parametru opțional care suprascrie titlul erorii.
 * @param {string} [text] - Parametru opțional care suprascrie textul erorii.
 * @param {string} [imagine] - Parametru opțional care suprascrie calea imaginii.
 * @returns {void}
 */
function afisareEroare(res, identificator, titlu, text, imagine) {
    let eroare = obGlobal.obErori.info_erori.find((elem) =>
        elem.identificator == identificator)
    let errDefault = obGlobal.obErori.eroare_default
    res.render("pagini/eroare", {
        imagine: imagine || eroare?.imagine || errDefault.imagine,
        titlu: titlu || eroare?.titlu || errDefault.titlu,
        text: text || eroare?.text || errDefault.text,
    })
}

app.get("/eroare", function(req, res) {
    afisareEroare(res, 404, "Eroare 404");
});

/**
 * Citește configurarea de galerie, generează thumbailuri (.webp) de dimensiune medie prin Sharp
 * și expune căile către mediul global pentru randare în view-uri.
 *
 * @returns {void}
 */
function initImagini() {
    var continut = fs.readFileSync(path.join(__dirname, "resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini = JSON.parse(continut);
    let vImagini = obGlobal.obImagini.imagini;
    let caleGalerie = obGlobal.obImagini.cale_galerie

    let caleAbs = path.join(__dirname, caleGalerie);
    let caleAbsMediu = path.join(caleAbs, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);
    
    for (let imag of vImagini) {
        [numeFis, ext] = imag.fisier_imagine.split(".");
        let caleFisAbs = path.join(caleAbs, imag.fisier_imagine);
        let caleFisMediuAbs = path.join(caleAbsMediu, numeFis + ".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        imag.fisier_mediu = path.join("/", caleGalerie, "mediu", numeFis + ".webp")
        imag.fisier_imagine = path.join("/", caleGalerie, imag.fisier_imagine)
    }
}
initImagini();

/**
 * Creează o copie a fișierului CSS compilat în folderul de backup, atașându-i un timestamp în nume.
 *
 * @param {string} caleCss - Calea absolută a fișierului sursă CSS existent.
 * @param {string} folderDestinatie - Calea folderului în care se realizează backup-ul.
 * @param {number} timestamp - Marcajul temporal folosit pentru redenumirea copiei de siguranță.
 * @returns {void}
 */
function creeazaBackup(caleCss, folderDestinatie, timestamp) {
    if (!fs.existsSync(caleCss)) return;

    if (!fs.existsSync(folderDestinatie)) {
        fs.mkdirSync(folderDestinatie, { recursive: true });
    }
    
    const numeFisCss  = path.basename(caleCss);
    const extensieCss = path.extname(numeFisCss);
    const numeBazaCss = path.basename(numeFisCss, extensieCss);
    const numeBackupCuTimestamp = `${numeBazaCss}_${timestamp}${extensieCss}`;

    fs.copyFileSync(caleCss, path.join(folderDestinatie, numeBackupCuTimestamp));
}

/**
 * Compilează fișierul SCSS în CSS și declanșează fluxul de creare a backup-ului fișierului compilat.
 *
 * @param {string} caleScss - Calea sau numele fișierului SCSS.
 * @param {string|null} caleCss - Calea de destinație CSS (dacă e null, o deduce pe baza folderului standard).
 * @param {string} folderDestinatieBackup - Calea directorului unde este plasat backupul fișierelor stil.
 * @param {number} timestamp - Marcajul temporal utilizat în procesul de logare a redenumirii fișierelor.
 * @returns {void}
 */
function compileazaScss(caleScss, caleCss, folderDestinatieBackup, timestamp) {
    if (!caleCss) {
        const numeFis = path.basename(caleScss, path.extname(caleScss));
        caleCss = path.join(obGlobal.folderCss, numeFis + ".css");
    }

    if (!path.isAbsolute(caleScss)) caleScss = path.join(obGlobal.folderScss, caleScss);

    creeazaBackup(caleCss, folderDestinatieBackup, timestamp);

    const rez = sass.compile(caleScss, { "sourceMap": true });
    fs.writeFileSync(caleCss, rez.css);
}

const timestampPornire = new Date().getTime();
const folderBackupPornire = path.join(obGlobal.folderBackup, "resurse/css", timestampPornire.toString());

vFisiere = fs.readdirSync(obGlobal.folderScss);
for (let numeFis of vFisiere) {
    if (path.extname(numeFis) == ".scss") {
        compileazaScss(numeFis, null, folderBackupPornire, timestampPornire);
    }
}

fs.watch(obGlobal.folderScss, function(eveniment, numeFis) {
    if ((eveniment == "change" || eveniment == "rename") && path.extname(numeFis) == ".scss") {
        let caleCompleta = path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)) {
            const tsModificare = new Date().getTime();
            const folderBackupModificare = path.join(obGlobal.folderBackup, "resurse/css", tsModificare.toString());
            compileazaScss(caleCompleta, null, folderBackupModificare, tsModificare);
        }
    }
});

app.get("/*pagina", function(req, res) {
    if (req.url.startsWith("/resurse")  && path.extname(req.url) == "") {
        afisareEroare(res, 403);
        return;
    }

    if (path.extname(req.url) == ".ejs") {
        afisareEroare(res, 400);
        return;
    }

    try {
        res.render("pagini" + req.url, function(err, rezRandare) {
            if (err) {
                if (err.message.includes("Failed to lookup view")) {
                    afisareEroare(res, 404)
                    return;
                }   
                afisareEroare(res)     
                return;   
            }
            res.send(rezRandare);
        })
    } catch(err) {
        if (err.message.includes("Cannot find module")) {
            afisareEroare(res, 404)
            return;
        }
        afisareEroare(res)
        return;
    }
})

app.listen(8080);
console.log("Serverul a pornit!");