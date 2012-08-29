# Escher

### Stackable backbone views

Escher is a [Backbone](http://backbonejs.org) extension for managing stacks of views. Views can be pushed or popped onto the stack. The stack builds views into a sheet-based UI.

Depends on [Underscore](http://underscorejs.org), [Backbone](http://backbonejs.org) and [jQuery](http://jquery.com) -- the same dependencies backbone.

### Download

* [Development](https://raw.github.com/SpiderStrategies/escher/master/src/escher.js)
* [Production -- Not yet]()

#### Non-AMD

```
  <!-- Include jquery, backbone, underscore -->
  <script src="/assets/vendor/escher.js"></script>
```

#### Using with AMD

  TODO: Build a shim into the file.

### Usage

Create a backbone view that will server as the base layer in the stack.

```
HelloView = Backbone.View.extend({
  attributes: {
    style: "width: 100%; height: 100%; position: absolute;"
  },

  render: function () {
    this.$el.html('Hey ohh')
    return this
  }
})

var hv = new HelloView

// Throw the view on the page
$('#container').append(hv.render().el)
```

Create escher, passing it configuration settings.  At a bare minimum, pass it the base view.

```
var mcescher = Backbone.Escher({ base: hv })
```

Build a new view for the next layer.

```
Painting = Backbone.View.extend({

  render: function () {
    this.$el.html("Relativity is aweesome.")
    return this
  }

})

```

And finally you can stack views...

```
mcescher.push(new Painting)
```

Remove the top view

```
mcescher.pop()
```

### Configuration

topOffset: 15
leftOffset: 5
labelField: 'name'
