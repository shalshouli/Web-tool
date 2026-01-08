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

// Pourcentages des formes - DOIT TOUJOURS TOTALISER 100
let shapePercentages = {
    'sphere': 100,
    'box': 0,
    'torus': 0,
    'cone': 0
};

const shapeTypes = ['sphere', 'box', 'torus', 'cone'];

P5Capture.setDefaultOptions({
  format: "gif",
  framerate: 60,
  quality: 1,
  width: 320,
});

function logarithmicSpeed(value) {
    if (value <= 0) return 0.0;
    if (value <= 50) return value / 50;
    else if (value <= 75) return 1.0 + ((value - 50) / 25) * 2.0;
    else if (value <= 90) return 3.0 + ((value - 75) / 15) * 3.0;
    else return 6.0 + ((value - 90) / 10) * 4.0;
}

function speedToSliderValue(speed) {
    if (speed <= 0) return 0;
    if (speed <= 1.0) return speed * 50;
    else if (speed <= 3.0) return 50 + ((speed - 1.0) / 2.0) * 25;
    else if (speed <= 6.0) return 75 + ((speed - 3.0) / 3.0) * 15;
    else return 90 + ((speed - 6.0) / 4.0) * 10;
}

function moveRecordingToSidebar() {
    setTimeout(() => {
        const recordingBox = document.querySelector('.p5c-container');
        const recordingContainer = document.getElementById('recording-box-container');
        if (recordingBox && recordingContainer) {
            recordingContainer.appendChild(recordingBox);
            console.log("Boîte d'enregistrement déplacée");
        }
    }, 1000);
}

function setup() {
    console.log("Setup en cours...");
    let canvas = createCanvas(700, 700, WEBGL);
    canvas.parent('canvasContainer');
    moveRecordingToSidebar();
    generateColorPalette();
    initControls();
    generateSpheres();
    console.log("Setup terminé");
}

function generateRandomSettings() {
    console.log("Génération de paramètres aléatoires...");
    
    sphereCount = Math.floor(random(5, 31));
    document.getElementById('sphereCountSlider').value = sphereCount;
    document.getElementById('sphereCountValue').textContent = sphereCount;
    
    colorHue = Math.floor(random(0, 361));
    document.getElementById('colorHueSlider').value = colorHue;
    document.getElementById('colorHueValue').textContent = colorHue + '°';
    
    colorSaturation = Math.floor(random(5, 101));
    document.getElementById('colorSaturationSlider').value = colorSaturation;
    document.getElementById('colorSaturationValue').textContent = colorSaturation + '%';
    
    const randomSpeed = random(0, 10.1);
    movementSpeed = randomSpeed;
    const sliderValue = speedToSliderValue(randomSpeed);
    document.getElementById('movementSpeedSlider').value = sliderValue;
    document.getElementById('movementSpeedValue').textContent = randomSpeed.toFixed(1) + 'x';
    
    generateRandomPercentages();
    generateColorPalette();
    generateSpheres();
    
    console.log("Paramètres appliqués");
    console.log(`- Formes: ${JSON.stringify(shapePercentages)}`);
}

function generateRandomPercentages() {
    let percentages = [];
    for (let i = 0; i < 4; i++) percentages.push(random(1, 100));
    let sum = percentages.reduce((a, b) => a + b, 0);
    percentages = percentages.map(p => Math.round((p / sum) * 100));
    let total = percentages.reduce((a, b) => a + b, 0);
    if (total !== 100) percentages[0] += (100 - total);
    
    shapeTypes.forEach((shape, index) => {
        shapePercentages[shape] = Math.max(0, Math.min(100, percentages[index]));
        const slider = document.getElementById(`${shape}PercentageSlider`);
        const valueDisplay = document.getElementById(`${shape}PercentageValue`);
        if (slider && valueDisplay) {
            slider.value = shapePercentages[shape];
            valueDisplay.textContent = shapePercentages[shape] + '%';
        }
    });
    updateTotalPercentage();
}

function draw() {
    if (isLightMode) background(240, 240, 245);
    else background(15, 15, 20);
    
    if (isLightMode) {
        ambientLight(200);
        directionalLight(255, 255, 255, 0, 0, -1);
    } else {
        ambientLight(60);
        directionalLight(255, 255, 255, 0, 0, -1);
    }
    
    rotateX(rotationY);
    rotateY(rotationX);
    noStroke();
    
    for (let i = 0; i < spheres.length; i++) {
        let s = spheres[i];
        push();
        
        let time = frameCount * 0.01 * movementSpeed;
        let moveX = sin(time + s.noiseOffsetX) * 10;
        let moveY = cos(time + s.noiseOffsetY) * 10;
        let moveZ = sin(time * 0.7 + s.noiseOffsetZ) * 5;
        
        translate(s.x + moveX, s.y + moveY, s.z + moveZ);
        rotateY(s.rotationSpeed * frameCount * 0.01 * movementSpeed);
        
        let colorVariation = sin(frameCount * 0.02 * movementSpeed + i) * 0.1;
        let r = s.baseColor[0] + colorVariation * 20;
        let g = s.baseColor[1] + colorVariation * 20;
        let b = s.baseColor[2] + colorVariation * 20;
        fill(r, g, b);
        
        let sizeVariation = sin(frameCount * 0.015 * movementSpeed + i) * 0.1;
        let currentSize = s.size * (1 + sizeVariation);
        
        // CORRECTION ICI : box() prend 3 arguments en WEBGL
        switch(s.shapeType) {
            case 'box':
                let cubeSize = currentSize * 0.7;
                box(cubeSize, cubeSize, cubeSize);
                break;
                
            case 'torus':
                let tubeRadius = currentSize * 0.2;
                let torusRadius = currentSize * 0.5;
                torus(torusRadius, tubeRadius, s.detail, s.detail);
                break;
                
            case 'cone':
                cone(currentSize * 0.7, currentSize * 1.4, s.detail, 1);
                break;
                
            case 'sphere':
            default:
                sphere(currentSize, s.detail * 2, s.detail * 2);
                break;
        }
        pop();
    }
}

function generateColorPalette() {
    colorPalette = [];
    const paletteSize = 6;
    for (let i = 0; i < paletteSize; i++) {
        const hueOffset = -30 + (i / (paletteSize - 1)) * 60;
        let hueVariation = (colorHue + hueOffset) % 360;
        let h = hueVariation / 360;
        let s = Math.max(colorSaturation / 100, 0.2);
        let l = 0.6;
        colorPalette.push(hslToRgb(h, s, l));
    }
}

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
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function generateSpheres() {
    spheres = [];
    let shapeCounts = {};
    let remainingCount = sphereCount;
    
    // Attribution selon les pourcentages
    shapeTypes.forEach(shape => {
        const percentage = shapePercentages[shape];
        const count = Math.floor(sphereCount * (percentage / 100));
        shapeCounts[shape] = count;
        remainingCount -= count;
    });
    
    // Distribuer les restes
    if (remainingCount > 0) {
        const nonZeroShapes = shapeTypes.filter(shape => shapePercentages[shape] > 0);
        for (let i = 0; i < remainingCount; i++) {
            const shape = nonZeroShapes[i % nonZeroShapes.length];
            shapeCounts[shape]++;
        }
    }
    
    // Créer et mélanger les formes
    let shapesToGenerate = [];
    shapeTypes.forEach(shape => {
        for (let i = 0; i < shapeCounts[shape]; i++) {
            shapesToGenerate.push(shape);
        }
    });
    
    // Mélanger
    for (let i = shapesToGenerate.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shapesToGenerate[i], shapesToGenerate[j]] = [shapesToGenerate[j], shapesToGenerate[i]];
    }
    
    // Générer
    for (let i = 0; i < sphereCount; i++) {
        let colorIndex = floor(random(colorPalette.length));
        let shapeType = shapesToGenerate[i] || 'sphere';
        
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
            noiseOffsetZ: random(100),
            shapeType: shapeType,
            detail: 12
        });
    }
    
    console.log(`${sphereCount} formes:`, shapeCounts);
}

function updateTotalPercentage() {
    let total = Object.values(shapePercentages).reduce((a, b) => a + b, 0);
    const totalElement = document.getElementById('shapesTotalValue');
    if (totalElement) {
        totalElement.textContent = total + '%';
        totalElement.style.color = total === 100 ? 'var(--text-secondary)' : '#ff4444';
    }
    console.log("Total pourcentages:", total);
    return total;
}

// FONCTION CRITIQUE : Assurer que le total reste à 100%
function adjustPercentages(changedShape, newValue) {
    const oldValue = shapePercentages[changedShape];
    const difference = newValue - oldValue;
    
    if (difference === 0) return;
    
    // Limiter à 0-100
    newValue = Math.max(0, Math.min(100, newValue));
    
    // Calculer combien on peut enlever aux autres
    const otherShapes = shapeTypes.filter(shape => shape !== changedShape);
    const availableToTake = otherShapes.reduce((sum, shape) => sum + shapePercentages[shape], 0);
    
    // Si on veut augmenter mais qu'il n'y a pas assez chez les autres
    if (difference > 0 && difference > availableToTake) {
        newValue = oldValue + availableToTake;
    }
    
    const actualDifference = newValue - oldValue;
    
    // Si on diminue, répartir l'excédent
    if (actualDifference < 0) {
        const otherShapesNonZero = otherShapes.filter(shape => shapePercentages[shape] > 0);
        if (otherShapesNonZero.length > 0) {
            const toAddPerShape = Math.abs(actualDifference) / otherShapesNonZero.length;
            otherShapesNonZero.forEach(shape => {
                shapePercentages[shape] = Math.min(100, shapePercentages[shape] + toAddPerShape);
            });
        }
    }
    // Si on augmente, diminuer les autres proportionnellement
    else if (actualDifference > 0) {
        const otherShapesNonZero = otherShapes.filter(shape => shapePercentages[shape] > 0);
        if (otherShapesNonZero.length > 0) {
            const totalOther = otherShapesNonZero.reduce((sum, shape) => sum + shapePercentages[shape], 0);
            otherShapesNonZero.forEach(shape => {
                const proportion = shapePercentages[shape] / totalOther;
                shapePercentages[shape] = Math.max(0, shapePercentages[shape] - (actualDifference * proportion));
            });
        }
    }
    
    // Appliquer la nouvelle valeur
    shapePercentages[changedShape] = newValue;
    
    // Normaliser pour être sûr d'avoir 100%
    normalizePercentages();
    
    // Mettre à jour l'interface
    updateAllSliders();
}

function normalizePercentages() {
    let total = Object.values(shapePercentages).reduce((a, b) => a + b, 0);
    
    if (total !== 100) {
        const diff = 100 - total;
        const shapesWithValue = shapeTypes.filter(shape => shapePercentages[shape] > 0);
        
        if (shapesWithValue.length > 0) {
            const perShape = diff / shapesWithValue.length;
            shapesWithValue.forEach(shape => {
                shapePercentages[shape] += perShape;
            });
        } else {
            shapePercentages['sphere'] = 100;
        }
        
        // Arrondir et s'assurer qu'on est à 100
        shapeTypes.forEach(shape => {
            shapePercentages[shape] = Math.round(shapePercentages[shape]);
        });
        
        total = Object.values(shapePercentages).reduce((a, b) => a + b, 0);
        if (total !== 100) {
            shapePercentages['sphere'] += (100 - total);
        }
    }
}

function updateAllSliders() {
    shapeTypes.forEach(shape => {
        const slider = document.getElementById(`${shape}PercentageSlider`);
        const valueDisplay = document.getElementById(`${shape}PercentageValue`);
        if (slider && valueDisplay) {
            slider.value = Math.round(shapePercentages[shape]);
            valueDisplay.textContent = Math.round(shapePercentages[shape]) + '%';
        }
    });
    updateTotalPercentage();
}

function resetPercentages() {
    shapePercentages = {'sphere': 100, 'box': 0, 'torus': 0, 'cone': 0};
    updateAllSliders();
    generateSpheres();
}

function equalizePercentages() {
    const activeShapes = shapeTypes.filter(shape => shapePercentages[shape] > 0);
    if (activeShapes.length === 0) {
        shapePercentages['sphere'] = 100;
    } else {
        const equalValue = Math.floor(100 / activeShapes.length);
        const remainder = 100 - (equalValue * activeShapes.length);
        
        shapeTypes.forEach(shape => {
            shapePercentages[shape] = activeShapes.includes(shape) ? equalValue : 0;
        });
        
        shapePercentages[activeShapes[0]] += remainder;
    }
    updateAllSliders();
    generateSpheres();
}

function initControls() {
    // Nombre de sphères
    document.getElementById('sphereCountSlider').addEventListener('input', (e) => {
        sphereCount = parseInt(e.target.value);
        document.getElementById('sphereCountValue').textContent = sphereCount;
        generateSpheres();
    });
    
    // Teinte
    document.getElementById('colorHueSlider').addEventListener('input', (e) => {
        colorHue = parseInt(e.target.value);
        document.getElementById('colorHueValue').textContent = colorHue + '°';
        generateColorPalette();
        for (let sphere of spheres) {
            if (sphere.colorIndex < colorPalette.length) {
                sphere.baseColor = colorPalette[sphere.colorIndex];
            }
        }
    });
    
    // Saturation
    document.getElementById('colorSaturationSlider').addEventListener('input', (e) => {
        colorSaturation = parseInt(e.target.value);
        document.getElementById('colorSaturationValue').textContent = colorSaturation + '%';
        generateColorPalette();
        for (let sphere of spheres) {
            if (sphere.colorIndex < colorPalette.length) {
                sphere.baseColor = colorPalette[sphere.colorIndex];
            }
        }
    });
    
    // Vitesse
    const speedSlider = document.getElementById('movementSpeedSlider');
    speedSlider.value = speedToSliderValue(1.0);
    speedSlider.addEventListener('input', (e) => {
        movementSpeed = logarithmicSpeed(parseInt(e.target.value));
        document.getElementById('movementSpeedValue').textContent = movementSpeed.toFixed(1) + 'x';
    });
    
    // Boutons
    document.getElementById('generateBtn').addEventListener('click', generateRandomSettings);
    document.getElementById('saveBtn').addEventListener('click', () => {
        saveCanvas('atomic_poster_' + saveCounter, 'png');
        saveCounter++;
    });
    
    document.getElementById('themeToggle').addEventListener('click', () => {
        isLightMode = !isLightMode;
        document.body.classList.toggle('light-mode');
        document.getElementById('themeToggle').textContent = isLightMode ? '🌙' : '☀️';
    });
    
    // Sliders de formes
    shapeTypes.forEach(shape => {
        const slider = document.getElementById(`${shape}PercentageSlider`);
        if (slider) {
            slider.addEventListener('input', (e) => {
                const newValue = parseInt(e.target.value);
                adjustPercentages(shape, newValue);
                generateSpheres();
            });
        }
    });
    
    // Boutons shapes
    document.getElementById('resetShapesBtn').addEventListener('click', resetPercentages);
    document.getElementById('equalizeShapesBtn').addEventListener('click', equalizePercentages);
    
    updateTotalPercentage();
    
    // Rotation
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
    
    document.addEventListener('mouseup', () => { isDragging = false; });
    
    // Raccourcis clavier
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case ' ':
                e.preventDefault();
                generateRandomSettings();
                break;
            case 's':
            case 'S':
                e.preventDefault();
                saveCanvas('atomic_poster_' + Date.now(), 'png');
                break;
            case '+':
            case '=':
                e.preventDefault();
                if (sphereCount < 30) {
                    sphereCount++;
                    document.getElementById('sphereCountSlider').value = sphereCount;
                    document.getElementById('sphereCountValue').textContent = sphereCount;
                    generateSpheres();
                }
                break;
            case '-':
            case '_':
                e.preventDefault();
                if (sphereCount > 5) {
                    sphereCount--;
                    document.getElementById('sphereCountSlider').value = sphereCount;
                    document.getElementById('sphereCountValue').textContent = sphereCount;
                    generateSpheres();
                }
                break;
            case ']':
            case '}':
                e.preventDefault();
                if (movementSpeed < 10.0) {
                    if (movementSpeed < 1.0) movementSpeed += 0.1;
                    else if (movementSpeed < 3.0) movementSpeed += 0.2;
                    else if (movementSpeed < 6.0) movementSpeed += 0.3;
                    else movementSpeed += 0.4;
                    document.getElementById('movementSpeedSlider').value = speedToSliderValue(movementSpeed);
                    document.getElementById('movementSpeedValue').textContent = movementSpeed.toFixed(1) + 'x';
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
                    document.getElementById('movementSpeedSlider').value = speedToSliderValue(movementSpeed);
                    document.getElementById('movementSpeedValue').textContent = movementSpeed.toFixed(1) + 'x';
                }
                break;
            case '0':
                e.preventDefault();
                movementSpeed = 1.0;
                document.getElementById('movementSpeedSlider').value = speedToSliderValue(movementSpeed);
                document.getElementById('movementSpeedValue').textContent = movementSpeed.toFixed(1) + 'x';
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                const recordBtn = document.querySelector('.p5c-btn');
                if (recordBtn) recordBtn.click();
                break;
        }
    });
}