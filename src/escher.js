(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['backbone'], factory)
  } else {
    factory(root.Backbone)
  }
}(this, function (Backbone) {
  "use strict"

  var Escher = function (opts) {
    if (!opts.base) {
      throw new Error('Escher must receive the base view')
    }
    // TODO: receive other useful config options
    _.defaults(opts, {
      leftOffset: 20,
      bottomOffset: 20,
      labelField: 'name'
    })
    this.opts = opts
    this.steps = [new StackedStep({view: opts.base, label: this.name, opts: this.opts})]

    this.on('changed', this._resize)
  }

  Escher.prototype.on = Backbone.Events.on
  Escher.prototype.off = Backbone.Events.off
  Escher.prototype.trigger = Backbone.Events.trigger

  Escher.prototype._resize = function () {
    if (this.length() === 1) {
      // Early exit
      return
    }

    var top = this.top()
    var height = top.$el.outerHeight()
    var bottomOffset = this.opts.bottomOffset

    // set heights for underlying elements
    _.each(_.first(this.steps, _.indexOf(this.steps, top)).reverse(), function (step) {
      // set the height of view that's being covered
      step.view.$el.height(height)
      // set the height for the cover
      height += step.retreat.$el.outerHeight(true) - bottomOffset
      step.$el.height(height)
    })

    this.bottom().$el.height(height)
  }

  Escher.prototype.top = function () {
    return _.last(this.steps)
  }

  Escher.prototype.bottom = function () {
    return _.first(this.steps)
  }

  Escher.prototype.push = function (view, rendered) {
    this.trigger('changing')
    var last = _.last(this.steps).drop()
    var label = last.view[this.opts.labelField]
    var parent = last.view.$el
    var ss = new StackedStep({view: view, label: label, opts: this.opts, parent: parent}).render()

    ss.view.on('resize', function () {
      this._resize()
    }, this)

    ss.on('close', this._retreat, this)
    this.steps.push(ss)
    this.trigger('changed')
  }

  Escher.prototype._retreat = function (step) {
    var self = this
    _.each(_.rest(self.steps, _.indexOf(self.steps, step)), function (i) {
      self.pop()
    })
  }

  Escher.prototype.pop = function () {
    if (this.length() > 1) {
      this.trigger('changing')
      this.steps.pop().destroy()
      _.last(this.steps).rise()
      this.trigger('changed')
    }
  }

  Escher.prototype.length = function () {
    return this.steps.length
  }

  var StackedStep = Backbone.View.extend({
    className: 'escher-step',

    attributes: {
      style: 'position: absolute; left: 0; top: 0; width: 100%'
    },

    initialize: function (opts) {
      this.view = opts.view
      this.opts = opts.opts
      this.parent = opts.parent
      this.retreat = new StepRetreat({label: opts.label}).render()

      // Yikes!
      var self = this
      this.retreat.on('close', function () {
        self.trigger('close', self)
      })
    },

    render: function () {
      this.view.$el.addClass('escher-step-view')
      this.view.trigger('view:activate')

      this.view.$el.css({
        'margin-left': this.opts.leftOffset,
        'margin-bottom': -1 * this.opts.bottomOffset,
        'width': '100%'
      })

      this.$el.append(this.retreat.el)
      this.$el.append(this.view.render().el)
      this.parent.append(this.$el)

      return this
    },

    drop: function () {
      this.view.undelegateEvents()
      this.view.trigger('view:deactivate')
      this.view.$el.addClass('escher-step-view-covered')
      return this
    },

    rise: function () {
      this.view.$el.css('height', '')
      this.$el.css('height', '')
      this.view.delegateEvents()
      this.view.trigger('view:activate')
      this.view.$el.removeClass('escher-step-view-covered')
    },

    destroy: function () {
      this.view.trigger('view:deactivate')
      this.retreat.off('close')
      this.view.off('resize')
      this.retreat.remove()
      this.remove()
      this.view = null
      this.retreat = null
    }

  })

  var StepRetreat = Backbone.View.extend({
    className: "escher-step-retreat",

    events: {
      'click a': 'close'
    },

    initialize: function (opts) {
      this.label = opts.label
    },

    close: function (e) {
      this.trigger('close')
    },

    render: function () {
      this.$el.html('<header><a href="#">' + this.label + '</a></header>')
      return this
    }
  })

  Backbone.Escher = Escher

  return Backbone
}))