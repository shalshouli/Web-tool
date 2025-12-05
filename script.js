let canvas;
let spheres = [];
let rotationX = 0;
let rotationY = 0;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

// Palette désaturée
const colors = [
  [100, 110, 120],   // Gris bleuté
  [120, 100, 110],   // Gris rosé
  [110, 120, 100],   // Gris verdâtre
  [130, 120, 110],   // Gris beige
  [110, 110, 130]    // Gris violacé
];

function setup() {
  console.log("Démarrage...");
  
  // Créer un canvas fixe 800x1000
  canvas = createCanvas(800, 1000, WEBGL);
  canvas.parent('canvasContainer');
  
  // Générer les sphères (sans noise)
  generateSpheres();
  
  // Événements boutons
  document.getElementById('generateBtn').addEventListener('click', generateSpheres);
  document.getElementById('saveBtn').addEventListener('click', savePoster);
  
  // Événements souris
  canvas.elt.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });
  
  canvas.elt.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    rotationX += (e.clientX - lastMouseX) * 0.01;
    rotationY += (e.clientY - lastMouseY) * 0.01;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });
  
  canvas.elt.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  // Événements clavier
  document.addEventListener('keydown', handleKeyPress);
}

function handleKeyPress(e) {
  if (e.code === 'Space') {
    e.preventDefault();
    console.log("Espace pressé - génération");
    generateSpheres();
  } else if (e.key === 's' || e.key === 'S') {
    e.preventDefault();
    console.log("S pressé - sauvegarde");
    savePoster();
  }
}

function generateSpheres() {
  spheres = [];
  
  // 12-18 sphères
  let count = Math.floor(random(12, 19));
  
  for (let i = 0; i < count; i++) {
    // Création de la sphère SANS noise
    spheres.push({
      // Propriétés de base
      baseX: random(-300, 300),
      baseY: random(-400, 400),
      baseZ: random(-200, 200),
      baseSize: random(50, 150),
      baseColor: colors[Math.floor(random(colors.length))],
      
      // Propriétés de mouvement
      rotationSpeed: random(-0.02, 0.02),
      currentRotation: 0,
      
      // Paramètres de noise (séparés)
      noiseParams: {
        offsetX: random(1000),
        offsetY: random(2000),
        offsetZ: random(3000),
        offsetColor: random(4000),
        offsetSize: random(5000),
        speed: random(0.005, 0.015)
      }
    });
  }
  
  console.log(`${count} sphères créées (noise séparé)`);
}

function draw() {
  // Fond sombre
  background(20, 20, 25);
  
  // Éclairage minimal
  ambientLight(50, 50, 55);
  directionalLight(80, 80, 85, 0, 0, -1);
  
  // Rotation de la scène
  rotateX(rotationY);
  rotateY(rotationX);
  
  // Dessiner les sphères avec noise appliqué séparément
  for (let s of spheres) {
    push();
    
    // APPLICATION DU NOISE (séparé de la création)
    // 1. Noise sur la position
    let noiseX = calculatePositionNoise(s, 'x');
    let noiseY = calculatePositionNoise(s, 'y');
    let noiseZ = calculatePositionNoise(s, 'z');
    
    // Position finale = position de base + noise
    let finalX = s.baseX + noiseX;
    let finalY = s.baseY + noiseY;
    let finalZ = s.baseZ + noiseZ;
    
    translate(finalX, finalY, finalZ);
    
    // 2. Noise sur la rotation
    s.currentRotation += s.rotationSpeed;
    let rotationNoise = calculateRotationNoise(s);
    rotateY(s.currentRotation + rotationNoise);
    
    // 3. Noise sur la couleur
    let finalColor = calculateColorWithNoise(s);
    fill(finalColor.r, finalColor.g, finalColor.b);
    noStroke();
    
    // 4. Noise sur la taille
    let sizeNoise = calculateSizeNoise(s);
    let finalSize = s.baseSize * sizeNoise;
    
    // Dessiner la sphère
    sphere(finalSize);
    
    pop();
  }
}

// FONCTIONS DE NOISE SÉPARÉES

function calculatePositionNoise(sphere, axis) {
  let offset, multiplier;
  
  switch(axis) {
    case 'x':
      offset = sphere.noiseParams.offsetX;
      multiplier = 25; // Amplitude du noise en X
      break;
    case 'y':
      offset = sphere.noiseParams.offsetY;
      multiplier = 25; // Amplitude du noise en Y
      break;
    case 'z':
      offset = sphere.noiseParams.offsetZ;
      multiplier = 15; // Amplitude du noise en Z
      break;
    default:
      return 0;
  }
  
  // Noise basé sur le temps
  let noiseVal = noise(offset + frameCount * sphere.noiseParams.speed);
  
  // Convertir de [0,1] à [-multiplier/2, multiplier/2]
  return (noiseVal - 0.5) * multiplier;
}

function calculateRotationNoise(sphere) {
  // Noise subtil sur la rotation
  let noiseVal = noise(
    sphere.noiseParams.offsetX + 1000 + frameCount * sphere.noiseParams.speed * 0.5
  );
  return (noiseVal - 0.5) * 0.1; // ±0.05 radians
}

function calculateColorWithNoise(sphere) {
  // Noise sur chaque composante de couleur
  let noiseR = noise(
    sphere.noiseParams.offsetColor + frameCount * 0.01,
    sphere.baseX * 0.001
  );
  let noiseG = noise(
    sphere.noiseParams.offsetColor + 100 + frameCount * 0.01,
    sphere.baseY * 0.001
  );
  let noiseB = noise(
    sphere.noiseParams.offsetColor + 200 + frameCount * 0.01,
    sphere.baseZ * 0.001
  );
  
  // Appliquer le noise (±15)
  let r = sphere.baseColor[0] + (noiseR - 0.5) * 30;
  let g = sphere.baseColor[1] + (noiseG - 0.5) * 30;
  let b = sphere.baseColor[2] + (noiseB - 0.5) * 30;
  
  // Contraintes
  r = constrain(r, 80, 130);
  g = constrain(g, 80, 130);
  b = constrain(b, 80, 130);
  
  // Désaturation
  let avg = (r + g + b) / 3;
  r = lerp(r, avg, 0.4);
  g = lerp(g, avg, 0.4);
  b = lerp(b, avg, 0.4);
  
  return { r: r, g: g, b: b };
}

function calculateSizeNoise(sphere) {
  // Noise sur la taille
  let noiseVal = noise(
    sphere.noiseParams.offsetSize + frameCount * 0.005,
    sphere.baseX * 0.002
  );
  
  // Variation de ±20%
  return 0.8 + noiseVal * 0.4;
}

function savePoster() {
  saveCanvas('poster_3d_' + new Date().getTime(), 'png');
}