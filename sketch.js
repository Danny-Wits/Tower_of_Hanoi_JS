let towers = [];
let intermediate_tower_count = 1;
let tower_count = intermediate_tower_count + 2;
let disk_count = 6;
let tower_height = 300;
let animation_speed = 4;

//solver
async function recursiveHanoi(n, initial, target) {
  if (n > 0) {
    let best = getBestTower(initial, target);
    await recursiveHanoi(n - 1, initial, best);
    await initial.moveDisk(target);
    incrementMoveCount();
    await recursiveHanoi(n - 1, best, target);
  }
}
function getBestTower(initial, target) {
  let best = null;
  for (let i = 0; i < tower_count; i++) {
    if (i !== initial.index && i !== target.index) {
      if (best == null || towers[i].disks.length < towers[best].disks.length) {
        best = i;
      }
    }
  }
  return towers[best];
}
function reset() {
  setMoveCount(0);
  towers = [];
  tower_count = intermediate_tower_count + 2;
  tower_height = 300;
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
    return this.size * 30;
  }
  draw() {
    fill(this.color);
    rect(this.x, this.y, this.getSize(), this.height, 20);
  }
}
function randomColor() {
  //random colors
  return color(random(0, 10), random(100, 130), random(180, 230), 200);
}
class Tower {
  width = 20;
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
    fill(1, 0, 20);
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
      0
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
      this.beam_height + disk.height * (this.disks.length + 1)
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
      print(Math.abs(i - Math.floor(tower.x - disk.getSize() / 2)));
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
  }
}

async function sleep() {
  return new Promise((resolve) => setTimeout(resolve, 10));
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
  //resize towers
  for (let i = 0; i < tower_count; i++) {
    towers[i].x = (width / tower_count) * (i + 1) - width / tower_count / 2;
  }
  //repostion disks
  for (let i = 0; i < tower_count; i++) {
    let temp = [];
    let disks_count = towers[i].disks.length;
    for (let j = 0; j < disks_count; j++) {
      temp.push(towers[i].removeDisk());
    }
    for (let j = 0; j < disks_count; j++) {
      towers[i].addDisk(temp.pop());
    }
  }
}
let flag = true;
function draw() {
  background(255);
  towers.forEach((tower) => {
    tower.draw();
  });
  towers.forEach((tower) => {
    tower.drawDisks();
  });
}

//HTML Calls

async function solve() {
  setMoveCount(0);
  await recursiveHanoi(disk_count, towers[0], towers[1]);
}
