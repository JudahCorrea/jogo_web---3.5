const keys2 = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    w: {
        pressed: false,
        hold: false
    },
    space: {
        pressed: false,
        hold: false
    },

}

window.addEventListener("keydown", e => {
    let key2 = e.key

    switch(key2) {
        case "ArrowLeft":
            keys2.a.pressed = true
            player2.lastKeyPressed = key2
            break
        case "ArrowRight":
            keys2.d.pressed = true
            player2.lastKeyPressed = key2
            break
        case "ArrowUp":
            keys2.w.pressed = true
            break
        case "l":
            keys2.space.pressed = true
            break
    }
})

window.addEventListener("keyup", e => {
    let key2 = e.key

    switch(key2) {
        case "ArrowLeft":
            keys2.a.pressed = false
            break
        case "ArrowRight":
            keys2.d.pressed = false
            break
        case "ArrowUp":
            keys2.w.pressed = false
            keys2.w.hold = false
            break
        case "l":
            keys2.space.pressed = false
            keys2.space.hold = false
            break
    }
})

function handleControls2() {
    player2.setSprite("idle")

    if (!player2.onGround) player2.setSprite("jumping")
    if (player2.isAttacking) player2.setSprite("attacking")

    movement()
    attacks()

    function movement() {
        player2.velocity.x = 0
        if (player2.isAttacking) return

        if (keys2.a.pressed && ["ArrowLeft"].includes(player2.lastKeyPressed)) {
            player2.velocity.x = -1.2 * 3.4
            player2.facing = "left"

            if (!player2.onGround) return

            player2.setSprite("running")
        }

        if (keys2.d.pressed && ["ArrowRight"].includes(player2.lastKeyPressed)) {
            player2.velocity.x = 1.2 * 3.4
            player2.facing = "right"

            if (!player2.onGround) return

            player2.setSprite("running")
        }

        if (keys2.w.pressed && !keys2.w.hold) {
            player2.jump()
            keys2.w.hold = true
            player2.setSprite("jumping")
        }
    }

    function attacks() {
        if (keys2.space.pressed && !keys2.space.hold) {
            player2.attack()
            keys2.space.hold = true
        } 
    }
}