// Variables globales
let spheres = [];
let rotationX = 0;
let rotationY = 0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

// Paramètres
let sphereCount = 15;
let colorHue = 180;
let colorSaturation = 15;
let colorPalette = [];

P5Capture.setDefaultOptions({
  format: "gif",
  framerate: 30,
  quality: 1,
  width: 320,
});

// Initialisation p5.js
function setup() {
    console.log("Setup en cours...");
    
    // Créer le canvas - taille réduite pour éviter les problèmes
    let canvas = createCanvas(700, 700, WEBGL);
    canvas.parent('canvasContainer');
    
    // Générer la palette initiale
    generateColorPalette();
    
    // Initialiser les contrôles
    initControls();
    
    // Générer les premières sphères
    generateSpheres();
    
    console.log("Setup terminé");
}

function draw() {
    // Fond sombre
    background(15, 15, 20);
    
    // Éclairage minimal
    ambientLight(60);
    directionalLight(255, 255, 255, 0, 0, -1);
    
    // Contrôles de rotation
    rotateX(rotationY);
    rotateY(rotationX);
    
    // Désactiver le stroke pour un rendu plus propre
    noStroke();
    
    // Dessiner toutes les sphères
    for (let i = 0; i < spheres.length; i++) {
        let s = spheres[i];
        
        push();
        
        // Position avec animation subtile
        let time = frameCount * 0.01;
        let moveX = sin(time + s.noiseOffsetX) * 10;
        let moveY = cos(time + s.noiseOffsetY) * 10;
        let moveZ = sin(time * 0.7 + s.noiseOffsetZ) * 5;
        
        translate(s.x + moveX, s.y + moveY, s.z + moveZ);
        
        // Rotation lente
        rotateY(s.rotationSpeed * frameCount * 0.01);
        
        // Couleur avec variations subtiles
        let colorVariation = sin(frameCount * 0.02 + i) * 0.1;
        fill(
            s.baseColor[0] + colorVariation * 20,
            s.baseColor[1] + colorVariation * 20,
            s.baseColor[2] + colorVariation * 20
        );
        
        // Taille avec légère variation
        let sizeVariation = sin(frameCount * 0.015 + i) * 0.1;
        let currentSize = s.size * (1 + sizeVariation);
        
        // Dessiner la sphère
        sphere(currentSize, 24, 24); // 24 segments pour un rendu lisse
        
        pop();
    }
}

// Fonction pour générer une palette de couleurs
function generateColorPalette() {
    colorPalette = [];
    const paletteSize = 6;
    
    for (let i = 0; i < paletteSize; i++) {
        // Variation autour de la teinte principale
        let hueVariation = (colorHue + map(i, 0, paletteSize, -30, 30)) % 360;
        
        // Conversion HSL vers RGB
        let h = hueVariation / 360;
        let s = colorSaturation / 100;
        let l = 0.5; // Luminosité moyenne
        
        let rgb = hslToRgb(h, s, l);
        colorPalette.push(rgb);
    }
}

// Conversion HSL vers RGB
function hslToRgb(h, s, l) {
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l;
    } else {
        let hue2rgb = function(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    ];
}

// Générer de nouvelles sphères
function generateSpheres() {
    spheres = [];
    
    for (let i = 0; i < sphereCount; i++) {
        let colorIndex = floor(random(colorPalette.length));
        
        spheres.push({
            // Position aléatoire
            x: random(-250, 250),
            y: random(-300, 300),
            z: random(-150, 150),
            
            // Taille aléatoire
            size: random(40, 120),
            
            // Couleur
            colorIndex: colorIndex,
            baseColor: colorPalette[colorIndex],
            
            // Animation
            rotationSpeed: random(-0.5, 0.5),
            
            // Offsets pour les animations
            noiseOffsetX: random(100),
            noiseOffsetY: random(100),
            noiseOffsetZ: random(100)
        });
    }
    
    console.log(`${sphereCount} sphères générées`);
}

// Mettre à jour les couleurs seulement
function updateSphereColors() {
    for (let sphere of spheres) {
        if (sphere.colorIndex < colorPalette.length) {
            sphere.baseColor = colorPalette[sphere.colorIndex];
        } else {
            sphere.colorIndex = floor(random(colorPalette.length));
            sphere.baseColor = colorPalette[sphere.colorIndex];
        }
    }
}

// Initialiser les contrôles de l'interface
function initControls() {
    // Curseur nombre de sphères
    const countSlider = document.getElementById('sphereCountSlider');
    const countValue = document.getElementById('sphereCountValue');
    
    countSlider.addEventListener('input', (e) => {
        sphereCount = parseInt(e.target.value);
        countValue.textContent = sphereCount;
        generateSpheres();
    });
    
    // Curseur teinte
    const hueSlider = document.getElementById('colorHueSlider');
    const hueValue = document.getElementById('colorHueValue');
    
    hueSlider.addEventListener('input', (e) => {
        colorHue = parseInt(e.target.value);
        hueValue.textContent = colorHue + '°';
        generateColorPalette();
        updateSphereColors();
    });
    
    // Curseur saturation
    const saturationSlider = document.getElementById('colorSaturationSlider');
    const saturationValue = document.getElementById('colorSaturationValue');
    
    saturationSlider.addEventListener('input', (e) => {
        colorSaturation = parseInt(e.target.value);
        saturationValue.textContent = colorSaturation + '%';
        generateColorPalette();
        updateSphereColors();
    });
    
    // Bouton générer
    document.getElementById('generateBtn').addEventListener('click', () => {
        generateSpheres();
    });
    
    // Bouton sauvegarder
    document.getElementById('saveBtn').addEventListener('click', () => {
        saveCanvas('poster_3d_' + Date.now(), 'png');
    });
    
    // Gestion de la souris pour la rotation
    let canvasElement = document.querySelector('#canvasContainer canvas');
    
    canvasElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        rotationX += (e.clientX - lastMouseX) * 0.005;
        rotationY += (e.clientY - lastMouseY) * 0.005;
        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    // Gestion du clavier
    document.addEventListener('keydown', (e) => {
        const countSlider = document.getElementById('sphereCountSlider');
        const countValue = document.getElementById('sphereCountValue');
        
        switch(e.key) {
            case ' ':
                e.preventDefault();
                generateSpheres();
                break;
                
            case 's':
            case 'S':
                e.preventDefault();
                saveCanvas('poster_3d_' + Date.now(), 'png');
                break;
                
            case '+':
            case '=':
                e.preventDefault();
                if (sphereCount < 30) {
                    sphereCount++;
                    countSlider.value = sphereCount;
                    countValue.textContent = sphereCount;
                    generateSpheres();
                }
                break;
                
            case '-':
            case '_':
                e.preventDefault();
                if (sphereCount > 5) {
                    sphereCount--;
                    countSlider.value = sphereCount;
                    countValue.textContent = sphereCount;
                    generateSpheres();
                }
                break;
        }
    });
}