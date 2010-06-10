
(function() {
	
	var toArgs = function(args, strings) {
		var results = [];
		for (var i = 0, arg; arg = args[i++];) {
			switch($type(arg)) {
				case "hash":
					if (strings) arg = JSON.encode(arg);
					break;
				case "element":
					if (strings) {
						var el = arg.get('tag');
						if (arg.get('id')) el += "#" + arg.get('id');
						if (arg.get('class').length) el += "." + arg.get('class').replace(/\s+/g, '.');
						arg = el;
					}
					break;
				default: 
					if (strings) {
						if (!$defined(arg)) arg = 'undefined';
						else if (!arg) arg = 'false';
						else if (arg.name) arg = arg.name;
				
						if ($type(arg) != "string") {
							if (arg.toString) arg = arg.toString();
							if ($type(arg) != "string") arg = '[Object]'
						}
					}
			}
			
			results.push(arg)
		}
		
		return results;
	};
	
	var toString = function(args) {
		return toArgs(args, true).join(" ")
	}
	
	Logger = new Class({
		log: function() {
			var name = (this.getName ? this.getName() : this.name) + " ::"
			if (console.log && console.log.apply) console.log.apply(console, toArgs([name].concat($A(arguments))));
			return this;	
		}
	});

	Exception = new Class({
		name: "Exception",

		initialize: function(object, message) {
			this.object = object;
			this.message = message;
			console.error(this.object, this.message)
		},
		
		toArgs: function() {
			return toArgs([this.object, this.message])
		}
	});

	Exception.Misconfiguration = new Class({
		Extends: Exception,

		name: "Misconfiguration"
	});

})();

$equals = function(one, another) {
	if (one == another) return true;
	if ((!one) ^ (!another)) return false;
	if (!$defined(one)) return false;
	
	if ((one instanceof Array) || one.callee) {
	  var j = one.length;
		if (j != another.length) return false;
		for (var i = 0; i < j; i++) if (!$equals(one[i], another[i])) return false;
		return true;
	} else if (one instanceof Color) {
	  return (one.red == another.red) && (one.green == another.green) && (one.blue == another.blue  ) && (one.alpha == another.alpha)
	} else if (typeof one == 'object') {
		if (one.equals) return one.equals(another)
		for (var i in one) if (!$equals(one[i], another[i])) return false;
		return true;
	}
	return false;
}



ART.implement({

	setHeight: function(height) {
	  this.element.setAttribute('height', height);
	  return this;
	},

	setWidth: function(width) {
	  this.element.setAttribute('width', width);
	  return this;
	}

});

ART.SVG.Element.implement({
  
	_writeTransform: function(){
		var transforms = [];
		for (var transform in this.transform) transforms.push(transform + '(' + this.transform[transform].join(',') + ')');
		var string = transforms.join(' ');
		if (string == this.lastTransform) return;
		this.element.setAttribute('transform', string);
		this.lastTransform = string;
	}
});


Observer = new Class({

	Implements: [Options, Events],

	options: {
		periodical: false,
		delay: 1000
	},

	initialize: function(el, onFired, options){
		this.element = $(el) || $$(el);
		this.addEvent('onFired', onFired);
		this.setOptions(options);
		this.bound = this.changed.bind(this);
		this.resume();
	},

	changed: function() {
		var value = this.element.get('value');
		if ($equals(this.value, value)) return;
		this.clear();
		this.value = value;
		this.timeout = this.onFired.delay(this.options.delay, this);
	},

	setValue: function(value) {
		this.value = value;
		this.element.set('value', value);
		return this.clear();
	},

	onFired: function() {
		this.fireEvent('onFired', [this.value, this.element]);
	},

	clear: function() {
		$clear(this.timeout || null);
		return this;
	},

	pause: function(){
		if (this.timer) $clear(this.timer);
		else this.element.removeEvent('keyup', this.bound);
		return this.clear();
	},

	resume: function(){
		this.value = this.element.get('value');
		if (this.options.periodical) this.timer = this.changed.periodical(this.options.periodical, this);
		else this.element.addEvent('keyup', this.bound);
		return this;
	}

});
