
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
	
	switch ($type(one)) {
		case "array":
			return (one.length == another.length) && one.every(function(value, i) {
				return $equals(value, another[i]);
			});
		case "color": 
			return $equals(one.color, another.color) && (one.type == another.type) 
		case "object":
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