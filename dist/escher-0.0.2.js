/*!
 * escher.js v0.0.2 
 * Copyright 2012, Spider Strategies <nathan.bowser@spiderstrategies.com> 
 * escher.js may be freely distributed under the BSD license. 
*/
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
      topOffset: 15,
      leftOffset: 5,
      labelField: 'name'
    })
    this.opts = opts
    this.steps = []
    this._step(opts.base)
  }

  Escher.prototype.on = Backbone.Events.on
  Escher.prototype.off = Backbone.Events.off
  Escher.prototype.trigger = Backbone.Events.trigger

  Escher.prototype._step = function (view) {
    var step = new Step(view, this.opts)
    view.$el.addClass('escher-step')
    view.trigger('view:activate')
    step.index = this.steps.push(step) - 1
    step.retreat.on('close', function () {
      var self = this
      _.each(_.rest(this.steps, _.indexOf(this.steps, step) + 1), function (i) {
        self.pop()
      })
    }, this)
  }

  Escher.prototype.top = function () {
    return _.last(this.steps)
  }

  Escher.prototype.bottom = function () {
    return _.first(this.steps)
  }

  Escher.prototype.push = function (view, rendered) {
    this.trigger('changing')
    // Drop the current step back
    var last = _.last(this.steps).drop()

    var offset = last.view.$el.offset()
    // Render this view
    view.render().$el.css({
      'margin-top': offset.top + this.opts.topOffset,
      'margin-left': offset.left + this.opts.leftOffset,
      'width': last.view.$el.width() - this.opts.leftOffset,
      'height': last.view.$el.height() - this.opts.topOffset,
      'position': 'absolute'
    })

    // Place it appropriately
    last.view.$el.after(view.el)
    this._step(view)
    this.trigger('changed')
  }

  Escher.prototype.pop = function () {
    this.trigger('changing')
    if (this.steps.length > 1) {
      this.steps.pop().destroy()
      _.last(this.steps).rise()
    }
    this.trigger('changed')
  }

  Escher.prototype.length = function () {
    return this.steps.length
  }

  var Step = function (view, opts) {
    this.view = view
    this.opts = opts
    this.retreat = new StepRetreat({step: this, label: view[opts.labelField]}).render()
  }

  Step.prototype.drop = function () {
    // Disable our events
    this.view.undelegateEvents()
    // Add the retreat link
    this.retreat.$el.show()
    this.view.$el.append(this.retreat.$el)
    this.view.trigger('view:deactivate')
    return this
  }

  Step.prototype.destroy = function () {
    this.view.undelegateEvents()
    this.view.$el.removeClass('escher-step')
    this.view.remove()
    this.view.trigger('view:deactivate')
    this.retreat.off('close')
    this.retreat.remove()
    this.retreat = null
  }

  Step.prototype.rise = function () {
    this.view.delegateEvents()
    this.retreat.$el.hide()
    this.view.trigger('view:activate')
  }

  var StepRetreat = Backbone.View.extend({
    className: "escher-step-retreat",

    attributes: {
      style: 'position: absolute; top: 0; left: 0;'
    },

    events: {
      'click a': 'close'
    },

    initialize: function (opts) {
      this.step = opts.step
      this.label = opts.label
    },

    close: function (e) {
      this.trigger('close')
    },

    render: function () {
      this.$el.html('<a href="#">' + this.label + '</a>')
      return this
    }
  })

  Backbone.Escher = Escher

  return Backbone
}))
