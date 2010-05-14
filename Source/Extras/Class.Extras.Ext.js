//basically, it's chained Extends.

Class.inherit = function(kls) {
	var args = [];
	for (var i = 1, j = arguments.length; i < j; i++) args.push(arguments[i]);
	return Class.prototype.inherit.apply(kls, args);
};

Class.Mergers = {
  events: function(mixin) {
    this.events = $mixin(this.events || {}, mixin.events);
  },
  shortcuts: function(mixin) {
    this.shortcuts = $mixin(this.shortcuts || {}, mixin.shortcuts);
  },
  layered: function(mixin) {
    this.layered = $mixin(this.layered || {}, mixin.layered)
  }
}

Class.prototype.inherit = function() {
	var klass = this;
	Array.each(arguments, function(mixin) {		
		var baked = new Class;
		
		//Extends didnt work here in IE. Had to do it like this.
		
		baked.parent = klass;
		baked.prototype = Class.instantiate(klass);

		this.implement('parent', function(){
			var name = this.caller._name, previous = this.caller._owner.parent.prototype[name];
			if (!previous) throw new Error('The method "' + name + '" has no parent.');
			return previous.apply(this, arguments);
		}.protect());
		
		var mixin = Class.instantiate(mixin);
		
		for (var property in Class.Mergers) {
		  if (mixin[property]) {
		    Class.Mergers[property].call(baked.prototype, mixin);
		    delete mixin[property]
		  }
		}
		baked.implement(mixin);
		klass = baked;
		
		
	}, this);
	
	
	return klass;
};

Class.hasParent = function(args) {
  var fn = args.callee;
  var caller = fn.caller;
  return !!(caller._owner.parent && caller._owner.parent.prototype[caller._name]);
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
    if (Class.hasParent(arguments)) {
      return this.parent.apply(this, arguments);
    } else {
      return callback.apply(this, arguments);
    }
  }
}