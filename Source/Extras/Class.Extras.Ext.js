//basically, it's chained Extends.

Class.inherit = function(kls) {
	var args = [];
	for (var i = 1, j = arguments.length; i < j; i++) args.push(arguments[i]);
	return Class.prototype.inherit.apply(kls, args);
};

Class.Mergers = {
  events: function(mixin) {
    this.events = $mixin(this.events || {}, mixin.events);
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















Fx.Fade = new Class({
	Extends: Fx.Tween,
	
	options: {
		property: 'opacity'
	},
	
	start: function(how) {
		var toggle;
		how = $pick(how, 'toggle');
		
		var start = Fx.Tween.prototype.start.bind(this);
		
		switch (how){
			case 'in': start(1); break;
			case 'out': start(0); break;
			case 'show': this.show(); break;
			case 'hide': this.hide(); break;
			case 'toggle':
				var flag = this.element.retrieve('fade:flag', this.element.get('opacity') == 1);
				start(flag ? 0 : 1);
				this.element.store('fade:flag', !flag);
				toggle = true;
			break;
			default: start(arguments);
		}
		if (!toggle) this.element.eliminate('fade:flag');
		return this;
	},
	
	hide: function() {
		return this.set(0);
	}, 
	
	show: function() {
		return this.set(1);
	}
});

Element.Properties.fade = {

	set: function(options){
		var tween = this.retrieve('fade');
		if (tween) tween.cancel();
		return this.eliminate('fade').store('fade:options', $extend({link: 'cancel'}, options));
	},

	get: function(options){
		if (options || !this.retrieve('fade')){
			if (options || !this.retrieve('fade:options')) this.set('fade', options);
			this.store('fade', new Fx.Fade(this, this.retrieve('fade:options')));
		}
		return this.retrieve('fade');
	}

};



(function(){
  var events;
  var check = function(e){
    var target = $(e.target);
    var parents = target.getParents();
    events.each(function(item){
      var element = item.element;
      if (element != target && !parents.contains(element))
        item.fn.call(element, e);
    });
  };
  Element.Events.outerClick = {
    onAdd: function(fn){
      if(!events) {
        document.addEvent('click', check);
        events = [];
      }
      events.push({element: this, fn: fn});
    },
    onRemove: function(fn){
      events = events.filter(function(item){
        return item.element != this || item.fn != fn;
      }, this);
      if (!events.length) {
        document.removeEvent('click', check);
        events = null;
      }
    }
  };
})();





