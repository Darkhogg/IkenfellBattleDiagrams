const BATTLE_WIDTH = 12
const BATTLE_HEIGHT = 5

const CW = 16
const CH = 8

function drawPerspectiveSquare (ctx, ox, oy, w, h, color) {
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.lineCap = 'square'
  
  ctx.beginPath()
  for (let i = 0; i < h; i++) {
    const x = ox + i + 0.5
    const y = oy + i + 0.5
    ctx.moveTo(x, y)
    ctx.lineTo(x + w - 1, y)
  }
  ctx.stroke()
}

function drawCell (ctx, ox, oy, color) {
  drawPerspectiveSquare(ctx, ox, oy, CW, CH, color)
}

function drawTarget (ctx, ox, oy, color) {
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.lineCap = 'square'
  
  ctx.beginPath()
  ctx.moveTo(ox + 7.5, oy + 2.5)
  ctx.lineTo(ox + 13.5, oy + 2.5)
  ctx.moveTo(ox + 10.5, oy + 3.5)
  ctx.lineTo(ox + 11.5, oy + 3.5)
  ctx.moveTo(ox + 11.5, oy + 4.5)
  ctx.lineTo(ox + 12.5, oy + 4.5)
  ctx.moveTo(ox + 12.5, oy + 5.5)
  ctx.lineTo(ox + 13.5, oy + 5.5)
  ctx.stroke()
}

const OLW = 2
const OLH = 1
const OL_MASK = {
  L: 0x01,
  R: 0x02,
  T: 0x04,
  B: 0x08,
  BL: 0x10,
  BR: 0x20,
  TL: 0x40,
  TR: 0x80,
}

function drawOutlines (ctx, outlines, ox, oy, color) {
  if (outlines & OL_MASK.L) {
    drawPerspectiveSquare(ctx, ox, oy, OLW, CH, color)
  }
  if (outlines & OL_MASK.R) {
    drawPerspectiveSquare(ctx, ox + CW - OLW, oy, OLW, CH, color)
  }
  if (outlines & OL_MASK.T) {
    drawPerspectiveSquare(ctx, ox, oy, CW, OLH, color)
  }
  if (outlines & OL_MASK.B) {
    drawPerspectiveSquare(ctx, ox + CH - OLH, oy + CH - OLH, CW, OLH, color)
  }
  if (outlines & OL_MASK.TL) {
    drawPerspectiveSquare(ctx, ox, oy, OLW, OLH, color)
  }
  if (outlines & OL_MASK.TR) {
    drawPerspectiveSquare(ctx, ox + CW - OLW, oy, OLW, OLH, color)
  }
  if (outlines & OL_MASK.BL) {
    drawPerspectiveSquare(ctx, ox + CH - OLH, oy + CH - OLH, OLW, OLH, color)
  }
  if (outlines & OL_MASK.BR) {
    drawPerspectiveSquare(ctx, ox + CW - OLW + CH - OLH, oy + CH - OLH, OLW, OLH, color)
  }
}

function calcOutlines (map, x, y) {
  if (!map[y][x]) return 0
  c = (cx, cy) => !!(map[cy] && map[cy][cx])
  
  const l = c(x-1, y) ? 0 : OL_MASK.L
  const r = c(x+1, y) ? 0 : OL_MASK.R
  const t = c(x, y-1) ? 0 : OL_MASK.T
  const b = c(x, y+1) ? 0 : OL_MASK.B
  
  const tl = c(x-1, y-1) ? 0 : OL_MASK.TL
  const tr = c(x+1, y-1) ? 0 : OL_MASK.TR
  const bl = c(x-1, y+1) ? 0 : OL_MASK.BL
  const br = c(x+1, y+1) ? 0 : OL_MASK.BR
  
  return l | r | t | b | tl | tr | bl | br
}

function drawShadow (ctx, cx, cy) {
  ctx.strokeStyle = 'rgba(0,0,0,0.3)'
  ctx.lineWidth = 1
  ctx.lineCap = 'square'
  
  ctx.beginPath()
  ctx.moveTo(cx - 5.5, cy + 0.5)
  ctx.lineTo(cx + 6.5, cy + 0.5)
  ctx.moveTo(cx - 4.5, cy - 0.5)
  ctx.lineTo(cx + 5.5, cy - 0.5)
  ctx.moveTo(cx - 4.5, cy + 1.5)
  ctx.lineTo(cx + 5.5, cy + 1.5)
  ctx.stroke()
}

function drawDiagramToCanvas (diagram, canvas) {
  var ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const vOff = canvas.height - (CH * BATTLE_HEIGHT)

  for (let bx = 0; bx < BATTLE_WIDTH; bx++) {
    for (let by = 0; by < BATTLE_HEIGHT; by++) {
      const parity = (bx + by) % 2
      const colors = diagram.highlights[by][bx] ? diagram.colorHl : (by >= 1 && by <= 3) ? diagram.colorIn : diagram.colorOut
      const outlines = calcOutlines(diagram.outlines, bx, by)
      
      const x = (bx * CW) + (by * CH)
      const y = vOff + (by * CH)

      drawCell(ctx, x, y, colors[parity])
      drawOutlines(ctx, outlines, x, y, diagram.colorOl)
      if (diagram.targets[by][bx]) {
        drawTarget(ctx, x, y, diagram.colorTg)
      }
    }
  }

  const sprBX = diagram.spritePosition.x - 1
  const sprBY = diagram.spritePosition.y - 1

  const sprCX = ((sprBX + 0.5) * CW) + ((sprBY + 0.5) * CH) - 1
  const sprCY = vOff + ((sprBY + 0.5) * CH) - 1

  if (diagram.shadow) {
    drawShadow(ctx, sprCX, sprCY)
  }
  if (diagram.sprite) {
    ctx.drawImage(diagram.sprite, sprCX - 7, sprCY - 23)
  }
}

const SPRITES = ['mari', 'nel', 'rook', 'perty', 'ima', 'gilda']


function init () {
    return {
        SPRITES,
        highlights: Array(5).fill().map(() => Array(12).fill(false)),
        outlines: Array(5).fill().map(() => Array(12).fill(false)),
        targets: Array(5).fill().map(() => Array(12).fill(false)),
        sprite: SPRITES[0],
        outColor1: '#333',
        outColor2: '#666',
        inColor1: '#47b',
        inColor2: '#7ad',
        hlColor1: '#ea4',
        hlColor2: '#ee5',
        olColor: '#c00',
        tColor: '#c00',
        sprPosX: 7,
        sprPosY: 3,
        drawSprite: true,
        drawShadow: true,
        selectSprite (name) {
          this.sprite = name
        },
        updateCell (array, row, col, value) {
          return array.map((rowArr, rowIdx) => (row - 1 === rowIdx)
            ? rowArr.map((colVal, colIdx) => col - 1 === colIdx ? value : colVal)
            : rowArr)
        },
        updateCanvas () {
          drawDiagramToCanvas({
            sprite: this.drawSprite ? this.$refs[this.sprite] : null,
            shadow: this.drawShadow,
            highlights: this.highlights,
            targets: this.targets,
            outlines: this.outlines,
            colorOut: [this.outColor1, this.outColor2],
            colorIn: [this.inColor1, this.inColor2],
            colorHl: [this.hlColor1, this.hlColor2],
            colorOl: this.olColor,
            colorTg: this.tColor,
            spritePosition: {x: this.sprPosX, y: this.sprPosY},
          }, this.$refs.canvas)

          const x2ctx = this.$refs.canvasx2.getContext('2d')
          x2ctx.imageSmoothingEnabled = false;
          x2ctx.clearRect(0, 0, this.$refs.canvasx2.width, this.$refs.canvasx2.height);
          x2ctx.drawImage(
            this.$refs.canvas, 
            0, 0, this.$refs.canvas.width, this.$refs.canvas.height,
            0, 0, this.$refs.canvasx2.width, this.$refs.canvasx2.height,
          );
        },
        downloadImage() {
          const link = document.createElement('a')
          link.download = 'diagram.png';
          link.href = this.$refs.canvas.toDataURL()
          link.click()
        }
    }
}