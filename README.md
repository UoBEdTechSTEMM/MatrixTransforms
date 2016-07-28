Matrix Transformations
======================

Two.JS Visualisation for Matrix Transformations

[STYLE GUIDE read before making a commit](https://github.com/feross/standard)

[View on rawgit](https://rawgit.com/UoBEdTechSTEMM/MatrixTransforms/master/index.html)

Contribution guide:
-------------------

[Install node.js](https://nodejs.org/en/) TODO: need a way to install this on uni computers ([cloud9ide?](https://c9.io/))

To lint your code using Standard.JS and check that it conforms to the style guide you can use the "standard" node module. If you have node installed you can set up standard by running the command:

```bash
$ npm install -g standard
```

After that you can run the command ```standard``` in the root directory of the project and it will alert you to javascript formatting errors in any of the source files. You can *automagically* fix any errors by running.

```bash
$ standard --fix
```

If you enter in a new function, add it to the ```mt``` namespace e.g. if you want to add the ```clamp``` function to the ```mt``` namespace write something like this:

```javascript
var matrix = {};

(function (mt) {
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
...
(function (mt) {
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

If you want to declare a namespace-local "private" variable or function, then declare it as normal but within the namespace:

```javascript
...
(function (mt) {
  var namespaceLocal = 5;
  ...
  mt.addOne = function () {
    return namespaceLocal + 1;
  }
  ...
})(matrix)

console.log(namespaceLocal === undefined); // true
```

Create objects as normal:

```javascript
...
(function (mt) {
  ...
  mt.Vector3 = function (x, y, z) {
    this.x = x
    this.y = y
    this.z = z
  }

  mt.Vector3.prototype.getLength = function () {
    return Math.sqrt(Math.pow(this.x, 2), Math.pow(this.y, 2), Math.pow(this.z, 2))
  }
  ...
})(matrix)

var vector = new matrix.Vector3(3, 4, 5)
console.log(vector.getLength()) // 7.07...
```
