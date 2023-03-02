var app = document.getElementById('typeo');

var typewriter = new Typewriter(app, {
    loop: true
});

typewriter.typeString('Lux!')
    .pauseFor(2500)
    .deleteAll()
    .typeString('</Cracks/>')
    .pauseFor(1000)
    .deleteAll()
    .typeString('Adios!')
    .pauseFor(1000)
    .start();

  
function cargar(){  
    var a = document.getElementById('carga');
    a.classList.add("d-none");  
}

//Cambio de color
const style = document.documentElement.style
const ChangeThema = (element) => {
    if(element==1){
        style.setProperty("--colorSecundario","#FFB801")
    }else if(element==2){
        style.setProperty("--colorSecundario","#ec4c4c")
    }else if(element==3){
        style.setProperty("--colorSecundario","#884EA0")
    }else if(element==4){
        style.setProperty("--colorSecundario","#148F77")
    }else{
        style.setProperty("--colorSecundario","ec4c4c")
    }
}