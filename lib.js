/* http://jonobr1.github.io/two.js/ */

/* Library namespace */
var matrix = {};

/* Our namespace function */
(function (mt) {
  // Matrix [[a, b], [c, d]]

  mt.Matrix = function (a, b, c, d) {
    this.a = a
    this.b = b
    this.c = c
    this.d = d
  }

  mt.Matrix.prototype.getDeterminant = function () {
    return this.a * this.d - this.b * this.c
  }

  mt.Matrix.prototype.getInverse = function () {
    // TODO
  }

  mt.Matrix.prototype.toString = function () {
    return '[[' + this.a + ', ' + this.b + '], [' + this.c + ', ' + this.d + ']]'
  }

  mt.Point = function (x, y) {
    this.x = x
    this.y = y
  }

  mt.Point.prototype.applyMatrix = function (m) {
    return new mt.Point(this.x * m.a + this.y * m.b, this.x * m.c + this.y * m.d)
  }

  mt.Point.prototype.toString = function () {
    return '[' + this.a + ', ' + this.b + ']'
  }

  // Grid

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

  mt.Grid.prototype.gridToScreenCoords = function (point) {
    return new mt.Point(point.x * this.tickSpacing.x + this.center.x,
                        point.y * this.tickSpacing.y + this.center.y)
  }

  mt.Grid.prototype.scalePoints = function (arrayOfPoints) {
    var scaled = []

    for (var i = 0; i < arrayOfPoints.length; i++) {
      scaled.push(this.gridToScreenCoords(arrayOfPoints[i]))
    }

    return scaled
  }

  mt.drawTriangle = function (two, vertices, color) {
    var triangle = two.makePath(vertices[0].x, vertices[0].y,
      vertices[1].x, vertices[1].y, vertices[2].x, vertices[2].y, true)

    triangle.fill = color
  }

  mt.runApp = function (canvasElem) {
    var two = new Two({ width: 500, height: 500 }).appendTo(canvasElem)

    // Bounding rectangle for the grid
    var rect = { x: 40, y: 40, width: two.width - 40 * 2, height: two.height - 40 * 2 }

    // Create and draw the grid
    var grid = new mt.Grid(rect)
    grid.draw(two)

    // Draw an untransformed triangle
    var vertices = [new mt.Point(0, 0), new mt.Point(1, 0), new mt.Point(1, -1)]
    var scaledVertices = grid.scalePoints(vertices)
    mt.drawTriangle(two, scaledVertices, 'red')

    var matrix = new mt.Matrix(-2, 0, 0, -2)

    // Apply transformation matrix to each vertex
    for (var i = 1; i < vertices.length; i++) {
      vertices[i] = vertices[i].applyMatrix(matrix)
    }

    scaledVertices = grid.scalePoints(vertices)

    // Draw the transformed triangle
    mt.drawTriangle(two, scaledVertices, 'green')

    // Display the matrix on the page
    $('#matrixDisplay').text(matrix.toString())

    two.update()
  }
})(matrix)
