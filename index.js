const express= require("express");
const path= require("path");

app= express();
app.set("view engine", "ejs")

console.log("Folder index.js", __dirname);
console.log("Folder curent (de lucru)", process.cwd());
console.log("Cale fisier", __filename);

// app.get("/resurse/css/general.css", function(req,res){

app.use("/resurse", express.static(path.join(__dirname, "resurse")));

app.get("/", function(req,res){
    res.render("pagini/index")
});

app.get("/despre", function(req,res){
    res.render("pagini/index/despre")
});

app.get("/:a/:b", function(req,res){
    res.sendFile(path.join(__dirname, "index.html"));
    console.log(parseInt(req.params.a) +  parseInt(req.params.b));
});

app.get("/cale/:a/:b", function(req,res){
    res.send(parseInt(req.params.a) +  parseInt(req.params.b));
    console.log(" Am primit o cerere GET la adresa /cale");
});

app.get("/cale", function(req,res){
    res.send(" Salut, aceasta este\n o <B style='color:blue'>cerere GET la adresa<b> /cale");
    console.log(" Am primit o cerere GET la adresa /cale");
});

app.get("/cale2", function(req,res){
    res.write("fsad \n");
    res.write("fsaasdffffffffd");
    res.end();
});







app.listen(8080);
console.log("Serverul a pornit!");

