Matrix Transformations
======================

Two.JS Visualisation for Matrix Transformations

[STYLE GUIDE read before making a commit](https://github.com/feross/standard)

[View on rawgit](https://rawgit.com/UoBEdTechSTEMM/MatrixTransforms/master/index.html)

Contribution guide:

If you enter in a new function, add it to the ```mt``` namespace e.g. if you want to add the ```clamp``` function to the ```mt``` namespace write something like this:

```javascript
var matrix = {};

(function(mt) {
...

mt.clamp = function (x, min, max) {
  if (x <= min) {
    return min
  } else if (x > min && x < max) {
    return x
  } else if (x >= max) {
    return max
  }
}

...
})(matrix)
```

You can then call this from inside the namespace like this:

```javascript
(function(mt) {
...
mt.somefunc = function  () {
  var y = mt.clamp(15, 10, 20)
}
...
})(matrix)
```

and from other scripts like this:

```javascript
var y = matrix.clamp(15, 10, 20)
```
