/* TwoJS http://jonobr1.github.io/two.js/ */
/* color palette http://paletton.com/#uid=32i0B0kmRuDdfKki--+sHsUtYm0 */

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
   * @params{options} object of the form:
   * var options = {
   *   numTicks,    // number of ticks on each axis. Defaults to 10.
   *   tickSpacing, // { x, y } spacing of ticks in the x, y direction. Defaults
   *                // to { x: rect.width / numTicks, y: rect.height / numTicks }
   *   tickLength,  // length in pixels of the tickmark rendered on the grid. Defaults to 10.
   *   gridlines    // true if you want dashed gridlines on each tick, defaults to true
   * }
   */
  mt.Grid = function (rect, options) {
    this.rect = rect
    this.numTicks = options.numTicks
    this.tickSpacing = options.tickSpacing
    this.tickLength = options.tickLength
    this.gridlines = options.gridlines
    this.center = { x: (this.rect.width / 2) + this.rect.x,
                    y: (this.rect.height / 2) + this.rect.y }

    if (this.numTicks === undefined) {
      this.numTicks = 10
    }
    if (this.tickSpacing === undefined) {
      this.tickSpacing = { x: rect.width / this.numTicks, y: rect.height / this.numTicks }
    }
    if (this.tickLength === undefined) {
      this.tickLength = 10
    }
    if (this.gridlines === undefined) {
      this.gridlines = true
    }
  }

  /* Draw the grid onto the two.js instance */
  mt.Grid.prototype.draw = function (two) {
    var gridX
    var gridY
    var gridlineColor = '#ddd'

    for (var x = 0; x <= this.rect.width / this.tickSpacing.x; x++) {
      // Draw horizontal gridlines
      if (this.gridlines) {
        gridX = two.makeLine(x * this.tickSpacing.x + this.rect.x, this.rect.y,
          x * this.tickSpacing.x + this.rect.x, this.rect.height + this.rect.y)

        gridX.linewidth = 1
        gridX.stroke = gridlineColor
      }

      // Draw horizontal tickmarks
      two.makeLine(x * this.tickSpacing.x + this.rect.x, this.center.y - this.tickLength / 2,
        x * this.tickSpacing.x + this.rect.x, this.center.y + this.tickLength / 2)
    }

    for (var y = 0; y <= this.rect.height / this.tickSpacing.y; y++) {
      // Draw vertical gridlines
      if (this.gridlines) {
        gridY = two.makeLine(this.rect.x, y * this.tickSpacing.y + this.rect.y,
                this.rect.height + this.rect.x, y * this.tickSpacing.y + this.rect.y)

        gridY.linewidth = 1
        gridY.stroke = gridlineColor
      }

      // Draw vertical tickmarks
      two.makeLine(this.center.x - this.tickLength / 2, y * this.tickSpacing.y + this.rect.y,
        this.center.x + this.tickLength / 2, y * this.tickSpacing.y + this.rect.y)
    }

    // Finally, draw the vertical and horizontal axes
    two.makeLine(this.center.x, this.rect.y, this.center.x, this.rect.height + this.rect.y)
    two.makeLine(this.rect.x, this.center.y, this.rect.width + this.rect.x, this.center.y)
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

  mt.drawTriangle = function (two, vertices, fillColor, strokeColor) {
    var triangle = two.makePath(vertices[0].x, vertices[0].y,
      vertices[1].x, vertices[1].y, vertices[2].x, vertices[2].y, false)

    triangle.fill = fillColor
    triangle.stroke = strokeColor
    triangle.linewidth = 2
    triangle.opacity = 0.5
  }

  // The main application closure
  mt.runApp = function (canvasElem) {
    var two = new Two({ width: 600, height: 600 }).appendTo(canvasElem)

    // Bounding rectangle for the grid
    var pad = 10
    var rect = { x: pad, y: pad, width: two.width - pad * 2, height: two.height - pad * 2 }
    var numTicks = 10

    // Create the grid
    var grid = new mt.Grid(rect, { numTicks: numTicks })
    var vertices
    var scaledVertices

    // Store both matrices (for swapping them using the swap button)
    var matrix
    var inverseMatrix

    // Called whenver display is to be updated
    function updateDisplay () {
      var transformedVertices
      var res

      // Clear the screen and draw initial stuff
      two.clear()

      // Draw the grid
      grid.draw(two)

      // Draw an untransformed triangle
      vertices = [new mt.Point(0, 0), new mt.Point(1, 0), new mt.Point(1, 1)]
      scaledVertices = grid.scalePoints(vertices)
      mt.drawTriangle(two, scaledVertices, '#FF9E96', '#F45346')

      // Get the matrix elements from page
      matrix = new mt.Matrix($('#matrixElemA').val(), $('#matrixElemB').val(),
        $('#matrixElemC').val(), $('#matrixElemD').val())

      transformedVertices = []

      // Apply transformation matrix to each vertex
      for (var i = 0; i < vertices.length; i++) {
        transformedVertices.push(vertices[i].applyMatrix(matrix))
      }

      // Transform to screen coordinates and draw the triangle
      scaledVertices = grid.scalePoints(transformedVertices)
      mt.drawTriangle(two, scaledVertices, '#DAF791', '#A1D916')

      // Calculate and display the inverse
      res = matrix.getInverse()

      if (res.exists) {
        inverseMatrix = res.matrix
        $('#inverseMatrix').text('\\[ \\begin{pmatrix} ' +
          res.matrix.a.toPrecision(3) + ' & ' + res.matrix.b.toPrecision(3) + ' \\\\ ' +
          res.matrix.c.toPrecision(3) + ' &  ' + res.matrix.d.toPrecision(3) + ' \\end{pmatrix} \\]')
      } else {
        inverseMatrix = new mt.Matrix(0, 0, 0, 0)
        $('#inverseMatrix').val('\\[ \\begin{pmatrix} 0 & 0 \\ 0 & 0 \\end{pmatrix} \\]')
      }

      // Re-render LaTeX
      MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'MatrixTransformations'])

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
      $('#matrixElemA').val(inverseMatrix.a)
      $('#matrixElemB').val(inverseMatrix.b)
      $('#matrixElemC').val(inverseMatrix.c)
      $('#matrixElemD').val(inverseMatrix.d)

      $('#inverseMatrix').text('\\[ \\begin{pmatrix} ' +
        matrix.a.toPrecision(3) + ' & ' + matrix.b.toPrecision(3) + ' \\\\ ' +
        matrix.c.toPrecision(3) + ' &  ' + matrix.d.toPrecision(3) + ' \\end{pmatrix} \\]')

      // Refresh everything
      updateDisplay()
    })

    // Draw initial display
    updateDisplay()
    two.update()
  }
})(matrix)
