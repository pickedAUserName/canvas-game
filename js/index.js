//set up canvas and get context
const canvas = document.querySelector("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;
const ctx = canvas.getContext("2d");

//setup gameover splash
const splash = document.getElementById("modalGameOver");
const splashScore = document.getElementById("modalScore");
const restartButton = document.getElementById("restartBtn");

//setup game start splash
const startSplash = document.getElementById("modalGameStart");

const startBtn = document.getElementById("startBtn");

//get sound icon for muting
const volBtn = document.getElementById("volumeUpEl");
const muteBtn = document.getElementById("muteEl");

//get score element
const scoreEl = document.getElementById("scoreEl");

//create and draw player
let player;
//player pos at starts
let playerx = canvas.width / 2;
let playery = canvas.height / 2;

//arrays for missiles, firework particles and enemies
let projectiles = [];
let enemies = [];
let particles = [];
//so can pause at Gme over
let animationId;
//intervalid so can cancel at gmeover
let intervalId;
//set intial score
let score = 0;
//create powerups
let powerUps = [];
//intervalid so can cancel at gmeover
let pUIntervalId;
//frame counter
let frames = 0;
//background particles array
let backgroundParticles = [];
//game running?
let game = {
  active: false,
};

//set game to starting point on restart click
function init() {
  game.active = true;
  //player pos at starts
  playerx = canvas.width / 2;
  playery = canvas.height / 2;
  player = new Player(playerx, playery, 10, "white");
  projectiles = [];
  enemies = [];
  particles = [];
  //default to one PU
  powerUps = [];
  animationId;
  score = 0;
  scoreEl.innerHTML = 0;
  frames = 0;
  //create background particles for drawing in animate
  const spacing = 30;
  backgroundParticles = [];
  for (let x = 0; x < canvas.width + spacing; x += spacing) {
    for (let y = 0; y < canvas.height + spacing; y += spacing) {
      backgroundParticles.push(
        new BackgroundParticle({ position: { x, y }, radius: 3 })
      );
    }
  }
}

function spawnEnemies() {
  //every sec create a new enemy in array
  intervalId = setInterval(() => {
    //have random sizes
    const radius = Math.random() * (30 - 4) + 4;
    let x;
    let y;
    //spawn at rndom offscreen pos
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height + radius;
    } else {
      x = Math.random() * canvas.width + radius;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const colour = `hsl(${Math.random() * 360}, 50%, 50%)`;
    //get them to head in direc of player
    const angle = Math.atan2(playery - y, playerx - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };

    const enemy = new Enemy(x, y, radius, colour, velocity);
    enemies.push(enemy);
  }, 1000);
}

//spawn powerups
function spawnPowerUps() {
  pUIntervalId = setInterval(() => {
    powerUps.push(
      new PowerUp({
        position: { x: -30, y: Math.random() * canvas.height },
        velocity: { x: Math.random() + 2, y: 0 },
      })
    );
  }, 10000);
}

//create score labels
function createScoreLabels({ position, score, color }) {
  //create html element
  const scoreLabel = document.createElement("label");
  scoreLabel.innerHTML = score;
  scoreLabel.style.color = `${color}`;
  //give location of kill
  scoreLabel.style.position = "absolute";
  scoreLabel.style.left = position.x + "px";
  scoreLabel.style.top = position.y + "px";
  scoreLabel.style.fontSize = "x-small";
  //make unclickable
  scoreLabel.style.userSelect = "none";
  scoreLabel.style.pointerEvents = "none";

  document.body.appendChild(scoreLabel);
  //get rid of label onscreen
  gsap.to(scoreLabel, {
    opacity: 0,
    y: -30,
    duration: 0.75,
    //remove from html
    onComplete: () => {
      scoreLabel.parentNode.removeChild(scoreLabel);
    },
  });
}

//draw and update the canvas
function animate() {
  frames++;
  //start loop
  animationId = requestAnimationFrame(animate);
  //empty between frames
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //draw background
  for (let index = 0; index < backgroundParticles.length; index++) {
    const bgP = backgroundParticles[index];
    bgP.draw();

    //get distance from player to blank out
    const playerBGCol = Math.hypot(
      player.x - bgP.position.x,
      player.y - bgP.position.y
    );
    if (playerBGCol < 100) {
      bgP.alpha = 0;
      if (playerBGCol > 70) {
        bgP.alpha = 0.05;
      }
    } else if (playerBGCol > 100 && bgP.alpha < 0.02) {
      bgP.alpha += 0.005;
    } else if (playerBGCol > 100 && bgP.alpha > 0.02) {
      bgP.alpha -= 0.005;
    }
  }

  player.update();
  //drawpowerup
  for (let index = powerUps.length - 1; index >= 0; index--) {
    const powerup = powerUps[index];
    if (powerup.position.x > canvas.width) {
      powerUps.splice(index, 1);
    } else {
      powerup.update();
    }

    //gain powerup
    const playerPUCol = Math.hypot(
      player.x - powerup.position.x,
      player.y - powerup.position.y
    );
    if (playerPUCol < powerup.image.height / 2 + player.radius) {
      audio.powerUp.play();
      powerUps.splice(index, 1);
      player.powerup = "MachineGun";
      player.colour = "yellow";
      //powerup runs out
      setTimeout(() => {
        player.powerup = null;
        player.colour = "white";
      }, 5000);
    }
  }
  //machine gun implementation
  if (player.powerup === "MachineGun") {
    const angle = Math.atan2(
      mouse.position.y - player.y,
      mouse.position.x - player.x
    );

    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5,
    };
    if (frames % 2 === 0) {
      projectiles.push(
        new Projectile(player.x, player.y, 5, "yellow", velocity)
      );
    }
    if (frames % 5 === 0) {
      audio.shoot.play();
    }
  }

  //draw particles in array
  for (let i = particles.length - 1; i >= 0; i--) {
    const particle = particles[i];

    if (particle.alpha <= 0) {
      particles.splice(i, 1);
    } else {
      particle.update();
    }
  }

  //loop through and draw
  for (let index = projectiles.length - 1; index >= 0; index--) {
    const projectile = projectiles[index];

    projectile.update();
    //remove from edges of screen
    if (
      projectile.x + projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      projectiles.splice(index, 1);
    }
  }

  //loop through and drw + check for hits
  //going backwards to avoid index errors
  for (let index = enemies.length - 1; index >= 0; index--) {
    const enemy = enemies[index];

    enemy.update();
    //end game
    const playerEneCol = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (playerEneCol - enemy.radius - player.radius < 1) {
      audio.death.play();
      //pause screen
      cancelAnimationFrame(animationId);
      game.active = false;
      //cancel enermy spawn
      clearInterval(intervalId);
      //cancelpUspawn
      clearInterval(pUIntervalId);
      //display splash using greensock animation
      splash.style.display = "block";
      gsap.fromTo(
        "#modalGameOver",
        {
          opacity: 0,
          scale: 0.8,
        },
        {
          scale: 1,
          opacity: 1,
          ease: "expo", //nonlinear rate of animation -
        }
      );
      //sync score with splash
      splashScore.innerHTML = score;
    }

    //hit enemy
    for (
      let projectileIndex = projectiles.length - 1;
      projectileIndex >= 0;
      projectileIndex--
    ) {
      const projectile = projectiles[projectileIndex];

      const distance = Math.hypot(
        projectile.x - enemy.x,
        projectile.y - enemy.y
      );
      if (distance - enemy.radius - projectile.radius < 1) {
        //filling array for fireworks
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.colour,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }
            )
          );
        }

        //shrink enemy on hit if larger thaan 20
        if (enemy.radius - 10 > 5) {
          //score for a hit
          score += 100;
          scoreEl.innerHTML = score;
          //using greensocks gsap to tween down enemy radius
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          createScoreLabels({
            position: { x: projectile.x, y: projectile.y },
            score: 100,
            color: enemy.colour,
          });
          projectiles.splice(projectileIndex, 1);
          audio.dmg.play();
        } else {
          audio.kill.play();
          //score for a kill
          score += 150;
          scoreEl.innerHTML = score;
          //remove enemy when small
          createScoreLabels({
            position: { x: projectile.x, y: projectile.y },
            score: 150,
            color: enemy.colour,
          });
          //change bg to colour of enemy
          backgroundParticles.forEach((bgP) => {
            if (bgP.alpha != 0) {
              gsap.set(bgP, {
                colour: "white",
                alpha: 0.2,
              });
              gsap.to(bgP, {
                colour: enemy.colour,
                alpha: 0.02,
              });
            }
          });

          enemies.splice(index, 1);
          projectiles.splice(projectileIndex, 1);
        }
      }
    }
  }
}

//function for shooting
function shoot({x, y}){
    if (game.active) {
        //playsound
        audio.shoot.play();
        //maths for shooting from plsyer towards mouse click
        const angle = Math.atan2(y - player.y, x - player.x);
        const speedFactor = 5;
        const velocity = {
          x: Math.cos(angle) * speedFactor,
          y: Math.sin(angle) * speedFactor,
        };
        const projectile = new Projectile(player.x, player.y, 5, "white", velocity);
        projectiles.push(projectile);
      }
}

//allow shooting by touch on mobile
window.addEventListener('touchstart', (e)=>{
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;

    shoot({x, y});

});
//allow powerup shooting on mobile
window.addEventListener('touchmove', (e)=>{
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;

    shoot({x, y});

});

// event listeners for buttons, mouse click to shoot and WASD for movement
let audioInitialized = false;
//draw projectile on mouse click
window.addEventListener("click", (e) => {
  //start bgm
  if (!audio.bgm.playing() && !audioInitialized) {
    audio.bgm.play();
    audioInitialized = true;
  }
  
  shoot({x: e.clientX, y: e.clientY});

});

//getting global mouse pos for machine gun
const mouse = {
  position: {
    x: 0,
    y: 0,
  },
};
window.addEventListener("mousemove", (e) => {
  mouse.position.x = e.clientX;
  mouse.position.y = e.clientY;
});

//restart game on restart button click
restartButton.addEventListener("click", (e) => {
  audio.select.play();
  init();
  animate();
  gsap.to("#modalGameOver", {
    opacity: 0,
    scale: 0.8,
    duration: 0.3,
    ease: "expo.in", //nonlinear rate of animation -
    onComplete: () => {
      splash.style.display = "none";
    },
  });
  spawnEnemies();
  spawnPowerUps();
});

//start loop on game start button click
startBtn.addEventListener("click", (e) => {
  audio.select.play();
  init();
  animate();
  spawnEnemies();
  spawnPowerUps();

  gsap.to("#modalGameStart", {
    opacity: 0,
    scale: 0.8,
    duration: 0.3,
    ease: "expo.in", //nonlinear rate of animation -
    onComplete: () => {
      startSplash.style.display = "none";
    },
  });
});

//mute all sound
volBtn.addEventListener("click", () => {
  for (let key in audio) {
    audio[key].mute(true);
  }

  muteBtn.style.display = "block";
  volBtn.style.display = "none";
});
//play all sound
muteBtn.addEventListener("click", () => {
  volBtn.style.display = "block";
  muteBtn.style.display = "none";

  for (let key in audio) {
    audio[key].mute(false);
  }
});

//allow resizing
window.addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  init();
});

//move player
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "d":
      if (player.velocity.x <= 5) {
        if (player.velocity.x < 0) {
          player.velocity.x = 1;
        }
        player.velocity.x += 1;
      }

      break;
    case "a":
      if (player.velocity.x >= -5) {
        if (player.velocity.x > 0) {
          player.velocity.x = -1;
        }
        player.velocity.x -= 1;
      }

      break;
    case "w":
      if (player.velocity.y >= -5) {
        if (player.velocity.y > 0) {
          player.velocity.y = -1;
        }

        player.velocity.y -= 1;
      }
      break;
    case "s":
      if (player.velocity.y <= 5) {
        if (player.velocity.y < 0) {
          player.velocity.y = 1;
        }
        player.velocity.y += 1;
      }
      break;
  }
});

//stop enemies spawning when not onscreen eg open other tab

document.addEventListener('visibilitychange', ()=>{
  if(document.hidden){
    //inactive
    //clearinteval
    clearInterval(intervalId);
    clearInterval(pUIntervalId);
  }else{
    //restart spawn enem,y and PU
    spawnEnemies();
    spawnPowerUps();
  }
});
