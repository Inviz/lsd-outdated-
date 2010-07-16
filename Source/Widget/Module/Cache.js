ART.Widget.Module.Cache = new Class({
  cache: { //flushed on:
    parent: {}, //adoption
    state: {}, //state change
    environment: {} //both
  },
  
  cached: {
    environment: {
      'getSelector': 'selector'
    }
  },
  
  getCached: function(type, key, callback, args) {
    var env = this.cache[type];
    if (!env[key]) env[key] = callback.apply(this, args || []);
    return env[key];
  },

  addClass: function() {
    this.cache.state = {};
    this.cache.environment = {};
    return this.parent.apply(this, arguments);
  },

  removeClass: function() {
    this.cache.state = {};
    this.cache.environment = {};
    return this.parent.apply(this, arguments);
  },

  addPseudo: function() {
    this.cache.state = {};
    this.cache.environment = {};
    return this.parent.apply(this, arguments);
  },

  removePseudo: function() {
    this.cache.state = {};
    this.cache.environment = {};
    return this.parent.apply(this, arguments);
  },
  
  setParent: Macro.onion(function() {
    this.cache.parent = {};
    this.cache.environment = {};
  }),
  
  getSelector: function() {
		var root = (this.parentWidget) ? this.parentWidget.getSelector() + ' ' : '';
    var key = 'selector';
    var env = this.cache.environment;
    var selector = env[key];
    if (!selector) {
  		selector = this.name;
  		if (this.options.id) selector += "#" + this.options.id;
  		if (this.classes.length) selector += '.' + this.classes.join('.');
  		if (this.pseudos.length) selector += ':' + this.pseudos.join(':');
  		if (this.attributes) for (var name in this.attributes) selector += '[' + name + '=' + this.attributes[name] + ']';
  	  env[key] = selector;
    }
    return root + selector;
  }
  
});
  