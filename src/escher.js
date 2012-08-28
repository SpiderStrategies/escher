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
    this.base = opts.base
    // TODO: receive config options
    this.views = []
  }

  Escher.prototype.push = function (view) {
    this.base.$el.append(view.render().el)
    this.views.push(view)
  }

  Escher.prototype.pop = function () {
    var view = this.views.pop()
    view.remove()
  }

  Escher.prototype.length = function () {
    return this.views.length
  }

  Backbone.Escher = Escher

})(this);
