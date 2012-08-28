/*!
 * escher.js v0.0.0
 * Copyright 2012, Spider Strategies <nathan.bowser@spiderstrategies.com>
 * escher.js may be freely distributed under the BSD license.
 */
(function(window) {

  "use strict"

  var Escher = function (opts) {
    if (!opts.base) {
      throw new Error('Escher must receive the base view')
    }
    // TODO: receive other useful config options
    _.defaults(opts, {
      topOffset: 15,
      leftOffset: 5
    })
    this.opts = opts
    this.views = [opts.base]
  }

  Escher.prototype.push = function (view) {
    var last = _.last(this.views)
    // Turn off events for the view below us
    last.undelegateEvents()
    // And add the retreat link
    last.$el.append(new StepRetreat({view: view, escher: this}).render().el)

    var offset = last.$el.offset()
    var v = view.render()

    v.$el.css({
      'margin-top': offset.top + this.opts.topOffset,
      'margin-left': offset.left + this.opts.leftOffset,
      'width': last.$el.width() - this.opts.leftOffset,
      'height': last.$el.height() - this.opts.topOffset,
      'position': 'absolute'
    })

    // Place it appropriately
    last.$el.after(v.el)
    this.views.push(view)
  }

  Escher.prototype.pop = function () {
    if (this.views.length > 1) {
      this.views.pop().remove()
      var last = _.last(this.views)
      last.delegateEvents()
      last.$('.escher-step-retreat').remove()
    }
  }

  Escher.prototype.length = function () {
    return this.views.length
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
      this.escher = opts.escher
      this.step = opts.view
    },

    close: function (e) {
      var self = this
      _.each(_.rest(this.escher.views, _.indexOf(this.escher.views, this.step)), function () {
        self.escher.pop()
      })
    },

    render: function () {
      this.$el.html('<a href="#">' + this.step.name + '</a>')
      return this
    }
  })

  Backbone.Escher = Escher

})(this);
