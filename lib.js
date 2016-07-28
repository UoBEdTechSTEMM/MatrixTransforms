/* http://jonobr1.github.io/two.js/ */

var matrix = {};

(function (mt) {
  mt.run = function (canvasElem) {
    var two = new Two({ width: 500, height: 500 }).appendTo(canvasElem)

    var rect = two.makeRectangle(100, 200, 40, 60)
    rect.fill = '#FF8000'
    rect.stroke = 'orangered'
    rect.linewidth = 3

    two.update()
  }
})(matrix)
