var app = document.getElementById('typeo');

var typewriter = new Typewriter(app, {
    loop: true
});

typewriter.typeString('Lux!')
    .pauseFor(2500)
    .deleteAll()
    .typeString('</Cracks/>')
    .pauseFor(2500)
    .deleteAll()
    .typeString('Adios!')
    .pauseFor(2500)
    .start();