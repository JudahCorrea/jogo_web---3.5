const gravity = 0.2

const floorHeight = 96

const backgroundSpritePath = "./assets/background/placeholder.png"
const defaultObjectSpritePath = "./assets/objects/square.svg"

class Sprite {
    constructor({ position, velocity, source, scale, offset, sprites, collider }) {
        this.position = position
        this.velocity = velocity

        this.scale = scale || 1
        this.image = new Image() 
        this.image.src = source || defaultObjectSpritePath
        this.width = this.image.width * this.scale
        this.height = this.image.height * this.scale

        this.width = this.image.width * this.scale
        this.height = this.image.height * this.scale

        this.offset = offset || {
            x: 0,
            y: 0
        }

        this.sprites = sprites || {
            idle: {
                src: this.image.src,
                totalSpriteFrames: 1,
                framesPerSpriteFrame: 1
            }
        }

        this.collider = collider || {
            width: this.width,
            height: this.height
        }
        

        this.currentSprite = this.sprites.idle

        this.currentSpriteFrame = 0
        this.elapsedTime = 0
        this.totalSpriteFrames = this.sprites.idle.totalSpriteFrames
        this.framesPerSpriteFrame = this.sprites.idle.framesPerSpriteFrame
    }

    setSprite(sprite) {
        this.currentSprite = this.sprites[sprite]

        if (!this.currentSprite) {
            this.currentSprite = this.sprites.idle
        }
    }

    loadSprite() {
        let previousSprite = this.image.src

        this.image = new Image()
        this.image.src = this.currentSprite.src
        this.width = this.image.width * this.scale
        this.height = this.image.height * this.scale

        this.totalSpriteFrames = this.currentSprite.totalSpriteFrames
        this.framesPerSpriteFrame = this.currentSprite.framesPerSpriteFrame

        let newSprite = this.image.src

        if (previousSprite !== newSprite) {
            // Corrects the sprite's position when switching sprites
            console.log("Detected sprite change: ", previousSprite.split("/").pop(), " -> ", newSprite.split("/").pop())
            
            let previousSpriteImage = new Image()
            previousSpriteImage.src = previousSprite

            // Corrects the sprite's position:
            this.position.y += (previousSpriteImage.height - this.image.height) * this.scale
        }
    }

    draw() {        
        ctx.imageSmoothingEnabled = false;

        // Determine the x-scale based on the facing direction
        const xScale = this.facing === "left" ? -1 : 1;

        ctx.save();
        ctx.translate(this.position.x + this.offset.x, this.position.y + this.offset.y);
        ctx.scale(xScale, 1); // Flip the image horizontally if facing left

        ctx.drawImage(
            this.image,
            this.currentSpriteFrame * this.image.width / this.totalSpriteFrames,
            0,
            this.image.width / this.totalSpriteFrames,
            this.image.height,
            0,
            0,
            this.width / this.totalSpriteFrames * xScale, // Adjust the width with x-scale
            this.height
        );

        ctx.restore();
    }

    animate() {
        this.elapsedTime += 1

        if (this.elapsedTime >= this.framesPerSpriteFrame) {
            this.currentSpriteFrame += 1

            if (this.currentSpriteFrame >= this.totalSpriteFrames) {
                this.currentSpriteFrame = 0
            }

            this.elapsedTime = 0
        }
        
    }

    update() {
        this.draw()
        this.animate()
    }
}

class Fighter extends Sprite {
    constructor({
        position,
        velocity,
        attackBox,
        sprites,
        scale
    }) {
        super({
            position,
            velocity,
            scale,
            sprites
        })

        this.velocity = velocity

        this.attackBox = attackBox || {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            width: 125,
            height: 50
        }

        this.isAttacking
        this.attackCooldown = 500
        this.onAttackCooldown

        this.lastKeyPressed
        this.onGround
    }
    
    checkAttackCollision(attackBox, other) {
        return (
            attackBox.position.x < other.position.x + other.width &&
            attackBox.position.x + attackBox.width > other.position.x &&
            attackBox.position.y < other.position.y + other.height &&
            attackBox.position.y + attackBox.height > other.position.y
        );
    }

    gravity() {
        if (this.position.y + this.height >= canvas.height - floorHeight) {
            this.onGround = true
        } else {
            this.onGround = false
        }

        if (this.position.y + this.height > canvas.height - floorHeight) {
            this.position.y = canvas.height - this.height - floorHeight
            this.velocity.y = 0
        } else {
            if (!this.onGround) this.velocity.y += gravity
        }

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        this.attackBox.position.x = this.position.x
        this.attackBox.position.y = this.position.y

        this.collider.x = this.position.x
        this.collider.y = this.position.y

    }
        
    update() {
        this.gravity()
        this.loadSprite()
        this.draw()
        this.animate()

        this.collider.x = this.position.x;
        this.collider.y = this.position.y;
    }

    attack() {
        if (this.onAttackCooldown) return

        this.isAttacking = true
        this.onAttackCooldown = true

        this.setSprite("attacking")
        this.performAttack()

        setTimeout(() => {
            this.isAttacking = false
        }, 400)

        setTimeout(() => {
            this.onAttackCooldown = false
        }, this.attackCooldown)
    }

    performAttack() {
        console.log("chegou aqui")
        const attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            width: this.attackBox.width,
            height: this.attackBox.height
        };
        
        if(player.facing === "left"){
            console.log("player1 atacando")
            if (this.checkAttackCollision(attackBox, player2)) {
                console.log("player 2 esquerda")
                this.pushBackPlayer(player2);
            
            }
        }
        if (player.facing === "right") {
            console.log("player1 atacando")
            if (this.checkAttackCollision(attackBox, player2)) {
                console.log("player2 direita")
                this.pushBackPlayer(player2);
            }
        }
    }

    pushBackPlayer(target) {
        const pushBackSpeed = 50;
        console.log("atacou")
        console.log(target.velocity.x)
        target.velocity.x += pushBackSpeed;
        console.log(target.velocity.x)
        target.jump()
    }

    jump() {        
        if (!this.onGround) return
        this.velocity.y = -8.5
    }
}

class Fighter2 extends Sprite {
    constructor({
        position,
        velocity,
        attackBox,
        sprites,
        scale
    }) {
        super({
            position,
            velocity,
            scale,
            sprites
        })

        this.velocity = velocity

        this.attackBox = attackBox || {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            width: 125,
            height: 50
        }

        this.isAttacking
        this.attackCooldown = 500
        this.onAttackCooldown

        this.lastKeyPressed
        this.onGround
    }
    
    checkAttackCollision(attackBox, other) {
        return (
            attackBox.position.x < other.position.x + other.width &&
            attackBox.position.x + attackBox.width > other.position.x &&
            attackBox.position.y < other.position.y + other.height &&
            attackBox.position.y + attackBox.height > other.position.y
        );
    }

    gravity() {
        if (this.position.y + this.height >= canvas.height - floorHeight) {
            this.onGround = true
        } else {
            this.onGround = false
        }

        if (this.position.y + this.height > canvas.height - floorHeight) {
            this.position.y = canvas.height - this.height - floorHeight
            this.velocity.y = 0
        } else {
            if (!this.onGround) this.velocity.y += gravity
        }

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        this.attackBox.position.x = this.position.x
        this.attackBox.position.y = this.position.y

        this.collider.x = this.position.x
        this.collider.y = this.position.y

    }
        
    update() {
        this.gravity()
        this.loadSprite()
        this.draw()
        this.animate()

        this.collider.x = this.position.x;
        this.collider.y = this.position.y;
    }

    attack() {
        if (this.onAttackCooldown) return

        this.isAttacking = true
        this.onAttackCooldown = true

        this.setSprite("attacking")
        this.performAttack()

        setTimeout(() => {
            this.isAttacking = false
        }, 400)

        setTimeout(() => {
            this.onAttackCooldown = false
        }, this.attackCooldown)
    }

    performAttack() {
        console.log("chegou aqui")
        const attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            width: this.attackBox.width,
            height: this.attackBox.height
        };
        
        if(player2.facing === "left"){
            console.log("player2 atacando")
            if (this.checkAttackCollision(attackBox, player)) {
                console.log("player1 esquerda")
                this.pushBackPlayer(player);
            
            } 
        }
        
        if( player2.facing === "right") {
            console.log("player2 atacando")
            if (this.checkAttackCollision(attackBox, player)) {
                console.log("player1 direita")
                this.pushBackPlayer(player);
            }
        }
    }

    pushBackPlayer(target) {
        const pushBackSpeed = - 50;
        target.velocity.x = pushBackSpeed;
        target.jump()
    }

    jump() {        
        if (!this.onGround) return
        this.velocity.y = -8.5
    }

}


const player = new Fighter({
    position: {
        x: 100,
        y: 0
    },
    velocity: {
        x: 0,
        y: 10
    }, 
    scale: 4,
    sprites: {
        idle: {
            src: "./assets/player/idle_edit.png",
            totalSpriteFrames: 11,
            framesPerSpriteFrame: 18
        },
        running: {
            src: "./assets/player/running_edit.png",
            totalSpriteFrames: 10,
            framesPerSpriteFrame: 8
        },
        jumping: {
            src: "./assets/player/jumping_edit.png",
            totalSpriteFrames: 4,
            framesPerSpriteFrame: 8
        },
        attacking: {
            src: "./assets/player/attacking_edit.png",
            totalSpriteFrames: 7,
            framesPerSpriteFrame: 8
        }
    }
})

 const player2 = new Fighter2({
    position: {
        x: 800,
        y: 20
    },
    velocity: {
        x: 0,
        y: 0
    },
    scale: 4,
    sprites: {
        idle: {
            src: "./assets/player2/idle.png",
            totalSpriteFrames: 11,
            framesPerSpriteFrame: 18
        },
        running: {
            src: "./assets/player2/running.png",
            totalSpriteFrames: 10,
            framesPerSpriteFrame: 8
        },
        jumping: {
            src: "./assets/player2/jumping.png",
            totalSpriteFrames: 4,
            framesPerSpriteFrame: 8
        },
        attacking: {
            src: "./assets/player2/attacking.png",
            totalSpriteFrames: 7,
            framesPerSpriteFrame: 8
        }
    }

}) 

const background = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    source: backgroundSpritePath
})

// sistema para verificar a posição do player e tocar nas telas 
const messageDuration = 2000; // Tempo de duração da mensagem em milissegundos
let player1HitBounds = false;
let player2HitBounds = false;

function checkPlayerBounds(player, canvasWidth, canvasHeight) {
    // Verifica o lado direito da tela
    if (player.position.x > canvasWidth) {
        player.position.x = 100;
        console.log(`Player atingiu o lado direito da tela.`);
        player1HitBounds = true;

        if (player1HitBounds) {
            displayMessage("Player 1 atingiu os limites da tela.");
        }
    }
    
    // Verifica o lado esquerdo da tela
    if (player.position.x < 0) {
        console.log(`Player atingiu o lado esquerdo da tela.`);
        player1HitBounds = true;

        if (player1HitBounds) {
            displayMessage("Player 1 atingiu os limites da tela.");
        }
    }

    // Verifica o topo da tela
    if (player.position.y <= 0) {
        console.log(`Player atingiu o topo da tela.`);
        player1HitBounds = true;

        if (player1HitBounds) {
            displayMessage("Player 1 atingiu os limites da tela.");
        }
    }
}


function checkPlayerBounds2(player2, canvasWidth, canvasHeight) {
    // Verifica o lado direito da tela
    if (player2.position.x > canvasWidth) {
        console.log(`Player 2 atingiu o lado direito da tela.`);
        player2HitBounds = true;

        if (player2HitBounds) {
            displayMessage("Player 2 atingiu os limites da tela.");
        }
    }

    // Verifica o lado esquerdo da tela
    if (player2.position.x <= 0) {
        player2.position.x = 800;
        console.log(`Player 2 atingiu o lado esquerdo da tela.`);
        player2HitBounds = true;

        if (player2HitBounds) {
            displayMessage("Player 2 atingiu os limites da tela.");
        }
    }

    // Verifica o topo da tela
    if (player2.position.y <= 0) {
        console.log(`Player 2 atingiu o topo da tela.`);
        player2HitBounds = true;

        if (player2HitBounds) {
            displayMessage("Player 2 atingiu os limites da tela.");
        }
    }
}

function displayMessage(message) {
    // Exibe a mensagem na tela do canvas
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.fillText(message, canvas.width / 2 - ctx.measureText(message).width / 2, canvas.height / 2);

    // Trava o jogo por um curto período de tempo (messageDuration)
    setTimeout(() => {
        // Limpa a mensagem
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Reset das flags
        player1HitBounds = false;
        player2HitBounds = false;
    }, messageDuration);
}
