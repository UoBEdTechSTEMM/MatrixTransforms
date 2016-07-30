/* TwoJS http://jonobr1.github.io/two.js/ */
/* color palette http://paletton.com/#uid=32i0B0kmRuDdfKki--+sHsUtYm0 */

/* Library namespace */
var matrix = matrix || {};

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

  mt.Matrix.prototype.add = function (m) {
    return new mt.Matrix(this.a + m.a, this.b + m.b, this.c + m.c, this.d + m.d)
  }

  mt.Matrix.prototype.multiplyRight = function (m) {
    return new mt.Matrix(this.a * m.a + this.b * m.c, this.a * m.b + this.b * m.d,
                         this.c * m.a + this.d * m.c, this.c * m.b + this.d * m.d)
  }

  mt.Matrix.prototype.multiplyLeft = function (m) {
    return m.multiplyRight(this)
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

  mt.drawPath = function (two, vertices, fillColor, strokeColor) {
    // Flatten vertices into a single array of x and y values
    var v = []
    for (var i = 0; i < vertices.length; ++i) {
      v.push(vertices[i].x)
      v.push(vertices[i].y)
    }
    // Finally push the boolean saying we want a closed path
    v.push(false)

    // Pass the arguments as an array, this bit is a bit tricky
    var path = two.makePath.apply(two, v)

    path.fill = fillColor
    path.stroke = strokeColor
    path.linewidth = 2
    path.opacity = 0.5
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

    // Num decimal places to truncate to
    var decimalPlaces = 3

    // Store both matrices (for swapping them using the swap button)
    var matrix
    var inverseMatrix

    // Current shape to draw
    var currentShape = 'Triangle'

    // Called whenever display is to be updated
    function updateDisplay () {
      var transformedVertices
      var res

      // Clear the screen and draw initial stuff
      two.clear()

      // Draw the grid
      grid.draw(two)

      // Draw the untransformed shape
      if (currentShape === 'Triangle') {
        vertices = [new mt.Point(0, 0), new mt.Point(1, 0), new mt.Point(1, 1)]
      } else if (currentShape === 'Square') {
        vertices = [new mt.Point(0, 0), new mt.Point(1, 0), new mt.Point(1, 1), new mt.Point(0, 1)]
      }

      // Scale the vertices and draw the shape
      scaledVertices = grid.scalePoints(vertices)
      mt.drawPath(two, scaledVertices, '#FF9E96', '#F45346')

      transformedVertices = []

      // Apply transformation matrix to each vertex
      for (var i = 0; i < vertices.length; i++) {
        transformedVertices.push(vertices[i].applyMatrix(matrix))
      }

      // Transform to screen coordinates and draw the triangle
      scaledVertices = grid.scalePoints(transformedVertices)
      mt.drawPath(two, scaledVertices, '#DAF791', '#A1D916')

      // Calculate and display the inverse
      res = matrix.getInverse()

      // If it exists, save it and display it, else set the inverse matrix to null
      if (res.exists) {
        inverseMatrix = res.matrix

        // Divide by 1 to remove trailing zeroes
        $('#inverseMatrix').text('\\[ \\begin{pmatrix} ' +
          res.matrix.a.toFixed(decimalPlaces) / 1 + ' & ' + res.matrix.b.toFixed(decimalPlaces) / 1 + ' \\\\ ' +
          res.matrix.c.toFixed(decimalPlaces) / 1 + ' &  ' + res.matrix.d.toFixed(decimalPlaces) / 1 + ' \\end{pmatrix} \\]')
      } else {
        inverseMatrix = new mt.Matrix(0, 0, 0, 0)
        $('#inverseMatrix').text('\\[ \\begin{pmatrix} 0 & 0 \\\\ 0 & 0 \\end{pmatrix} \\]')
      }

      // Re-render LaTeX
      MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'MatrixTransformations'])

      // Update screen
      two.update()
    }

    // Get new values from the transformation matrix on the page and display them, updating the display afterwards
    function getNewMatrixValuesAndUpdate () {
      // Get the matrix elements from page
      matrix = new mt.Matrix(Number($('#matrixElemA').val()), Number($('#matrixElemB').val()),
        Number($('#matrixElemC').val()), Number($('#matrixElemD').val()))

      // Check if there are any bad values, if so, break
      if (isNaN(matrix.a) || isNaN(matrix.b) || isNaN(matrix.c) || isNaN(matrix.d)) {
        return
      }

      updateDisplay()
    }

    // Refresh the transformation matrix on the page with the current matrix values
    function updateTransformationMatrixDisplay () {
      // Divide by 1 to remove trailing zeroes
      $('#matrixElemA').val(matrix.a.toFixed(decimalPlaces) / 1)
      $('#matrixElemB').val(matrix.b.toFixed(decimalPlaces) / 1)
      $('#matrixElemC').val(matrix.c.toFixed(decimalPlaces) / 1)
      $('#matrixElemD').val(matrix.d.toFixed(decimalPlaces) / 1)
    }

    // TODO: Maybe refactor event handling code out? (It's pretty long)

    // Add event handler to update display on change
    $('#matrixElemA').on('input', getNewMatrixValuesAndUpdate)
    $('#matrixElemB').on('input', getNewMatrixValuesAndUpdate)
    $('#matrixElemC').on('input', getNewMatrixValuesAndUpdate)
    $('#matrixElemD').on('input', getNewMatrixValuesAndUpdate)

    // Add event handler to button that swaps the inverse and transformation matrices
    $('#swapMatrices').click(function () {
      // Divide by 1 to remove trailing zeroes
      matrix.a = inverseMatrix.a.toFixed(decimalPlaces) / 1
      matrix.b = inverseMatrix.b.toFixed(decimalPlaces) / 1
      matrix.c = inverseMatrix.c.toFixed(decimalPlaces) / 1
      matrix.d = inverseMatrix.d.toFixed(decimalPlaces) / 1

      $('#inverseMatrix').text('\\[ \\begin{pmatrix} ' +
        matrix.a.toFixed(decimalPlaces) / 1 + ' & ' + matrix.b.toFixed(decimalPlaces) / 1 + ' \\\\ ' +
        matrix.c.toFixed(decimalPlaces) / 1 + ' &  ' + matrix.d.toFixed(decimalPlaces) / 1 + ' \\end{pmatrix} \\]')

      // Refresh everything
      updateDisplay()
      updateTransformationMatrixDisplay()
    })

    // Add event handler for shape selection drop-down list
    $('#shapeSelect').change(function () {
      currentShape = $('#shapeSelect option:selected').text()
      updateDisplay()
    })

    // Add event handler for apply scale matrix button
    $('#applyScaleMatrix').click(function () {
      // Multiply current matrix from left by scale matrix and update transformation matrix and display
      if (!isNaN($('#scaleMatrixElem').val())) {
        matrix = matrix.multiplyLeft(new mt.Matrix(Number($('#scaleMatrixElem').val()), 0, 0, Number($('#scaleMatrixElem').val())))
        updateTransformationMatrixDisplay()
        updateDisplay()
      }
    })

    // Makes sure that both diagonal elements of scale matrix are equal
    function scaleEventHandler () {
      if (!isNaN($('#scaleMatrixElem').val()) && $('#scaleMatrixElem').val() !== '') {
        $('#scaleMatrix').text('\\(\\begin{pmatrix} ' +
          '\\FormInput[][matrixInputSmaller][' + $('#scaleMatrixElem').val() + ']{scaleMatrixElem} & 0 \\\\ 0 & ' +
          $('#scaleMatrixElem').val() + '\\end{pmatrix} \\)')

        MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'MatrixTransformations'])

        // Re-register event handler after MathJax refresh
        MathJax.Hub.Queue(function () {
          $('#scaleMatrixElem').on('input', scaleEventHandler)
        })
      }
    }

    // Add event handler so that both diagonal elements of the scale matrix are equal
    $('#scaleMatrixElem').on('input', scaleEventHandler)

    // Add event handler for apply rotation matrix button
    $('#applyRotationMatrix').click(function () {
      // Multiply current matrix from left by rotation matrix and update transformation matrix and display
      if (!isNaN($('#rotationAngle').val())) {
        var angle = Number($('#rotationAngle').val()) * (Math.PI / 180)

        matrix = matrix.multiplyLeft(new mt.Matrix(Math.cos(angle), -Math.sin(angle), Math.sin(angle), Math.cos(angle)))
        updateTransformationMatrixDisplay()
        updateDisplay()
      }
    })

    // Makes sure that both diagonal elements of scale matrix are equal
    function rotationEventHandler () {
      if (!isNaN($('#rotationAngle').val()) && $('#rotationAngle').val() !== '') {
        var angle = $('#rotationAngle').val()

        $('#rotationMatrix').text('\\(\\begin{pmatrix} ' +
          '\\cos{\\FormInput[][matrixInput][' + angle + ']{rotationAngle}} & -\\sin{' + angle + '}' +
          '\\\\ \\sin{' + angle + '} & ' + ' \\cos{' + angle + '} \\end{pmatrix} \\)')

        MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'MatrixTransformations'])

        // Re-register event handler after MathJax refresh
        MathJax.Hub.Queue(function () {
          $('#rotationAngle').on('input', rotationEventHandler)
        })
      }
    }

    // Add event handler so that both diagonal elements of the scale matrix are equal
    $('#rotationAngle').on('input', rotationEventHandler)

    // Draw initial display
    getNewMatrixValuesAndUpdate()
    two.update()
  }
})(matrix)
