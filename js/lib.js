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

  mt.IdentityMatrix = function () {
    return new mt.Matrix(1, 0, 0, 1)
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

  // Build matrix from jQuery object, returning a matrix or null if none exists
  mt.getMatrixFromjQuery = function (object) {
    var value
    var angle

    // Depending on type of the matrix, get the value(s), build the appropriate matrix, and apply it
    if (object.hasClass('scaleMatrix')) {
      value = object.find('.scaleMatrixElem')[0].value

      // Return scale matrix
      if (!isNaN(value)) {
        return new mt.Matrix(Number(value), 0, 0, Number(value))
      }
    } else if (object.hasClass('rotationMatrix')) {
      value = object.find('.rotationAngle')[0].value

      if (!isNaN(value)) {
        angle = Number(value) * (Math.PI / 180)

        return new mt.Matrix(Math.cos(angle), -Math.sin(angle), Math.sin(angle), Math.cos(angle))
      }
    } else if (object.hasClass('skewXMatrix')) {
      value = object.find('.skewXElem')[0].value

      if (!isNaN(value)) {
        angle = Number(value) * (Math.PI / 180)

        return new mt.Matrix(1, Math.tan(angle), 0, 1)
      }
    } else if (object.hasClass('skewYMatrix')) {
      value = object.find('.skewYElem')[0].value

      if (!isNaN(value)) {
        angle = Number(value) * (Math.PI / 180)

        return new mt.Matrix(1, 0, Math.tan(angle), 1)
      }
    } else if (object.hasClass('reflectXMatrix')) {
      return new mt.Matrix(1, 0, 0, -1)
    } else if (object.hasClass('reflectYMatrix')) {
      return new mt.Matrix(-1, 0, 0, 1)
    } else if (object.hasClass('reflectOriginMatrix')) {
      return new mt.Matrix(-1, 0, 0, -1)
    } else if (object.hasClass('arbitraryMatrix')) {
      value = [object.find('.matrixElemA')[0].value, object.find('.matrixElemB')[0].value,
          object.find('.matrixElemC')[0].value, object.find('.matrixElemD')[0].value]

      if (!value.some(isNaN)) {
        return new mt.Matrix(value[0], value[1], value[2], value[3])
      }
    }

    return null
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

    // Store undo history stack
    var undoHistory = []

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

      // Transform to screen coordinates and draw the untransformed shape
      scaledVertices = grid.scalePoints(vertices)
      mt.drawPath(two, scaledVertices, '#FF9E96', '#F45346')

      transformedVertices = []

      // Apply transformation matrix to each vertex (in grid space)
      for (var i = 0; i < vertices.length; i++) {
        transformedVertices.push(vertices[i].applyMatrix(matrix))
      }

      // Transform to screen coordinates and draw the transformed shape
      scaledVertices = grid.scalePoints(transformedVertices)
      mt.drawPath(two, scaledVertices, '#DAF791', '#A1D916')

      // Calculate and display the inverse
      res = matrix.getInverse()

      // If it exists, save it and display it, else set the inverse matrix to null
      if (res.exists === true) {
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

    // Add event handler to update transformation matrix on element change
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

    // Add event handler that adds a new matrix to the transformation list
    $('#addMatrixToList').click(function () {
      var newMatrix = $('#matrixSelect option:selected').text()

      // Depending on which matrix we have selected, add appropriate LaTeX to the page and render
      if (newMatrix === 'Scale') {
        $('#sortable').append('<div class="item scaleMatrix">' +
          'Scale<br />' +
          '\\(' +
          '\\begin{pmatrix}' +
          '\\FormInput[][matrixInputSmaller scaleMatrixElem][1]{} & 0 \\\\' +
          '0 & 1' +
          '\\end{pmatrix}' +
          '\\)' +
        '</div>')

        MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'MatrixTransformations'])

        // Add event handler that ensures that both diagonal elements of the scale matrix are equal
        MathJax.Hub.Queue(function () {
          $('.scaleMatrixElem').on('focusout', scaleEventHandler)
        })
      } else if (newMatrix === 'Rotation') {
        $('#sortable').append('<div class="item rotationMatrix">' +
          'Rotation<br />' +
          '\\(' +
          '\\begin{pmatrix}' +
          '\\cos{\\FormInput[][matrixInput rotationAngle][30]{}} & -\\sin{30} \\\\' +
          '\\sin{30} & \\cos{30}' +
          '\\end{pmatrix}' +
          '\\)' +
        '</div>')

        MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'MatrixTransformations'])

        // Add event handler so that both diagonal elements of the scale matrix are equal
        MathJax.Hub.Queue(function () {
          $('.rotationAngle').on('focusout', rotationEventHandler)
        })
      } else if (newMatrix === 'Skew X') {
        $('#sortable').append('<div class="item skewXMatrix">' +
          'Skew X<br />' +
          '\\(' +
          '\\begin{pmatrix}' +
          '1 & \\tan{\\FormInput[][matrixInput skewXElem][30]{}} \\\\' +
          '0 & 1' +
          '\\end{pmatrix}' +
          '\\)' +
        '</div>')

        MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'MatrixTransformations'])
      } else if (newMatrix === 'Skew Y') {
        $('#sortable').append('<div class="item skewYMatrix">' +
          'Skew Y<br />' +
          '\\(' +
          '\\begin{pmatrix}' +
          '1 & 0 \\\\' +
          '\\tan{\\FormInput[][matrixInput skewYElem][30]{}} & 1' +
          '\\end{pmatrix}' +
          '\\)' +
        '</div>')

        MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'MatrixTransformations'])
      } else if (newMatrix === 'Reflect X') {
        $('#sortable').append('<div class="item reflectXMatrix">' +
          'Reflect X <br />\\(\\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix} \\) </div>')

        MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'MatrixTransformations'])
      } else if (newMatrix === 'Reflect Y') {
        $('#sortable').append('<div class="item reflectYMatrix">' +
          'Reflect Y <br />\\(\\begin{pmatrix} -1 & 0 \\\\ 0 & 1 \\end{pmatrix} \\) </div>')

        MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'MatrixTransformations'])
      } else if (newMatrix === 'Reflect origin') {
        $('#sortable').append('<div class="item reflectOriginMatrix">' +
          'Reflect Origin <br />\\(\\begin{pmatrix} -1 & 0 \\\\ 0 & -1 \\end{pmatrix} \\) </div>')

        MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'MatrixTransformations'])
      } else if (newMatrix === 'Arbitrary') {
        $('#sortable').append('<div class="item arbitraryMatrix">' +
          'Arbitrary <br />' +
          '\\(' +
          '\\begin{pmatrix}' +
          '\\FormInput[][matrixInput matrixElemA][1]{} & \\FormInput[][matrixInput matrixElemB][0]{} \\\\' +
          '\\FormInput[][matrixInput matrixElemC][0]{} & \\FormInput[][matrixInput matrixElemD][1]{}' +
          '\\end{pmatrix}' +
          '\\)' +
        '</div>')

        MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'MatrixTransformations'])
      }
    })

    // Makes sure that both diagonal elements of scale matrix are equal
    function scaleEventHandler () {
      if (!isNaN(this.value) && this.value !== '') {
        // Replace LaTeX in div
        $(this).closest('div').text('\\(\\begin{pmatrix} ' +
          '\\FormInput[][matrixInputSmaller scaleMatrixElem][' + this.value + ']{} & 0 \\\\ 0 & ' +
          this.value + '\\end{pmatrix} \\)')

        MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'MatrixTransformations'])

        // Re-register event handler after MathJax refresh
        MathJax.Hub.Queue(function () {
          $('.scaleMatrixElem').on('focusout', scaleEventHandler)
        })
      }
    }

    // Makes sure that all the angles in the matrix are equal
    function rotationEventHandler () {
      if (!isNaN(this.value) && this.value !== '') {
        var angle = this.value

        // Replace LaTeX in div
        $(this).closest('div').text('\\(\\begin{pmatrix} ' +
          '\\cos{\\FormInput[][matrixInput rotationAngle][' + angle + ']{}} & -\\sin{' + angle + '}' +
          '\\\\ \\sin{' + angle + '} & ' + ' \\cos{' + angle + '} \\end{pmatrix} \\)')

        MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'MatrixTransformations'])

        // Re-register event handler after MathJax refresh
        MathJax.Hub.Queue(function () {
          $('.rotationAngle').on('focusout', rotationEventHandler)
        })
      }
    }

    // Apply matrices in order from right to left
    function applyInOrder () {
      var child
      var children = $('#sortable').children()

      // Traverse div children in reverse
      for (var i = children.length - 1; i >= 0; i--) {
        child = $(children[i])

        matrix = matrix.multiplyLeft(mt.getMatrixFromjQuery(child))
      }

      // Update transformation matrix and display
      updateTransformationMatrixDisplay()
      updateDisplay()
    }

    // Apply matrices in order to tranformation matrix
    $('#applyInOrder').click(applyInOrder)

    // Apply but reset the transformation matrix first
    $('#applyInOrderAndReset').click(function () {
      matrix = mt.IdentityMatrix()
      applyInOrder()
    })

    // Undo deleted matrix
    $('#undoDeletion').click(function () {
      if (undoHistory.length > 0) {
        $('#sortable').append(undoHistory.pop())

        // Set event handlers back up
        $('.scaleMatrixElem').on('focusout', scaleEventHandler)
        $('.rotationAngle').on('focusout', rotationEventHandler)
      }
    })

    // Push inverse matrix onto end of list
    $('#pushInverse').click(function () {
      var end = $('#sortable').children().last()
      var res = mt.getMatrixFromjQuery(end).getInverse()

      if (res.exists === true) {
        $('#sortable').append('<div class="item arbitraryMatrix">' +
          '\\(' +
          '\\begin{pmatrix}' +
          '\\FormInput[][matrixInput matrixElemA][' + res.matrix.a + ']{} & \\FormInput[][matrixInput matrixElemB][' + res.matrix.b + ']{} \\\\' +
          '\\FormInput[][matrixInput matrixElemC][' + res.matrix.c + ']{} & \\FormInput[][matrixInput matrixElemD][' + res.matrix.d + ']{}' +
          '\\end{pmatrix}' +
          '\\)' +
        '</div>')

        MathJax.Hub.Queue(['Typeset', MathJax.Hub, 'MatrixTransformations'])
      }
    })

    // Make the list of matrices sortable
    $('#sortable').sortable({
      items: '.item',
      connectWith: '#sortableDelete' // Allow us to drag items into the bin
    })
    $('#sortable').disableSelection()

    // If we drop a matrix on the trash, destroy it
    $('#sortableDelete').sortable({
      items: '.item',
      receive: function (event, ui) {
        // Delete the element, also storing it in undo history
        undoHistory.push(ui.item)
        ui.item.remove()
      }
    })

    // Draw initial display
    getNewMatrixValuesAndUpdate()
    two.update()
  }
})(matrix)
