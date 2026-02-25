let towers = [];
let intermediate_tower_count = 1;
let tower_count = intermediate_tower_count + 2;
let disk_count = 6;
let tower_height = 300;
let tower_width = innerWidth > 600 ? 40 : 30;
let animation_speed = 20;
let best_r = 2;
let audio_enabled = false;
let pause_enabled = true;
let audio;
let disk_multiplier = innerWidth > 600 ? 40 : 30;
//audio
function preload() {
  audio = loadSound("move.mp3");
}
function playAudio() {
  if (
    audio.isLoaded() &&
    !audio.isPlaying() &&
    audio_enabled &&
    animation_speed < 100
  ) {
    audio.play();
  }
}
// Timer Logic
let timeLeft = 0;
let timerInterval = 1000;

const SECONDS_PER_MOVE = 1;

function updateTimerDisplay() {
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  if (hours > 0) {
    document.getElementById("timer-display").innerText =
      `${hours}:${minutes}:${seconds}`;
  } else {
    document.getElementById("timer-display").innerText =
      `${minutes}:${seconds}`;
  }

  if (timeLeft <= 15 && timeLeft > 0) {
    document.getElementById("timer-display").style.color = "red";
    document.getElementById("timer-display").style.borderColor = "red";
  } else {
    document.getElementById("timer-display").style.color =
      "var(--primary-color)";
    document.getElementById("timer-display").style.borderColor =
      "var(--primary-color)";
  }
}

function startTimer() {
  const optimalMoves = FrameStewartHelper(disk_count, tower_count);

  timeLeft = Math.ceil(optimalMoves * SECONDS_PER_MOVE);
}

function decrementTimer() {
  timeLeft--;
  updateTimerDisplay();
}

function resetTimer() {
  let optimalMoves = FrameStewartHelper(disk_count, tower_count);

  timeLeft = Math.ceil(optimalMoves * SECONDS_PER_MOVE);

  updateTimerDisplay();
}

window.addEventListener("load", () => {
  resetTimer();
});
//solver functions
async function recursiveHanoiForThree(n, initial, target, intermediate) {
  let pause = pause_enabled && tower_count == 3 && n == disk_count;
  if (n > 0) {
    await recursiveHanoiForThree(n - 1, initial, intermediate, target);
    if (pause) {
      await sleep(1000);
    }

    await initial.moveDisk(target);
    incrementMoveCount();
    if (pause) {
      await sleep(1000);
    }
    await recursiveHanoiForThree(n - 1, intermediate, target, initial);
  }
}

async function optimalFrameStewartHolistic(n, initial, target, ptowers) {
  if (n == 0) return;
  if (n == 1) {
    incrementMoveCount();
    await initial.moveDisk(target);
    return;
  }
  let k = ptowers.length;

  if (k == 3) {
    await recursiveHanoiForThree(
      n,
      initial,
      target,
      getFreeTower(initial, target, ptowers),
    );
    return;
  }
  FrameStewartHelper(n, k);
  const r = best_r;
  const aux = getFreeTower(initial, target, ptowers);
  print(`r=${r}, aux=${aux.index}`);

  await optimalFrameStewartHolistic(r, initial, aux, ptowers);
  if (pause_enabled && n == disk_count) await sleep(1000);
  const reduced_towers = ptowers.filter((tower) => tower.index !== aux.index);

  await optimalFrameStewartHolistic(n - r, initial, target, reduced_towers);

  if (pause_enabled && n == disk_count) await sleep(1000);
  await optimalFrameStewartHolistic(r, aux, target, ptowers);
}

function FrameStewartHelper(n, k) {
  if (n in [0, 1]) return n;
  if (k == 3) return Math.pow(2, n) - 1;
  let best = Infinity;
  for (let r = 1; r < n; r++) {
    let moves = 2 * FrameStewartHelper(r, k) + FrameStewartHelper(n - r, k - 1);
    if (moves < best) {
      best = moves;
      best_r = r;
    }
  }
  return best;
}
function getFreeTower(initial, target, ptowers) {
  let best = null;
  for (let i = 0; i < ptowers.length; i++) {
    let current = ptowers[i];
    if (current.index !== initial.index && current.index !== target.index) {
      if (best == null || current.disks.length < ptowers[best].disks.length) {
        best = i;
      }
    }
  }
  return ptowers[best];
}
function reset() {
  setMoveCount(0);
  resetTimer();
  towers = [];
  tower_count = intermediate_tower_count + 2;
  tower_height = 300;
  tower_width = innerWidth > 600 ? 30 : 25;
  disk_multiplier = innerWidth > 600 ? 30 : 25;

  for (let i = 0; i < tower_count; i++) {
    towers.push(new Tower(i));
  }
  for (let i = disk_count + 1; i > 1; i--) {
    towers[0].addDisk(new Disk(i));
  }
}

class Disk {
  height = 40;
  x = 0;
  y = 0;
  constructor(size) {
    this.size = size;
    this.color = randomColor();
  }
  getSize() {
    return this.size * disk_multiplier * (tower_count < 5 ? 1 : 0.7);
  }
  draw() {
    fill(this.color);
    rect(this.x, this.y, this.getSize(), this.height, 20);
  }
}
function randomColor() {
  // Vibrant "Neon" palette: High saturation and brightness
  const colors = [
    color(255, 0, 127, 220), // Neon Pink
    color(0, 255, 255, 220), // Cyan
    color(57, 255, 20, 220), // Neon Green
    color(255, 170, 0, 220), // Bright Orange
    color(180, 0, 255, 220), // Electric Purple
    color(255, 255, 0, 220), // Bright Yellow
  ];
  return random(colors);
}
class Tower {
  width = tower_width;
  disks = [];
  x = 0;
  y = 0;
  beam_height = 20;
  beam_width = 200;
  constructor(index) {
    this.index = index;
    let block = width / tower_count;
    this.x = block * (index + 1) - block / 2;
  }
  draw() {
    noStroke();
    fill("#060101");
    let y = height - tower_height - this.beam_height;
    rect(this.x, y, this.width, tower_height, 20, 20, 0, 0);
    //lower beam
    rect(
      this.x - this.beam_width / 2 + this.width / 2,
      height - this.beam_height,
      this.beam_width,
      this.beam_height,
      20,
      20,
      0,
      0,
    );
    stroke(0);
  }
  drawDisks() {
    //drawing the disk
    for (let i = 0; i < this.disks.length; i++) {
      const disk = this.disks[i];
      disk.draw();
    }
  }
  postion_of_next_disk(disk) {
    let x = this.x - disk.getSize() / 2 + this.width / 2;
    let y = height - disk.height * (this.disks.length + 1) - this.beam_height;
    return [x, y];
  }
  addDisk(disk) {
    // check if the disk is bigger than the last disk
    if (
      this.disks.length > 0 &&
      this.disks[this.disks.length - 1].size < disk.size
    ) {
      alert("Invalid move");
      return;
    }
    // adding the disk position
    [disk.x, disk.y] = this.postion_of_next_disk(disk);

    // update the beam width
    this.beam_width = max(this.beam_width, disk.getSize() + 30);

    //update the tower height
    tower_height = max(
      tower_height,
      this.beam_height + disk.height * (this.disks.length + 1),
    );
    //adding the disk
    this.disks.push(disk);
  }
  topDisk() {
    return this.disks[this.disks.length - 1];
  }
  removeDisk() {
    return this.disks.pop();
  }
  async moveDisk(tower) {
    let disk = this.topDisk();
    const lift_distance = 100;
    playAudio();
    //move out of the tower
    for (let i = disk.y; i >= height - tower_height - lift_distance; i -= 1) {
      disk.y = i;
      if (Math.floor(i) % animation_speed == 0) await sleep();
    }
    //move to tower
    for (
      let i = disk.x;
      Math.abs(i - Math.floor(tower.x - disk.getSize() / 2)) > 1;
      i += this.x < tower.x ? 1 : -1
    ) {
      disk.x = i;
      if (Math.floor(i) % animation_speed == 0) await sleep();
    }
    //move down
    let desired_y;
    [disk.x, desired_y] = tower.postion_of_next_disk(disk);
    for (let i = disk.y; i <= desired_y; i++) {
      disk.y = i;
      if (Math.floor(i) % animation_speed == 0) await sleep();
    }
    this.removeDisk();
    tower.addDisk(disk);
    decrementTimer();
    audio.pause();
  }
}

async function sleep(time = 10) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  for (let i = 0; i < tower_count; i++) {
    towers.push(new Tower(i));
  }
  for (let i = disk_count + 1; i > 1; i--) {
    towers[0].addDisk(new Disk(i));
  }
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  reset();
  document.getElementById("audio").checked = false;
  audio_enabled = false;
}

function draw() {
  drawBackground();
  towers.forEach((tower) => {
    tower.draw();
  });
  towers.forEach((tower) => {
    tower.drawDisks();
  });
}

function drawBackground() {
  background(255); // Solid white base
  // Draw the dotted grid
  let dotSpacing = 20;
  let dotSize = 3;
  fill(220); // Light gray for the dots
  noStroke();
  for (let x = 0; x < width; x += dotSpacing) {
    for (let y = 0; y < height; y += dotSpacing) {
      circle(x, y, dotSize);
    }
  }
}

//HTML Calls

async function solve() {
  reset();
  setMoveCount(0);
  startTimer();
  document.getElementById("controls").style.display = "none";
  document.getElementById("toggle-btn").innerHTML = "&#9776;";
  if (tower_count == 3) {
    await recursiveHanoiForThree(disk_count, towers[0], towers[1], towers[2]);
    return;
  }
  await optimalFrameStewartHolistic(disk_count, towers[0], towers[1], towers);
}
