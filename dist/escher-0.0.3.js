/*!
 * escher.js v0.0.3 
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
      topOffset: 60,
      leftOffset: 20,
      bottomOffset: 20,
      labelField: 'name'
    })
    this.opts = opts
    this.base = opts.base
    this.steps = []

    this.on('changed', this._resize)

    var self = this
    var _resize = function () {
      self._resize()
    }
    this.on('changed', function () {
      if (self.length()) {
        $(window).resize(_resize)
      } else {
        $(window).unbind('resize', _resize)
      }
    })
  }

  Escher.prototype.on = Backbone.Events.on
  Escher.prototype.off = Backbone.Events.off
  Escher.prototype.trigger = Backbone.Events.trigger

  Escher.prototype._resize = function () {
    if (this.length() === 0) {
     this.base.$el.css('height', '')
     return
    }

    var top = this.top()
    top.view.$el.css('height', '')
    top.$el.css('height', '')
    var height = top.$el.outerHeight()

    var offset = this.opts.bottomOffset * 2
    _.each(_.first(this.steps, _.indexOf(this.steps, top)).reverse(), function (step, i) {
      height += offset
      step.view.$el.height(0)
      step.$el.height(height)
    })

    if (this.length() === 1) {
      this.top().$el.css('height', 'auto')
      height -= this.opts.bottomOffset
    }

    this.base.$el.height(height)
  }

  Escher.prototype.top = function () {
    return _.last(this.steps)
  }

  Escher.prototype.bottom = function () {
    return _.first(this.steps)
  }

  Escher.prototype.push = function (view, rendered) {
    this.trigger('changing')
    var last = _.last(this.steps)
    var label = last && last.view[this.opts.labelField] || this.base[this.opts.labelField]
    var container = last && last.$el || this.base.$el.parent()

    // This code is garbage.
    var pos
    if (last) {
      pos = {
        left: this.opts.leftOffset,
        top: this.opts.topOffset,
        width: last.$el.width()
      }
    } else {
      this.base.$el.css('overflow', 'hidden')
      pos = {
        left: this.base.$el.offset().left,
        top: this.base.$el.offset().top,
        width: this.base.$el.outerWidth()
      }
    }
    if (last) {
      last.drop()
    } else {
      this.base.undelegateEvents()
      this.base.trigger('view:deactivate')
    }

    var ss = new StackedStep({view: view, label: label, opts: this.opts, container: container, position: pos}).render()
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
    this.trigger('changing')

    this.steps.pop().destroy()
    var top = _.last(this.steps)
    if (top) {
      top.rise()
    } else {
      this.base.delegateEvents()
      this.base.trigger('view:activate')
      this.base.$el.css('overflow', '')
    }

    this.trigger('changed')
  }

  Escher.prototype.length = function () {
    return this.steps.length
  }

  var StackedStep = Backbone.View.extend({
    className: 'escher-step',

    attributes: {
      style: 'position: absolute'
    },

    initialize: function (opts) {
      this.view = opts.view
      this.opts = opts.opts
      this.retreat = new StepRetreat({label: opts.label}).render()

      this.position = opts.position
      this.container = opts.container

      // Yikes!
      var self = this
      this.retreat.on('close', function () {
        self.trigger('close', self)
      })
    },

    render: function () {
      this.view.$el.addClass('escher-step-view')
      this.view.trigger('view:activate')

      this.$el.css(this.position)

      this.view.$el.css({
        'margin-left': this.opts.leftOffset,
        'margin-bottom': -1 * this.opts.bottomOffset,
        'width': '100%'
      })

      this.$el.append(this.retreat.el)
      this.$el.append(this.view.render().el)
      this.container.append(this.$el)

      return this
    },

    drop: function () {
      this.view.undelegateEvents()
      this.view.trigger('view:deactivate')
      return this
    },

    destroy: function () {
      this.view.undelegateEvents()
      this.view.$el.removeClass('escher-step-view')
      this.view.$el.parent().remove()
      this.view.remove()
      this.view.trigger('view:deactivate')
      this.retreat.off('close')
      this.retreat.remove()
      this.retreat = null
    },

    rise: function () {
      this.view.delegateEvents()
      this.view.trigger('view:activate')
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