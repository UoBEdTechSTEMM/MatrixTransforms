
// Forminput extension for LaTeX Inputs
MathJax.Hub.Config({
  TeX: {
    extensions: ['http://cs.jsu.edu/mathjax-ext/contrib/forminput/forminput.js']
  }
})

/* Run app when all MathJax has loaded.
 * Needed because matrix element inputs are MathJax and we will be adding event listeners */
MathJax.Hub.Queue(function () {
  // Unhide page
  $('#hidePage').css('visibility', '')

  // Get the canvas element
  var elem = $('#canvasContainer')[0]

  // Run the app
  matrix.runApp(elem)
})
