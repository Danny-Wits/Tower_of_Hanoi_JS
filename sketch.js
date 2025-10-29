let towers = [];
let intermediate_tower_count = 1;
let tower_count = intermediate_tower_count + 2;
let disk_count = 10;
let tower_height = 300;
let Animation_Delay = 20;
let tower_gap;
function randomColor() {
  //random colors
  return color(random(150, 240), random(200, 240), random(200, 240));
}
class Tower {
  width = 20;
  disks = [];
  x = 0;
  beam_height = 20;
  beam_width = 200;
  constructor(index) {
    this.index = index;
    this.x = (width / tower_count) * index + this.width / 2 + 200;
  }
  draw(x) {
    x = x || this.x;
    fill("black");
    let y = height - tower_height;
    rect(x, y - this.beam_height, this.width, tower_height, 20, 20, 0, 0);
    //lower beam
    rect(
      x - this.beam_width / 2 + this.width / 2,
      height - this.beam_height,
      this.beam_width,
      this.beam_height,
      20,
      20,
      0,
      0
    );
    //drawing the disk
    for (let i = 0; i < this.disks.length; i++) {
      const disk = this.disks[i];
      disk.draw();
    }
  }
  addDisk(disk) {
    // check if the disk is bigger than the last disk
    if (
      this.disks.length > 0 &&
      this.disks[this.disks.length - 1].size < disk.size
    ) {
      return;
    }
    disk.x = this.x - disk.getSize() / 2 + this.width / 2;
    disk.y = height - disk.height * (this.disks.length + 1) - this.beam_height;
    this.beam_width = max(this.beam_width, disk.getSize() + 10);
    tower_height = max(
      tower_height,
      this.beam_height + disk.height * (this.disks.length + 1)
    );
    this.disks.push(disk);
  }
  async moveDisk(index, tower) {
    await this.animate(index, tower);
    tower.addDisk(this.disks[this.disks.length - 1]);
  }
  async animate(index, tower) {
    let disk = this.disks[this.disks.length - 1];
    let diskX = this.width / 2 - disk.getSize() / 2;
    let diskY = height - disk.y - this.beam_height;
    //move out of the tower
    for (let i = diskY; i >= height - tower_height - 100; i--) {
      await sleep(Animation_Delay);
      disk.y = i;
      disk.draw();
    }
    //move to side
    let increment = 5;
    if (this.x > tower.x) {
      increment = -1;
    }
    for (
      let i = this.x;
      i <= (increment > 0 ? 1 : -1) * tower.x + disk.getSize() / 2;
      i += increment
    ) {
      await sleep(Animation_Delay);
      print(disk.x);
      disk.x = i;
      disk.draw();
    }
    //move down
    for (
      let i = height - tower_height - 100;
      i <= tower.y - disk.height / 2;
      i++
    ) {
      await sleep(Animation_Delay);
      disk.y = i;
      disk.draw();
    }
    //move to tower
    for (
      let i = tower.x - disk.getSize() / 2;
      i <= tower.x + disk.getSize() / 2;
      i++
    ) {
      await sleep(Animation_Delay);
      disk.x = i;
      disk.draw();
    }
    this.disks.pop();
  }

  removeDisk() {
    return this.disks.pop();
  }
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
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
  draw(x, y) {
    x = x || this.x;
    y = y || this.y;
    fill(this.color);
    rect(x, y, this.getSize(), this.height, 20);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  for (let i = 0; i < tower_count; i++) {
    towers.push(new Tower(i));
  }
  for (let i = disk_count + 2; i >= 2; i--) {
    towers[0].addDisk(new Disk(i));
  }
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
let flag = true;
function draw() {
  background(255);
  for (let i = 0; i < tower_count; i++) {
    const tower = towers[i];
    tower.draw();
  }
  if (flag) {
    towers[0].moveDisk(1, towers[1]);
    flag = false;
  }
}
