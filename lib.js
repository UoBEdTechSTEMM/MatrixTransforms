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
    var det = this.getDeterminant()

    if (det === 0) {
      return { exists: false }
    }

    return { exists: true, matrix: new mt.Matrix(this.d / det, -this.b / det, -this.c / det, this.a / det) }
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
   *    to { x: rect.width / numTicks, y: rect.height / numTicks }
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

  /* Draw the grid onto the two.js instance */
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

  /* Transform right-handed grid coordinates into left-handed, scaled screen coordinates */
  mt.Grid.prototype.gridToScreenCoords = function (point) {
    return new mt.Point(point.x * this.tickSpacing.x + this.center.x,
                       -point.y * this.tickSpacing.y + this.center.y)
  }

  /* Transform array of points from grid to screen coordinates */
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
    var pad = 20
    var rect = { x: pad, y: pad, width: two.width - pad * 2, height: two.height - pad * 2 }

    // Create the grid
    var grid = new mt.Grid(rect, 20)
    var vertices
    var scaledVertices

    function drawGridAndUntransformedTriangle () {
      // Draw the grid
      grid.draw(two)

      // Draw an untransformed triangle
      vertices = [new mt.Point(0, 0), new mt.Point(1, 0), new mt.Point(1, 1)]
      scaledVertices = grid.scalePoints(vertices)
      mt.drawTriangle(two, scaledVertices, 'red')
    }

    function updateDisplay () {
      // Clear the screen and redraw initial stuff
      two.clear()
      drawGridAndUntransformedTriangle()

      // Get the matrix elements from page
      var matrix = new mt.Matrix($('#matrixElemA').val(), $('#matrixElemB').val(),
        $('#matrixElemC').val(), $('#matrixElemD').val())

      var newVertices = [new mt.Point(0, 0)]

      // Apply transformation matrix to each vertex
      for (var i = 1; i < vertices.length; i++) {
        newVertices.push(vertices[i].applyMatrix(matrix))
      }

      // Transform to screen coordinates
      scaledVertices = grid.scalePoints(newVertices)

      // Draw the transformed triangle
      mt.drawTriangle(two, scaledVertices, 'green')

      // Calculate inverse if it exists
      var res = matrix.getInverse()

      if (res.exists) {
        $('#invMatrixElemA').text(res.matrix.a)
        $('#invMatrixElemB').text(res.matrix.b)
        $('#invMatrixElemC').text(res.matrix.c)
        $('#invMatrixElemD').text(res.matrix.d)
      } else {
        $('#invMatrixElemA').text(0)
        $('#invMatrixElemB').text(0)
        $('#invMatrixElemC').text(0)
        $('#invMatrixElemD').text(0)
      }

      // Update screen
      two.update()
    }

    // Add event handler to update display on change
    $('#matrixElemA').on('input', updateDisplay)
    $('#matrixElemB').on('input', updateDisplay)
    $('#matrixElemC').on('input', updateDisplay)
    $('#matrixElemD').on('input', updateDisplay)

    // Button that swaps the inverse and transformation matrices
    $('#swapMatrices').click(function () {
      var temp = $('#matrixElemA').val()
      $('#matrixElemA').val($('#invMatrixElemA').text())
      $('#invMatrixElemA').text(temp)

      temp = $('#matrixElemB').val()
      $('#matrixElemB').val($('#invMatrixElemB').text())
      $('#invMatrixElemB').text(temp)

      temp = $('#matrixElemC').val()
      $('#matrixElemC').val($('#invMatrixElemC').text())
      $('#invMatrixElemC').text(temp)

      temp = $('#matrixElemD').val()
      $('#matrixElemD').val($('#invMatrixElemD').text())
      $('#invMatrixElemD').text(temp)

      // Refresh everything
      updateDisplay()
    })

    // Draw initial display
    updateDisplay()
    two.update()
  }
})(matrix)
