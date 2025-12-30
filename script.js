// Variables globales
let spheres = [];
let rotationX = 0;
let rotationY = 0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let isLightMode = false;
let saveCounter = 1;

// Paramètres
let sphereCount = 15;
let colorHue = 180;
let colorSaturation = 15;
let movementSpeed = 1.0;
let colorPalette = [];

P5Capture.setDefaultOptions({
  format: "gif",
  framerate: 60,
  quality: 1,
  width: 320,
});

// Fonction pour convertir une valeur linéaire (0-100) en échelle logarithmique (0.0-10.0)
function logarithmicSpeed(value) {
    if (value <= 0) return 0.0;
    
    if (value <= 50) {
        return value / 50;
    } else if (value <= 75) {
        return 1.0 + ((value - 50) / 25) * 2.0;
    } else if (value <= 90) {
        return 3.0 + ((value - 75) / 15) * 3.0;
    } else {
        return 6.0 + ((value - 90) / 10) * 4.0;
    }
}

// Fonction inverse : convertir une vitesse en valeur de curseur
function speedToSliderValue(speed) {
    if (speed <= 0) return 0;
    if (speed <= 1.0) {
        return speed * 50;
    } else if (speed <= 3.0) {
        return 50 + ((speed - 1.0) / 2.0) * 25;
    } else if (speed <= 6.0) {
        return 75 + ((speed - 3.0) / 3.0) * 15;
    } else {
        return 90 + ((speed - 6.0) / 4.0) * 10;
    }
}

// Fonction pour déplacer l'enregistrement dans la sidebar
function moveRecordingToSidebar() {
    setTimeout(() => {
        const recordingBox = document.querySelector('.p5c-container');
        const recordingContainer = document.getElementById('recording-box-container');
        
        if (recordingBox && recordingContainer) {
            recordingContainer.appendChild(recordingBox);
            recordingBox.draggable = false;
            console.log("Boîte d'enregistrement déplacée dans la sidebar");
        }
    }, 1000);
}

// Initialisation p5.js
function setup() {
    console.log("Setup en cours...");
    
    // Créer le canvas
    let canvas = createCanvas(700, 700, WEBGL);
    canvas.parent('canvasContainer');
    
    // Déplacer l'enregistrement dans la sidebar
    moveRecordingToSidebar();
    
    // Générer la palette initiale
    generateColorPalette();
    
    // Initialiser les contrôles
    initControls();
    
    // Générer les premières sphères
    generateSpheres();
    
    console.log("Setup terminé");
}

// Fonction pour générer des valeurs aléatoires pour tous les curseurs
function generateRandomSettings() {
    console.log("Génération de paramètres aléatoires...");
    
    // 1. Nombre de sphères aléatoire (5-30)
    sphereCount = Math.floor(random(5, 31));
    document.getElementById('sphereCountSlider').value = sphereCount;
    document.getElementById('sphereCountValue').textContent = sphereCount;
    
    // 2. Teinte aléatoire (0-360)
    colorHue = Math.floor(random(0, 361));
    document.getElementById('colorHueSlider').value = colorHue;
    document.getElementById('colorHueValue').textContent = colorHue + '°';
    
    // 3. Saturation aléatoire (5-100)
    colorSaturation = Math.floor(random(5, 101));
    document.getElementById('colorSaturationSlider').value = colorSaturation;
    document.getElementById('colorSaturationValue').textContent = colorSaturation + '%';
    
    // 4. Vitesse aléatoire (0.0-10.0 en échelle logarithmique)
    const randomSpeed = random(0, 10.1);
    movementSpeed = randomSpeed;
    const sliderValue = speedToSliderValue(randomSpeed);
    document.getElementById('movementSpeedSlider').value = sliderValue;
    document.getElementById('movementSpeedValue').textContent = randomSpeed.toFixed(1) + 'x';
    
    // Regénérer la palette avec les nouvelles valeurs
    generateColorPalette();
    
    // Générer de nouvelles sphères avec les nouveaux paramètres
    generateSpheres(); 
    
    console.log("Paramètres aléatoires appliqués");
    console.log(`- Sphères: ${sphereCount}`);
    console.log(`- Teinte: ${colorHue}°`);
    console.log(`- Saturation: ${colorSaturation}%`);
    console.log(`- Vitesse: ${movementSpeed.toFixed(1)}x`);
}

function draw() {
    // Fond
    if (isLightMode) {
        background(240, 240, 245);
    } else {
        background(15, 15, 20);
    }
    
    // Éclairage
    if (isLightMode) {
        ambientLight(200);
        directionalLight(255, 255, 255, 0, 0, -1);
    } else {
        ambientLight(60);
        directionalLight(255, 255, 255, 0, 0, -1);
    }
    
    // Contrôles de rotation
    rotateX(rotationY);
    rotateY(rotationX);
    
    // Désactiver le stroke pour un rendu plus propre
    noStroke();
    
    // Dessiner toutes les sphères
    for (let i = 0; i < spheres.length; i++) {
        let s = spheres[i];
        
        push();
        
        // Position avec animation - MULTIPLIÉ PAR movementSpeed
        let time = frameCount * 0.01 * movementSpeed;
        let moveX = sin(time + s.noiseOffsetX) * 10;
        let moveY = cos(time + s.noiseOffsetY) * 10;
        let moveZ = sin(time * 0.7 + s.noiseOffsetZ) * 5;
        
        translate(s.x + moveX, s.y + moveY, s.z + moveZ);
        
        // Rotation - MULTIPLIÉE PAR movementSpeed
        rotateY(s.rotationSpeed * frameCount * 0.01 * movementSpeed);
        
        // Couleur avec variations subtiles
        let colorVariation = sin(frameCount * 0.02 * movementSpeed + i) * 0.1;
        let r = s.baseColor[0] + colorVariation * 20;
        let g = s.baseColor[1] + colorVariation * 20;
        let b = s.baseColor[2] + colorVariation * 20;
        
        fill(r, g, b);
        
        // Taille avec légère variation
        let sizeVariation = sin(frameCount * 0.015 * movementSpeed + i) * 0.1;
        let currentSize = s.size * (1 + sizeVariation);
        
        // Dessiner la sphère
        sphere(currentSize, 24, 24);
        
        pop();
    }
}

// Fonction pour générer une palette de couleurs
function generateColorPalette() {
    colorPalette = [];
    const paletteSize = 6;
    
    for (let i = 0; i < paletteSize; i++) {
        // Variation autour de la teinte principale
        const hueOffset = -30 + (i / (paletteSize - 1)) * 60;
        let hueVariation = (colorHue + hueOffset) % 360;
        
        let h = hueVariation / 360;
        let s = colorSaturation / 100;
        let l = 0.6; // Luminosité moyenne-haute
        
        // IMPORTANT: Si saturation < 20%, augmenter pour éviter les gris
        if (s < 0.2) {
            s = 0.2; // Minimum 20% de saturation
        }
        
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
            x: random(-250, 250),
            y: random(-300, 300),
            z: random(-150, 150),
            size: random(40, 120),
            colorIndex: colorIndex,
            baseColor: colorPalette[colorIndex],
            rotationSpeed: random(-0.5, 0.5),
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
    
    // CURSEUR vitesse de mouvement avec échelle logarithmique
    const speedSlider = document.getElementById('movementSpeedSlider');
    const speedValue = document.getElementById('movementSpeedValue');
    
    // Initialiser le curseur à la position correspondant à 1.0x
    speedSlider.value = speedToSliderValue(1.0);
    
    speedSlider.addEventListener('input', (e) => {
        const rawValue = parseInt(e.target.value);
        // Conversion échelle logarithmique
        movementSpeed = logarithmicSpeed(rawValue);
        speedValue.textContent = movementSpeed.toFixed(1) + 'x';
    });
    
    // Bouton générer - MAINTENANT AVEC VALEURS ALÉATOIRES
    document.getElementById('generateBtn').addEventListener('click', () => {
        generateRandomSettings();
    });
    
    // Bouton sauvegarder
    document.getElementById('saveBtn').addEventListener('click', () => {
        saveCanvas('orbify_poster_' + saveCounter, 'png');
        saveCounter++;
    });
    
    // Bouton thème
    document.getElementById('themeToggle').addEventListener('click', () => {
        isLightMode = !isLightMode;
        document.body.classList.toggle('light-mode');
        const button = document.getElementById('themeToggle');
        button.textContent = isLightMode ? '🌙' : '☀️';
    });
    
    // Gestion de la souris pour la rotation
    let canvasElement = document.querySelector('#canvasContainer canvas');
    
    if (canvasElement) {
        canvasElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        });
    }
    
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
        const speedSlider = document.getElementById('movementSpeedSlider');
        const speedValue = document.getElementById('movementSpeedValue');
        
        switch(e.key) {
            case ' ':
                e.preventDefault();
                generateRandomSettings(); // Espace génère aussi des valeurs aléatoires
                break;
                
            case 's':
            case 'S':
                e.preventDefault();
                saveCanvas('orbify_poster_' + Date.now(), 'png');
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
                
            // RACCOURCIS POUR LA VITESSE
            case ']':
            case '}':
                e.preventDefault();
                if (movementSpeed < 10.0) {
                    if (movementSpeed < 1.0) movementSpeed += 0.1;
                    else if (movementSpeed < 3.0) movementSpeed += 0.2;
                    else if (movementSpeed < 6.0) movementSpeed += 0.3;
                    else movementSpeed += 0.4;
                    
                    speedSlider.value = speedToSliderValue(movementSpeed);
                    speedValue.textContent = movementSpeed.toFixed(1) + 'x';
                }
                break;
                
            case '[':
            case '{':
                e.preventDefault();
                if (movementSpeed > 0.0) {
                    if (movementSpeed <= 1.0) movementSpeed = Math.max(0, movementSpeed - 0.1);
                    else if (movementSpeed <= 3.0) movementSpeed -= 0.2;
                    else if (movementSpeed <= 6.0) movementSpeed -= 0.3;
                    else movementSpeed -= 0.4;
                    
                    speedSlider.value = speedToSliderValue(movementSpeed);
                    speedValue.textContent = movementSpeed.toFixed(1) + 'x';
                }
                break;
                
            case '0':
                e.preventDefault();
                movementSpeed = 1.0;
                speedSlider.value = speedToSliderValue(movementSpeed);
                speedValue.textContent = movementSpeed.toFixed(1) + 'x';
                break;
                
            // Raccourci pour l'enregistrement
            case 'r':
            case 'R':
                e.preventDefault();
                const recordBtn = document.querySelector('.p5c-btn');
                if (recordBtn) {
                    recordBtn.click();
                }
                break;
        }
    });
}

