# Webtool 

## I/ Idée du projet

- Shapes
- Colors
- Typography
- Posters
- Randomize 
## Liens

-[Gradient]([https://](https://everywhere.tools/projects/photo-gradient))

## II/ Description
L'outil sert à créer des posters graphique et colorés avec diverses couleurs, shapes et typographies. Chaque poster est différent et peut être randomize.

Si possible : 

- Ajouter des curseurs de réglages (texture, nombre de formes, nombre de couleurs sur le poster...)
- Permettre de changer la couleur de fond du canva
- Ajouter un outil de dessin libre (pinceau)
- Pouvoir mettre le texte où on le souhaite

## III/ Snippets

Bout de code pour le projet (fonctionnalités)
 
 - Créer des formes
 - Randomize les couleurs de ces formes avec une palette
 - Ajouter du texte personnalisé

//Structure de base P5.js

````
let canvas;

function setup() {
    // Création du canvas
    canvas = createCanvas(800, 1000);
    canvas.parent('canvasContainer');
    
    // Génération initiale
    generatePoster();
    
    // Événements
    document.getElementById('generateBtn').addEventListener('click', generatePoster);
    document.getElementById('saveBtn').addEventListener('click', savePoster);
    document.getElementById('customText').addEventListener('input', generatePoster);
}

function generatePoster() {
    background(255); // Fond blanc
    generateShapes(); // Génération des formes
    addCustomText(); // Ajout du texte
}

function savePoster() {
    saveCanvas('poster_' + Date.now(), 'png');
}
````

//Création de formes géométriques parfaites

```
 function generateShapes() {
    // Désactivation des contours
    noStroke();
    
    // Génération d'un nombre aléatoire de formes
    let shapeCount = int(random(8, 12));
    
    for (let i = 0; i < shapeCount; i++) {
        let x = random(width);
        let y = random(height);
        
        // Sélection aléatoire d'une couleur
        let colorIndex = int(random(colors.length));
        let chosenColor = color(colors[colorIndex]);
        let alpha = random(150, 230);
        chosenColor.setAlpha(alpha);
        fill(chosenColor);
        
        // Sélection aléatoire du type de forme
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
                    x + triangleSize/2, y - (triangleSize * 0.866)
                );
                break;
        }
    }
}
````

//Ajout de typographie avec polices Google Fonts

```// Définition des polices disponibles
let fonts = ['Inter', 'Alfa Slab One'];

function addCustomText() {
    // Récupération du texte personnalisé
    let customText = document.getElementById('customText').value;
    if (customText.trim() === "") {
        customText = "COMPOSITION";
    }
    
    // Sélection aléatoire de la police
    let fontIndex = int(random(fonts.length));
    let chosenFont = fonts[fontIndex];
    
    // Application des styles typographiques
    textFont(chosenFont);
    textAlign(CENTER, CENTER);
    textSize(random(80, 140)); // Taille aléatoire entre 80 et 140px
    
    // Adaptation du style selon la police
    if (chosenFont === 'Inter') {
        textStyle(BOLD);
    } else {
        textStyle(NORMAL);
    }
    
    // Sélection aléatoire de la couleur du texte
    let textColorIndex = int(random(colors.length));
    fill(colors[textColorIndex]);
    
    // Positionnement aléatoire du texte
    let x = width / 2;
    let y = random(250, height - 250);
    
    // Affichage du texte
    text(customText, x, y);
}
````


// Définition de la palette de 4 couleurs
```
const colors = ['#EA1800', '#013BEB', '#F5A001', '#1B9900'];

// Utilisation d'une couleur aléatoire
let colorIndex = int(random(colors.length));
let chosenColor = color(colors[colorIndex]);

// Application avec transparence
let alpha = random(150, 230);
chosenColor.setAlpha(alpha);
fill(chosenColor);