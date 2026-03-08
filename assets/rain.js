const canvas = document.getElementById("rainCanvas");
const ctx = canvas.getContext("2d");

let drops=[];
let rainEnabled=true;

function resize(){
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
}

window.addEventListener("resize",resize);
resize();

function createRain(){

  drops=[];

  for(let i=0;i<200;i++){

    drops.push({
      x:Math.random()*canvas.width,
      y:Math.random()*canvas.height,
      len:10+Math.random()*20,
      speed:4+Math.random()*4
    });

  }

}

createRain();

function draw(){

  if(!rainEnabled) return;

  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle="rgba(180,200,255,.35)";
  ctx.lineWidth=1;

  for(let d of drops){

    ctx.beginPath();
    ctx.moveTo(d.x,d.y);
    ctx.lineTo(d.x,d.y+d.len);
    ctx.stroke();

    d.y+=d.speed;

    if(d.y>canvas.height){
      d.y=-20;
      d.x=Math.random()*canvas.width;
    }

  }

}

function loop(){

  draw();
  requestAnimationFrame(loop);

}

loop();

/* toggle */

const toggle=document.getElementById("rainToggle");

const saved=localStorage.getItem("rain");

if(saved==="off"){
  rainEnabled=false;
  toggle.innerText="Rain: OFF";
}

toggle.onclick=()=>{

  rainEnabled=!rainEnabled;

  if(rainEnabled){
    toggle.innerText="Rain: ON";
    localStorage.setItem("rain","on");
  }else{
    toggle.innerText="Rain: OFF";
    ctx.clearRect(0,0,canvas.width,canvas.height);
    localStorage.setItem("rain","off");
  }

};

body{
  margin:0;
  background-color:var(--bg);
  background-image:
    linear-gradient(rgba(0,0,0,.60), rgba(0,0,0,.60)),
    url("SEU_BACKGROUND_AQUI");
  background-position:center center;
  background-size:cover;
  background-repeat:no-repeat;
  background-attachment:fixed;
  color:var(--text);
  font:24px/1.75 "font", monospace;
  position:relative;
}

#rainCanvas{
  position:fixed;
  inset:0;
  pointer-events:none;
  z-index:2;
  background:transparent;
}

.container{
  position:relative;
  z-index:3;
}

#clockBox{
  position:fixed;
  top:14px;
  left:14px;
  z-index:9998;
}
