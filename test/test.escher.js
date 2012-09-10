var assert = chai.assert

describe('Escher', function () {
  var Escher, base

  describe('Initialization', function () {
    it('throws an error if a base view is not defined', function () {
      try {
        var escher = new Escher()
      } catch (e) {
        assert(e)
      }
    })

    it('sets proper defaults', function () {
      var escher = new Escher({
        base: base,
        topOffset: 20
      })

      assert.equal(escher.opts.topOffset, 20)
      assert.equal(escher.opts.leftOffset, 20)
      assert.equal(escher.opts.labelField, 'name')
    })

    it('adds the base step', function () {
      var escher = new Escher({ base: base })

      assert.equal(escher.steps.length, 1)
      assert.equal(escher.length(), 1)
      assert.equal(escher.top(), escher.bottom())
    })
  })

  describe('Top & Bottom', function () {
    it('fetches the top', function () {
      var escher = new Escher({ base: base })
      var v = new Backbone.View
      escher.push(v)
      assert.equal(escher.bottom().view, base)
      assert.equal(escher.top().view, v)
    })
  })

  describe('Events', function () {
    var layer, escher
    it('emits a view:activate event when a view is pushed', function (done) {
      layer.on('view:activate', done)
      escher.push(layer)
    })

    it('emits a view:activate event when a view is sent to the front of the stack', function (done) {
      base.on('view:activate', done)
      escher.push(layer)
      escher.pop()
    })

    it('emits a view:deactivate event when a view is dropped', function (done) {
      base.on('view:deactivate', done)
      escher.push(layer)
    })

    it('emits a view:deactivate event when a view is popped', function (done) {
      layer.on('view:deactivate', done)
      escher.push(layer)
      escher.pop()
    })

    it('emits a changed event when the stack changes', function (done) {
      escher.on('changed', function () {
        assert.equal(escher.length(), 2)
        done()
      })
      escher.push(layer)
    })

    it('emits a changing event before the stack changes', function (done) {
      escher.on('changing', function () {
        assert.equal(escher.length(), 1)
        done()
      })
      escher.push(layer)
    })

    beforeEach(function () {
      escher = new Escher({ base: base })
      var Layer = Backbone.View.extend({})
      layer = new Layer
    })
  })

  describe('Push & Pop', function () {
    var escher, layer1;

    describe('pop', function () {
      it('removes the top layer from the stack', function () {
        assert.equal(escher.length(), 2)
        escher.pop()
        assert.equal(escher.length(), 1)
      })

      it('shows the retreat link for the top view', function () {
        assert(escher.top().$('.escher-step-retreat').size())
      })

      it('removes the escher specific class names', function () {
        assert(base.$el.hasClass('escher-step-view-covered'))
        escher.pop()
        assert(!base.$el.hasClass('escher-step-view-covered'))
      })

      it('enables the events for the top view', function () {
        escher.pop()
        base.$('.next').trigger('click')
        assert(base.clicked)
      })

      beforeEach(function () {
        escher.push(layer1)
      })
    })

    describe('push', function () {
      it('adds a new step on the stack', function () {
        escher.push(layer1)
        assert.equal(escher.length(), 2)
        assert.equal(escher.top().view, layer1)
      })

      it('sets the appropriate class names', function () {
        escher.push(layer1)
        assert(layer1.$el.hasClass('escher-step-view'))
        assert(escher.top().$el.hasClass('escher-step'))
        assert(escher.top().view.$el.hasClass('escher-step-view'))
        assert(escher.top().retreat.$el.hasClass('escher-step-retreat'))
      })

      it('sets the correct style for the new page', function () {
        escher.push(layer1)
        assert.equal(escher.top().$el.css('position'), 'absolute')
        assert.equal(escher.top().$el.css('left'), '0px');
        assert.equal(escher.top().$el.css('top'), '0px');
        assert.equal(escher.top().view.$el.css('margin-left'), escher.opts.leftOffset + 'px')
        assert.equal(escher.top().view.$el.css('margin-bottom'), -(escher.opts.bottomOffset) + 'px')
        assert.equal(escher.top().$el.css('height'), base.$el.css('height'))
        escher.push(new (Backbone.View.extend({
            attributes: {
              style: "height: 500px"
            },

            name: 'Purple layer',

            render: function () {
              this.$el.html('<div>' +
                            '  <p style="padding-left: 30px; padding-top: 60px;">Layer 3</p>' +
                            '  <button class="close">Close</button>' +
                            '</div>')
              return this
            }
          })))

      })

      describe('background views', function () {

        it('stress test', function () {
          for (var i = 0; i < 15; i++) {
            var Layer = Backbone.View.extend({
              attributes: {
                style: "border: solid 1px #8b6125; background: #6D3353;"
              },
              name: 'Layer ' + i
            })
            escher.push(new Layer)
          }
          assert.equal(escher.length(), 16)
          assert.equal(escher.steps[1].retreat.$el.text(), 'Base')
          assert.equal(escher.top().retreat.$el.text(), 'Layer 13')

          escher.steps[1].retreat.trigger('close')
          assert.equal(escher.length(), 1)
          assert.equal($("#container").children().size(), 1)
        })

        it('builds a retreat link', function () {
          escher.push(layer1)
          var $retreat = escher.top().$('.escher-step-retreat')
          assert.equal($retreat.size(), 1)
          assert.equal($retreat.text(), base.name)
        })

        it('turns off events on background views', function () {
          base.$('.next').trigger('click')
          assert(base.clicked)
          base.clicked = false
          escher.push(layer1)
          base.$('.next').trigger('click')
          assert(!base.clicked)
        })

        it('clears overlaid views if retreating to the base view', function () {
          escher.push(layer1)
          assert(escher.top().retreat.$el.is(':visible'))
          assert.equal(escher.length(), 2)
          escher.top().retreat.trigger('close')

          // Make sure we only have one item (the base) in the stack
          assert.equal(escher.length(), 1)

          //Make sure events are turned on
          base.$('.next').trigger('click')
          assert(base.clicked)
          assert.equal(escher.length(), 1)

          assert.equal($("#container").children().size(), 1)
        })
      })
    })

    beforeEach(function () {
      escher = new Escher({ base: base })
      var Layer1 = Backbone.View.extend({
        name: 'Pink Layer',

        render: function () {
          this.$el.html('<div>' +
                        '  <p style="padding-left: 30px; padding-top: 60px;">Layer 2</p>' +
                        '  <button class="next">Next</button>' +
                        '  <button class="close">Close</button>' +
                        '</div>')
          return this
        }
      })
      layer1 = new Layer1
    })
  })

  describe('Multiple instances of escher', function () {
    it('minds its own business', function () {
      var escher = new Escher({
        base: base
      })

      var Base2 = Backbone.View.extend({})
      var escher2 = new Escher({
        base: new Base2
      })
      assert.notEqual(escher, escher2)
      assert.equal(escher.length(), 1)
      assert.equal(escher2.length(), 1)
      assert.notEqual(escher.bottom(), escher2.bottom())

      escher.push(new (Backbone.View.extend({})))
      assert.equal(escher.length(), 2)
      assert.equal(escher2.length(), 1)
    })
  })

  beforeEach(function () {
    Escher = Backbone.Escher;

    var Base = Backbone.View.extend({
      attributes: {
        style: "width: 100%; height: 100%; border: solid 1px #ccc; background: #ddd; margin-top: 20px; position: absolute;"
      },

      events: {
        'click .next': 'next'
      },

      name: 'Base',

      next: function () {
        this.clicked = true
      },

      render: function () {
        this.$el.html('<div>' +
                      '  <h1 style="padding-left: 100px; padding-top: 150px;">Base layer text</h1>' +
                      '  <button class="next">Next</button>' +
                      '</div>')
        return this
      }
    })

    base = new Base
    $('#container').append(base.render().el)
  })

  afterEach(function () {
    $('#container').empty()
  })
})
