let canvas;
const colors = ['#EA1800', '#013BEB', '#F5A001', '#1B9900'];
let fonts = [
    'Inter',           // Sans-serif moderne
    'Alfa Slab One',   // Serif bold
    'Pacifico',        // Script cursif
    'Montserrat',      // Sans-serif géométrique
    'Playfair Display', // Serif élégant
    'Roboto Slab',     // Slab serif
    'Lobster',         // Script décontracté
    'Oswald',          // Sans-serif condensé
    'Raleway'          // Sans-serif élégant
];

// Variables pour stocker les paramètres du poster actuel
let currentShapes = [];
let currentTextProperties = {};

function setup() {
    console.log("P5.js est chargé !");
    
    // Calculer la taille du canvas pour qu'il s'adapte à la hauteur de l'écran
    let container = document.querySelector('.poster-container');
    let maxHeight = container.clientHeight * 0.9; // 90% de la hauteur du conteneur
    let width = Math.min(800, maxHeight * 0.8); // Ratio 4:5 pour le poster
    
    // Créer le canvas
    canvas = createCanvas(width, maxHeight);
    canvas.parent('canvasContainer');
    
    // Générer le premier poster (avec formes et texte)
    generateNewPoster();
    
    // Ajouter les événements aux boutons
    document.getElementById('generateBtn').addEventListener('click', generateNewPoster);
    document.getElementById('saveBtn').addEventListener('click', savePoster);
    
    // Mettre à jour seulement le texte quand l'input change
    document.getElementById('customText').addEventListener('input', updateTextOnly);
}

function windowResized() {
    // Recalculer la taille quand la fenêtre est redimensionnée
    let container = document.querySelector('.poster-container');
    let maxHeight = container.clientHeight * 0.9;
    let width = Math.min(800, maxHeight * 0.8);
    
    resizeCanvas(width, maxHeight);
    redrawPoster();
}

function generateNewPoster() {
    console.log("Génération d'une NOUVELLE composition avec de nouvelles formes...");
    
    // Générer de NOUVELLES formes et NOUVELLES propriétés de texte
    generateShapes();
    generateTextProperties();
    
    // Dessiner le poster avec les nouvelles formes et le texte
    redrawPoster();
    
    console.log("Nouvelle composition générée avec de nouvelles formes !");
}

function generateShapes() {
    // Générer entre 8 et 12 NOUVELLES formes
    let shapeCount = int(random(8, 12));
    currentShapes = []; // Réinitialiser les formes
    
    for (let i = 0; i < shapeCount; i++) {
        let x = random(width);
        let y = random(height);
        
        // Choisir une couleur aléatoire parmi les 4
        let colorIndex = int(random(colors.length));
        let chosenColor = color(colors[colorIndex]);
        
        // Appliquer la transparence
        let alpha = random(150, 230);
        chosenColor.setAlpha(alpha);
        
        // Tailles différentes mais proportionnelles au canvas
        // Entre 5% et 20% de la plus petite dimension du canvas
        let minSize = min(width, height) * 0.05;
        let maxSize = min(width, height) * 0.2;
        let baseSize = random(minSize, maxSize);
        
        let shapeType = int(random(3));
        
        // Stocker la NOUVELLE forme
        currentShapes.push({
            x: x,
            y: y,
            color: chosenColor.toString(),
            alpha: alpha,
            size: baseSize,
            type: shapeType
        });
    }
    console.log("Nouvelles formes générées avec différentes tailles:", currentShapes.length);
}

function generateTextProperties() {
    // Choisir une police aléatoire
    let fontIndex = int(random(fonts.length));
    let chosenFont = fonts[fontIndex];
    
    // Choisir une couleur aléatoire parmi les 4 pour le texte
    let textColorIndex = int(random(colors.length));
    
    // Taille du texte proportionnelle au canvas
    let textSizeValue = min(width, height) * 0.1;
    
    // Position du texte
    let textY = random(height * 0.3, height * 0.7);
    
    // Stocker les NOUVELLES propriétés du texte
    currentTextProperties = {
        font: chosenFont,
        color: colors[textColorIndex],
        size: textSizeValue,
        y: textY
    };
    
    console.log("Nouvelle police sélectionnée:", chosenFont);
}

function redrawPoster() {
    // Effacer le canvas
    clear();
    
    // Fond blanc pour le poster
    background(255);
    
    // Redessiner toutes les formes stockées
    drawShapes();
    
    // Redessiner le texte (seulement si l'input n'est pas vide)
    drawText();
}

function drawShapes() {
    // Pas de stroke
    noStroke();
    
    // Dessiner toutes les formes stockées
    for (let shape of currentShapes) {
        let c = color(shape.color);
        c.setAlpha(shape.alpha);
        fill(c);
        
        switch(shape.type) {
            case 0:
                // Cercle parfait - diamètre égal dans les deux dimensions
                ellipse(shape.x, shape.y, shape.size, shape.size);
                break;
            case 1:
                // Carré parfait - largeur = hauteur
                rect(shape.x, shape.y, shape.size, shape.size);
                break;
            case 2:
                // Triangle équilatéral parfait
                let triangleSize = shape.size;
                triangle(
                    shape.x, shape.y,
                    shape.x + triangleSize, shape.y,
                    shape.x + triangleSize/2, shape.y - (triangleSize * 0.866)
                );
                break;
        }
    }
}

function drawText() {
    let customText = document.getElementById('customText').value;
    
    // Si le texte est vide, NE PAS afficher de texte
    if (customText.trim() === "") {
        return; // Sortir de la fonction sans dessiner de texte
    }
    
    // Utiliser la police stockée
    textFont(currentTextProperties.font);
    textAlign(CENTER, CENTER);
    textSize(currentTextProperties.size);
    
    // Style selon la police
    if (currentTextProperties.font === 'Inter' || 
        currentTextProperties.font === 'Montserrat' || 
        currentTextProperties.font === 'Raleway' ||
        currentTextProperties.font === 'Playfair Display') {
        textStyle(BOLD);
    } else {
        textStyle(NORMAL);
    }
    
    // Utiliser la couleur stockée
    fill(currentTextProperties.color);
    
    // Position du texte
    let x = width / 2;
    let y = currentTextProperties.y;
    
    // Dessiner le texte
    text(customText, x, y);
}

function updateTextOnly() {
    console.log("Mise à jour du texte seulement...");
    
    // Effacer le canvas
    clear();
    
    // Fond blanc pour le poster
    background(255);
    
    // Redessiner les formes existantes (sans en générer de nouvelles)
    drawShapes();
    
    // Redessiner le texte avec la nouvelle valeur (ou ne rien dessiner si vide)
    drawText();
    
    console.log("Texte mis à jour sans changer les formes !");
}

function savePoster() {
    saveCanvas('poster_' + year() + month() + day() + hour() + minute() + second(), 'png');
}