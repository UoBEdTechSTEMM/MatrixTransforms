/* http://jonobr1.github.io/two.js/ */

/* Library namespace */
var matrix = {};

/* Our namespace function */
(function (mt) {
  /* @param{rect} rectangle { x, y, width, height } bounding the grid.
   * @param{numTicks} number of ticks on each axis. Defaults to 10.
   * @param{tickSpacing} { x, y } spacing of ticks in the x, y direction. Defaults
   *    to { x: rect.width / 2, y: rect.height / 2 }
   * @param{tickLength} length in pixels of the tickmark rendered on the grid. Defaults to 10. */
  mt.Grid = function (rect, numTicks, tickSpacing, tickLength) {
    if (numTicks === undefined) {
      numTicks = 10
    }
    if (tickSpacing === undefined) {
      tickSpacing = { x: rect.width / numTicks, y: rect.height / numTicks }
    }
    if (tickLength === undefined) {
      tickLength = 10
    }
    this.rect = rect
    this.numTicks = numTicks
    this.tickSpacing = tickSpacing
    this.tickLength = tickLength
    this.center = { x: (this.rect.width / 2) + this.rect.x,
                    y: (this.rect.height / 2) + this.rect.y }
  }

  mt.Grid.prototype.draw = function (two) {
    // Draw the vertical and horizontal axes
    two.makeLine(this.center.x, this.rect.y, this.center.x, this.rect.height + this.rect.y)
    two.makeLine(this.rect.x, this.center.y, this.rect.width + this.rect.x, this.center.y)

    // Draw the horizontal tickmarks
    for (var x = 0; x <= this.rect.width / this.tickSpacing.x; x++) {
      two.makeLine(x * this.tickSpacing.x + this.rect.x, this.center.y - this.tickLength / 2,
        x * this.tickSpacing.x + this.rect.x, this.center.y + this.tickLength / 2)
    }
    // Draw the vertical tickmarks
    for (var y = 0; y <= this.rect.height / this.tickSpacing.y; y++) {
      two.makeLine(this.center.x - this.tickLength / 2, y * this.tickSpacing.y + this.rect.y,
        this.center.x + this.tickLength / 2, y * this.tickSpacing.y + this.rect.y)
    }
  }

  mt.Grid.prototype.gridToScreenCoords = function (x, y) {
    return { x: x * this.tickSpacing.x + this.center.x,
             y: -y * this.tickSpacing.y + this.center.y }
  }

  mt.runApp = function (canvasElem) {
    var two = new Two({ width: 500, height: 500 }).appendTo(canvasElem)

    // Bounding rectangle for the grid
    var rect = { x: 40, y: 40, width: two.width - 40 * 2, height: two.height - 40 * 2 }
    var grid = new mt.Grid(rect)
    grid.draw(two)

    var vertices = [grid.gridToScreenCoords(0, 0), grid.gridToScreenCoords(1, 0), grid.gridToScreenCoords(1, 1)]
    var triangle = two.makePath(vertices[0].x, vertices[0].y,
      vertices[1].x, vertices[1].y, vertices[2].x, vertices[2].y, true)
    triangle.stroke = 'orangered'
    triangle.fill = 'red'
    triangle.linewidth = 0

    console.log(vertices)

    two.update()
  }
})(matrix)
