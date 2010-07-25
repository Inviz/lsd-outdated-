//basically, it's chained Extends.


(function() {
  var getInstance = function(klass){
  	klass.$prototyping = true;
  	var proto = new klass;
  	delete klass.$prototyping;
  	return proto;
  };
  
  Class.include = function(klass, klasses) {
    return new Class({
      Includes: Array.from(arguments).flatten()
    });
  }
  
  Class.flatten = function(items) {
    return Array.from(items).filter($defined).map(function(item) {
      if (item.parent) {
        return [Class.flatten(item.parent), item]
      } else {
        return item
      }
    }).flatten();
  }

  Class.Mutators.Includes = function(items) {
    var instance
  	Class.flatten(items).each(function(parent){        
      var baked = new Class;
      if (instance) {
        baked.parent = instance;
        baked.prototype = getInstance(instance);
      }
      var proto = $extend({}, parent.prototype)
      delete proto.$caller;
      delete proto.$constructor;
      delete proto.parent;
      delete proto.caller;
      for (var i in proto) if (proto[i] && proto[i].$owner && proto[i].$owner != parent && proto[i].$owner.parent) delete proto[i]
      baked.implement(proto);
      instance = baked
  	}, this);
  	this.parent = instance
  	this.prototype = getInstance(instance);
  }
})();



$extend(Class.Mutators, {
  events: function(mixin) {
    this.prototype.events = $mixin(this.prototype.events || {}, mixin);
  },
  shortcuts: function(mixin) {
    this.prototype.shortcuts = $mixin(this.prototype.shortcuts || {}, mixin);
  },
  layered: function(mixin) {
    this.prototype.layered = $mixin(this.prototype.layered || {}, mixin)
  }
});

Class.hasParent = function(klass) {
  var caller = klass.$caller;
  return !!(caller.$owner.parent && caller.$owner.parent.prototype[caller.$name]);
}
Macro = {};
Macro.onion = function(callback) {
  return function() {
    if (!this.parent.apply(this, arguments)) return;
    callback.apply(this, arguments);
    return true;
  } 
}

Macro.setter = function(name, callback) {
  return function() {
    if (!this[name]) this[name] = callback.apply(this, arguments);
    return this[name];
  } 
}

Macro.defaults = function(callback) {
  return function() {
    if (Class.hasParent(this)) {
      return this.parent.apply(this, arguments);
    } else {
      return callback.apply(this, arguments);
    }
  }
}

Macro.stateful = function(states, reflect) {
  var proto = reflect ? {
    setStatefulClassName: function(state, value) {
      this.element[value ? 'addClass' : 'removeClass'](state);
    },
    
    onStateChange: function(state, value, args) {
      return this.setStatefulClassName.apply(this, arguments);
    }
  } : {};
  
  $extend(proto, {
    options: {
      states: {}
    },
    setStateTo: function(state, to) {
      return this[this.options.states[state][to ? 0 : 1]]()
    }
  });
  

  Hash.each(states, function(methods, state) {
    var enabler = methods[0];
    var disabler = methods[1];
    var toggler = methods[2];
    
    proto.options.states[state] = methods;
    
    proto[enabler] = function() {
      if (this[state]) return false;
      this[state] = true; 
      
    	if (Class.hasParent(this)) this.parent.apply(this, arguments);
      this.fireEvent(enabler, arguments);
      if (this.onStateChange) this.onStateChange(state, true, arguments);
      return true;
    }
    
    proto[disabler] = function() {
      
      if (!this[state]) return false;
      this[state] = false;
      
  	  if (Class.hasParent(this)) this.parent.apply(this, arguments);
  	  
      this.fireEvent(disabler, arguments);
      if (this.onStateChange) this.onStateChange(state, false, arguments);
      return true;
    }
    
    if (toggler) proto[toggler] = function() {
      return this[this[state] ? disabler : enabler].apply(this, arguments)
    }
  });
  
  return new Class(proto);
}