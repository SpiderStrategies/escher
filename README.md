# Escher

### Stackable backbone views

Escher is a [Backbone](http://backbonejs.org) extension for managing stacks of views. Views can be pushed or popped onto the stack. The stack builds views into a sheet-based UI.

Depends on [Underscore](http://underscorejs.org), [Backbone](http://backbonejs.org) and [jQuery](http://jquery.com) -- the same dependencies backbone.

### Download

Download the Dev or Prod (uglified) [vesions](https://raw.github.com/SpiderStrategies/escher/master/dist/).

#### Non-AMD

```
  <!-- Include jquery, backbone, underscore -->
  <script src="/assets/vendor/escher.js"></script>
```

#### Using with AMD

Define the path for escher and then you can require it.  Escher adds itself to Backbone, so the define returns backbone.

```
main.js
 {
  paths:
    { escher: '/vendor/backbone/plugins/escher'}
 }
```

Then simply require it, so it loads itself into backbone
```
define('core', ['escher'], function (Backbone) {
  // Escher is loaded into backbone
})
```

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

Each retreat link is wrapped by a div with a classname of **escher-step-retreat**, so it can be styled.  Every view managed by escher will have a classname of **escher-step** applied.

### Configuration

topOffset: 15
leftOffset: 5
labelField: 'name'

#### Testing

Tests use mocha and chai.assert.  Install these dependencies.

```
npm install -d
```

Run the tests
```
make test
```
