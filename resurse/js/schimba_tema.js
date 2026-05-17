window.addEventListener("DOMContentLoaded", function(){

    if(localStorage.getItem("tema")=="dark"){
        document.body.classList.add("dark")
    }
    else{
        document.body.classList.remove("dark")
    }
    
    
    document.getElementById("schimba_tema").onclick= function(){
        if(localStorage.getItem("tema")=="dark")
            {
                localStorage.setItem("tema","light")
                document.body.classList.remove("dark")
            }
            else {
                localStorage.setItem("tema","dark")
                document.body.classList.add("dark") 
        }

    }
});