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
    _.defaults(opts, {
      topOffset: 10,
      leftOffset: 5
    })
    this.opts = opts
    var base = opts.base
    // TODO: receive config options
    this.views = [base]
  }

  Escher.prototype.base = function () {
    return _.first(this.views)
  }

  Escher.prototype.push = function (view) {
    // Turn off events for the view below us
    var last = _.last(this.views)
    last.undelegateEvents()
    var offset = last.$el.offset()

    // Render the new view
    var v = view.render()

    v.$el.css({
      'margin-top': offset.top + this.opts.topOffset,
      'margin-left': offset.left + this.opts.leftOffset,
      'width': '100%',
      'height': '100%',
      'position': 'absolute'
    })

    // Place it appropriately
    last.$el.after(v.el)
    this.views.push(view)
  }

  Escher.prototype.pop = function () {
    if (this.views.length) {
      var view = this.views.pop()
      view.remove()
      var last = _.last(this.views)
      last.delegateEvents()
    }
  }

  Escher.prototype.length = function () {
    return this.views.length
  }

  Backbone.Escher = Escher

})(this);
