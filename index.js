const express= require("express");
const path= require("path");
const fs=require("fs");
const sass=require("sass");
const sharp = require('sharp');

const app= express();
app.set("view engine", "ejs")



obGlobal={
    obErori:null,
    obImagini:null,
    folderScss: path.join(__dirname,"/resurse/scss"),
    folderCss: path.join(__dirname,"/resurse/css"),
    folderBackup: path.join(__dirname,"backup"),
}

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

let vect_folder=["temp","logs","backup","fisiere_uploadate"];
for(let folder of vect_folder){
    let caleFolder=path.join(__dirname, folder);
    if(!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder);
    }
}

app.use("/resurse",express.static(path.join(__dirname, "resurse")));
app.use("/dist",express.static(path.join(__dirname, "node_modules/bootstrap/dist")));

app.get("/favicon.ico", function(req,res){
    res.sendFile(path.join(__dirname,"resurse/imagini/favicon/favicon.ico"))
})

app.get(["/","/index","/home"], function(req,res){
    res.render("pagini/index",{
        ip:req.ip,
        imagini:obGlobal.obImagini.imagini
    });
});

app.get("/despre", function(req, res){
    res.render("pagini/despre");
});



//bonus 

const caleEroriJson = path.join(__dirname, "resurse/json/erori.json");

function verificaExistentaFisierErori(cale) {
    if (!fs.existsSync(cale)) {
        console.error("Eroare: Fișierul erori.json nu există.");
        process.exit();
    }
}
verificaExistentaFisierErori(caleEroriJson);

const textJsonErori = fs.readFileSync(caleEroriJson).toString("utf-8");

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

const obiectEroriParsed = JSON.parse(textJsonErori);

function verificaProprietatiPrincipale(obiectJson) {
    if (!obiectJson.info_erori || !obiectJson.cale_baza || !obiectJson.eroare_default) {
        console.error("Eroare: Lipsesc una sau mai multe dintre proprietățile: info_erori, cale_baza, eroare_default.");
    }
}
verificaProprietatiPrincipale(obiectEroriParsed);

function verificaProprietatiEroareDefault(eroareDefault) {
    if (eroareDefault) {
        if (!eroareDefault.titlu || !eroareDefault.text || !eroareDefault.imagine) {
            console.error("Eroare: Pentru eroarea default lipsește una dintre proprietățile: titlu, text sau imagine.");
        }
    }
}
verificaProprietatiEroareDefault(obiectEroriParsed.eroare_default);

function verificaExistentaFolderCaleBaza(caleBaza) {
    if (caleBaza) {
        let caleAbsoluta = path.join(__dirname, caleBaza);
        if (!fs.existsSync(caleAbsoluta)) {
            console.error(`Eroare: Folderul specificat în "cale_baza" (${caleBaza}) nu există în sistemul de fișiere.`);
        }
    }
}
verificaExistentaFolderCaleBaza(obiectEroriParsed.cale_baza);

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
                console.error(`Eroare: Există mai multe erori cu identificatorul ${id}. Detalii erori:`);
                for (let eroare of dictionarId[id]) {
                    let copieEroare = { ...eroare };
                    delete copieEroare.identificator;
                    console.error(JSON.stringify(copieEroare));
                }
            }
        }
    }
}
verificaIdentificatoriDuplicati(obiectEroriParsed.info_erori);

//bonus end

function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    let erori=obGlobal.obErori=JSON.parse(continut)
    let err_default=erori.eroare_default
    err_default.imagine=path.join(erori.cale_baza, err_default.imagine)
    for (let eroare of erori.info_erori){
        eroare.imagine=path.join(erori.cale_baza, eroare.imagine)
    }

}
initErori()

function afisareEroare(res,identificator,titlu,text,imagine)
{
    let eroare=obGlobal.obErori.info_erori.find((elem)=>
        elem.identificator==identificator)
        let errDefault = obGlobal.obErori.eroare_default
    res.render("pagini/eroare",{
        imagine: imagine || eroare?.imagine|| errDefault.imagine,
        titlu: titlu || eroare?.titlu || errDefault.titlu,
        text: text || eroare?.text || errDefault.text,
    })
}

app.get("/eroare", function(req,res)
{
    afisareEroare(res,404,"Eroare 404");
});

function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;
    let caleGalerie=obGlobal.obImagini.cale_galerie

    let caleAbs=path.join(__dirname,caleGalerie);
    let caleAbsMediu=path.join(caleAbs, "mediu");
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);
    
    for (let imag of vImagini){
        [numeFis, ext]=imag.fisier.split("."); //"ceva.png" -> ["ceva", "png"]
        let caleFisAbs=path.join(caleAbs,imag.fisier);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        sharp(caleFisAbs).resize(300).toFile(caleFisMediuAbs);
        imag.fisier_mediu=path.join("/", caleGalerie, "mediu", numeFis+".webp" )
        imag.fisier=path.join("/", caleGalerie, imag.fisier )
        
    }
    // console.log(obGlobal.obImagini)
}
initImagini();

function compileazaScss(caleScss, caleCss){
    if(!caleCss){

        let numeFisExt=path.basename(caleScss); // "folder1/folder2/a.scss" -> "a.scss"
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css"; // output: a.css
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    
    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }
    
    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss=path.basename(caleCss);
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css",numeFisCss ))// +(new Date()).getTime()
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    
}


vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})

app.get("/*pagina", function(req,res){
    console.log("Cale pagina", req.url);
    if(req.url.startsWith("/resurse")  && path.extname(req.url)==""){
        afisareEroare(res,403);
        return;
    }

    if (path.extname(req.url)==".ejs"){
        afisareEroare(res,400);
        return;
    }

    try{res.render("pagini"+req.url,function(err,rezRandare){
        if (err){
            if (err.message.includes("Failed to lookup view")){
                afisareEroare(res,404)
                return;
            }   
                afisareEroare(res)     
                return;   
            
        }
        res.send(rezRandare);

    })
    }catch(err){
        if (err.message.includes("Cannot find module")){
            afisareEroare(res,404)
            return;
        }
        afisareEroare(res)
        return;
    }
})

app.listen(8080);
console.log("Serverul a pornit!");