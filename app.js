
/* Run app when all MathJax has loaded.
 * Needed because matrix element inputs are MathJax and we will be adding event listeners */
MathJax.Hub.Queue(function () {
  // Unhide page
  $('#hidePage').css('visibility', '')

  // Get the canvas container
  var elem = $('#canvasContainer')[0]

  // Run the app
  matrix.runApp(elem)
})
