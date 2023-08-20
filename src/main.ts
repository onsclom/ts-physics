const canvas = document.createElement("canvas")

const SIM_SIZE = 400

canvas.style.width = `${SIM_SIZE}px`
canvas.style.height = `${SIM_SIZE}px`

type Circle = {
  pos: [number, number]
  ogPos: [number, number]
  color: string
}

const CIRCLE_RADIUS = 7
const CIRCLE_AMOUNT = 400
const circles: Circle[] = []

const CONSTRAINT = {
  pos: [SIM_SIZE / 2, SIM_SIZE / 2],
  radius: 200,
}

let mousePos: [number, number] = [0, 0]

function update() {
  const dpi = window.devicePixelRatio
  canvas.width = canvas.clientWidth * dpi
  canvas.height = canvas.clientHeight * dpi

  // ========================
  // UPDATE

  // add circle
  if (circles.length < CIRCLE_AMOUNT) {
    const pos: [number, number] = [SIM_SIZE / 2, SIM_SIZE / 4]
    circles.push({
      pos: [...pos],
      ogPos: [...pos],
      color: `hsl(${Math.random() * 50 + 176}, 100%, 85%)`,
    })
  }

  // apply collission
  circles.forEach((circle) => {
    circles.forEach((otherCircle) => {
      if (circle === otherCircle) return
      const difference = [
        circle.pos[0] - otherCircle.pos[0],
        circle.pos[1] - otherCircle.pos[1],
      ]
      const dist = Math.sqrt(difference[0] ** 2 + difference[1] ** 2)
      if (dist < CIRCLE_RADIUS * 2) {
        const overlap = CIRCLE_RADIUS * 2 - dist
        circle.pos[0] += difference[0] * (overlap / dist) * 0.5
        circle.pos[1] += difference[1] * (overlap / dist) * 0.5
        otherCircle.pos[0] -= difference[0] * (overlap / dist) * 0.5
        otherCircle.pos[1] -= difference[1] * (overlap / dist) * 0.5
      }
    })
  })

  // apply constraint
  circles.forEach((circle) => {
    const dist = Math.sqrt(
      (circle.pos[0] - CONSTRAINT.pos[0]) ** 2 +
        (circle.pos[1] - CONSTRAINT.pos[1]) ** 2
    )
    if (dist > CONSTRAINT.radius - CIRCLE_RADIUS) {
      const toCirc = [
        circle.pos[0] - CONSTRAINT.pos[0],
        circle.pos[1] - CONSTRAINT.pos[1],
      ]
      circle.pos[0] =
        CONSTRAINT.pos[0] +
        toCirc[0] * ((CONSTRAINT.radius - CIRCLE_RADIUS) / dist)
      circle.pos[1] =
        CONSTRAINT.pos[1] +
        toCirc[1] * ((CONSTRAINT.radius - CIRCLE_RADIUS) / dist)
    }
  })

  // update circles
  circles.forEach((circle) => {
    const vel = [
      circle.pos[0] - circle.ogPos[0],
      circle.pos[1] - circle.ogPos[1],
    ]
    circle.ogPos = [...circle.pos]

    // apply grav
    circle.pos[1] += 0.1

    // apply mouse force
    const mouseDiff: [number, number] = [
      mousePos[0] - circle.pos[0],
      mousePos[1] - circle.pos[1],
    ]
    const distSquared = mouseDiff[0] ** 2 + mouseDiff[1] ** 2
    const dist = Math.sqrt(distSquared)
    if (dist < 50) {
      const normalized = normalize(mouseDiff)
      circle.pos[0] -= normalized[0] * 1
      circle.pos[1] -= normalized[1] * 1
    }

    // apply
    circle.pos[0] += vel[0]
    circle.pos[1] += vel[1]
  })

  // ========================
  // DRAW

  const ctx = canvas.getContext("2d")!
  ctx.scale(dpi, dpi)

  // clear screen
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // draw constraint
  ctx.fillStyle = "black"
  ctx.beginPath()
  ctx.arc(
    CONSTRAINT.pos[0],
    CONSTRAINT.pos[1],
    CONSTRAINT.radius,
    0,
    2 * Math.PI
  )
  ctx.fill()

  circles.forEach((circle) => {
    ctx.fillStyle = circle.color
    ctx.beginPath()
    ctx.arc(circle.pos[0], circle.pos[1], CIRCLE_RADIUS, 0, 2 * Math.PI)
    ctx.fill()
  })

  requestAnimationFrame(update)
}
update()

canvas.onmousemove = (e) => {
  mousePos = [e.offsetX, e.offsetY]
}

document.body.appendChild(canvas)

function normalize(vec: [number, number]) {
  const dist = Math.sqrt(vec[0] ** 2 + vec[1] ** 2)
  if (dist === 0) return [0, 0]
  return [vec[0] / dist, vec[1] / dist]
}

// canvas.onmousedown = (e) => {
//   const pos: [number, number] = [e.offsetX, e.offsetY]
//   circles.push({
//     pos: [...pos],
//     ogPos: [...pos],
//     color: `hsl(${Math.random() * 10}%, 100%, 85%)`,
//   })
// }
