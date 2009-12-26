//basically, it's chained Extends.

Class.inherit = function(kls) {
	var args = [];
	for (var i = 1, j = arguments.length; i < j; i++) args.push(arguments[i]);
	return Class.prototype.inherit.apply(kls, args);
};

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
		
		baked.implement(Class.instantiate(mixin));
		
		klass = baked;
		
	}, this);
	
	
	return klass;
};

Class.hasParent = function(args) {
  var fn = args.callee;
  var caller = fn.caller;
  return !!(caller._owner.parent && caller._owner.parent.prototype[caller._name]);
}