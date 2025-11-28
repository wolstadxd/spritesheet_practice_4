let sheet;               // p5.Graphics з кадрами
const FRAMES = 6;        // кількість кадрів у рядку
const FW = 32, FH = 32;  // розмір одного кадру
let frameIndex = 0;      // поточний кадр
let animFps = 10;        // FPS анімації
let facing = 1;          // 1 = вправо, -1 = вліво
let scaleK = 3;          // масштаб спрайта
let x, y;                // позиція
let moveSpeed = 160;     // швидкість руху px/сек

// Константи для станів
const ST_STAND = 0;
const ST_WALK = 1;
const ST_RUN = 2;
let state = ST_WALK;

let flipBtn, scaleSlider;

function setup() {
  createCanvas(720, 420);
  textFont('Verdana'); textSize(14);

  sheet = createGraphics(FRAMES * FW, FH * 3);
  sheet.noStroke(); sheet.textAlign(CENTER, CENTER);

  for (let row = 0; row < 3; row++) {
    for (let f = 0; f < FRAMES; f++) {
      const t = map(f, 0, FRAMES - 1, 0, 1);
      
      sheet.push();
      sheet.translate(f * FW, row * FH); 
      
      let armAngle = 0;
      let bodyColor;

      if (row === ST_STAND) {
        bodyColor = color(100, 150, 200);
        armAngle = sin(f * TWO_PI / FRAMES) * 2; 
      } else if (row === ST_WALK) {

        bodyColor = color(60, 120 + 100 * t, 255 - 60 * t);
        armAngle = sin(f * TWO_PI / FRAMES) * 8; 
      } else if (row === ST_RUN) {

        bodyColor = color(255, 100 + 50 * t, 50);
        armAngle = sin(f * TWO_PI / FRAMES) * 14;
      }

      sheet.fill(bodyColor);
      sheet.rect(0, 0, FW, FH, 6);

      sheet.push();
      sheet.translate(FW / 2, FH / 2);
      sheet.stroke(255); sheet.strokeWeight(3);
      sheet.line(-8, 0, -8, armAngle);
      sheet.line(8, 0, 8, -armAngle);
      sheet.pop();

      sheet.noStroke(); sheet.fill(0);
      sheet.circle(FW / 2 - 6, FH / 2 - 6, 4);
      sheet.circle(FW / 2 + 6, FH / 2 - 6, 4);
      
      sheet.pop();
    }
  }

  x = width / 2; y = height / 2;

  flipBtn = createButton('Flip (F)');
  flipBtn.position(10, 10);
  flipBtn.mousePressed(() => facing *= -1);

  scaleSlider = createSlider(1, 5, 3, 0.5);
  scaleSlider.position(100, 10);
  
  let infoText = createDiv('Controls: <b>1</b>-Stand, <b>2</b>-Walk, <b>3</b>-Run, <b>Arrows</b>-Move');
  infoText.position(10, 40); 
  infoText.style('font-family', 'sans-serif'); 
  infoText.style('font-size', '12px');
}

function draw() {
  background(240);

  if (frameCount % int(60 / animFps) === 0) {
    frameIndex = (frameIndex + 1) % FRAMES;
  }

  const dt = deltaTime / 1000;
  let dx = 0, dy = 0;
  if (keyIsDown(LEFT_ARROW))  { dx -= 1; facing = -1; }
  if (keyIsDown(RIGHT_ARROW)) { dx += 1; facing =  1; }
  if (keyIsDown(UP_ARROW))    { dy -= 1; }
  if (keyIsDown(DOWN_ARROW))  { dy += 1; }

  if (touches.length > 0) {
    const tv = createVector(touches[0].x - x, touches[0].y - y);
    if (tv.mag() > 1) { tv.normalize(); dx = tv.x; dy = tv.y; facing = dx >= 0 ? 1 : -1; }
  }

  if (dx || dy) {
    const l = Math.hypot(dx, dy); dx /= l || 1; dy /= l || 1;
    x += dx * moveSpeed * dt; 
    y += dy * moveSpeed * dt;
  }
  x = constrain(x, 0, width); y = constrain(y, 0, height);

  scaleK = scaleSlider.value();

  const sx = frameIndex * FW;
  const sy = state * FH; 
  
  const sw = FW, sh = FH;
  const dw = FW * scaleK, dh = FH * scaleK;

  push();
  translate(x, y);
  scale(facing, 1);
  image(sheet, -dw/2, -dh/2, dw, dh, sx, sy, sw, sh);
  pop();

  let hitColor = color(0, 200, 0);
  let hitR = 10 * scaleK;

  if (state === ST_STAND) {
    hitColor = color(0, 0, 200);
    hitR = 11 * scaleK; 
  } else if (state === ST_RUN) {
    hitColor = color(200, 0, 0);
    hitR = 9 * scaleK; 
  }

  noFill(); stroke(hitColor); strokeWeight(2);
  circle(x, y, hitR * 2);

  noStroke(); fill(20);
  let modeName = state === 0 ? "Stand" : (state === 1 ? "Walk" : "Run");
  text(`State: ${modeName} (FPS: ${animFps}) | Facing: ${facing} | Scale: ${scaleK}`, 10, height - 24);
}

function keyPressed() {
  if (key === 'f' || key === 'F') facing *= -1;
  
  if (key === '1') {
    state = ST_STAND;
    animFps = 3;      
    moveSpeed = 0;    
  }
  if (key === '2') {
    state = ST_WALK;
    animFps = 12;     
    moveSpeed = 160;   
  }
  if (key === '3') {
    state = ST_RUN;
    animFps = 16;
    moveSpeed = 300;   
  }
}
