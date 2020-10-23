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

function drawDiagramToCanvas (diagram, canvas) {
  var ctx = canvas.getContext('2d')
  for (let x = 0; x < BATTLE_WIDTH; x++) {
    for (let y = 0; y < BATTLE_HEIGHT; y++) {
      const parity = (x + y) % 2
      const colors = diagram.highlights[y][x] ? diagram.colorHl : (y >= 1 && y <= 3) ? diagram.colorIn : diagram.colorOut
      const outlines = calcOutlines(diagram.outlines, x, y)
      
      drawCell(ctx, x * CW + y * CH, y* CH, colors[parity])
      drawOutlines(ctx, outlines, x * CW + y * CH, y* CH, diagram.colorOl)
    }
  }

  const imX = 5
  const imY = 2
  ctx.drawImage(diagram.sprite, 
    imX * CW + imX * CH - 4,
    imY * CH - 16)
}

function init () {
    return {
        highlights: Array(5).fill().map(() => Array(12).fill(false)),
        outlines: Array(5).fill().map(() => Array(12).fill(false)),
        outColor1: '#333',
        outColor2: '#666',
        inColor1: '#47b',
        inColor2: '#7ad',
        hlColor1: '#ea4',
        hlColor2: '#ee5',
        olColor: '#fff',
        tColor: '#fff',
        updateCell (array, row, col, value) {
          return array.map((rowArr, rowIdx) => (row - 1 === rowIdx)
            ? rowArr.map((colVal, colIdx) => col - 1 === colIdx ? value : colVal)
            : rowArr)
        },
        updateCanvas () {
          drawDiagramToCanvas({
            sprite: this.$refs.mar,
            highlights: this.highlights,
            outlines: this.outlines,
            colorOut: [this.outColor1, this.outColor2],
            colorIn: [this.inColor1, this.inColor2],
            colorHl: [this.hlColor1, this.hlColor2],
            colorOl: this.olColor,
            colorTg: this.tColor,
          }, this.$refs.canvas)

          const x2ctx = this.$refs.canvasx2.getContext('2d')
          x2ctx.imageSmoothingEnabled = false;
          x2ctx.drawImage(
            this.$refs.canvas, 
            0, 0, 240, 40,
            0, 0, 480, 80
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