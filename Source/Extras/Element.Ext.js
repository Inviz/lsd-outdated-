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
