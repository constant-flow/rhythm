let capture;

const w = 640;
const h = 480;

const gh = 150;
const gw = w*2;
const gm = 10;

let videoLoaded = false;

function setup() {
  let cnv = createCanvas(2*w, h + gh);
  cnv.mousePressed(resetLimits);
  capture = createCapture(VIDEO, ()=>{videoLoaded=true;});
  capture.size(w, h);
  capture.hide();

  fill(0);
  rect(0,h,gw,gh);
}

let lastframe = null;
let nowframe = null;
let i = 0;

const smoothing = 0.95;
let changeValue = 0;
let maxValue = 0;
let minValue = 0;
let drawPos = 0;

let images = [];
let MAX_IMAGES = 10;

let valuesOverTime = [];
let MAX_VALUES = 400;

function resetLimits(){
  maxValue = 0;
  minValue = 10000000;
}

function draw() {
  fill(0);
  if(!videoLoaded) return;
  i++;

  // background(255);

  nowframe = capture.get();
  images[i % MAX_IMAGES] = capture.get();

  if(i < MAX_IMAGES) return;

  blendMode(BLEND);
  image(nowframe, 0, 0, w, h);

  // if(lastframe!==null) image(lastframe, w, 0, w, h);
  if(images[(i+1) % MAX_IMAGES]) image(images[(i+1) % MAX_IMAGES], w, 0, w, h);


//   if(lastframe!==null){
//     blendMode(DIFFERENCE);
//     image(lastframe, 0, 0, w, h);
//   }

  if(images[(i+1) % MAX_IMAGES]){
    blendMode(DIFFERENCE);
    image(images[(i+1) % MAX_IMAGES], 0, 0, w, h);
  }

  blendMode(BLEND);


  // if(i%1==0)
  lastframe = capture.get();

  valuesOverTime[i%MAX_VALUES] = changeValue;
  let maxInTimeFrame = valuesOverTime.reduce((max, ele) => {return Math.max(max, ele)});
  let minInTimeFrame = valuesOverTime.reduce((min, ele) => {return Math.min(min, ele)});

  if(i%1==0){
    strokeWeight(10);
    stroke(2,0);
    fill(255);
    rect(drawPos, h, 10, gh); // erase old data from graph
    // let drawHeight = map(changeValue, minValue, maxValue, 0, gh);
    let drawHeight = map(changeValue, minInTimeFrame, maxInTimeFrame, 0+gm, gh-gm);
    stroke('black'); // Change the color
    strokeWeight(2);
    point(drawPos, drawHeight + h);
    drawPos++;
    if(drawPos>gw)drawPos = 0;
  }

  const diffImg = get(0,0,w,h);
  const changeThresholdPerPixel = 50;

  let sum = 0;
  diffImg.loadPixels();
  let maxInDiff = 0;
  for (let i = 0; i < 4 * (w * h ); i += 4) {
    const valueToAdd = diffImg.pixels[i] + diffImg.pixels[i+1] +diffImg.pixels[i+2];
    if(valueToAdd > maxInDiff) maxInDiff=valueToAdd;
    if(valueToAdd > changeThresholdPerPixel)
    sum += valueToAdd;
  }



  const factorToMakeVisible = (255.0*3) / maxInDiff;
  for (let i = 0; i < 4 * (w * h ); i += 4) {
    const valueToAdd = diffImg.pixels[i] + diffImg.pixels[i+1] +diffImg.pixels[i+2];

    if(valueToAdd > changeThresholdPerPixel){
      diffImg.pixels[i] *= factorToMakeVisible;
      diffImg.pixels[i+1] *= factorToMakeVisible;
      diffImg.pixels[i+2] *= factorToMakeVisible;
    }

  }

  diffImg.updatePixels();
  image(diffImg, 0, 0, w, h);


  if(sum>200) {

    changeValue = sum * (1-smoothing) + changeValue * smoothing;
    // console.log(changeValue);
  }

  if(changeValue > maxValue) maxValue = changeValue;
  if(changeValue < minValue) minValue = changeValue;
}