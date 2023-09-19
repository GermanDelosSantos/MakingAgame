const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector('#scoreEl');
console.log(scoreEl)
// jugador
class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

}
// creacion de projectiles 
class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}
// creacion de enemigos
class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}
//Creacion de Particulas
const friction = 0.97
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha =1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

const player = new Player(x, y, 10, 'white')

// const para animaciones
const projetiles = []
const enemies = []
const particles = []
// spawn de enemigos
function spawnEnemies() {
    setInterval(() =>{
        const radius = Math.random() * (30 - 4) + 4
        
        let x
        let y

        
        if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
        y = Math.random() * canvas.height
        } 
        else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius

        }
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`

        const angle = Math.atan2(canvas.height / 2 - y,canvas.width / 2 - x)
        const velocity = {x: Math.cos(angle), y: Math.sin(angle)}
        
        enemies.push(
            new Enemy(x, y, radius, color, velocity)
        )
    },1000)
}
// animacion
let animationId
let score = 0
function animate () {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    particles.forEach((particle, index) =>{
        if (particle.alpha <= 0){
            particles.splice( index, 1)
        }else{
            particle.update()
        }
        
    });
    projetiles.forEach((projectile, index) => {
        projectile.update()
        // Sacar projectiles fuera del juego
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projetiles.splice(index, 1)
            }, 0)

        } 
    })

    enemies.forEach((enemy, index) => {
        enemy.update()
        // end game
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (dist - enemy.radius - player.radius < 1) {
            cancelAnimationFrame(animationId)
        }

        // eliminar enemigos
        projetiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            // Explociones
            if (dist - enemy.radius - projectile.radius < 1) 
            {

                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push (new Particle(
                        projectile.x, projectile.y, Math.random() * 2, enemy.color,
                        {x: (Math.random() - 0.5) * Math.random() * 6, y: (Math.random() - 0.5) * Math.random() * 6}));
                    
                }
            //Achicar enemigos
                if(enemy.radius -10 > 5){
            //Score Puntaje
                score += 100
                scoreEl.innerHTML = score
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projetiles.splice(projectileIndex, 1)
                    }, 0)
                } else{
            //Score Puntaje
                score += 250
                scoreEl.innerHTML = score

                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projetiles.splice(projectileIndex, 1)
    
                    }, 0)
                }
            }
        })
    });
} 
// disparos
addEventListener('click', (event) =>
    {
    const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
    const velocity = {x: Math.cos(angle) * 5, y: Math.sin(angle) * 5
    } 
    console.log (angle)
    projetiles.push(
        new Projectile(canvas.width/2, canvas.height / 2, 5, 'white', velocity)
    )
})

animate()
spawnEnemies()