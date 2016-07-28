/* http://jonobr1.github.io/two.js/ */

/* Library namespace */
var matrix = {};

/* Our namespace function */
(function (mt) {
  mt.runApp = function (canvasElem) {
    var two = new Two({ width: 500, height: 500 }).appendTo(canvasElem)

    var rect = two.makeRectangle(100, 200, 40, 60)
    rect.fill = '#FF8000'
    rect.stroke = 'orangered'
    rect.linewidth = 3

    two.update()
  }
})(matrix)
