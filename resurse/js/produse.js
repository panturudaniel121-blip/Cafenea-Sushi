window.onload=function(){


    document.getElementById("inp-pret").onchange=function(){
        let val=this.value.trim()
        document.getElementById("infoRange").innerHTML=`(${val})`
    }

    document.getElementById("filtrare").onclick=function(){
        let inpNume=document.getElementById("inp-nume").value.trim().toLowerCase()

        let grupRadio=document.getElementsByName("gr_rad")
        let caloriiMin, caloriiMax, isToate=false;
        for (let rad of grupRadio){
            if (rad.checked){
                if (rad.value!="toate"){
                    [caloriiMin,caloriiMax]= rad.value.split(":")  
                    caloriiMin=parseInt(caloriiMin)
                    caloriiMax=parseInt(caloriiMax)
                }
                else{
                    isToate=true
                }
                break
            }
        }

        let inpPretMin=parseFloat(document.getElementById("inp-pret").value.trim())

        let inpCategorie=document.getElementById("inp-categorie").value.trim().toLowerCase()

        let produse=document.getElementsByClassName("produs")
        for (let prod of produse){
            prod.style.display="none"

            let nume= prod.getElementsByClassName("val-nume")[0].innerHTML.trim().toLowerCase()
            let cond1=nume.includes(inpNume)


            let calorii=parseInt(prod.getElementsByClassName("val-calorii")[0].innerHTML.trim())
            let cond2=(calorii>=caloriiMin && calorii<caloriiMax) || isToate;

            let pret=parseFloat(prod.getElementsByClassName("val-pret")[0].innerHTML.trim())
            let cond3=pret>=inpPretMin

            let cond4=prod.getElementsByClassName("val-categorie")[0].innerHTML.trim().toLowerCase() == inpCategorie || inpCategorie== "toate";


            if (cond1 && cond2 && cond3 && cond4){
                prod.style.display="block"
            }
        }
    }

    document.getElementById("resetare").onclick=function(){
        document.getElementById("inp-nume").value=""
        document.getElementById("inp-pret").value="0"
        document.getElementById("infoRange").innerHTML="(0)"
        document.getElementById("inp-categorie").value="toate"
        document.getElementById("i_rad4").checked=true

        let produse=document.getElementsByClassName("produs")
        for (let prod of produse){
            prod.style.display="block"
        }

    }
}
