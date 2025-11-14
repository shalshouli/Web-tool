/*let canvas;
const colors = ['#EA1800', '#013BEB', '#F5A001', '#1B9900'];
let fonts = ['Inter', 'Alfa Slab One'];

function setup() {
    console.log("P5.js est chargé !");
    
    // Créer le canvas directement dans le conteneur
    canvas = createCanvas(800, 1000);
    canvas.parent('canvasContainer');
    
    // Générer le premier poster
    generatePoster();
    
    // Ajouter les événements aux boutons
    document.getElementById('generateBtn').addEventListener('click', generatePoster);
    document.getElementById('saveBtn').addEventListener('click', savePoster);
    
    // Régénérer quand le texte change
    document.getElementById('customText').addEventListener('input', generatePoster);
}

function generatePoster() {
    console.log("Génération d'une nouvelle composition...");
    
    // Fond blanc pour le poster
    background(255);
    
    // Générer des formes
    generateShapes();
    
    // Ajouter le texte personnalisé
    addCustomText();
    
    console.log("Composition générée !");
}

function generateShapes() {
    // Pas de stroke
    noStroke();
    
    // Générer entre 8 et 12 formes
    let shapeCount = int(random(8, 12));
    
    for (let i = 0; i < shapeCount; i++) {
        let x = random(width);
        let y = random(height);
        
        // Choisir une couleur aléatoire parmi les 4
        let colorIndex = int(random(colors.length));
        let chosenColor = color(colors[colorIndex]);
        
        // Appliquer la transparence
        let alpha = random(150, 230);
        chosenColor.setAlpha(alpha);
        fill(chosenColor);
        
        let shapeType = int(random(3));
        
        switch(shapeType) {
            case 0:
                // Cercle parfait - diamètre 100px
                ellipse(x, y, 100, 100);
                break;
            case 1:
                // Carré parfait - 100x100px
                rect(x, y, 100, 100);
                break;
            case 2:
                // Triangle équilatéral parfait
                let triangleSize = 100;
                triangle(
                    x, y,
                    x + triangleSize, y,
                    x + triangleSize/2, y - (triangleSize * 0.866) // Hauteur d'un triangle équilatéral
                );
                break;
        }
    }
}

function addCustomText() {
    let customText = document.getElementById('customText').value;
    
    if (customText.trim() === "") {
        customText = "COMPOSITION";
    }
    
    // Choisir une police aléatoire
    let fontIndex = int(random(fonts.length));
    let chosenFont = fonts[fontIndex];
    
    // Utiliser la police choisie
    textFont(chosenFont);
    textAlign(CENTER, CENTER);
    
    // Texte beaucoup plus gros
    let textSizeValue = random(80, 140);
    textSize(textSizeValue);
    
    // Style selon la police
    if (chosenFont === 'Inter') {
        textStyle(BOLD);
    } else {
        // Alfa Slab One est déjà bold par défaut
        textStyle(NORMAL);
    }
    
    // Choisir une couleur aléatoire parmi les 4 pour le texte
    let textColorIndex = int(random(colors.length));
    fill(colors[textColorIndex]);
    
    // Position du texte
    let x = width / 2;
    let y = random(250, height - 250);
    
    // Dessiner le texte
    text(customText, x, y);
}

function savePoster() {
    saveCanvas('poster_' + year() + month() + day() + hour() + minute() + second(), 'png');
}*/