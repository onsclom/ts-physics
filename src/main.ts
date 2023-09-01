const SIM_SIZE = 400

const canvas = document.createElement("canvas")
document.body.appendChild(canvas)
canvas.style.width = `${SIM_SIZE}px`
canvas.style.height = `${SIM_SIZE}px`

type Circle = {
  pos: [number, number]
  ogPos: [number, number]
  color: string
  radius: number
}

const CIRCLE_AMOUNT = 400
const circles: Circle[] = []

const CONSTRAINT = {
  pos: [SIM_SIZE / 2, SIM_SIZE / 2],
  radius: 200,
}

let mousePos: [number, number] = [0, 0]

update()
canvas.onmousemove = (e) => (mousePos = [e.offsetX, e.offsetY])

function update() {
  // ========================
  // UPDATE

  const RADIUS_RANGE = [3, 10]
  // add circle
  if (circles.length < CIRCLE_AMOUNT) {
    const pos: [number, number] = [SIM_SIZE / 2, SIM_SIZE / 4]
    circles.push({
      pos: [...pos],
      ogPos: [...pos],
      color: `hsl(${Math.random() * 50 + 176}, 100%, 85%)`,
      radius:
        Math.random() * (RADIUS_RANGE[1] - RADIUS_RANGE[0]) + RADIUS_RANGE[0],
    })
  }

  const physicSteps = 4
  const physicDelta = 1 / physicSteps

  for (let i = 0; i < physicSteps; i++) {
    // update circles
    circles.forEach((circle) => {
      const vel = [
        circle.pos[0] - circle.ogPos[0],
        circle.pos[1] - circle.ogPos[1],
      ]
      circle.ogPos = [...circle.pos]

      // apply grav
      circle.pos[1] += 0.075 * physicDelta ** 2

      // apply mouse force
      const mouseDiff: [number, number] = [
        mousePos[0] - circle.pos[0],
        mousePos[1] - circle.pos[1],
      ]
      const distSquared = mouseDiff[0] ** 2 + mouseDiff[1] ** 2
      const dist = Math.sqrt(distSquared)
      if (dist < 50) {
        const normalized = normalize(mouseDiff)
        circle.pos[0] -= normalized[0] * physicDelta ** 2
        circle.pos[1] -= normalized[1] * physicDelta ** 2
      }

      // apply velocity
      circle.pos[0] += vel[0]
      circle.pos[1] += vel[1]
    })

    for (let i = 0; i < circles.length; i++) {
      for (let j = i + 1; j < circles.length; j++) {
        const circle = circles[i]
        const otherCircle = circles[j]
        if (circle === otherCircle) continue
        let diffX = circle.pos[0] - otherCircle.pos[0]
        const diffY = circle.pos[1] - otherCircle.pos[1]
        // HACK:
        // if they are same position, move one of them a bit
        if (diffX === 0 && diffY === 0) diffX += 0.1
        const dist = Math.sqrt(diffX ** 2 + diffY ** 2)
        // const radiusSum = circle.radius + otherCircle.radius
        if (dist < circle.radius + otherCircle.radius) {
          // const overlap = circle.radius + otherCircle.radius - dist
          circle.pos[0] +=
            diffX * ((circle.radius + otherCircle.radius - dist) / dist) * 0.5
          circle.pos[1] +=
            diffY * ((circle.radius + otherCircle.radius - dist) / dist) * 0.5
          otherCircle.pos[0] -=
            diffX * ((circle.radius + otherCircle.radius - dist) / dist) * 0.5
          otherCircle.pos[1] -=
            diffY * ((circle.radius + otherCircle.radius - dist) / dist) * 0.5
        }
      }
    }

    // apply constraint
    circles.forEach((circle) => {
      const dist = Math.sqrt(
        (circle.pos[0] - CONSTRAINT.pos[0]) ** 2 +
          (circle.pos[1] - CONSTRAINT.pos[1]) ** 2
      )
      if (dist > CONSTRAINT.radius - circle.radius) {
        const toCirc = [
          circle.pos[0] - CONSTRAINT.pos[0],
          circle.pos[1] - CONSTRAINT.pos[1],
        ]
        circle.pos[0] =
          CONSTRAINT.pos[0] +
          toCirc[0] * ((CONSTRAINT.radius - circle.radius) / dist)
        circle.pos[1] =
          CONSTRAINT.pos[1] +
          toCirc[1] * ((CONSTRAINT.radius - circle.radius) / dist)
      }
    })
  }

  // ========================
  // DRAW

  const ctx = canvas.getContext("2d")!

  // stuff needed to handle high dpi screens and zoom
  const dpi = window.devicePixelRatio
  canvas.width = canvas.clientWidth * dpi
  canvas.height = canvas.clientHeight * dpi
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

  // draw circles
  circles.forEach((circle) => {
    ctx.fillStyle = circle.color
    ctx.beginPath()
    ctx.arc(circle.pos[0], circle.pos[1], circle.radius, 0, 2 * Math.PI)
    ctx.fill()
  })

  requestAnimationFrame(update)
}

function normalize(vec: [number, number]) {
  const dist = Math.sqrt(vec[0] ** 2 + vec[1] ** 2)
  if (dist === 0) return [0, 0]
  return [vec[0] / dist, vec[1] / dist]
}
