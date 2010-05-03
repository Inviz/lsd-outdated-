Element.Properties.instance = {
	get: function(options) {
		return this.set('instance', options);
	},
	
	set: function(options) {
		if (this.retrieve('instance')) {
			return this.retrieve('instance').setOptions(options)
		} else {
			var given = this.retrieve('instance:options') || {};
			for (var i in options) {
				if (given[i] && i.match('^on[A-Z]')) {
					given[i] = (function(a,b) {
						return function() {
							a.apply(this, arguments);
							b.apply(this, arguments);
						}
					})(given[i], options[i])
				} else {
					var o = {};
					o[i] = options[i];
					$extend(given, o);
				}
			}
			this.store('instance:options', given);
		}
	}
};


//html5-compatible data attribute
Element.Properties.data = {
	get: function(key){
	  key = key.replace(/_/g, '-');
		return this.getProperty('data-' + key);
	},
	
	set: function(key, value) {
	  key = key.replace(/_/g, '-');
	  if (value) {
	    return this.setProperty('data-' + key, value);
	  } else {
	    return this.removeProperty('data-' + key);
	  }
	}
};

Drag.implement({
  setMaxX: function(x) {
    var limit = this.options.limit;
    limit.x[1] = x//Math.max(x, limit.x[1]);
    limit.x[0] = Math.min(limit.x[0], limit.x[1]);
  },
  
  setMaxY: function(y) {
    var limit = this.options.limit;
    limit.y[1] = y//Math.max(y, limit.y[1]);
    limit.y[0] = Math.min(limit.y[0], limit.y[1]);
  },
  
  setMinX: function(x) {
    var limit = this.options.limit;
    limit.x[0] = x//Math.min(x, limit.x[0]);
    limit.x[1] = Math.max(limit.x[1], limit.x[0]);
  },
  
  setMinY: function(y) {
    var limit = this.options.limit;
    limit.y[0] = y//Math.min(y, limit.y[0]);
    limit.y[1] = Math.max(limit.y[1], limit.y[0]);
  }
});









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


