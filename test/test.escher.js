
describe('Escher', function () {
  var Escher, base;

  describe('Initialization', function () {
    it('throws an error if a base view is not defined', function () {
      try {
        var escher = new Escher()
      } catch (e) {
        chai.assert(e)
      }
    })

    it('sets proper defaults', function () {
      var escher = new Escher({
        base: base,
        topOffset: 20
      })

      chai.assert.equal(escher.opts.topOffset, 20)
      chai.assert.equal(escher.opts.leftOffset, 5)
      chai.assert.equal(escher.opts.labelField, 'name')
    })

    it('adds the base step', function () {
      var escher = new Escher({ base: base })

      chai.assert.equal(escher.steps.length, 1)
      chai.assert.equal(escher.length(), 1)
    })
  })

  describe('Top & Bottom', function () {
    it('fetches the top', function () {
      var escher = new Escher({ base: base })
      chai.assert.equal(escher.bottom().view, base)
      chai.assert.equal(escher.top(), escher.bottom())
      var v = new Backbone.View
      escher.push(v)
      chai.assert.equal(escher.top().view, v)
      chai.assert.notEqual(escher.top(), escher.bottom())
      chai.assert.equal(escher.bottom().view, base)
    })
  })

  describe('Push & Pop', function () {
    var escher, layer1;

    describe('pop', function () {
      it('removes the top layer from the stack', function () {
        chai.assert.equal(escher.length(), 2)
        escher.pop()
        chai.assert.equal(escher.length(), 1)
      })

      it('hides the retreat link for the top view', function () {
        chai.assert(!escher.top().view.$('.escher-step-retreat').size())
        escher.pop()
        chai.assert(escher.top().retreat.$el.is(':hidden'))
      })

      it('enables the events for the top view', function () {
        escher.pop()
        escher.top().view.$('.next').trigger('click')
        chai.assert(escher.top().view.clicked)
      })

      beforeEach(function () {
        escher.push(layer1)
      })
    })

    describe('push', function () {
      it('adds a new step on the stack', function () {
        escher.push(layer1)
        chai.assert.equal(escher.length(), 2)
        chai.assert.equal(escher.top().view, layer1)
      })

      it('sets the correct style for the new page', function () {
        escher.push(layer1)
        // margin-top, margin-left, width, height
        var offset = base.$el.offset()
        chai.assert.equal(layer1.$el.css('margin-top'), offset.top + escher.opts.topOffset + 'px')
        chai.assert.equal(layer1.$el.css('margin-left'), offset.left + escher.opts.leftOffset + 'px')
        chai.assert.equal(layer1.$el.width(), base.$el.width() - escher.opts.leftOffset)
        chai.assert.equal(layer1.$el.height(), base.$el.height() - escher.opts.topOffset)
      })

      describe('background views', function () {
        it('drops the base step back', function () {
          escher.push(layer1)
          chai.assert.equal(escher.bottom().view, base)
        })

        it('builds a retreat link', function () {
          escher.push(layer1)
          // Verify the base view has a retreat link
          var $retreat = escher.bottom().view.$('.escher-step-retreat')
          chai.assert.equal($retreat.size(), 1)
          chai.assert.equal($retreat.text(), base.name)
        })

        it('turns off events on background views', function () {
          base.$('.next').trigger('click')
          chai.assert(base.clicked)
          base.clicked = false
          escher.push(layer1)
          base.$('.next').trigger('click')
          chai.assert(!base.clicked)
        })

        it('clears overlaid views if retreating to the base view', function () {
          escher.push(layer1)
          chai.assert(escher.bottom().retreat.$el.is(':visible'))
          chai.assert.equal(escher.length(), 2)
          escher.bottom().retreat.trigger('close')

          // Make sure we only have one item (the base) in the stack
          chai.assert.equal(escher.length(), 1)

          //Make sure events are turned on
          base.$('.next').trigger('click')
          chai.assert(base.clicked)

          // The base should not display the retreat link
          chai.assert(escher.bottom().retreat.$el.is(':hidden'))
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
