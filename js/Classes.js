//create classes for player, enemies and projectiles

class Player {
    constructor(x, y, radius, colour) {
        this.x = x,
            this.y = y,
            this.radius = radius,
            this.colour = colour,
            this.friction = 0.99,
            this.velocity = {
                x: 0,
                y: 0
            },
            this.powerUp

    }
    //draw player on the canvas - must be called
    drawPlayer() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.colour;
        ctx.fill()
    }

    //move player
    update(){
        this.drawPlayer();
        //slow down movement
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;
        
        //move according to arrow press but
        //only if in bounds of canvas - collison detection on x and y axis

        if (this.x + this.radius + this.velocity.x <= canvas.width && 
            this.x - this.radius + this.velocity.x >= 0) {
            
                this.x += this.velocity.x;
        }else{
            this.velocity.x = 0;
        }

        if (this.y + this.radius + this.velocity.y <= canvas.height && 
            this.y - this.radius + this.velocity.y >= 0) {
            
                this.y += this.velocity.y;
        }else{
            this.velocity.y = 0;
        }

        
    }
}

class Projectile {
    constructor(x, y, radius, colour, velocity) {
        this.x = x,
            this.y = y,
            this.radius = radius,
            this.colour = colour,
            this.velocity = velocity
    }
    drawProjectile() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.colour;
        ctx.fill()
    }
    //draw proj and update pos
    update() {
        this.drawProjectile();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, colour, velocity) {
        this.x = x,
            this.y = y,
            this.radius = radius,
            this.colour = colour,
            this.velocity = velocity,
            this.type ='Linear',
            //for spinning enermy
            this.radians = 0,
            this.center = {
                x,
                y
            }
            //50% enemies are homing

            if (Math.random() <= 0.5){
                this.type = 'Homing';
                if(Math.random() < 0.5){
                    this.type = 'Spinning';
                    if(Math.random() < 0.5){
                        this.type = 'Homing Spinning';
                    }
                }
            }
    }
    drawEnemy() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.colour;
        ctx.fill()
    }
    update() {
        this.drawEnemy();

        //spinning enemy
        if (this.type === 'Spinning') {
                       
            this.radians += 0.1;
            
            this.center.x += this.velocity.x;
            this.center.y += this.velocity.y;

            this.x = this.center.x + Math.cos(this.radians) * 30;
            this.y = this.center.y + Math.sin(this.radians) * 30;
        }

        //honing enermy to player
        else if(this.type === 'Homing'){
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.velocity.x = Math.cos(angle);
            this.velocity.y = Math.sin(angle);
            this.x = this.x + this.velocity.x;
            this.y = this.y + this.velocity.y;
    }
    //homing and spinning
    else if(this.type === "Homing Spinning"){
            this.radians += 0.1;
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            this.velocity.x = Math.cos(angle);
            this.velocity.y = Math.sin(angle);

            this.center.x += this.velocity.x;
            this.center.y += this.velocity.y;

            this.x = this.center.x + Math.cos(this.radians) * 30;
            this.y = this.center.y + Math.sin(this.radians) * 30;


    }
    else{
        //linear enemy
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;}
    }
}

//fireworks explosion particle class
//factor to slow down velocity of particles
const friction = 0.98;
class Particle {
    constructor(x, y, radius, colour, velocity) {
        this.x = x,
            this.y = y,
            this.radius = radius,
            this.colour = colour,
            this.velocity = velocity,
            //so can fade out the particle
            this.alpha = 1 
    }
    drawEnemy() {
        //for altering alpha
        ctx.save();
        ctx.globalAlpha = this.alpha;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.colour;
        ctx.fill();
        //out of altering alpha
        ctx.restore();
    }
    update() {
        this.drawEnemy();
        //slow down over time
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        //make disappear
        this.alpha -= 0.01;
    }
}

//background particles
//default radius = 3, color blue


class BackgroundParticle{
    constructor({position, radius = 3, colour = 'blue'}){
        this.position = position,
        this.radius = radius,
        this.colour = colour,
        //fade in and out using alpha + greensocks
        this.alpha = 0.02
        
    }

    draw(){
        //alpha
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.colour;
        ctx.fill();
        ctx.restore();
    }
}

//create class for ppowerup to collect
//parameters wrapped in curlies so can give assignments/labels
//to make it easier to pass in the right values when creating objects
//includes a default for position
class PowerUp{
    constructor({position = {x: 0, y: 0}, velocity}){
        this.position = position,
        this.velocity = velocity,

        //create js image from image
        this.image = new Image(),
        this.image.src = './img/lightningBolt.png',

        //fade in and out using alpha + greensocks
        this.alpha = 1,
        gsap.to(this, {
            alpha: 0,
            duration: 0.2,
            repeat: -1,
            yoyo:true,
            ease: 'linear'
        }),
        this.radians = 0
    }
 
    draw(){
        //change alpha and rotate
        ctx.save();
        ctx.globalAlpha = this.alpha;
        //rotate
        ctx.translate(this.position.x + this.image.width / 2, this.position.y + this.image.height / 2);
        ctx.rotate(this.radians);
        ctx.translate(-this.position.x - this.image.width / 2, -this.position.y - this.image.height / 2);
        ctx.drawImage(this.image, this.position.x, this.position.y);
        ctx.restore();
    }

    update(){
        this.draw();
        this.radians += 0.01;
        this.position.x += this.velocity.x;
    }
}