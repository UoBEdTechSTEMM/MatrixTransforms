# Matrix Transformations

Hello :wave: This is a Two.JS Visualisation of how matrix transformations affect a simple shape on a grid.

`lib.js` contains the main code of our program. `app.js` adds a callback to the end of the MathJax rendering queue, so that when MathJax has finished loading, the `matrix.runApp` function is called with the div element that we want to include the canvas/SVG element in.


[Try it out on rawgit :sushi:](https://rawgit.com/UoBEdTechSTEMM/MatrixTransforms/master/index.html)

[View our homepage :tada:](https://github.com/UoBEdTechSTEMM/UoBEdTechSTEMM)

[Get involved with the contribution guide :crystal_ball:](https://github.com/UoBEdTechSTEMM/Contribution)

To get setup run:

```bash
$ npm install
```

Then you can run `standard` to lint your code and highlight any style errors.

## TODO

* Add ~~gridlines~~ and axis numbering

* Display vertices and matrices

  * ~~Display inverse matrix in LaTeX~~
  * ~~Display transformation matrix using [forminput](https://github.com/leathrum/mathjax-ext-contrib/tree/master/forminput)~~
  * Display full transformation equation (M * vertex = transformed)
  * Display sequence of transformations in list in order of application


* Sequencing of transformations in a list e.g. (M_1 * M_2 * M_3)

  * ~~Allow changing the order of application [(drag-and-drop?)](https://jqueryui.com/draggable/#sortableo)~~
  * Allow deleting of matrices from list
  * ~~Allow clearing of transformation matrix~~
  * Non-commuting matrices


* ~~Have some preset matrices~~

* Add new shapes

  * ~~Square~~
  * Circle? (Harder)
  * Allow user to click points to create arbitrary polygon


* Animation of transformation process in elementary steps

* Make it prettier :kiss:

* Gamification

* Make more responsive with [media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries)

* ~~Add the inverse matrix~~

## Ideas

* I don't know if the swap button is very useful
