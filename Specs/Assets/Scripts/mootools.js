/*
---

name: Core

description: The heart of MooTools.

license: MIT-style license.

copyright: Copyright (c) 2006-2010 [Valerio Proietti](http://mad4milk.net/).

authors: The MooTools production team (http://mootools.net/developers/)

inspiration:
  - Class implementation inspired by [Base.js](http://dean.edwards.name/weblog/2006/03/base/) Copyright (c) 2006 Dean Edwards, [GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)
  - Some functionality inspired by [Prototype.js](http://prototypejs.org) Copyright (c) 2005-2007 Sam Stephenson, [MIT License](http://opensource.org/licenses/mit-license.php)

provides: [Core, MooTools, Type, typeOf, instanceOf]

...
*/

(function(){

this.MooTools = {
	version: '1.3dev',
	build: 'a56b5ec1e4fb2a8383c5aee0236ce437267629bc'
};

// typeOf, instanceOf

var typeOf = this.typeOf = function(item){
	if (item == null) return 'null';
	if (item.$family) return item.$family();
	
	if (item.nodeName){
		if (item.nodeType == 1) return 'element';
		if (item.nodeType == 3) return (/\S/).test(item.nodeValue) ? 'textnode' : 'whitespace';
	} else if (typeof item.length == 'number'){
		if (item.callee) return 'arguments';
		if ('item' in item) return 'collection';
	}

	return typeof item;
};

var instanceOf = this.instanceOf = function(item, object){
	if (item == null) return false;
	var constructor = item.$constructor || item.constructor;
	while (constructor){
		if (constructor === object) return true;
		constructor = constructor.parent;
	}
	return item instanceof object;
};

// Function overloading

var Function = this.Function;

var enumerables = true;
for (var i in {toString: 1}) enumerables = null;
if (enumerables) enumerables = ['hasOwnProperty', 'valueOf', 'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString', 'constructor'];

Function.prototype.overloadSetter = function(usePlural){
	var self = this;
	return function(a, b){
		if (a == null) return this;
		if (usePlural || typeof a != 'string'){
			for (var k in a) self.call(this, k, a[k]);
			if (enumerables) for (var i = enumerables.length; i--;){
				k = enumerables[i];
				if (a.hasOwnProperty(k)) self.call(this, k, a[k]);
			}
		} else {
			self.call(this, a, b);
		}
		return this;
	};
};

Function.prototype.overloadGetter = function(usePlural){
	var self = this;
	return function(a){
		var args, result;
		if (usePlural || typeof a != 'string') args = a;
		else if (arguments.length > 1) args = arguments;
		if (args){
			result = {};
			for (var i = 0; i < args.length; i++) result[args[i]] = self.call(this, args[i]);
		} else {
			result = self.call(this, a);
		}
		return result;
	};
};

Function.prototype.extend = function(key, value){
	this[key] = value;
}.overloadSetter();

Function.prototype.implement = function(key, value){
	this.prototype[key] = value;
}.overloadSetter();

// From

Function.from = function(item){
	return (typeOf(item) == 'function') ? item : function(){
		return item;
	};
};

Array.from = function(item){
	if (item == null) return [];
	return (Type.isEnumerable(item) && typeof item != 'string') ? (typeOf(item) == 'array') ? item : Array.prototype.slice.call(item) : [item];
};

Number.from = function(item){
	var number = parseFloat(item);
	return isFinite(number) ? number : null;
};

String.from = function(item){
	return item + '';
};

// hide, protect

Function.implement({
	
	hide: function(){
		this.$hidden = true;
		return this;
	},

	protect: function(){
		this.$protected = true;
		return this;
	}
	
});

// Type

var Type = this.Type = function(name, object){
	if (name){
		var lower = name.toLowerCase();
		var typeCheck = function(item){
			return (typeOf(item) == lower);
		};
		
		Type['is' + name] = typeCheck;
		if (object != null){
			object.prototype.$family = (function(){
				return lower;
			}).hide();
			//<1.2compat>
			object.type = typeCheck;
			//</1.2compat>
		}
	}

	if (object == null) return null;
	
	object.extend(this);
	object.$constructor = Type;
	object.prototype.$constructor = object;
	
	return object;
};

var toString = Object.prototype.toString;

Type.isEnumerable = function(item){
	return (item != null && typeof item.length == 'number' && toString.call(item) != '[object Function]' );
};

var hooks = {};

var hooksOf = function(object){
	var type = typeOf(object.prototype);
	return hooks[type] || (hooks[type] = []);
};

var implement = function(name, method){
	if (method && method.$hidden) return this;
	
	var hooks = hooksOf(this);
	
	for (var i = 0; i < hooks.length; i++){
		var hook = hooks[i];
		if (typeOf(hook) == 'type') implement.call(hook, name, method);
		else hook.call(this, name, method);
	}

	var previous = this.prototype[name];
	if (previous == null || !previous.$protected) this.prototype[name] = method;
	
	if (this[name] == null && typeOf(method) == 'function') extend.call(this, name, function(item){
		return method.apply(item, Array.prototype.slice.call(arguments, 1));
	});
	
	return this;
};

var extend = function(name, method){
	if (method && method.$hidden) return this;
	var previous = this[name];
	if (previous == null || !previous.$protected) this[name] = method;
	return this;
};

Type.implement({
	
	implement: implement.overloadSetter(),
	
	extend: extend.overloadSetter(),

	alias: function(name, existing){
		implement.call(this, name, this.prototype[existing]);
	}.overloadSetter(),

	mirror: function(hook){
		hooksOf(this).push(hook);
		return this;
	}
	
});

new Type('Type', Type);

// Default Types

var force = function(name, type, methods){
	var object = new Type(name, type),
		prototype = object.prototype;
	
	for (var i = 0, l = methods.length; i < l; i++){
		var key = methods[i],
			generic = object[key],
			proto = prototype[key];
		
		if (generic) generic.protect();
		
		if (proto){
			delete prototype[key];
			prototype[key] = proto.protect();
		}
	}
	
	object.implement(object.prototype);
	
	return force;
};

force('String', String, [
	'charAt', 'charCodeAt', 'concat', 'indexOf', 'lastIndexOf', 'match', 'quote', 'replace', 'search',
	'slice', 'split', 'substr', 'substring', 'toLowerCase', 'toUpperCase'
])('Array', Array, [
	'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice',
	'indexOf', 'lastIndexOf', 'filter', 'forEach', 'every', 'map', 'some', 'reduce', 'reduceRight'
])('Number', Number, [
	'toExponential', 'toFixed', 'toLocaleString', 'toPrecision'
])('Function', Function, [
	'apply', 'call'
])('RegExp', RegExp, ['exec', 'test'])('Date', Date, ['now']);

Date.extend('now', function(){
	return +(new Date);
});

new Type('Boolean', Boolean);

// fixes NaN returning as Number

Number.prototype.$family = function(){
	return isFinite(this) ? 'number' : 'null';
}.hide();

// Number.random

Number.extend('random', function(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min);
});

// forEach, each

Object.extend('forEach', function(object, fn, bind){
	for (var key in object){
		if (object.hasOwnProperty(key)) fn.call(bind, object[key], key, object);
	}
});

Object.each = Object.forEach;

Array.implement({
	
	forEach: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if (i in this) fn.call(bind, this[i], i, this);
		}
	},
	
	each: function(fn, bind){
		Array.forEach(this, fn, bind);
		return this;
	}
	
});

// Array & Object cloning, Object merging and appending

var cloneOf = function(item){
	switch (typeOf(item)){
		case 'array': return item.clone();
		case 'object': return Object.clone(item);
		default: return item;
	}
};

Array.implement('clone', function(){
	var i = this.length, clone = new Array(i);
	while (i--) clone[i] = cloneOf(this[i]);
	return clone;
});

var mergeOne = function(source, key, current){
	switch (typeOf(current)){
		case 'object':
			if (typeOf(source[key]) == 'object') Object.merge(source[key], current);
			else source[key] = Object.clone(current);
		break;
		case 'array': source[key] = current.clone(); break;
		default: source[key] = current;
	}
	return source;
};

Object.extend({
	
	merge: function(source, k, v){
		if (typeOf(k) == 'string') return mergeOne(source, k, v);
		for (var i = 1, l = arguments.length; i < l; i++){
			var object = arguments[i];
			for (var key in object) mergeOne(source, key, object[key]);
		}
		return source;
	},
	
	clone: function(object){
		var clone = {};
		for (var key in object) clone[key] = cloneOf(object[key]);
		return clone;
	},
	
	append: function(original){
		for (var i = 1, l = arguments.length; i < l; i++){
			var extended = arguments[i] || {};
			for (var key in extended) original[key] = extended[key];
		}
		return original;
	}
	
});

// Object-less types

['Object', 'WhiteSpace', 'TextNode', 'Collection', 'Arguments'].each(function(name){
	new Type(name);
});

//<1.2compat>

var Hash = this.Hash = new Type('Hash', function(object){
	if (typeOf(object) == 'hash') object = Object.clone(object.getClean());
	for (var key in object) this[key] = object[key];
	return this;
});

Hash.implement({

	forEach: function(fn, bind){
		Object.forEach(this, fn, bind);
	},

	getClean: function(){
		var clean = {};
		for (var key in this){
			if (this.hasOwnProperty(key)) clean[key] = this[key];
		}
		return clean;
	},

	getLength: function(){
		var length = 0;
		for (var key in this){
			if (this.hasOwnProperty(key)) length++;
		}
		return length;
	}

});

Hash.alias('each', 'forEach');

Object.type = Type.isObject;

var Native = this.Native = function(properties){
	return new Type(properties.name, properties.initialize);
};

Native.implement = function(objects, methods){
	for (var i = 0; i < objects.length; i++) objects[i].implement(methods);
	return Native;
};

(function(check){
	Array.type = function(item){
		return instanceOf(item, Array) || check(item);
	};
})(Array.type);

this.$A = function(item){
	return Array.from(item).slice();
};

this.$arguments = function(i){
	return function(){
		return arguments[i];
	};
};

this.$chk = function(obj){
	return !!(obj || obj === 0);
};

this.$clear = function(timer){
	clearTimeout(timer);
	clearInterval(timer);
	return null;
};

this.$defined = function(obj){
	return (obj != null);
};

this.$each = function(iterable, fn, bind){
	var type = typeOf(iterable);
	((type == 'arguments' || type == 'collection' || type == 'array') ? Array : Object).each(iterable, fn, bind);
};

this.$empty = function(){};

this.$extend = function(original, extended){
	for (var key in (extended || {})) original[key] = extended[key];
	return original;
};

this.$H = function(object){
	return new Hash(object);
};

this.$merge = function(){
	var args = Array.slice(arguments);
	args.unshift({});
	return Object.merge.apply(null, args);
};

this.$lambda = Function.from;
this.$mixin = Object.merge;
this.$random = Number.random;
this.$splat = Array.from;
this.$time = Date.now;

this.$type = function(object){
	var type = typeOf(object);
	if (type == 'elements') return 'array';
	return (type == 'null') ? false : type;
};

this.$unlink = function(object){
	switch (typeOf(object)){
		case 'object': return Object.clone(object);
		case 'array': return Array.clone(object);
		case 'hash': return new Hash(object);
		default: return object;
	}
};

//</1.2compat>

})();


/*
---

name: Array

description: Contains Array Prototypes like each, contains, and erase.

license: MIT-style license.

requires: Type

provides: Array

...
*/

Array.implement({
	
	invoke: function(methodName){
		var args = Array.slice(arguments, 1);
		return this.map(function(item){
			return item[methodName].apply(item, args);
		});
	},

	every: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if ((i in this) && !fn.call(bind, this[i], i, this)) return false;
		}
		return true;
	},

	filter: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++){
			if ((i in this) && fn.call(bind, this[i], i, this)) results.push(this[i]);
		}
		return results;
	},

	clean: function(){
		return this.filter(function(item){
			return item != null;
		});
	},

	indexOf: function(item, from){
		var len = this.length;
		for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++){
			if (this[i] === item) return i;
		}
		return -1;
	},

	map: function(fn, bind){
		var results = [];
		for (var i = 0, l = this.length; i < l; i++){
			if (i in this) results[i] = fn.call(bind, this[i], i, this);
		}
		return results;
	},

	some: function(fn, bind){
		for (var i = 0, l = this.length; i < l; i++){
			if ((i in this) && fn.call(bind, this[i], i, this)) return true;
		}
		return false;
	},

	associate: function(keys){
		var obj = {}, length = Math.min(this.length, keys.length);
		for (var i = 0; i < length; i++) obj[keys[i]] = this[i];
		return obj;
	},

	link: function(object){
		var result = {};
		for (var i = 0, l = this.length; i < l; i++){
			for (var key in object){
				if (object[key](this[i])){
					result[key] = this[i];
					delete object[key];
					break;
				}
			}
		}
		return result;
	},

	contains: function(item, from){
		return this.indexOf(item, from) != -1;
	},

	append: function(array){
		this.push.apply(this, array);
		return this;
	},
	
	getLast: function(){
		return (this.length) ? this[this.length - 1] : null;
	},

	getRandom: function(){
		return (this.length) ? this[Number.random(0, this.length - 1)] : null;
	},

	include: function(item){
		if (!this.contains(item)) this.push(item);
		return this;
	},

	combine: function(array){
		for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
		return this;
	},

	erase: function(item){
		for (var i = this.length; i--;){
			if (this[i] === item) this.splice(i, 1);
		}
		return this;
	},

	empty: function(){
		this.length = 0;
		return this;
	},

	flatten: function(){
		var array = [];
		for (var i = 0, l = this.length; i < l; i++){
			var type = typeOf(this[i]);
			if (type == 'null') continue;
			array = array.concat((type == 'array' || type == 'collection' || type == 'arguments' || instanceOf(this[i], Array)) ? Array.flatten(this[i]) : this[i]);
		}
		return array;
	},
	
	pick: function(){
		for (var i = 0, l = this.length; i < l; i++){
			if (this[i] != null) return this[i];
		}
		return null;
	},

	hexToRgb: function(array){
		if (this.length != 3) return null;
		var rgb = this.map(function(value){
			if (value.length == 1) value += value;
			return value.toInt(16);
		});
		return (array) ? rgb : 'rgb(' + rgb + ')';
	},

	rgbToHex: function(array){
		if (this.length < 3) return null;
		if (this.length == 4 && this[3] == 0 && !array) return 'transparent';
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (this[i] - 0).toString(16);
			hex.push((bit.length == 1) ? '0' + bit : bit);
		}
		return (array) ? hex : '#' + hex.join('');
	}

});

//<1.2compat>

Array.alias('extend', 'append');

var $pick = function(){
	return Array.from(arguments).pick();
};

//</1.2compat>


/*
---

name: String

description: Contains String Prototypes like camelCase, capitalize, test, and toInt.

license: MIT-style license.

requires: Type

provides: String

...
*/

String.implement({

	test: function(regex, params){
		return ((typeOf(regex) == 'regexp') ? regex : new RegExp('' + regex, params)).test(this);
	},

	contains: function(string, separator){
		return (separator) ? (separator + this + separator).indexOf(separator + string + separator) > -1 : this.indexOf(string) > -1;
	},

	trim: function(){
		return this.replace(/^\s+|\s+$/g, '');
	},

	clean: function(){
		return this.replace(/\s+/g, ' ').trim();
	},

	camelCase: function(){
		return this.replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
	},

	hyphenate: function(){
		return this.replace(/[A-Z]/g, function(match){
			return ('-' + match.charAt(0).toLowerCase());
		});
	},

	capitalize: function(){
		return this.replace(/\b[a-z]/g, function(match){
			return match.toUpperCase();
		});
	},

	escapeRegExp: function(){
		return this.replace(/([-.*+?^${}()|[\]\/\\])/g, '\\$1');
	},

	toInt: function(base){
		return parseInt(this, base || 10);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	hexToRgb: function(array){
		var hex = this.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
		return (hex) ? hex.slice(1).hexToRgb(array) : null;
	},

	rgbToHex: function(array){
		var rgb = this.match(/\d{1,3}/g);
		return (rgb) ? rgb.rgbToHex(array) : null;
	},

	substitute: function(object, regexp){
		return this.replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
			if (match.charAt(0) == '\\') return match.slice(1);
			return (object[name] != undefined) ? object[name] : '';
		});
	}

});


/*
---

name: Number

description: Contains Number Prototypes like limit, round, times, and ceil.

license: MIT-style license.

requires: Type

provides: Number

...
*/

Number.implement({

	limit: function(min, max){
		return Math.min(max, Math.max(min, this));
	},

	round: function(precision){
		precision = Math.pow(10, precision || 0).toFixed(precision < 0 ? -precision : 0);
		return Math.round(this * precision) / precision;
	},

	times: function(fn, bind){
		for (var i = 0; i < this; i++) fn.call(bind, i, this);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	toInt: function(base){
		return parseInt(this, base || 10);
	}

});

Number.alias('each', 'times');

(function(math){
	var methods = {};
	math.each(function(name){
		if (!Number[name]) methods[name] = function(){
			return Math[name].apply(null, [this].concat(Array.from(arguments)));
		};
	});
	Number.implement(methods);
})(['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'sin', 'sqrt', 'tan']);


/*
---

name: Function

description: Contains Function Prototypes like create, bind, pass, and delay.

license: MIT-style license.

requires: Type

provides: Function

...
*/

Function.extend({

	attempt: function(){
		for (var i = 0, l = arguments.length; i < l; i++){
			try {
				return arguments[i]();
			} catch (e){}
		}
		return null;
	}

});

Function.implement({

	attempt: function(args, bind){
		try {
			return this.apply(bind, Array.from(args));
		} catch (e){
			return null;
		}
	},

	bind: function(bind, args){
		var self = this;
		if (args != null) args = Array.from(args);
		return function(){
			return self.apply(bind, args || arguments);
		};
	},

	delay: function(delay, bind, args){
		return setTimeout(this.bind(bind, args || []), delay);
	},

	pass: function(args, bind){
		return this.bind(bind, args);
	},

	periodical: function(periodical, bind, args){
		return setInterval(this.bind(bind, args || []), periodical);
	},

	run: function(args, bind){
		return this.apply(bind, Array.from(args));
	}

});

//<1.2compat>

Function.implement({

	create: function(options){
		var self = this;
		options = options || {};
		return function(event){
			var args = options.arguments;
			args = (args != undefined) ? Array.from(args) : Array.slice(arguments, (options.event) ? 1 : 0);
			if (options.event) args = [event || window.event].extend(args);
			var returns = function(){
				return self.apply(options.bind || null, args);
			};
			if (options.delay) return setTimeout(returns, options.delay);
			if (options.periodical) return setInterval(returns, options.periodical);
			if (options.attempt) return Function.attempt(returns);
			return returns();
		};
	},

	bindWithEvent: function(bind, args){
		var self = this;
		if (args != null) args = Array.from(args);
		return function(event){
			return self.apply(bind, (args == null) ? arguments : [event].concat(args));
		};
	}

});

var $try = Function.attempt;

//</1.2compat>


/*
---

name: Object

description: Object generic methods

license: MIT-style license.

requires: Type

provides: [Object, Hash]

...
*/


Object.extend({
	
	subset: function(object, keys){
		var results = {};
		for (var i = 0, l = keys.length; i < l; i++){
			var k = keys[i];
			results[k] = object[k];
		}
		return results;
	},
	
	map: function(object, fn, bind){
		var results = {};
		for (var key in object){
			if (object.hasOwnProperty(key)) results[key] = fn.call(bind, object[key], key, object);
		}
		return results;
	},
	
	filter: function(object, fn, bind){
		var results = {};
		Object.each(object, function(value, key){
			if (fn.call(bind, value, key, object)) results[key] = value;
		});
		return results;
	},
	
	every: function(object, fn, bind){
		for (var key in object){
			if (object.hasOwnProperty(key) && !fn.call(bind, object[key], key)) return false;
		}
		return true;
	},
	
	some: function(object, fn, bind){
		for (var key in object){
			if (object.hasOwnProperty(key) && fn.call(bind, object[key], key)) return true;
		}
		return false;
	},
	
	keys: function(object){
		var keys = [];
		for (var key in object){
			if (object.hasOwnProperty(key)) keys.push(key);
		}
		return keys;
	},
	
	values: function(object){
		var values = [];
		for (var key in object){
			if (object.hasOwnProperty(key)) values.push(object[key]);
		}
		return values;
	},
	
	getLength: function(object){
		return Object.keys(object).length;
	},
	
	keyOf: function(object, value){
		for (var key in object){
			if (object.hasOwnProperty(key) && object[key] === value) return key;
		}
		return null;
	},
	
	contains: function(object, value){
		return Object.keyOf(object, value) != null;
	},
	
	toQueryString: function(object, base){
		var queryString = [];
		
		Object.each(object, function(value, key){
			if (base) key = base + '[' + key + ']';
			var result;
			switch (typeOf(value)){
				case 'object': result = Object.toQueryString(value, key); break;
				case 'array':
					var qs = {};
					value.each(function(val, i){
						qs[i] = val;
					});
					result = Object.toQueryString(qs, key);
				break;
				default: result = key + '=' + encodeURIComponent(value);
			}
			if (value != undefined) queryString.push(result);
		});

		return queryString.join('&');
	}
	
});


//<1.2compat>

Hash.implement({

	has: Object.prototype.hasOwnProperty,

	keyOf: function(value){
		return Object.keyOf(this, value);
	},

	hasValue: function(value){
		return Object.contains(this, value);
	},

	extend: function(properties){
		Hash.each(properties || {}, function(value, key){
			Hash.set(this, key, value);
		}, this);
		return this;
	},

	combine: function(properties){
		Hash.each(properties || {}, function(value, key){
			Hash.include(this, key, value);
		}, this);
		return this;
	},

	erase: function(key){
		if (this.hasOwnProperty(key)) delete this[key];
		return this;
	},

	get: function(key){
		return (this.hasOwnProperty(key)) ? this[key] : null;
	},

	set: function(key, value){
		if (!this[key] || this.hasOwnProperty(key)) this[key] = value;
		return this;
	},

	empty: function(){
		Hash.each(this, function(value, key){
			delete this[key];
		}, this);
		return this;
	},

	include: function(key, value){
		if (this[key] == undefined) this[key] = value;
		return this;
	},

	map: function(fn, bind){
		return new Hash(Object.map(this, fn, bind));
	},

	filter: function(fn, bind){
		return new Hash(Object.filter(this, fn, bind));
	},

	every: function(fn, bind){
		return Object.every(this, fn, bind);
	},

	some: function(fn, bind){
		return Object.some(this, fn, bind);
	},

	getKeys: function(){
		return Object.keys(this);
	},

	getValues: function(){
		return Object.values(this);
	},

	toQueryString: function(base){
		return Object.toQueryString(this, base);
	}

});

Hash.alias({indexOf: 'keyOf', contains: 'hasValue'});

//</1.2compat>


/*
---

name: Browser

description: The Browser Object. Contains Browser initialization, Window and Document, and the Browser Hash.

license: MIT-style license.

requires: [Array, Function, Number, String]

provides: [Browser, Window, Document]

...
*/

(function(){

var document = this.document;
var window = document.window = this;

var UID = 1;

this.$uid = (window.ActiveXObject) ? function(item){
	return (item.uid || (item.uid = [UID++]))[0];
} : function(item){
	return item.uid || (item.uid = UID++);
};

$uid(window);
$uid(document);

var ua = navigator.userAgent.toLowerCase(),
	platform = navigator.platform.toLowerCase(),
	UA = ua.match(/(opera|ie|firefox|chrome|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/) || [null, 'unknown', 0];

var Browser = this.Browser = {
	
	extend: Function.prototype.extend,
	
	name: (UA[1] == 'version') ? UA[3] : UA[1],

	version: parseFloat((UA[1] == 'opera' && UA[4]) ? UA[4] : UA[2]),

	Platform: {
		name: ua.match(/ip(?:ad|od|hone)/) ? 'ios' : (ua.match(/(?:webos|android)/) || platform.match(/mac|win|linux/) || ['other'])[0]
	},

	Features: {
		xpath: !!(document.evaluate),
		air: !!(window.runtime),
		query: !!(document.querySelector),
		json: !!(window.JSON)
	},

	Plugins: {}

};

Browser[Browser.name] = true;
Browser[Browser.name + parseInt(Browser.version, 10)] = true;
Browser.Platform[Browser.Platform.name] = true;

// Request

Browser.Request = (function(){

	var XMLHTTP = function(){
		return new XMLHttpRequest();
	};
 
	var MSXML2 = function(){
		return new ActiveXObject('MSXML2.XMLHTTP');
	};
 
	var MSXML = function(){
		return new ActiveXObject('Microsoft.XMLHTTP');
	};
 
	return Function.attempt(function(){
		XMLHTTP();
		return XMLHTTP;
	}, function(){
		MSXML2();
		return MSXML2;
	}, function(){
		MSXML();
		return MSXML;
	});
 
})();

Browser.Features.xhr = !!(Browser.Request);

// Flash detection

Browser.Plugins.Flash = (function(){
	var version = (Function.attempt(function(){
		return navigator.plugins['Shockwave Flash'].description;
	}, function(){
		return new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
	}) || '0 r0').match(/\d+/g);
	return {version: Number(version[0] || 0 + '.' + version[1]) || 0, build: Number(version[2]) || 0};
})();

// String scripts

Browser.exec = function(text){
	if (!text) return text;
	if (window.execScript){
		window.execScript(text);
	} else {
		var script = document.createElement('script');
		script.setAttribute('type', 'text/javascript');
		script.text = text;
		document.head.appendChild(script);
		document.head.removeChild(script);
	}
	return text;
};

String.implement('stripScripts', function(exec){
	var scripts = '';
	var text = this.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, function(all, code){
		scripts += code + '\n';
		return '';
	});
	if (exec === true) Browser.exec(scripts);
	else if (typeOf(exec) == 'function') exec(scripts, text);
	return text;
});

// Window, Document
	
Browser.extend({
	Document: this.Document,
	Window: this.Window,
	Element: this.Element,
	Event: this.Event
});

this.Window = this.$constructor = new Type('Window', function(){});

this.$family = Function.from('window').hide();

Window.mirror(function(name, method){
	window[name] = method;
});

this.Document = document.$constructor = new Type('Document', function(){});

document.$family = Function.from('document').hide();

Document.mirror(function(name, method){
	document[name] = method;
});

document.html = document.documentElement;
document.head = document.getElementsByTagName('head')[0];

if (document.execCommand) try {
	document.execCommand("BackgroundImageCache", false, true);
} catch (e){}

if (this.attachEvent){
	var unloadEvent = function(){
		this.detachEvent('onunload', unloadEvent);
		document.head = document.html = document.window = null;
	};
	this.attachEvent('onunload', unloadEvent);
}

// IE fails on collections and <select>.options (refers to <select>)
var arrayFrom = Array.from;
try {
	arrayFrom(document.html.childNodes);
} catch(e){
	Array.from = function(item){
		if (typeof item != 'string' && Type.isEnumerable(item) && typeOf(item) != 'array'){
			var i = item.length, array = new Array(i);
			while (i--) array[i] = item[i];
			return array;
		}
		return arrayFrom(item);
	};
	
	['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'concat', 'join', 'slice'].each(function(name){
		var method = Array.prototype[name];
		Array[name] = function(item){
			return method.apply(Array.from(item), Array.prototype.slice.call(arguments, 1));
		};
	});
}

//<1.2compat>

if (Browser.Platform.ios) Browser.Platform.ipod = true;

Browser.Engine = {};

var setEngine = function(name, version){
	Browser.Engine.name = name;
	Browser.Engine[name + version] = true;
	Browser.Engine.version = version;
};

if (Browser.ie){
	Browser.Engine.trident = true;
	
	switch (Browser.version){
		case 6: setEngine('trident', 4); break;
		case 7: setEngine('trident', 5); break;
		case 8: setEngine('trident', 6);
	}
}

if (Browser.firefox){
	Browser.Engine.gecko = true;
	
	if (Browser.version >= 3) setEngine('gecko', 19);
	else setEngine('gecko', 18);
}

if (Browser.safari || Browser.chrome){
	Browser.Engine.webkit = true;
	
	switch (Browser.version){
		case 2: setEngine('webkit', 419); break;
		case 3: setEngine('webkit', 420); break;
		case 4: setEngine('webkit', 525);
	}
}

if (Browser.opera){
	Browser.Engine.presto = true;
	
	if (Browser.version >= 9.6) setEngine('presto', 960);
	else if (Browser.version >= 9.5) setEngine('presto', 950);
	else setEngine('presto', 925);
}

if (Browser.name == 'unknown'){
	switch ((ua.match(/(?:webkit|khtml|gecko)/) || [])[0]){
		case 'webkit':
		case 'khtml':
			Browser.Engine.webkit = true;
		break;
		case 'gecko':
			Browser.Engine.gecko = true;
	}
}

this.$exec = Browser.exec;

//</1.2compat>

})();


/*
---

name: Event

description: Contains the Event Class, to make the event object cross-browser.

license: MIT-style license.

requires: [Window, Document, Array, Function, String]

provides: Event

...
*/

var Event = new Type('Event', function(event, win){
	if (!win) win = window;
	var doc = win.document;
	event = event || win.event;
	if (event.$extended) return event;
	this.$extended = true;
	var type = event.type,
		target = event.target || event.srcElement,
		page = {},
		client = {};
	while (target && target.nodeType == 3) target = target.parentNode;

	if (type.test(/key/)){
		var code = event.which || event.keyCode;
		var key = Object.keyOf(Event.Keys, code);
		if (type == 'keydown'){
			var fKey = code - 111;
			if (fKey > 0 && fKey < 13) key = 'f' + fKey;
		}
		if (!key) key = String.fromCharCode(code).toLowerCase();
	} else if (type.test(/click|mouse|menu/i)){
		doc = (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
		page = {
			x: (event.pageX != null) ? event.pageX : event.clientX + doc.scrollLeft,
			y: (event.pageY != null) ? event.pageY : event.clientY + doc.scrollTop
		};
		client = {
			x: (event.pageX != null) ? event.pageX - win.pageXOffset : event.clientX,
			y: (event.pageY != null) ? event.pageY - win.pageYOffset : event.clientY
		};
		if (type.test(/DOMMouseScroll|mousewheel/)){
			var wheel = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3;
		}
		var rightClick = (event.which == 3) || (event.button == 2),
			related = null;
		if (type.test(/over|out/)){
			related = event.relatedTarget || event[(type == 'mouseover' ? 'from' : 'to') + 'Element'];
			var testRelated = function(){
				while (related && related.nodeType == 3) related = related.parentNode;
				return true;
			};
			var hasRelated = (Browser.firefox2) ? testRelated.attempt() : testRelated();
			related = (hasRelated) ? related : null;
		}
	} else if (type.test(/gesture|touch/i)){
		this.rotation = event.rotation;
		this.scale = event.scale;
		this.touches = event.touches;
		this.targetTouches = event.targetTouches;
		this.changedTouches = event.changedTouches;
	}

	return Object.append(this, {
		event: event,
		type: type,

		page: page,
		client: client,
		rightClick: rightClick,

		wheel: wheel,

		relatedTarget: document.id(related),
		target: document.id(target),

		code: code,
		key: key,

		shift: event.shiftKey,
		control: event.ctrlKey,
		alt: event.altKey,
		meta: event.metaKey
	});
});

Event.Keys = {
	'enter': 13,
	'up': 38,
	'down': 40,
	'left': 37,
	'right': 39,
	'esc': 27,
	'space': 32,
	'backspace': 8,
	'tab': 9,
	'delete': 46
};

//<1.2compat>

Event.Keys = new Hash(Event.Keys);

//</1.2compat>

Event.implement({

	stop: function(){
		return this.stopPropagation().preventDefault();
	},

	stopPropagation: function(){
		if (this.event.stopPropagation) this.event.stopPropagation();
		else this.event.cancelBubble = true;
		return this;
	},

	preventDefault: function(){
		if (this.event.preventDefault) this.event.preventDefault();
		else this.event.returnValue = false;
		return this;
	}

});


/*
---

name: Class

description: Contains the Class Function for easily creating, extending, and implementing reusable Classes.

license: MIT-style license.

requires: [Array, String, Function, Number]

provides: Class

...
*/

(function(){

var Class = this.Class = new Type('Class', function(params){
	
	if (instanceOf(params, Function)) params = {'initialize': params};
	
	var newClass = function(){
		reset(this);
		if (newClass.$prototyping) return this;
		this.$caller = null;
		var value = (this.initialize) ? this.initialize.apply(this, arguments) : this;
		this.$caller = this.caller = null;
		return value;
	}.extend(this);

	newClass.implement(params);
	
	newClass.$constructor = Class;
	newClass.prototype.$constructor = newClass;
	newClass.prototype.parent = parent;

	return newClass;

});

var parent = function(){
	if (!this.$caller) throw new Error('The method "parent" cannot be called.');
	var name = this.$caller.$name, parent = this.$caller.$owner.parent;
	var previous = (parent) ? parent.prototype[name] : null;
	if (!previous) throw new Error('The method "' + name + '" has no parent.');
	return previous.apply(this, arguments);
};

var reset = function(object){
	for (var key in object){
		var value = object[key];
		switch (typeOf(value)){
			case 'object':
				var F = function(){};
				F.prototype = value;
				var instance = new F;
				object[key] = reset(instance);
			break;
			case 'array': object[key] = value.clone(); break;
		}
	}
	return object;
};

var wrap = function(self, key, method){
	if (method.$origin) method = method.$origin;
	var wrapper = function(){
		if (method.$protected && this.$caller == null) throw new Error('The method "' + key + '" cannot be called.');
		var caller = this.caller, current = this.$caller;
		this.caller = current; this.$caller = wrapper;
		var result = method.apply(this, arguments);
		this.$caller = current; this.caller = caller;
		return result;
	}.extend({$owner: self, $origin: method, $name: key});
	return wrapper;
};

var implement = function(key, value, retain){
	if (Class.Mutators.hasOwnProperty(key)){
		value = Class.Mutators[key].call(this, value);
		if (value == null) return this;
	}
	
	if (typeOf(value) == 'function'){
		if (value.$hidden) return this;
		this.prototype[key] = (retain) ? value : wrap(this, key, value);
	} else {
		Object.merge(this.prototype, key, value);
	}
	
	return this;
	
};

var getInstance = function(klass){
	klass.$prototyping = true;
	var proto = new klass;
	delete klass.$prototyping;
	return proto;
};

Class.implement('implement', implement.overloadSetter());

Class.Mutators = {
	
	Extends: function(parent){
		this.parent = parent;
		this.prototype = getInstance(parent);
	},
	
	Implements: function(items){
		Array.from(items).each(function(item){
			var instance = new item;
			for (var key in instance) implement.call(this, key, instance[key], true);
		}, this);
	}
};

})();


/*
---

name: Class.Extras

description: Contains Utility Classes that can be implemented into your own Classes to ease the execution of many common tasks.

license: MIT-style license.

requires: Class

provides: [Class.Extras, Chain, Events, Options]

...
*/

(function(){

this.Chain = new Class({

	$chain: [],

	chain: function(){
		this.$chain.append(Array.flatten(arguments));
		return this;
	},

	callChain: function(){
		return (this.$chain.length) ? this.$chain.shift().apply(this, arguments) : false;
	},

	clearChain: function(){
		this.$chain.empty();
		return this;
	}

});

var Events = this.Events = new Class({

	$events: {},

	addEvent: function(type, fn, internal){
		type = Events.removeOn(type);
		if (fn/*<1.2compat>*/ && fn != $empty /*</1.2compat>*/){
			this.$events[type] = this.$events[type] || [];
			this.$events[type].include(fn);
			if (internal) fn.internal = true;
		}
		return this;
	},

	addEvents: function(events){
		for (var type in events) this.addEvent(type, events[type]);
		return this;
	},

	fireEvent: function(type, args, delay){
		type = Events.removeOn(type);
		if (!this.$events || !this.$events[type]) return this;
		this.$events[type].each(function(fn){
			(delay) ? fn.delay(delay, this, args) : fn.run(args, this);
		}, this);
		return this;
	},

	removeEvent: function(type, fn){
		type = Events.removeOn(type);
		if (!this.$events[type]) return this;
		if (!fn.internal) this.$events[type].erase(fn);
		return this;
	},

	removeEvents: function(events){
		var type;
		if (typeOf(events) == 'object'){
			for (type in events) this.removeEvent(type, events[type]);
			return this;
		}
		if (events) events = Events.removeOn(events);
		for (type in this.$events){
			if (events && events != type) continue;
			var fns = this.$events[type];
			for (var i = fns.length; i--;) this.removeEvent(type, fns[i]);
		}
		return this;
	}

});

Events.removeOn = function(string){
	return string.replace(/^on([A-Z])/, function(full, first){
		return first.toLowerCase();
	});
};

this.Options = new Class({

	setOptions: function(){
		var options = this.options = Object.merge.run([{}, this.options].append(arguments));
		if (!this.addEvent) return this;
		for (var option in options){
			if (typeOf(options[option]) != 'function' || !(/^on[A-Z]/).test(option)) continue;
			this.addEvent(option, options[option]);
			delete options[option];
		}
		return this;
	}

});

})();

/*
---
name: Slick.Parser
description: Standalone CSS3 Selector parser
provides: Slick.Parser
...
*/

(function(){
	
var parsed,
	separatorIndex,
	combinatorIndex,
	reversed,
	cache = {},
	reverseCache = {},
	reUnescape = /\\/g;

var parse = function(expression, isReversed){
	if (!expression) return null;
	if (expression.Slick === true) return expression;
	expression = ('' + expression).replace(/^\s+|\s+$/g, '');
	reversed = !!isReversed;
	var currentCache = (reversed) ? reverseCache : cache;
	if (currentCache[expression]) return currentCache[expression];
	parsed = {Slick: true, expressions: [], raw: expression, reverse: function(){
		return parse(this.raw, true);
	}};
	separatorIndex = -1;
	while (expression != (expression = expression.replace(regexp, parser)));
	parsed.length = parsed.expressions.length;
	return currentCache[expression] = (reversed) ? reverse(parsed) : parsed;
};

var reverseCombinator = function(combinator){
	if (combinator === '!') return ' ';
	else if (combinator === ' ') return '!';
	else if ((/^!/).test(combinator)) return combinator.replace(/^!/, '');
	else return '!' + combinator;
};

var reverse = function(expression){
	var expressions = expression.expressions;
	for (var i = 0; i < expressions.length; i++){
		var exp = expressions[i];
		var last = {parts: [], tag: '*', combinator: reverseCombinator(exp[0].combinator)};
		
		for (var j = 0; j < exp.length; j++){
			var cexp = exp[j];
			if (!cexp.reverseCombinator) cexp.reverseCombinator = ' ';
			cexp.combinator = cexp.reverseCombinator;
			delete cexp.reverseCombinator;
		}
		
		exp.reverse().push(last);
	}
	return expression;
};

var escapeRegExp = function(string){// Credit: XRegExp 0.6.1 (c) 2007-2008 Steven Levithan <http://stevenlevithan.com/regex/xregexp/> MIT License
	return string.replace(/[-[\]{}()*+?.\\^$|,#\s]/g, "\\$&");
};

var regexp = new RegExp(
/*
#!/usr/bin/env ruby
puts "\t\t" + DATA.read.gsub(/\(\?x\)|\s+#.*$|\s+|\\$|\\n/,'')
__END__
	"(?x)^(?:\
	  \\s* ( , ) \\s*               # Separator          \n\
	| \\s* ( <combinator>+ ) \\s*   # Combinator         \n\
	|      ( \\s+ )                 # CombinatorChildren \n\
	|      ( <unicode>+ | \\* )     # Tag                \n\
	| \\#  ( <unicode>+       )     # ID                 \n\
	| \\.  ( <unicode>+       )     # ClassName          \n\
	|                               # Attribute          \n\
	\\[  \
		\\s* (<unicode1>+)  (?:  \
			\\s* ([*^$!~|]?=)  (?:  \
				\\s* (?:\
					([\"']?)(.*?)\\9 \
				)\
			)  \
		)?  \\s*  \
	\\](?!\\]) \n\
	|   :+ ( <unicode>+ )(?:\
	\\( (?:\
		 ([\"']?)((?:\\([^\\)]+\\)|[^\\(\\)]*)+)\\12\
	) \\)\
	)?\
	)"
*/
	"^(?:\\s*(,)\\s*|\\s*(<combinator>+)\\s*|(\\s+)|(<unicode>+|\\*)|\\#(<unicode>+)|\\.(<unicode>+)|\\[\\s*(<unicode1>+)(?:\\s*([*^$!~|]?=)(?:\\s*(?:([\"']?)(.*?)\\9)))?\\s*\\](?!\\])|:+(<unicode>+)(?:\\((?:([\"']?)((?:\\([^\\)]+\\)|[^\\(\\)]*)+)\\12)\\))?)"
	.replace(/<combinator>/, '[' + escapeRegExp(">+~`!@$%^&={}\\;</") + ']')
	.replace(/<unicode>/g, '(?:[\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])')
	.replace(/<unicode1>/g, '(?:[:\\w\\u00a1-\\uFFFF-]|\\\\[^\\s0-9a-f])')
);

function parser(
	rawMatch,
	
	separator,
	combinator,
	combinatorChildren,
	
	tagName,
	id,
	className,
	
	attributeKey,
	attributeOperator,
	attributeQuote,
	attributeValue,
	
	pseudoClass,
	pseudoQuote,
	pseudoClassValue
){
	if (separator || separatorIndex === -1){
		parsed.expressions[++separatorIndex] = [];
		combinatorIndex = -1;
		if (separator) return '';
	}
	
	if (combinator || combinatorChildren || combinatorIndex === -1){
		combinator = combinator || ' ';
		var currentSeparator = parsed.expressions[separatorIndex];
		if (reversed && currentSeparator[combinatorIndex])
			currentSeparator[combinatorIndex].reverseCombinator = reverseCombinator(combinator);
		currentSeparator[++combinatorIndex] = {combinator: combinator, tag: '*'};
	}
	
	var currentParsed = parsed.expressions[separatorIndex][combinatorIndex];

	if (tagName){
		currentParsed.tag = tagName.replace(reUnescape, '');

	} else if (id){
		currentParsed.id = id.replace(reUnescape, '');

	} else if (className){
		className = className.replace(reUnescape, '');

		if (!currentParsed.classList) currentParsed.classList = [];
		if (!currentParsed.classes) currentParsed.classes = [];
		currentParsed.classList.push(className);
		currentParsed.classes.push({
			value: className,
			regexp: new RegExp('(^|\\s)' + escapeRegExp(className) + '(\\s|$)')
		});
		
	} else if (pseudoClass){
		pseudoClassValue = pseudoClassValue ? pseudoClassValue.replace(reUnescape, '') : null;
		
		if (!currentParsed.pseudos) currentParsed.pseudos = [];
		currentParsed.pseudos.push({
			key: pseudoClass.replace(reUnescape, ''),
			value: pseudoClassValue
		});
		
	} else if (attributeKey){
		attributeKey = attributeKey.replace(reUnescape, '');
		attributeValue = (attributeValue || '').replace(reUnescape, '');
		
		var test, regexp;
		
		switch (attributeOperator){
			case '^=' : regexp = new RegExp(       '^'+ escapeRegExp(attributeValue)            ); break;
			case '$=' : regexp = new RegExp(            escapeRegExp(attributeValue) +'$'       ); break;
			case '~=' : regexp = new RegExp( '(^|\\s)'+ escapeRegExp(attributeValue) +'(\\s|$)' ); break;
			case '|=' : regexp = new RegExp(       '^'+ escapeRegExp(attributeValue) +'(-|$)'   ); break;
			case  '=' : test = function(value){
				return attributeValue == value;
			}; break;
			case '*=' : test = function(value){
				return value && value.indexOf(attributeValue) > -1;
			}; break;
			case '!=' : test = function(value){
				return attributeValue != value;
			}; break;
			default   : test = function(value){
				return !!value;
			};
		}
		
		if (!test) test = function(value){
			return value && regexp.test(value);
		};
		
		if (!currentParsed.attributes) currentParsed.attributes = [];
		currentParsed.attributes.push({
			key: attributeKey,
			operator: attributeOperator,
			value: attributeValue,
			test: test
		});
		
	}
	
	return '';
};

// Slick NS

var Slick = (this.Slick || {});

Slick.parse = function(expression){
	return parse(expression);
};

Slick.escapeRegExp = escapeRegExp;

if (!this.Slick) this.Slick = Slick;
	
}).apply(/*<CommonJS>*/(typeof exports != 'undefined') ? exports : /*</CommonJS>*/this);


/*
---
name: Slick.Finder
description: The new, superfast css selector engine.
provides: Slick.Finder
requires: Slick.Parser
...
*/

(function(){

var local = {};

// Feature / Bug detection

local.isNativeCode = function(fn){
	return (/\{\s*\[native code\]\s*\}/).test('' + fn);
};

local.isXML = function(document){
	return (!!document.xmlVersion) || (!!document.xml) || (Object.prototype.toString.call(document) === '[object XMLDocument]') ||
	(document.nodeType === 9 && document.documentElement.nodeName !== 'HTML');
};

local.setDocument = function(document){
	
	// convert elements / window arguments to document. if document cannot be extrapolated, the function returns.
	
	if (document.nodeType === 9); // document
	else if (document.ownerDocument) document = document.ownerDocument; // node
	else if (document.navigator) document = document.document; // window
	else return;
	
	// check if it's the old document
	
	if (this.document === document) return;
	this.document = document;
	var root = this.root = document.documentElement;
	
	// document sort
	
	this.brokenStarGEBTN
	= this.starSelectsClosedQSA
	= this.idGetsName
	= this.brokenMixedCaseQSA
	= this.brokenGEBCN
	= false;
	
	var starSelectsClosed, starSelectsComments,
		brokenSecondClassNameGEBCN, cachedGetElementsByClassName;
	
	if (!(this.isXMLDocument = this.isXML(document))){
		
		var testNode = document.createElement('div');
		this.root.appendChild(testNode);
		var selected, id;
		
		// IE returns comment nodes for getElementsByTagName('*') for some documents
		testNode.appendChild(document.createComment(''));
		starSelectsComments = (testNode.getElementsByTagName('*').length > 0);
		
		// IE returns closed nodes (EG:"</foo>") for getElementsByTagName('*') for some documents
		try {
			testNode.innerHTML = 'foo</foo>';
			selected = testNode.getElementsByTagName('*');
			starSelectsClosed = (selected && selected.length && selected[0].nodeName.charAt(0) == '/');
		} catch(e){};
		
		this.brokenStarGEBTN = starSelectsComments || starSelectsClosed;
		
		// IE 8 returns closed nodes (EG:"</foo>") for querySelectorAll('*') for some documents
		if (testNode.querySelectorAll) try {
			testNode.innerHTML = 'foo</foo>';
			selected = testNode.querySelectorAll('*');
			this.starSelectsClosedQSA = (selected && selected.length && selected[0].nodeName.charAt(0) == '/');
		} catch(e){};
		
		// IE returns elements with the name instead of just id for getElementById for some documents
		try {
			id = 'slick_id_gets_name';
			testNode.innerHTML = ('<a name='+id+'></a><b id='+id+'></b>');
			this.idGetsName = testNode.ownerDocument.getElementById(id) === testNode.firstChild;
		} catch(e){};
		
		// Safari 3.2 QSA doesnt work with mixedcase on quirksmode
		try {
			testNode.innerHTML = '<a class="MiXedCaSe"></a>';
			this.brokenMixedCaseQSA = !testNode.querySelectorAll('.MiXedCaSe').length;
		} catch(e){};

		try {
			testNode.innerHTML = '<a class="f"></a><a class="b"></a>';
			testNode.getElementsByClassName('b').length;
			testNode.firstChild.className = 'b';
			cachedGetElementsByClassName = (testNode.getElementsByClassName('b').length != 2);
		} catch(e){};
		
		// Opera 9.6 GEBCN doesnt detects the class if its not the first one
		try {
			testNode.innerHTML = '<a class="a"></a><a class="f b a"></a>';
			brokenSecondClassNameGEBCN = (testNode.getElementsByClassName('a').length != 2);
		} catch(e){};
		
		this.brokenGEBCN = cachedGetElementsByClassName || brokenSecondClassNameGEBCN;
		
		this.root.removeChild(testNode);
		testNode = null;
		
	}
	
	// hasAttribute
	
	this.hasAttribute = (root && this.isNativeCode(root.hasAttribute)) ? function(node, attribute) {
		return node.hasAttribute(attribute);
	} : function(node, attribute) {
		node = node.getAttributeNode(attribute);
		return !!(node && (node.specified || node.nodeValue));
	};
	
	// contains
	// FIXME: Add specs: local.contains should be different for xml and html documents?
	this.contains = (root && this.isNativeCode(root.contains)) ? function(context, node){
		return context.contains(node);
	} : (root && root.compareDocumentPosition) ? function(context, node){
		return context === node || !!(context.compareDocumentPosition(node) & 16);
	} : function(context, node){
		if (node) do {
			if (node === context) return true;
		} while ((node = node.parentNode));
		return false;
	};
	
	// document order sorting
	// credits to Sizzle (http://sizzlejs.com/)
	
	this.documentSorter = (root.compareDocumentPosition) ? function(a, b){
		if (!a.compareDocumentPosition || !b.compareDocumentPosition) return 0;
		return a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
	} : ('sourceIndex' in root) ? function(a, b){
		if (!a.sourceIndex || !b.sourceIndex) return 0;
		return a.sourceIndex - b.sourceIndex;
	} : (document.createRange) ? function(a, b){
		if (!a.ownerDocument || !b.ownerDocument) return 0;
		var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
		aRange.setStart(a, 0);
		aRange.setEnd(a, 0);
		bRange.setStart(b, 0);
		bRange.setEnd(b, 0);
		return aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
	} : null ;
	
	this.getUID = (this.isXMLDocument) ? this.getUIDXML : this.getUIDHTML;
	
};
	
// Main Method

local.search = function(context, expression, append, first){
	
	var found = this.found = (first) ? null : (append || []);
	
	// no need to pass a context if its the current document
	
	if (expression == null){
		expression = context;
		context = document; // the current document, not local.document, cause it would be confusing
	}
	
	// context checks

	if (!context) return found; // No context
	if (context.navigator) context = context.document; // Convert the node from a window to a document
	else if (!context.nodeType) return found; // Reject misc junk input

	// setup
	
	var parsed, i;

	var uniques = this.uniques = {};
	
	if (this.document !== (context.ownerDocument || context)) this.setDocument(context);

	// expression checks
	
	if (typeof expression == 'string'){ // expression is a string
		
		// Overrides

		for (i = this.overrides.length; i--;){
			var override = this.overrides[i];
			if (override.regexp.test(expression)){
				var result = override.method.call(context, expression, found, first);
				if (result === false) continue;
				if (result === true) return found;
				return result;
			}
		}
		
		parsed = this.Slick.parse(expression);
		if (!parsed.length) return found;
	} else if (expression == null){ // there is no expression
		return found;
	} else if (expression.Slick){ // expression is a parsed Slick object
		parsed = expression;
	} else if (this.contains(context.documentElement || context, expression)){ // expression is a node
		(found) ? found.push(expression) : found = expression;
		return found;
	} else { // other junk
		return found;
	}
	
	// cache elements for the nth selectors
	
	/*<pseudo-selectors>*//*<nth-pseudo-selectors>*/
	
	this.posNTH = {};
	this.posNTHLast = {};
	this.posNTHType = {};
	this.posNTHTypeLast = {};
	
	/*</nth-pseudo-selectors>*//*</pseudo-selectors>*/
	
	// should sort if there are nodes in append and if you pass multiple expressions.
	// should remove duplicates if append already has items
	var shouldUniques = !!(append && append.length);
	
	// if append is null and there is only a single selector with one expression use pushArray, else use pushUID
	this.push = (!shouldUniques && (first || (parsed.length == 1 && parsed.expressions[0].length == 1))) ? this.pushArray : this.pushUID;
	
	if (found == null) found = [];
	
	// avoid duplicating items already in the append array
	if (shouldUniques) for (i = found.length; i--;) this.uniques[this.getUID(found[i])] = true;
	
	// default engine
	
	var j, m, n;
	var combinator, tag, id, classList, classes, attributes, pseudos;
	var currentItems, currentExpression, currentBit, lastBit, expressions = parsed.expressions;
	
	search: for (i = 0; (currentExpression = expressions[i]); i++) for (j = 0; (currentBit = currentExpression[j]); j++){

		combinator = 'combinator:' + currentBit.combinator;
		if (!this[combinator]) continue search;
		
		tag        = (this.isXMLDocument) ? currentBit.tag : currentBit.tag.toUpperCase();
		id         = currentBit.id;
		classList  = currentBit.classList;
		classes    = currentBit.classes;
		attributes = currentBit.attributes;
		pseudos    = currentBit.pseudos;
		lastBit    = (j === (currentExpression.length - 1));
	
		this.bitUniques = {};
		
		if (lastBit){
			this.uniques = uniques;
			this.found = found;
		} else {
			this.uniques = {};
			this.found = [];
		}

		if (j === 0){
			this[combinator](context, tag, id, classes, attributes, pseudos, classList);
			if (first && lastBit && found.length) break search;
		} else {
			if (first && lastBit) for (m = 0, n = currentItems.length; m < n; m++){
				this[combinator](currentItems[m], tag, id, classes, attributes, pseudos, classList);
				if (found.length) break search;
			} else for (m = 0, n = currentItems.length; m < n; m++) this[combinator](currentItems[m], tag, id, classes, attributes, pseudos, classList);
		}
		
		currentItems = this.found;
	}
	
	if (shouldUniques || (parsed.expressions.length > 1)) this.sort(found);
	
	return (first) ? (found[0] || null) : found;
};

// Utils

local.uidx = 1;
local.uidk = 'slick:uniqueid';

local.getUIDXML = function(node){
	var uid = node.getAttribute(this.uidk);
	if (!uid){
		uid = this.uidx++;
		node.setAttribute(this.uidk, uid);
	}
	return uid;
};

local.getUIDHTML = function(node){
	return node.uniqueNumber || (node.uniqueNumber = this.uidx++);
};

// sort based on the setDocument documentSorter method.

local.sort = function(results){
	if (!this.documentSorter) return results;
	results.sort(this.documentSorter);
	return results;
};

/*<pseudo-selectors>*//*<nth-pseudo-selectors>*/

local.cacheNTH = {};

local.matchNTH = /^([+-]?\d*)?([a-z]+)?([+-]\d+)?$/;

local.parseNTHArgument = function(argument){
	var parsed = argument.match(this.matchNTH);
	if (!parsed) return false;
	var special = parsed[2] || false;
	var a = parsed[1] || 1;
	if (a == '-') a = -1;
	var b = +parsed[3] || 0;
	parsed =
		(special == 'n')	? {a: a, b: b} :
		(special == 'odd')	? {a: 2, b: 1} :
		(special == 'even')	? {a: 2, b: 0} : {a: 0, b: a};
		
	return (this.cacheNTH[argument] = parsed);
};

local.createNTHPseudo = function(child, sibling, positions, ofType){
	return function(node, argument){
		var uid = this.getUID(node);
		if (!this[positions][uid]){
			var parent = node.parentNode;
			if (!parent) return false;
			var el = parent[child], count = 1;
			if (ofType){
				var nodeName = node.nodeName;
				do {
					if (el.nodeName !== nodeName) continue;
					this[positions][this.getUID(el)] = count++;
				} while ((el = el[sibling]));
			} else {
				do {
					if (el.nodeType !== 1) continue;
					this[positions][this.getUID(el)] = count++;
				} while ((el = el[sibling]));
			}
		}
		argument = argument || 'n';
		var parsed = this.cacheNTH[argument] || this.parseNTHArgument(argument);
		if (!parsed) return false;
		var a = parsed.a, b = parsed.b, pos = this[positions][uid];
		if (a == 0) return b == pos;
		if (a > 0){
			if (pos < b) return false;
		} else {
			if (b < pos) return false;
		}
		return ((pos - b) % a) == 0;
	};
};

/*</nth-pseudo-selectors>*//*</pseudo-selectors>*/

local.pushArray = function(node, tag, id, classes, attributes, pseudos){
	if (this.matchSelector(node, tag, id, classes, attributes, pseudos)) this.found.push(node);
};

local.pushUID = function(node, tag, id, classes, attributes, pseudos){
	var uid = this.getUID(node);
	if (!this.uniques[uid] && this.matchSelector(node, tag, id, classes, attributes, pseudos)){
		this.uniques[uid] = true;
		this.found.push(node);
	}
};

local.matchNode = function(node, selector){
	var parsed = this.Slick.parse(selector);
	if (!parsed) return true;
	
	// simple (single) selectors
	if(parsed.length == 1 && parsed.expressions[0].length == 1){
		var exp = parsed.expressions[0][0];
		return this.matchSelector(node, (this.isXMLDocument) ? exp.tag : exp.tag.toUpperCase(), exp.id, exp.classes, exp.attributes, exp.pseudos);
	}

	var nodes = this.search(this.document, parsed);
	for (var i = 0, item; item = nodes[i++];){
		if (item === node) return true;
	}
	return false;
};

local.matchPseudo = function(node, name, argument){
	var pseudoName = 'pseudo:' + name;
	if (this[pseudoName]) return this[pseudoName](node, argument);
	var attribute = this.getAttribute(node, name);
	return (argument) ? argument == attribute : !!attribute;
};

local.matchSelector = function(node, tag, id, classes, attributes, pseudos){
	if (tag){
		if (tag == '*'){
			if (node.nodeName < '@') return false; // Fix for comment nodes and closed nodes
		} else {
			if (node.nodeName != tag) return false;
		}
	}
	
	if (id && node.getAttribute('id') != id) return false;

	var i, part, cls;
	if (classes) for (i = classes.length; i--;){
		cls = ('className' in node) ? node.className : node.getAttribute('class');
		if (!(cls && classes[i].regexp.test(cls))) return false;
	}
	if (attributes) for (i = attributes.length; i--;){
		part = attributes[i];
		if (part.operator ? !part.test(this.getAttribute(node, part.key)) : !this.hasAttribute(node, part.key)) return false;
	}
	if (pseudos) for (i = pseudos.length; i--;){
		part = pseudos[i];
		if (!this.matchPseudo(node, part.key, part.value)) return false;
	}
	return true;
};

var combinators = {

	' ': function(node, tag, id, classes, attributes, pseudos, classList){ // all child nodes, any level
		
		var i, item, children;

		if (!this.isXMLDocument){
			getById: if (id){
				item = this.document.getElementById(id);
				if ((!item && node.all) || (this.idGetsName && item && item.getAttributeNode('id').nodeValue != id)){
					// all[id] returns all the elements with that name or id inside node
					// if theres just one it will return the element, else it will be a collection
					children = node.all[id];
					if (!children) return;
					if (!children[0]) children = [children];
					for (i = 0; item = children[i++];) if (item.getAttributeNode('id').nodeValue == id){
						this.push(item, tag, null, classes, attributes, pseudos);
						break;
					} 
					return;
				}
				if (!item){
					// if the context is in the dom we return, else we will try GEBTN, breaking the getById label
					if (this.contains(this.document.documentElement, node)) return;
					else break getById;
				} else if (this.document !== node && !this.contains(node, item)) return;
				this.push(item, tag, null, classes, attributes, pseudos);
				return;
			}
			getByClass: if (classes && node.getElementsByClassName && !this.brokenGEBCN){
				children = node.getElementsByClassName(classList.join(' '));
				if (!(children && children.length)) break getByClass;
				for (i = 0; item = children[i++];) this.push(item, tag, id, null, attributes, pseudos);
				return;
			}
		}
		getByTag: {
			children = node.getElementsByTagName(tag);
			if (!(children && children.length)) break getByTag;
			if (!this.brokenStarGEBTN) tag = null;
			for (i = 0; item = children[i++];) this.push(item, tag, id, classes, attributes, pseudos);
		}
	},
	
	'>': function(node, tag, id, classes, attributes, pseudos){ // direct children
		if ((node = node.firstChild)) do {
			if (node.nodeType === 1) this.push(node, tag, id, classes, attributes, pseudos);
		} while ((node = node.nextSibling));
	},
	
	'+': function(node, tag, id, classes, attributes, pseudos){ // next sibling
		while ((node = node.nextSibling)) if (node.nodeType === 1){
			this.push(node, tag, id, classes, attributes, pseudos);
			break;
		}
	},

	'^': function(node, tag, id, classes, attributes, pseudos){ // first child
		node = node.firstChild;
		if (node){
			if (node.nodeType === 1) this.push(node, tag, id, classes, attributes, pseudos);
			else this['combinator:+'](node, tag, id, classes, attributes, pseudos);
		}
	},

	'~': function(node, tag, id, classes, attributes, pseudos){ // next siblings
		while ((node = node.nextSibling)){
			if (node.nodeType !== 1) continue;
			var uid = this.getUID(node);
			if (this.bitUniques[uid]) break;
			this.bitUniques[uid] = true;
			this.push(node, tag, id, classes, attributes, pseudos);
		}
	},

	'++': function(node, tag, id, classes, attributes, pseudos){ // next sibling and previous sibling
		this['combinator:+'](node, tag, id, classes, attributes, pseudos);
		this['combinator:!+'](node, tag, id, classes, attributes, pseudos);
	},

	'~~': function(node, tag, id, classes, attributes, pseudos){ // next siblings and previous siblings
		this['combinator:~'](node, tag, id, classes, attributes, pseudos);
		this['combinator:!~'](node, tag, id, classes, attributes, pseudos);
	},
	
	'!': function(node, tag, id, classes, attributes, pseudos){  // all parent nodes up to document
		while ((node = node.parentNode)) if (node !== document) this.push(node, tag, id, classes, attributes, pseudos);
	},
	
	'!>': function(node, tag, id, classes, attributes, pseudos){ // direct parent (one level)
		node = node.parentNode;
		if (node !== document) this.push(node, tag, id, classes, attributes, pseudos);
	},
	
	'!+': function(node, tag, id, classes, attributes, pseudos){ // previous sibling
		while ((node = node.previousSibling)) if (node.nodeType === 1){
			this.push(node, tag, id, classes, attributes, pseudos);
			break;
		}
	},
	
	'!^': function(node, tag, id, classes, attributes, pseudos){ // last child
		node = node.lastChild;
		if (node){
			if (node.nodeType === 1) this.push(node, tag, id, classes, attributes, pseudos);
			else this['combinator:!+'](node, tag, id, classes, attributes, pseudos);
		}
	},

	'!~': function(node, tag, id, classes, attributes, pseudos){ // previous siblings
		while ((node = node.previousSibling)){
			if (node.nodeType !== 1) continue;
			var uid = this.getUID(node);
			if (this.bitUniques[uid]) break;
			this.bitUniques[uid] = true;
			this.push(node, tag, id, classes, attributes, pseudos);
		}
	}

};

for (var c in combinators) local['combinator:' + c] = combinators[c];

var pseudos = {
	
	/*<pseudo-selectors>*/

	'empty': function(node){
		var child = node.firstChild;
		return !(child && child.nodeType == 1) && !(node.innerText || node.textContent || '').length;
	},

	'not': function(node, expression){
		return !this.matchNode(node, expression);
	},

	'contains': function(node, text){
		return (node.innerText || node.textContent || '').indexOf(text) > -1;
	},

	'first-child': function(node){
		while ((node = node.previousSibling)) if (node.nodeType === 1) return false;
		return true;
	},

	'last-child': function(node){
		while ((node = node.nextSibling)) if (node.nodeType === 1) return false;
		return true;
	},

	'only-child': function(node){
		var prev = node;
		while ((prev = prev.previousSibling)) if (prev.nodeType === 1) return false;
		var next = node;
		while ((next = next.nextSibling)) if (next.nodeType === 1) return false;
		return true;
	},
	
	/*<nth-pseudo-selectors>*/

	'nth-child': local.createNTHPseudo('firstChild', 'nextSibling', 'posNTH'),
	
	'nth-last-child': local.createNTHPseudo('lastChild', 'previousSibling', 'posNTHLast'),
	
	'nth-of-type': local.createNTHPseudo('firstChild', 'nextSibling', 'posNTHType', true),
	
	'nth-last-of-type': local.createNTHPseudo('lastChild', 'previousSibling', 'posNTHTypeLast', true),
	
	'index': function(node, index){
		return this['pseudo:nth-child'](node, '' + index + 1);
	},

	'even': function(node, argument){
		return this['pseudo:nth-child'](node, '2n');
	},

	'odd': function(node, argument){
		return this['pseudo:nth-child'](node, '2n+1');
	},
	
	/*</nth-pseudo-selectors>*/
	
	/*<of-type-pseudo-selectors>*/
	
	'first-of-type': function(node){
		var nodeName = node.nodeName;
		while ((node = node.previousSibling)) if (node.nodeName === nodeName) return false;
		return true;
	},
	
	'last-of-type': function(node){
		var nodeName = node.nodeName;
		while ((node = node.nextSibling)) if (node.nodeName === nodeName) return false;
		return true;
	},
	
	'only-of-type': function(node){
		var prev = node, nodeName = node.nodeName;
		while ((prev = prev.previousSibling)) if (prev.nodeName === nodeName) return false;
		var next = node;
		while ((next = next.nextSibling)) if (next.nodeName === nodeName) return false;
		return true;
	},
	
	/*</of-type-pseudo-selectors>*/

	// custom pseudos

	'enabled': function(node){
		return (node.disabled === false);
	},
	
	'disabled': function(node){
		return (node.disabled === true);
	},

	'checked': function(node){
		return node.checked;
	},

	'selected': function(node){
		return node.selected;
	},
	
	'focus': function(node){
		return !this.isXMLDocument && this.document.activeElement === node && (node.href || node.type || this.hasAttribute(node, 'tabindex'));
	}
	
	/*</pseudo-selectors>*/
};

for (var p in pseudos) local['pseudo:' + p] = pseudos[p];

// attributes methods

local.attributeGetters = {

	'class': function(){
		return ('className' in this) ? this.className : this.getAttribute('class');
	},
	
	'for': function(){
		return ('htmlFor' in this) ? this.htmlFor : this.getAttribute('for');
	},
	
	'href': function(){
		return ('href' in this) ? this.getAttribute('href', 2) : this.getAttribute('href');
	},
	
	'style': function(){
		return (this.style) ? this.style.cssText : this.getAttribute('style');
	}

};

local.getAttribute = function(node, name){
	// FIXME: check if getAttribute() will get input elements on a form on this browser
	// getAttribute is faster than getAttributeNode().nodeValue
	var method = this.attributeGetters[name];
	if (method) return method.call(node);
	var attributeNode = node.getAttributeNode(name);
	return attributeNode ? attributeNode.nodeValue : null;
};

// overrides

local.overrides = [];

local.override = function(regexp, method){
	this.overrides.push({regexp: regexp, method: method});
};

/*<overrides>*/

/*<query-selector-override>*/

local.override(/./, function(expression, found, first){ //querySelectorAll override

	if (!this.querySelectorAll || this.nodeType != 9 || local.isXMLDocument || local.brokenMixedCaseQSA || Slick.disableQSA) return false;
	
	var nodes, node;
	try {
		if (first) return this.querySelector(expression) || null;
		else nodes = this.querySelectorAll(expression);
	} catch(error){
		return false;
	}

	var i, hasOthers = !!(found.length);

	if (local.starSelectsClosedQSA) for (i = 0; node = nodes[i++];){
		if (node.nodeName > '@' && (!hasOthers || !local.uniques[local.getUIDHTML(node)])) found.push(node);
	} else for (i = 0; node = nodes[i++];){
		if (!hasOthers || !local.uniques[local.getUIDHTML(node)]) found.push(node);
	}

	if (hasOthers) local.sort(found);

	return true;

});

/*</query-selector-override>*/

/*<tag-override>*/

local.override(/^[\w-]+$|^\*$/, function(expression, found, first){ // tag override
	var tag = expression;
	if (tag == '*' && local.brokenStarGEBTN) return false;
	
	var nodes = this.getElementsByTagName(tag);
	
	if (first) return nodes[0] || null;
	var i, node, hasOthers = !!(found.length);
	
	for (i = 0; node = nodes[i++];){
		if (!hasOthers || !local.uniques[local.getUID(node)]) found.push(node);
	}
	
	if (hasOthers) local.sort(found);

	return true;
});

/*</tag-override>*/

/*<class-override>*/

local.override(/^\.[\w-]+$/, function(expression, found, first){ // class override
	if (local.isXMLDocument || (!this.getElementsByClassName && this.querySelectorAll)) return false;
	
	var nodes, node, i, hasOthers = !!(found && found.length), className = expression.substring(1);
	if (this.getElementsByClassName && !local.brokenGEBCN){
		nodes = this.getElementsByClassName(className);
		if (first) return nodes[0] || null;
		for (i = 0; node = nodes[i++];){
			if (!hasOthers || !local.uniques[local.getUIDHTML(node)]) found.push(node);
		}
	} else {
		var matchClass = new RegExp('(^|\\s)'+ Slick.escapeRegExp(className) +'(\\s|$)');
		nodes = this.getElementsByTagName('*');
		for (i = 0; node = nodes[i++];){
			className = node.className;
			if (!className || !matchClass.test(className)) continue;
			if (first) return node;
			if (!hasOthers || !local.uniques[local.getUIDHTML(node)]) found.push(node);
		}
	}
	if (hasOthers) local.sort(found);
	return (first) ? null : true;
});

/*</class-override>*/

/*<id-override>*/

local.override(/^#[\w-]+$/, function(expression, found, first){ // ID override
	if (local.isXMLDocument || this.nodeType != 9) return false;
	
	var id = expression.substring(1), el = this.getElementById(id);
	if (!el) return found;
	if (local.idGetsName && el.getAttributeNode('id').nodeValue != id) return false;
	if (first) return el || null;
	var hasOthers = !!(found.length);
	if (!hasOthers || !local.uniques[local.getUIDHTML(el)]) found.push(el);
	if (hasOthers) local.sort(found);
	return true;
});

/*</id-override>*/

/*</overrides>*/

if (typeof document != 'undefined') local.setDocument(document);

// Slick

var Slick = local.Slick = (this.Slick || {});

Slick.version = '0.9dev';

// Slick finder

Slick.search = function(context, expression, append){
	return local.search(context, expression, append);
};

Slick.find = function(context, expression){
	return local.search(context, expression, null, true);
};

// Slick containment checker

Slick.contains = function(container, node){
	local.setDocument(container);
	return local.contains(container, node);
};

// Slick attribute getter

Slick.getAttribute = function(node, name){
	return local.getAttribute(node, name);
};

// Slick matcher

Slick.match = function(node, selector){
	if (!(node && selector)) return false;
	if (!selector || selector === node) return true;
	if (typeof selector != 'string') return false;
	local.setDocument(node);
	return local.matchNode(node, selector);
};

// Slick attribute accessor

Slick.defineAttributeGetter = function(name, fn){
	local.attributeGetters[name] = fn;
	return this;
};

Slick.lookupAttributeGetter = function(name){
	return local.attributeGetters[name];
};

// Slick pseudo accessor

Slick.definePseudo = function(name, fn){
	local['pseudo:' + name] = function(node, argument){
		return fn.call(node, argument);
	};
	return this;
};

Slick.lookupPseudo = function(name){
	var pseudo = local['pseudo:' + name];
	if (pseudo) return function(argument){
		return pseudo.call(this, argument);
	};
	return null;
};

// Slick overrides accessor

Slick.override = function(regexp, fn){
	local.override(regexp, fn);
	return this;
};

Slick.isXML = local.isXML;

Slick.uidOf = function(node){
	return local.getUIDHTML(node);
};

if (!this.Slick) this.Slick = Slick;
	
}).apply(/*<CommonJS>*/(typeof exports != 'undefined') ? exports : /*</CommonJS>*/this);


/*
---

name: Element

description: One of the most important items in MooTools. Contains the dollar function, the dollars function, and an handful of cross-browser, time-saver methods to let you easily work with HTML Elements.

license: MIT-style license.

requires: [Window, Document, Array, String, Function, Number, Slick.Parser, Slick.Finder]

provides: [Element, Elements, $, $$, Iframe]

...
*/

// it needs to be this.Element cause IE8 erases the Element Object while pre-processing this script
this.Element = function(tag, props){
	var konstructor = Element.Constructors[tag];
	if (konstructor) return konstructor(props);
	if (typeof tag != 'string') return document.id(tag).set(props);
	
	if (!props) props = {};
	
	if (!tag.test(/^[\w-]+$/)){
		var parsed = Slick.parse(tag).expressions[0][0];
		tag = (parsed.tag == '*') ? 'div' : parsed.tag;
		if (parsed.id && props.id == null) props.id = parsed.id;
		
		var attributes = parsed.attributes;
		if (attributes) for (var i = 0, l = attributes.length; i < l; i++){
			var attr = attributes[i];
			if (attr.value != null && attr.operator == '=' && props[attr.key] == null)
				props[attr.key] = attr.value;
		}
		
		if (parsed.classList && props['class'] == null) props['class'] = parsed.classList.join(' ');
	}
	
	return document.newElement(tag, props);
};
	
if (Browser.Element){
	Element.prototype = Browser.Element.prototype;
}

new Type('Element', Element).mirror(function(name, method){
	var obj = {};
	obj[name] = function(){
		var results = [], args = arguments, elements = true;
		for (var i = 0, l = this.length; i < l; i++){
			var element = this[i], result = results[i] = element[name].apply(element, args);
			elements = (elements && typeOf(result) == 'element');
		}
		return (elements) ? new Elements(results) : results;
	};
	
	Elements.implement(obj);
});

if (!Browser.Element){
	Element.parent = Object;

	Element.ProtoType = {'$family': Function.from('element').hide()};

	Element.mirror(function(name, method){
		Element.ProtoType[name] = method;
	});
}

Element.Constructors = {};

//<1.2compat>

Element.Constructors = new Hash;

//</1.2compat>

var IFrame = new Type('IFrame', function(){
	var params = Array.link(arguments, {
		properties: Type.isObject,
		iframe: function(obj){
			return (obj != null);
		}
	});
	var props = params.properties || {};
	var iframe = document.id(params.iframe);
	var onload = props.onload || function(){};
	delete props.onload;
	props.id = props.name = [props.id, props.name, iframe ? (iframe.id || iframe.name) : 'IFrame_' + Date.now()].pick();
	iframe = new Element(iframe || 'iframe', props);
	var onFrameLoad = function(){
		var host = Function.attempt(function(){
			return iframe.contentWindow.location.host;
		});
		if (!host || host == window.location.host){
			var win = new Window(iframe.contentWindow);
			new Document(iframe.contentWindow.document);
			Object.append(win.Element.prototype, Element.ProtoType);
		}
		onload.call(iframe.contentWindow, iframe.contentWindow.document);
	};
	var contentWindow = Function.attempt(function(){
		return iframe.contentWindow;
	});
	((contentWindow && contentWindow.document.body) || window.frames[props.id]) ? onFrameLoad() : iframe.addListener('load', onFrameLoad);
	return iframe;
});
 
var Elements = this.Elements = function(nodes){
	if (nodes && nodes.length){
		var uniques = {}, node;
		for (var i = 0; node = nodes[i++];){
			var uid = Slick.uidOf(node);
			if (!uniques[uid]){
				uniques[uid] = true;
				this.push(node);
			}
		}
	}
};
 
Elements.prototype = {length: 0};
Elements.parent = Array;

new Type('Elements', Elements).implement({
 
	filter: function(filter, bind){
		if (!filter) return this;
		return new Elements(Array.filter(this, (typeOf(filter) == 'string') ? function(item){
			return item.match(filter);
		} : filter, bind));
	}.protect(),
 
	push: function(){
		var length = this.length;
		for (var i = 0, l = arguments.length; i < l; i++){
			var item = document.id(arguments[i]);
			if (item) this[length++] = item;
		}
		return (this.length = length);
	}.protect()
 
}).implement(Array.prototype);
 
Array.mirror(Elements);

Document.implement({

	newElement: function(tag, props){
		if (props && props.checked != null) props.defaultChecked = props.checked;
		return this.id(this.createElement(tag)).set(props);
	},

	newTextNode: function(text){
		return this.createTextNode(text);
	},

	getDocument: function(){
		return this;
	},

	getWindow: function(){
		return this.window;
	},
	
	id: (function(){
		
		var types = {

			string: function(id, nocash, doc){
				id = Slick.find(doc, '#' + id);
				return (id) ? types.element(id, nocash) : null;
			},
			
			element: function(el, nocash){
				$uid(el);
				if (!nocash && !el.$family && !(/^object|embed$/i).test(el.tagName)){
					Object.append(el, Element.ProtoType);
				}
				return el;
			},
			
			object: function(obj, nocash, doc){
				if (obj.toElement) return types.element(obj.toElement(doc), nocash);
				return null;
			}
			
		};

		types.textnode = types.whitespace = types.window = types.document = function(zero){
			return zero;
		};
		
		return function(el, nocash, doc){
			if (el && el.$family && el.uid) return el;
			var type = typeOf(el);
			return (types[type]) ? types[type](el, nocash, doc || document) : null;
		};

	})()

});

if (window.$ == null) Window.implement('$', function(el, nc){
	return document.id(el, nc, this.document);
});

Window.implement({

	getDocument: function(){
		return this.document;
	},

	getWindow: function(){
		return this;
	}

});

[Document, Element].invoke('implement', {
 
	getElements: function(expression){
		return Slick.search(this, expression, new Elements);
	},
 
	getElement: function(expression){
		return document.id(Slick.find(this, expression));
	}
 
});

//<1.2compat>

if (window.$$ == null) Window.implement('$$', function(selector){
	var elements = new Elements;
	if (arguments.length == 1 && typeof selector == 'string') return Slick.search(this.document, selector, elements);
	var args = Array.flatten(arguments);
	for (var i = 0, l = args.length; i < l; i++){
		var item = args[i];
		switch (typeOf(item)){
			case 'element': elements.push(item); break;
			case 'string': Slick.search(this.document, item, elements);
		}
	}
	return elements;
});

//</1.2compat>

if (window.$$ == null) Window.implement('$$', function(selector){
	if (arguments.length == 1){
		if (typeof selector == 'string') return Slick.search(this.document, selector, new Elements);
		else if (Type.isEnumerable(selector)) return new Elements(selector);
	}
	return new Elements(arguments);
});

(function(){

var collected = {}, storage = {};
var props = {input: 'checked', option: 'selected', textarea: 'value'};

var get = function(uid){
	return (storage[uid] || (storage[uid] = {}));
};

var clean = function(item){
	if (item.removeEvents) item.removeEvents();
	if (item.clearAttributes) item.clearAttributes();
	var uid = item.uid;
	if (uid != null){
		delete collected[uid];
		delete storage[uid];
	}
	return item;
};

var camels = ['defaultValue', 'accessKey', 'cellPadding', 'cellSpacing', 'colSpan', 'frameBorder', 'maxLength', 'readOnly',
	'rowSpan', 'tabIndex', 'useMap'
];
var bools = ['compact', 'nowrap', 'ismap', 'declare', 'noshade', 'checked', 'disabled', 'readOnly', 'multiple', 'selected',
	'noresize', 'defer'
];
 var attributes = {
	'html': 'innerHTML',
	'class': 'className',
	'for': 'htmlFor',
	'text': (function(){
		var temp = document.createElement('div');
		return (temp.innerText == null) ? 'textContent' : 'innerText';
	})()
};
var readOnly = ['type'];
var expandos = ['value', 'defaultValue'];
var uriAttrs = /^href|src|usemap$/i;

bools = bools.associate(bools);
camels = camels.associate(camels.map(String.toLowerCase));
readOnly = readOnly.associate(readOnly);

Object.append(attributes, expandos.associate(expandos));

var inserters = {

	before: function(context, element){
		var parent = element.parentNode;
		if (parent) parent.insertBefore(context, element);
	},

	after: function(context, element){
		var parent = element.parentNode;
		if (parent) parent.insertBefore(context, element.nextSibling);
	},

	bottom: function(context, element){
		element.appendChild(context);
	},

	top: function(context, element){
		element.insertBefore(context, element.firstChild);
	}

};

inserters.inside = inserters.bottom;

//<1.2compat>

Object.each(inserters, function(inserter, where){

	where = where.capitalize();
	
	var methods = {};
	
	methods['inject' + where] = function(el){
		inserter(this, document.id(el, true));
		return this;
	};
	
	methods['grab' + where] = function(el){
		inserter(document.id(el, true), this);
		return this;
	};

	Element.implement(methods);

});

//</1.2compat>

Element.implement({

	set: function(prop, value){
		var property = Element.Properties[prop];
		(property && property.set) ? property.set.apply(this, Array.slice(arguments, 1)) : this.setProperty(prop, value);
	}.overloadSetter(),

	get: function(prop){
		var property = Element.Properties[prop];
		return (property && property.get) ? property.get.apply(this, Array.slice(arguments, 1)) : this.getProperty(prop);
	}.overloadGetter(),

	erase: function(prop){
		var property = Element.Properties[prop];
		(property && property.erase) ? property.erase.apply(this) : this.removeProperty(prop);
		return this;
	},

	setProperty: function(attribute, value){
		attribute = camels[attribute] || attribute;
		if (value == null) return this.removeProperty(attribute);
		var key = attributes[attribute];
		(key) ? this[key] = value :
			(bools[attribute]) ? this[attribute] = !!value : this.setAttribute(attribute, '' + value);
		return this;
	},

	setProperties: function(attributes){
		for (var attribute in attributes) this.setProperty(attribute, attributes[attribute]);
		return this;
	},

	getProperty: function(attribute){
		attribute = camels[attribute] || attribute;
		var key = attributes[attribute] || readOnly[attribute];
		return (key) ? this[key] :
			(bools[attribute]) ? !!this[attribute] :
			(uriAttrs.test(attribute) ? this.getAttribute(attribute, 2) :
			(key = this.getAttributeNode(attribute)) ? key.nodeValue : null) || null;
	},

	getProperties: function(){
		var args = Array.from(arguments);
		return args.map(this.getProperty, this).associate(args);
	},

	removeProperty: function(attribute){
		attribute = camels[attribute] || attribute;
		var key = attributes[attribute];
		(key) ? this[key] = '' :
			(bools[attribute]) ? this[attribute] = false : this.removeAttribute(attribute);
		return this;
	},

	removeProperties: function(){
		Array.each(arguments, this.removeProperty, this);
		return this;
	},

	hasClass: function(className){
		return this.className.contains(className, ' ');
	},

	addClass: function(className){
		if (!this.hasClass(className)) this.className = (this.className + ' ' + className).clean();
		return this;
	},

	removeClass: function(className){
		this.className = this.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
		return this;
	},

	toggleClass: function(className, force){
		if (force == null) force = !this.hasClass(className);
		return (force) ? this.addClass(className) : this.removeClass(className);
	},

	adopt: function(){
		var parent = this, fragment, elements = Array.flatten(arguments), length = elements.length;
		if (length > 1) parent = fragment = document.createDocumentFragment();
		
		for (var i = 0; i < length; i++){
			var element = document.id(elements[i], true);
			if (element) parent.appendChild(element);
		}
		
		if (fragment) this.appendChild(fragment);
		
		return this;
	},

	appendText: function(text, where){
		return this.grab(this.getDocument().newTextNode(text), where);
	},

	grab: function(el, where){
		inserters[where || 'bottom'](document.id(el, true), this);
		return this;
	},

	inject: function(el, where){
		inserters[where || 'bottom'](this, document.id(el, true));
		return this;
	},

	replaces: function(el){
		el = document.id(el, true);
		el.parentNode.replaceChild(this, el);
		return this;
	},

	wraps: function(el, where){
		el = document.id(el, true);
		return this.replaces(el).grab(el, where);
	},

	getPrevious: function(match){
		return document.id(Slick.find(this, '!~ ' + (match || '')));
	},

	getAllPrevious: function(match){
		return Slick.search(this, '!~ ' + (match || ''), new Elements);
	},

	getNext: function(match){
		return document.id(Slick.find(this, '~ ' + (match || '')));
	},

	getAllNext: function(match){
		return Slick.search(this, '~ ' + (match || ''), new Elements);
	},

	getFirst: function(match){
		return document.id(Slick.find(this, '> ' + (match || '')));
	},

	getLast: function(match){
		return document.id(Slick.find(this, '!^ ' + (match || '')));
	},

	getParent: function(match){
		return document.id(Slick.find(this, '! ' + (match || '')));
	},

	getParents: function(match){
		return Slick.search(this, '! ' + (match || ''), new Elements);
	},
	
	getSiblings: function(match){
		return Slick.search(this, '~~ ' + (match || ''), new Elements);
	},

	getChildren: function(match){
		return Slick.search(this, '> ' + (match || ''), new Elements);
	},

	getWindow: function(){
		return this.ownerDocument.window;
	},

	getDocument: function(){
		return this.ownerDocument;
	},

	getElementById: function(id){
		return document.id(Slick.find(this, '#' + id));
	},

	getSelected: function(){
		this.selectedIndex; // Safari 3.2.1
		return new Elements(Array.from(this.options).filter(function(option){
			return option.selected;
		}));
	},

	toQueryString: function(){
		var queryString = [];
		this.getElements('input, select, textarea').each(function(el){
			var type = el.type;
			if (!el.name || el.disabled || type == 'submit' || type == 'reset' || type == 'file' || type == 'image') return;
			
			var value = (el.get('tag') == 'select') ? el.getSelected().map(function(opt){
				// IE
				return document.id(opt).get('value');
			}) : ((type == 'radio' || type == 'checkbox') && !el.checked) ? null : el.get('value');
			
			Array.from(value).each(function(val){
				if (typeof val != 'undefined') queryString.push(encodeURIComponent(el.name) + '=' + encodeURIComponent(val));
			});
		});
		return queryString.join('&');
	},

	clone: function(contents, keepid){
		contents = contents !== false;
		var clone = this.cloneNode(contents);
		var clean = function(node, element){
			if (!keepid) node.removeAttribute('id');
			if (Browser.ie){
				node.clearAttributes();
				node.mergeAttributes(element);
				node.removeAttribute('uid');
				if (node.options){
					var no = node.options, eo = element.options;
					for (var j = no.length; j--;) no[j].selected = eo[j].selected;
				}
			}
			var prop = props[element.tagName.toLowerCase()];
			if (prop && element[prop]) node[prop] = element[prop];
		};

		if (contents){
			var ce = clone.getElementsByTagName('*'), te = this.getElementsByTagName('*');
			for (var i = ce.length; i--;) clean(ce[i], te[i]);
		}

		clean(clone, this);
		return document.id(clone);
	},
	
	destroy: function(){
		var children = clean(this).getElementsByTagName('*');
		Array.each(children, clean);
		Element.dispose(this);
		return null;
	},
	
	empty: function(){
		Array.from(this.childNodes).each(Element.dispose);
		return this;
	},

	dispose: function(){
		return (this.parentNode) ? this.parentNode.removeChild(this) : this;
	},

	match: function(expression){
		return !expression || Slick.match(this, expression);
	}

});

var contains = {contains: function(element){
	return Slick.contains(this, element);
}};

if (!document.contains) Document.implement(contains);
if (!document.createElement('div').contains) Element.implement(contains);

//<1.2compat>

Element.implement('hasChild', function(element){
	return this !== element && this.contains(element);
});

//</1.2compat>

[Element, Window, Document].invoke('implement', {

	addListener: function(type, fn){
		if (type == 'unload'){
			var old = fn, self = this;
			fn = function(){
				self.removeListener('unload', fn);
				old();
			};
		} else {
			collected[this.uid] = this;
		}
		if (this.addEventListener) this.addEventListener(type, fn, false);
		else this.attachEvent('on' + type, fn);
		return this;
	},

	removeListener: function(type, fn){
		if (this.removeEventListener) this.removeEventListener(type, fn, false);
		else this.detachEvent('on' + type, fn);
		return this;
	},

	retrieve: function(property, dflt){
		var storage = get(this.uid), prop = storage[property];
		if (dflt != null && prop == null) prop = storage[property] = dflt;
		return prop != null ? prop : null;
	},

	store: function(property, value){
		var storage = get(this.uid);
		storage[property] = value;
		return this;
	},

	eliminate: function(property){
		var storage = get(this.uid);
		delete storage[property];
		return this;
	}

});

// purge

window.addListener('unload', function(){
	Object.each(collected, clean);
	if (window.CollectGarbage) CollectGarbage();
});

})();

Element.Properties = {};

//<1.2compat>

Element.Properties = new Hash;

//</1.2compat>

Element.Properties.style = {

	set: function(style){
		this.style.cssText = style;
	},

	get: function(){
		return this.style.cssText;
	},

	erase: function(){
		this.style.cssText = '';
	}

};

Element.Properties.tag = {

	get: function(){
		return this.tagName.toLowerCase();
	}

};

(function(maxLength){
	if (maxLength != null) Element.Properties.maxlength = Element.Properties.maxLength = {
		get: function(){
			var maxlength = this.getAttribute('maxLength');
			return maxlength == maxLength ? null : maxlength;
		}
	};
})(document.createElement('input').getAttribute('maxLength'));

Element.Properties.html = (function(){
	
	var tableTest = Function.attempt(function(){
		var table = document.createElement('table');
		table.innerHTML = '<tr><td></td></tr>';
	});
	
	var wrapper = document.createElement('div');

	var translations = {
		table: [1, '<table>', '</table>'],
		select: [1, '<select>', '</select>'],
		tbody: [2, '<table><tbody>', '</tbody></table>'],
		tr: [3, '<table><tbody><tr>', '</tr></tbody></table>']
	};
	translations.thead = translations.tfoot = translations.tbody;

	var html = {
		set: function(){
			var html = Array.flatten(arguments).join('');
			var wrap = (!tableTest && translations[this.get('tag')]);
			if (wrap){
				var first = wrapper;
				first.innerHTML = wrap[1] + html + wrap[2];
				for (var i = wrap[0]; i--;) first = first.firstChild;
				this.empty().adopt(first.childNodes);
			} else {
				this.innerHTML = html;
			}
		}
	};

	html.erase = html.set;

	return html;
})();


/*
---

name: Element.Style

description: Contains methods for interacting with the styles of Elements in a fashionable way.

license: MIT-style license.

requires: Element

provides: Element.Style

...
*/

(function(){

var html = document.html;

Element.Properties.styles = {set: function(styles){
	this.setStyles(styles);
}};

var hasOpacity = (html.style.opacity != null);
var reAlpha = /alpha\(opacity=([\d.]+)\)/i;

Element.Properties.opacity = {

	set: function(opacity, novisibility){
		if (!novisibility){
			if (opacity == 0){
				if (this.style.visibility != 'hidden') this.style.visibility = 'hidden';
			} else {
				if (this.style.visibility != 'visible') this.style.visibility = 'visible';
			}
		}
		if (!this.currentStyle || !this.currentStyle.hasLayout) this.style.zoom = 1;
		if (hasOpacity){
			this.style.opacity = opacity;
		} else {
			opacity = (opacity == 1) ? '' : 'alpha(opacity=' + opacity * 100 + ')';
			var filter = this.style.filter || this.getComputedStyle('filter') || '';
			this.style.filter = filter.test(reAlpha) ? filter.replace(reAlpha, opacity) : filter + opacity;
		}
	}

};

Element.Properties.opacity.get = (hasOpacity) ? function(){
	opacity = this.style.opacity || this.getComputedStyle('opacity');
	return (opacity == '') ? 1 : opacity;
} : function(){
	var opacity, filter = this.style.filter || this.getComputedStyle('filter');
	if (filter) opacity = filter.match(reAlpha);
	return (opacity == null || filter == null) ? 1 : opacity[1] / 100;
};

var floatName = (html.style.cssFloat == null) ? 'styleFloat' : 'cssFloat';

Element.implement({

	getComputedStyle: function(property){
		if (this.currentStyle) return this.currentStyle[property.camelCase()];
		var defaultView = Element.getDocument(this).defaultView,
			computed = defaultView ? defaultView.getComputedStyle(this, null) : null;
		return (computed) ? computed.getPropertyValue((property == floatName) ? 'float' : property.hyphenate()) : null;
	},

	setOpacity: function(value){
		return this.set('opacity', value, true);
	},

	getOpacity: function(){
		return this.get('opacity');
	},

	setStyle: function(property, value){
		switch (property){
			case 'opacity': return this.set('opacity', parseFloat(value));
			case 'float': property = floatName;
		}
		property = property.camelCase();
		if (typeOf(value) != 'string'){
			var map = (Element.Styles[property] || '@').split(' ');
			value = Array.from(value).map(function(val, i){
				if (!map[i]) return '';
				return (typeOf(val) == 'number') ? map[i].replace('@', Math.round(val)) : val;
			}).join(' ');
		} else if (value == String(Number(value))){
			value = Math.round(value);
		}
		this.style[property] = value;
		return this;
	},

	getStyle: function(property){
		switch (property){
			case 'opacity': return this.get('opacity');
			case 'float': property = floatName;
		}
		property = property.camelCase();
		var result = this.style[property];
		if (!result || property == 'zIndex'){
			result = [];
			for (var style in Element.ShortStyles){
				if (property != style) continue;
				for (var s in Element.ShortStyles[style]) result.push(this.getStyle(s));
				return result.join(' ');
			}
			result = this.getComputedStyle(property);
		}
		if (result){
			result = String(result);
			var color = result.match(/rgba?\([\d\s,]+\)/);
			if (color) result = result.replace(color[0], color[0].rgbToHex());
		}
		if (Browser.opera || (Browser.ie && isNaN(result))){
			if (property.test(/^(height|width)$/)){
				var values = (property == 'width') ? ['left', 'right'] : ['top', 'bottom'], size = 0;
				values.each(function(value){
					size += this.getStyle('border-' + value + '-width').toInt() + this.getStyle('padding-' + value).toInt();
				}, this);
				return this['offset' + property.capitalize()] - size + 'px';
			}
			if (Browser.opera && String(result).test('px')) return result;
			if (property.test(/(border(.+)Width|margin|padding)/)) return '0px';
		}
		return result;
	},

	setStyles: function(styles){
		for (var style in styles) this.setStyle(style, styles[style]);
		return this;
	},

	getStyles: function(){
		var result = {};
		Array.flatten(arguments).each(function(key){
			result[key] = this.getStyle(key);
		}, this);
		return result;
	}

});

Element.Styles = {
	left: '@px', top: '@px', bottom: '@px', right: '@px',
	width: '@px', height: '@px', maxWidth: '@px', maxHeight: '@px', minWidth: '@px', minHeight: '@px',
	backgroundColor: 'rgb(@, @, @)', backgroundPosition: '@px @px', color: 'rgb(@, @, @)',
	fontSize: '@px', letterSpacing: '@px', lineHeight: '@px', clip: 'rect(@px @px @px @px)',
	margin: '@px @px @px @px', padding: '@px @px @px @px', border: '@px @ rgb(@, @, @) @px @ rgb(@, @, @) @px @ rgb(@, @, @)',
	borderWidth: '@px @px @px @px', borderStyle: '@ @ @ @', borderColor: 'rgb(@, @, @) rgb(@, @, @) rgb(@, @, @) rgb(@, @, @)',
	zIndex: '@', 'zoom': '@', fontWeight: '@', textIndent: '@px', opacity: '@'
};

//<1.2compat>

Element.Styles = new Hash(Element.Styles);

//</1.2compat>

Element.ShortStyles = {margin: {}, padding: {}, border: {}, borderWidth: {}, borderStyle: {}, borderColor: {}};

['Top', 'Right', 'Bottom', 'Left'].each(function(direction){
	var Short = Element.ShortStyles;
	var All = Element.Styles;
	['margin', 'padding'].each(function(style){
		var sd = style + direction;
		Short[style][sd] = All[sd] = '@px';
	});
	var bd = 'border' + direction;
	Short.border[bd] = All[bd] = '@px @ rgb(@, @, @)';
	var bdw = bd + 'Width', bds = bd + 'Style', bdc = bd + 'Color';
	Short[bd] = {};
	Short.borderWidth[bdw] = Short[bd][bdw] = All[bdw] = '@px';
	Short.borderStyle[bds] = Short[bd][bds] = All[bds] = '@';
	Short.borderColor[bdc] = Short[bd][bdc] = All[bdc] = 'rgb(@, @, @)';
});

})();


/*
---

name: Element.Event

description: Contains Element methods for dealing with events. This file also includes mouseenter and mouseleave custom Element Events.

license: MIT-style license.

requires: [Element, Event]

provides: Element.Event

...
*/

Element.Properties.events = {set: function(events){
	this.addEvents(events);
}};

[Element, Window, Document].invoke('implement', {

	addEvent: function(type, fn){
		var events = this.retrieve('events', {});
		events[type] = events[type] || {keys: [], values: []};
		if (events[type].keys.contains(fn)) return this;
		events[type].keys.push(fn);
		var realType = type, custom = Element.Events[type], condition = fn, self = this;
		if (custom){
			if (custom.onAdd) custom.onAdd.call(this, fn);
			if (custom.condition){
				condition = function(event){
					if (custom.condition.call(this, event)) return fn.call(this, event);
					return true;
				};
			}
			realType = custom.base || realType;
		}
		var defn = function(){
			return fn.call(self);
		};
		var nativeEvent = Element.NativeEvents[realType];
		if (nativeEvent){
			if (nativeEvent == 2){
				defn = function(event){
					event = new Event(event, self.getWindow());
					if (condition.call(self, event) === false) event.stop();
				};
			}
			this.addListener(realType, defn);
		}
		events[type].values.push(defn);
		return this;
	},

	removeEvent: function(type, fn){
		var events = this.retrieve('events');
		if (!events || !events[type]) return this;
		var pos = events[type].keys.indexOf(fn);
		if (pos == -1) return this;
		events[type].keys.splice(pos, 1);
		var value = events[type].values.splice(pos, 1)[0];
		var custom = Element.Events[type];
		if (custom){
			if (custom.onRemove) custom.onRemove.call(this, fn);
			type = custom.base || type;
		}
		return (Element.NativeEvents[type]) ? this.removeListener(type, value) : this;
	},

	addEvents: function(events){
		for (var event in events) this.addEvent(event, events[event]);
		return this;
	},

	removeEvents: function(events){
		var type;
		if (typeOf(events) == 'object'){
			for (type in events) this.removeEvent(type, events[type]);
			return this;
		}
		var attached = this.retrieve('events');
		if (!attached) return this;
		if (!events){
			for (type in attached) this.removeEvents(type);
			this.eliminate('events');
		} else if (attached[events]){
			while (attached[events].keys[0]) this.removeEvent(events, attached[events].keys[0]);
			attached[events] = null;
		}
		return this;
	},

	fireEvent: function(type, args, delay){
		var events = this.retrieve('events');
		if (!events || !events[type]) return this;
		events[type].keys.each(function(fn){
			(delay) ? fn.delay(delay, this, args) : fn.run(args, this);
		}, this);
		return this;
	},

	cloneEvents: function(from, type){
		from = document.id(from);
		var events = from.retrieve('events');
		if (!events) return this;
		if (!type){
			for (var eventType in events) this.cloneEvents(from, eventType);
		} else if (events[type]){
			events[type].keys.each(function(fn){
				this.addEvent(type, fn);
			}, this);
		}
		return this;
	}

});

Element.NativeEvents = {
	click: 2, dblclick: 2, mouseup: 2, mousedown: 2, contextmenu: 2, //mouse buttons
	mousewheel: 2, DOMMouseScroll: 2, //mouse wheel
	mouseover: 2, mouseout: 2, mousemove: 2, selectstart: 2, selectend: 2, //mouse movement
	keydown: 2, keypress: 2, keyup: 2, //keyboard
	orientationchange: 2, // mobile
	touchstart: 2, touchmove: 2, touchend: 2, touchcancel: 2, // touch
	gesturestart: 2, gesturechange: 2, gestureend: 2, // gesture
	focus: 2, blur: 2, change: 2, reset: 2, select: 2, submit: 2, //form elements
	load: 2, unload: 1, beforeunload: 2, resize: 1, move: 1, DOMContentLoaded: 1, readystatechange: 1, //window
	error: 1, abort: 1, scroll: 1 //misc
};

(function(){

var $check = function(event){
	var related = event.relatedTarget;
	if (related == undefined) return true;
	if (related === false) return false;
	return (typeOf(this) != 'document' && related != this && related.prefix != 'xul' && !this.contains(related));
};

Element.Events = {

	mouseenter: {
		base: 'mouseover',
		condition: $check
	},

	mouseleave: {
		base: 'mouseout',
		condition: $check
	},

	mousewheel: {
		base: (Browser.firefox) ? 'DOMMouseScroll' : 'mousewheel'
	}

};

//<1.2compat>

Element.Events = new Hash(Element.Events);

//</1.2compat>

})();


/*
---

name: Element.Dimensions

description: Contains methods to work with size, scroll, or positioning of Elements and the window object.

license: MIT-style license.

credits:
  - Element positioning based on the [qooxdoo](http://qooxdoo.org/) code and smart browser fixes, [LGPL License](http://www.gnu.org/licenses/lgpl.html).
  - Viewport dimensions based on [YUI](http://developer.yahoo.com/yui/) code, [BSD License](http://developer.yahoo.com/yui/license.html).

requires: [Element, Element.Style]

provides: [Element.Dimensions]

...
*/

(function(){

Element.implement({

	scrollTo: function(x, y){
		if (isBody(this)){
			this.getWindow().scrollTo(x, y);
		} else {
			this.scrollLeft = x;
			this.scrollTop = y;
		}
		return this;
	},

	getSize: function(){
		if (isBody(this)) return this.getWindow().getSize();
		return {x: this.offsetWidth, y: this.offsetHeight};
	},

	getScrollSize: function(){
		if (isBody(this)) return this.getWindow().getScrollSize();
		return {x: this.scrollWidth, y: this.scrollHeight};
	},

	getScroll: function(){
		if (isBody(this)) return this.getWindow().getScroll();
		return {x: this.scrollLeft, y: this.scrollTop};
	},

	getScrolls: function(){
		var element = this, position = {x: 0, y: 0};
		while (element && !isBody(element)){
			position.x += element.scrollLeft;
			position.y += element.scrollTop;
			element = element.parentNode;
		}
		return position;
	},

	getOffsetParent: function(){
		var element = this;
		if (isBody(element)) return null;
		if (!Browser.ie) return element.offsetParent;
		while ((element = element.parentNode)){
			if (styleString(element, 'position') != 'static' || isBody(element)) return element;
		}
		return null;
	},

	getOffsets: function(){
		if (this.getBoundingClientRect && !Browser.Platform.ipod){
			var bound = this.getBoundingClientRect(),
				html = document.id(this.getDocument().documentElement),
				htmlScroll = html.getScroll(),
				elemScrolls = this.getScrolls(),
				elemScroll = this.getScroll(),
				isFixed = (styleString(this, 'position') == 'fixed');

			return {
				x: bound.left.toInt() + elemScrolls.x - elemScroll.x + ((isFixed) ? 0 : htmlScroll.x) - html.clientLeft,
				y: bound.top.toInt()  + elemScrolls.y - elemScroll.y + ((isFixed) ? 0 : htmlScroll.y) - html.clientTop
			};
		}

		var element = this, position = {x: 0, y: 0};
		if (isBody(this)) return position;

		while (element && !isBody(element)){
			position.x += element.offsetLeft;
			position.y += element.offsetTop;

			if (Browser.firefox){
				if (!borderBox(element)){
					position.x += leftBorder(element);
					position.y += topBorder(element);
				}
				var parent = element.parentNode;
				if (parent && styleString(parent, 'overflow') != 'visible'){
					position.x += leftBorder(parent);
					position.y += topBorder(parent);
				}
			} else if (element != this && Browser.safari){
				position.x += leftBorder(element);
				position.y += topBorder(element);
			}

			element = element.offsetParent;
		}
		if (Browser.firefox && !borderBox(this)){
			position.x -= leftBorder(this);
			position.y -= topBorder(this);
		}
		return position;
	},

	getPosition: function(relative){
		if (isBody(this)) return {x: 0, y: 0};
		var offset = this.getOffsets(),
				scroll = this.getScrolls();
		var position = {
			x: offset.x - scroll.x,
			y: offset.y - scroll.y
		};
		var relativePosition = (relative && (relative = document.id(relative))) ? relative.getPosition() : {x: 0, y: 0};
		return {x: position.x - relativePosition.x, y: position.y - relativePosition.y};
	},

	getCoordinates: function(element){
		if (isBody(this)) return this.getWindow().getCoordinates();
		var position = this.getPosition(element),
				size = this.getSize();
		var obj = {
			left: position.x,
			top: position.y,
			width: size.x,
			height: size.y
		};
		obj.right = obj.left + obj.width;
		obj.bottom = obj.top + obj.height;
		return obj;
	},

	computePosition: function(obj){
		return {
			left: obj.x - styleNumber(this, 'margin-left'),
			top: obj.y - styleNumber(this, 'margin-top')
		};
	},

	setPosition: function(obj){
		return this.setStyles(this.computePosition(obj));
	}

});


[Document, Window].invoke('implement', {

	getSize: function(){
		if (Browser.opera || Browser.safari){
			var win = this.getWindow();
			return {x: win.innerWidth, y: win.innerHeight};
		}
		var doc = getCompatElement(this);
		return {x: doc.clientWidth, y: doc.clientHeight};
	},

	getScroll: function(){
		var win = this.getWindow(), doc = getCompatElement(this);
		return {x: win.pageXOffset || doc.scrollLeft, y: win.pageYOffset || doc.scrollTop};
	},

	getScrollSize: function(){
		var doc = getCompatElement(this), min = this.getSize();
		return {x: Math.max(doc.scrollWidth, min.x), y: Math.max(doc.scrollHeight, min.y)};
	},

	getPosition: function(){
		return {x: 0, y: 0};
	},

	getCoordinates: function(){
		var size = this.getSize();
		return {top: 0, left: 0, bottom: size.y, right: size.x, height: size.y, width: size.x};
	}

});

// private methods

var styleString = Element.getComputedStyle;

function styleNumber(element, style){
	return styleString(element, style).toInt() || 0;
};

function borderBox(element){
	return styleString(element, '-moz-box-sizing') == 'border-box';
};

function topBorder(element){
	return styleNumber(element, 'border-top-width');
};

function leftBorder(element){
	return styleNumber(element, 'border-left-width');
};

function isBody(element){
	return (/^(?:body|html)$/i).test(element.tagName);
};

function getCompatElement(element){
	var doc = element.getDocument();
	return (!doc.compatMode || doc.compatMode == 'CSS1Compat') ? doc.html : doc.body;
};

})();

//aliases
Element.alias({position: 'setPosition'}); //compatability

[Window, Document, Element].invoke('implement', {

	getHeight: function(){
		return this.getSize().y;
	},

	getWidth: function(){
		return this.getSize().x;
	},

	getScrollTop: function(){
		return this.getScroll().y;
	},

	getScrollLeft: function(){
		return this.getScroll().x;
	},

	getScrollHeight: function(){
		return this.getScrollSize().y;
	},

	getScrollWidth: function(){
		return this.getScrollSize().x;
	},

	getTop: function(){
		return this.getPosition().y;
	},

	getLeft: function(){
		return this.getPosition().x;
	}

});


/*
---

name: Fx

description: Contains the basic animation logic to be extended by all other Fx Classes.

license: MIT-style license.

requires: [Chain, Events, Options]

provides: Fx

...
*/

(function(){

var Fx = this.Fx = new Class({

	Implements: [Chain, Events, Options],

	options: {
		/*
		onStart: nil,
		onCancel: nil,
		onComplete: nil,
		*/
		fps: 50,
		unit: false,
		duration: 500,
		link: 'ignore'
	},

	initialize: function(options){
		this.subject = this.subject || this;
		this.setOptions(options);
	},

	getTransition: function(){
		return function(p){
			return -(Math.cos(Math.PI * p) - 1) / 2;
		};
	},

	step: function(){
		var time = Date.now();
		if (time < this.time + this.options.duration){
			var delta = this.transition((time - this.time) / this.options.duration);
			this.set(this.compute(this.from, this.to, delta));
		} else {
			this.set(this.compute(this.from, this.to, 1));
			this.complete();
		}
	},

	set: function(now){
		return now;
	},

	compute: function(from, to, delta){
		return Fx.compute(from, to, delta);
	},

	check: function(){
		if (!this.timer) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(this.caller.bind(this, arguments)); return false;
		}
		return false;
	},

	start: function(from, to){
		if (!this.check(from, to)) return this;
		var duration = this.options.duration;
		this.options.duration = Fx.Durations[duration] || duration.toInt();
		this.from = from;
		this.to = to;
		this.time = 0;
		this.transition = this.getTransition();
		this.startTimer();
		this.onStart();
		return this;
	},

	complete: function(){
		if (this.stopTimer()) this.onComplete();
		return this;
	},

	cancel: function(){
		if (this.stopTimer()) this.onCancel();
		return this;
	},

	onStart: function(){
		this.fireEvent('start', this.subject);
	},

	onComplete: function(){
		this.fireEvent('complete', this.subject);
		if (!this.callChain()) this.fireEvent('chainComplete', this.subject);
	},

	onCancel: function(){
		this.fireEvent('cancel', this.subject).clearChain();
	},

	pause: function(){
		this.stopTimer();
		return this;
	},

	resume: function(){
		this.startTimer();
		return this;
	},

	stopTimer: function(){
		if (!this.timer) return false;
		this.time = Date.now() - this.time;
		this.timer = removeInstance(this);
		return true;
	},

	startTimer: function(){
		if (this.timer) return false;
		this.time = Date.now() - this.time;
		this.timer = addInstance(this);
		return true;
	}

});

Fx.compute = function(from, to, delta){
	return (to - from) * delta + from;
};

Fx.Durations = {'short': 250, 'normal': 500, 'long': 1000};

// global timers

var instances = {}, timers = {};

var loop = function(){
	for (var i = this.length; i--;){
		if (this[i]) this[i].step();
	}
};

var addInstance = function(instance){
	var fps = instance.options.fps,
		list = instances[fps] || (instances[fps] = []);
	list.push(instance);
	if (!timers[fps]) timers[fps] = loop.periodical(Math.round(1000 / fps), list);
	return true;
};

var removeInstance = function(instance){
	var fps = instance.options.fps,
		list = instances[fps] || [];
	list.erase(instance);
	if (!list.length && timers[fps]) timers[fps] = clearInterval(timers[fps]);
	return false;
};

})();


/*
---

name: Fx.CSS

description: Contains the CSS animation logic. Used by Fx.Tween, Fx.Morph, Fx.Elements.

license: MIT-style license.

requires: [Fx, Element.Style]

provides: Fx.CSS

...
*/

Fx.CSS = new Class({

	Extends: Fx,

	//prepares the base from/to object

	prepare: function(element, property, values){
		values = Array.from(values);
		if (values[1] == null){
			values[1] = values[0];
			values[0] = element.getStyle(property);
		}
		var parsed = values.map(this.parse);
		return {from: parsed[0], to: parsed[1]};
	},

	//parses a value into an array

	parse: function(value){
		value = Function.from(value)();
		value = (typeof value == 'string') ? value.split(' ') : Array.from(value);
		return value.map(function(val){
			val = String(val);
			var found = false;
			Object.each(Fx.CSS.Parsers, function(parser, key){
				if (found) return;
				var parsed = parser.parse(val);
				if (parsed || parsed === 0) found = {value: parsed, parser: parser};
			});
			found = found || {value: val, parser: Fx.CSS.Parsers.String};
			return found;
		});
	},

	//computes by a from and to prepared objects, using their parsers.

	compute: function(from, to, delta){
		var computed = [];
		(Math.min(from.length, to.length)).times(function(i){
			computed.push({value: from[i].parser.compute(from[i].value, to[i].value, delta), parser: from[i].parser});
		});
		computed.$family = Function.from('fx:css:value');
		return computed;
	},

	//serves the value as settable

	serve: function(value, unit){
		if (typeOf(value) != 'fx:css:value') value = this.parse(value);
		var returned = [];
		value.each(function(bit){
			returned = returned.concat(bit.parser.serve(bit.value, unit));
		});
		return returned;
	},

	//renders the change to an element

	render: function(element, property, value, unit){
		element.setStyle(property, this.serve(value, unit));
	},

	//searches inside the page css to find the values for a selector

	search: function(selector){
		if (Fx.CSS.Cache[selector]) return Fx.CSS.Cache[selector];
		var to = {};
		Array.each(document.styleSheets, function(sheet, j){
			var href = sheet.href;
			if (href && href.contains('://') && !href.contains(document.domain)) return;
			var rules = sheet.rules || sheet.cssRules;
			Array.each(rules, function(rule, i){
				if (!rule.style) return;
				var selectorText = (rule.selectorText) ? rule.selectorText.replace(/^\w+/, function(m){
					return m.toLowerCase();
				}) : null;
				if (!selectorText || !selectorText.test('^' + selector + '$')) return;
				Element.Styles.each(function(value, style){
					if (!rule.style[style] || Element.ShortStyles[style]) return;
					value = String(rule.style[style]);
					to[style] = (value.test(/^rgb/)) ? value.rgbToHex() : value;
				});
			});
		});
		return Fx.CSS.Cache[selector] = to;
	}

});

Fx.CSS.Cache = {};

Fx.CSS.Parsers = {

	Color: {
		parse: function(value){
			if (value.match(/^#[0-9a-f]{3,6}$/i)) return value.hexToRgb(true);
			return ((value = value.match(/(\d+),\s*(\d+),\s*(\d+)/))) ? [value[1], value[2], value[3]] : false;
		},
		compute: function(from, to, delta){
			return from.map(function(value, i){
				return Math.round(Fx.compute(from[i], to[i], delta));
			});
		},
		serve: function(value){
			return value.map(Number);
		}
	},

	Number: {
		parse: parseFloat,
		compute: Fx.compute,
		serve: function(value, unit){
			return (unit) ? value + unit : value;
		}
	},

	String: {
		parse: Function.from(false),
		compute: function(zero, one){
			return one;
		},
		serve: function(zero){
			return zero;
		}
	}

};

//<1.2compat>

Fx.CSS.Parsers = new Hash(Fx.CSS.Parsers);

//</1.2compat>


/*
---

name: Fx.Morph

description: Formerly Fx.Styles, effect to transition any number of CSS properties for an element using an object of rules, or CSS based selector rules.

license: MIT-style license.

requires: Fx.CSS

provides: Fx.Morph

...
*/

Fx.Morph = new Class({

	Extends: Fx.CSS,

	initialize: function(element, options){
		this.element = this.subject = document.id(element);
		this.parent(options);
	},

	set: function(now){
		if (typeof now == 'string') now = this.search(now);
		for (var p in now) this.render(this.element, p, now[p], this.options.unit);
		return this;
	},

	compute: function(from, to, delta){
		var now = {};
		for (var p in from) now[p] = this.parent(from[p], to[p], delta);
		return now;
	},

	start: function(properties){
		if (!this.check(properties)) return this;
		if (typeof properties == 'string') properties = this.search(properties);
		var from = {}, to = {};
		for (var p in properties){
			var parsed = this.prepare(this.element, p, properties[p]);
			from[p] = parsed.from;
			to[p] = parsed.to;
		}
		return this.parent(from, to);
	}

});

Element.Properties.morph = {

	set: function(options){
		this.get('morph').cancel().setOptions(options);
		return this;
	},

	get: function(){
		var morph = this.retrieve('morph');
		if (!morph){
			morph = new Fx.Morph(this, {link: 'cancel'});
			this.store('morph', morph);
		}
		return morph;
	}

};

Element.implement({

	morph: function(props){
		this.get('morph').start(props);
		return this;
	}

});


/*
---

name: Fx.Tween

description: Formerly Fx.Style, effect to transition any CSS property for an element.

license: MIT-style license.

requires: Fx.CSS

provides: [Fx.Tween, Element.fade, Element.highlight]

...
*/

Fx.Tween = new Class({

	Extends: Fx.CSS,

	initialize: function(element, options){
		this.element = this.subject = document.id(element);
		this.parent(options);
	},

	set: function(property, now){
		if (arguments.length == 1){
			now = property;
			property = this.property || this.options.property;
		}
		this.render(this.element, property, now, this.options.unit);
		return this;
	},

	start: function(property, from, to){
		if (!this.check(property, from, to)) return this;
		var args = Array.flatten(arguments);
		this.property = this.options.property || args.shift();
		var parsed = this.prepare(this.element, this.property, args);
		return this.parent(parsed.from, parsed.to);
	}

});

Element.Properties.tween = {
	
	set: function(options){
		this.get('tween').cancel().setOptions(options);
		return this;
	},

	get: function(){
		var tween = this.retrieve('tween');
		if (!tween){
			tween = new Fx.Tween(this, {link: 'cancel'});
			this.store('tween', tween);
		}
		return tween;
	}

};

Element.implement({

	tween: function(property, from, to){
		this.get('tween').start(arguments);
		return this;
	},

	fade: function(how){
		var fade = this.get('tween'), o = 'opacity', toggle;
		how = [how, 'toggle'].pick();
		switch (how){
			case 'in': fade.start(o, 1); break;
			case 'out': fade.start(o, 0); break;
			case 'show': fade.set(o, 1); break;
			case 'hide': fade.set(o, 0); break;
			case 'toggle':
				var flag = this.retrieve('fade:flag', this.get('opacity') == 1);
				fade.start(o, (flag) ? 0 : 1);
				this.store('fade:flag', !flag);
				toggle = true;
			break;
			default: fade.start(o, arguments);
		}
		if (!toggle) this.eliminate('fade:flag');
		return this;
	},

	highlight: function(start, end){
		if (!end){
			end = this.retrieve('highlight:original', this.getStyle('background-color'));
			end = (end == 'transparent') ? '#fff' : end;
		}
		var tween = this.get('tween');
		tween.start('background-color', start || '#ffff88', end).chain(function(){
			this.setStyle('background-color', this.retrieve('highlight:original'));
			tween.callChain();
		}.bind(this));
		return this;
	}

});


/*
---

name: Fx.Transitions

description: Contains a set of advanced transitions to be used with any of the Fx Classes.

license: MIT-style license.

credits:
  - Easing Equations by Robert Penner, <http://www.robertpenner.com/easing/>, modified and optimized to be used with MooTools.

requires: Fx

provides: Fx.Transitions

...
*/

Fx.implement({

	getTransition: function(){
		var trans = this.options.transition || Fx.Transitions.Sine.easeInOut;
		if (typeof trans == 'string'){
			var data = trans.split(':');
			trans = Fx.Transitions;
			trans = trans[data[0]] || trans[data[0].capitalize()];
			if (data[1]) trans = trans['ease' + data[1].capitalize() + (data[2] ? data[2].capitalize() : '')];
		}
		return trans;
	}

});

Fx.Transition = function(transition, params){
	params = Array.from(params);
	return Object.append(transition, {
		easeIn: function(pos){
			return transition(pos, params);
		},
		easeOut: function(pos){
			return 1 - transition(1 - pos, params);
		},
		easeInOut: function(pos){
			return (pos <= 0.5) ? transition(2 * pos, params) / 2 : (2 - transition(2 * (1 - pos), params)) / 2;
		}
	});
};

Fx.Transitions = {

	linear: function(zero){
		return zero;
	}

};

//<1.2compat>

Fx.Transitions = new Hash(Fx.Transitions);

//</1.2compat>

Fx.Transitions.extend = function(transitions){
	for (var transition in transitions) Fx.Transitions[transition] = new Fx.Transition(transitions[transition]);
};

Fx.Transitions.extend({

	Pow: function(p, x){
		return Math.pow(p, x[0] || 6);
	},

	Expo: function(p){
		return Math.pow(2, 8 * (p - 1));
	},

	Circ: function(p){
		return 1 - Math.sin(Math.acos(p));
	},

	Sine: function(p){
		return 1 - Math.sin((1 - p) * Math.PI / 2);
	},

	Back: function(p, x){
		x = x[0] || 1.618;
		return Math.pow(p, 2) * ((x + 1) * p - x);
	},

	Bounce: function(p){
		var value;
		for (var a = 0, b = 1; 1; a += b, b /= 2){
			if (p >= (7 - 4 * a) / 11){
				value = b * b - Math.pow((11 - 6 * a - 11 * p) / 4, 2);
				break;
			}
		}
		return value;
	},

	Elastic: function(p, x){
		return Math.pow(2, 10 * --p) * Math.cos(20 * p * Math.PI * (x[0] || 1) / 3);
	}

});

['Quad', 'Cubic', 'Quart', 'Quint'].each(function(transition, i){
	Fx.Transitions[transition] = new Fx.Transition(function(p){
		return Math.pow(p, [i + 2]);
	});
});


/*
---

name: Request

description: Powerful all purpose Request Class. Uses XMLHTTPRequest.

license: MIT-style license.

requires: [Object, Element, Chain, Events, Options, Browser]

provides: Request

...
*/

var Request = new Class({

	Implements: [Chain, Events, Options],

	options: {/*
		onRequest: nil,
		onComplete: nil,
		onCancel: nil,
		onSuccess: nil,
		onFailure: nil,
		onException: nil,*/
		url: '',
		data: '',
		headers: {
			'X-Requested-With': 'XMLHttpRequest',
			'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
		},
		async: true,
		format: false,
		method: 'post',
		link: 'ignore',
		isSuccess: null,
		emulation: true,
		urlEncoded: true,
		encoding: 'utf-8',
		evalScripts: false,
		evalResponse: false,
		noCache: false
	},

	initialize: function(options){
		this.xhr = new Browser.Request();
		this.setOptions(options);
		this.headers = this.options.headers;
	},

	onStateChange: function(){
		if (this.xhr.readyState != 4 || !this.running) return;
		this.running = false;
		this.status = 0;
		Function.attempt(function(){
			this.status = this.xhr.status;
		}.bind(this));
		this.xhr.onreadystatechange = function(){};
		if (this.options.isSuccess.call(this, this.status)){
			this.response = {text: (this.xhr.responseText || ''), xml: this.xhr.responseXML};
			this.success(this.response.text, this.response.xml);
		} else {
			this.response = {text: null, xml: null};
			this.failure();
		}
	},

	isSuccess: function(){
		return ((this.status >= 200) && (this.status < 300));
	},

	processScripts: function(text){
		if (this.options.evalResponse || (/(ecma|java)script/).test(this.getHeader('Content-type'))) return Browser.exec(text);
		return text.stripScripts(this.options.evalScripts);
	},

	success: function(text, xml){
		this.onSuccess(this.processScripts(text), xml);
	},

	onSuccess: function(){
		this.fireEvent('complete', arguments).fireEvent('success', arguments).callChain();
	},

	failure: function(){
		this.onFailure();
	},

	onFailure: function(){
		this.fireEvent('complete').fireEvent('failure', this.xhr);
	},

	setHeader: function(name, value){
		this.headers[name] = value;
		return this;
	},

	getHeader: function(name){
		return Function.attempt(function(){
			return this.xhr.getResponseHeader(name);
		}.bind(this));
	},

	check: function(){
		if (!this.running) return true;
		switch (this.options.link){
			case 'cancel': this.cancel(); return true;
			case 'chain': this.chain(this.caller.bind(this, arguments)); return false;
		}
		return false;
	},

	send: function(options){
		if (!this.check(options)) return this;
		
		this.options.isSuccess = this.options.isSuccess || this.isSuccess;
		this.running = true;

		var type = typeOf(options);
		if (type == 'string' || type == 'element') options = {data: options};

		var old = this.options;
		options = Object.append({data: old.data, url: old.url, method: old.method}, options);
		var data = options.data, url = String(options.url), method = options.method.toLowerCase();

		switch (typeOf(data)){
			case 'element': data = document.id(data).toQueryString(); break;
			case 'object': case 'hash': data = Object.toQueryString(data);
		}

		if (this.options.format){
			var format = 'format=' + this.options.format;
			data = (data) ? format + '&' + data : format;
		}

		if (this.options.emulation && !['get', 'post'].contains(method)){
			var _method = '_method=' + method;
			data = (data) ? _method + '&' + data : _method;
			method = 'post';
		}

		if (this.options.urlEncoded && method == 'post'){
			var encoding = (this.options.encoding) ? '; charset=' + this.options.encoding : '';
			this.headers['Content-type'] = 'application/x-www-form-urlencoded' + encoding;
		}

		if (this.options.noCache){
			var noCache = 'noCache=' + new Date().getTime();
			data = (data) ? noCache + '&' + data : noCache;
		}

		var trimPosition = url.lastIndexOf('/');
		if (trimPosition > -1 && (trimPosition = url.indexOf('#')) > -1) url = url.substr(0, trimPosition);

		if (data && method == 'get'){
			url = url + (url.contains('?') ? '&' : '?') + data;
			data = null;
		}

		this.xhr.open(method.toUpperCase(), url, this.options.async);

		this.xhr.onreadystatechange = this.onStateChange.bind(this);

		Object.each(this.headers, function(value, key){
			try {
				this.xhr.setRequestHeader(key, value);
			} catch (e){
				this.fireEvent('exception', [key, value]);
			}
		}, this);

		this.fireEvent('request');
		this.xhr.send(data);
		if (!this.options.async) this.onStateChange();
		return this;
	},

	cancel: function(){
		if (!this.running) return this;
		this.running = false;
		this.xhr.abort();
		this.xhr.onreadystatechange = function(){};
		this.xhr = new Browser.Request();
		this.fireEvent('cancel');
		return this;
	}

});

(function(){

var methods = {};
['get', 'post', 'put', 'delete', 'GET', 'POST', 'PUT', 'DELETE'].each(function(method){
	methods[method] = function(data){
		return this.send({
			data: data,
			method: method
		});
	};
});

Request.implement(methods);

})();

Element.Properties.send = {
	
	set: function(options){
		var send = this.get('send').cancel();
		send.setOptions(options);
		return this;
	},

	get: function(){
		var send = this.retrieve('send');
		if (!send){
			send = new Request({
				data: this, link: 'cancel', method: this.get('method') || 'post', url: this.get('action')
			});
			this.store('send', send);
		}
		return send;
	}

};

Element.implement({

	send: function(url){
		var sender = this.get('send');
		sender.send({data: this, url: url || sender.options.url});
		return this;
	}

});


/*
---

name: Request.HTML

description: Extends the basic Request Class with additional methods for interacting with HTML responses.

license: MIT-style license.

requires: [Element, Request]

provides: Request.HTML

...
*/

Request.HTML = new Class({

	Extends: Request,

	options: {
		update: false,
		append: false,
		evalScripts: true,
		filter: false
	},

	success: function(text){
		var options = this.options, response = this.response;

		response.html = text.stripScripts(function(script){
			response.javascript = script;
		}); 
		
		var match = response.html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
		if (match) response.html = match[1];
		var temp = new Element('div').set('html', response.html);

		response.tree = temp.childNodes;
		response.elements = temp.getElements('*');

		if (options.filter) response.tree = response.elements.filter(options.filter);
		if (options.update) document.id(options.update).empty().set('html', response.html);
		else if (options.append) document.id(options.append).adopt(temp.getChildren());
		if (options.evalScripts) Browser.exec(response.javascript);

		this.onSuccess(response.tree, response.elements, response.html, response.javascript);
	}

});

Element.Properties.load = {
	
	set: function(options){
		var load = this.get('load').cancel();
		load.setOptions(options);
		return this;
	},

	get: function(){
		var load = this.retrieve('load');
		if (!load){
			load = new Request({data: this, link: 'cancel', update: this, method: 'get'});
			this.store('load', load);
		}
		return load;
	}

};

Element.implement({

	load: function(){
		this.get('load').send(Array.link(arguments, {data: Type.isObject, url: Type.isString}));
		return this;
	}

});


/*
---

name: JSON

description: JSON encoder and decoder.

license: MIT-style license.

See Also: <http://www.json.org/>

requires: [Array, String, Number, Function]

provides: JSON

...
*/

if (!this.JSON) this.JSON = {};

//<1.2compat>

JSON = new Hash({
	stringify: JSON.stringify,
	parse: JSON.parse
});

//</1.2compat>

Object.append(JSON, {
	
	$specialChars: {'\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"' : '\\"', '\\': '\\\\'},

	$replaceChars: function(chr){
		return JSON.$specialChars[chr] || '\\u00' + Math.floor(chr.charCodeAt() / 16).toString(16) + (chr.charCodeAt() % 16).toString(16);
	},

	encode: function(obj){
		switch (typeOf(obj)){
			case 'string':
				return '"' + obj.replace(/[\x00-\x1f\\"]/g, JSON.$replaceChars) + '"';
			case 'array':
				return '[' + String(obj.map(JSON.encode).clean()) + ']';
			case 'object': case 'hash':
				var string = [];
				Object.each(obj, function(value, key){
					var json = JSON.encode(value);
					if (json) string.push(JSON.encode(key) + ':' + json);
				});
				return '{' + string + '}';
			case 'number': case 'boolean': return String(obj);
			case 'null': return 'null';
		}
		return null;
	},

	decode: function(string, secure){
		if (typeOf(string) != 'string' || !string.length) return null;
		if (secure && !(/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(string.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, ''))) return null;
		return eval('(' + string + ')');
	}

});


/*
---

name: Request.JSON

description: Extends the basic Request Class with additional methods for sending and receiving JSON data.

license: MIT-style license.

requires: [Request, JSON]

provides: Request.JSON

...
*/

Request.JSON = new Class({

	Extends: Request,

	options: {
		secure: true
	},

	initialize: function(options){
		this.parent(options);
		Object.append(this.headers, {
			'Accept': 'application/json',
			'X-Request': 'JSON'
		});
	},

	success: function(text){
		var secure = this.options.secure;
		var json = this.response.json = Function.attempt(function(){
			return JSON.decode(text, secure);
		});

		if (json == null) this.onFailure();
		else this.onSuccess(json, text);
	}

});


/*
---

name: Cookie

description: Class for creating, reading, and deleting browser Cookies.

license: MIT-style license.

credits:
  - Based on the functions by Peter-Paul Koch (http://quirksmode.org).

requires: Options

provides: Cookie

...
*/

var Cookie = new Class({

	Implements: Options,

	options: {
		path: '/',
		domain: false,
		duration: false,
		secure: false,
		document: document
	},

	initialize: function(key, options){
		this.key = key;
		this.setOptions(options);
	},

	write: function(value){
		value = encodeURIComponent(value);
		if (this.options.domain) value += '; domain=' + this.options.domain;
		if (this.options.path) value += '; path=' + this.options.path;
		if (this.options.duration){
			var date = new Date();
			date.setTime(date.getTime() + this.options.duration * 24 * 60 * 60 * 1000);
			value += '; expires=' + date.toGMTString();
		}
		if (this.options.secure) value += '; secure';
		this.options.document.cookie = this.key + '=' + value;
		return this;
	},

	read: function(){
		var value = this.options.document.cookie.match('(?:^|;)\\s*' + this.key.escapeRegExp() + '=([^;]*)');
		return (value) ? decodeURIComponent(value[1]) : null;
	},

	dispose: function(){
		new Cookie(this.key, Object.merge({}, this.options, {duration: -1})).write('');
		return this;
	}

});

Cookie.write = function(key, value, options){
	return new Cookie(key, options).write(value);
};

Cookie.read = function(key){
	return new Cookie(key).read();
};

Cookie.dispose = function(key, options){
	return new Cookie(key, options).dispose();
};


/*
---

name: DomReady

description: Contains the custom event domready.

license: MIT-style license.

requires: Element.Event

provides: DomReady

...
*/

Element.Events.domready = {

	onAdd: function(fn){
		if (Browser.loaded) fn.call(this);
	}

};

(function(){

	var domready = function(){
		if (Browser.loaded) return;
		Browser.loaded = true;
		window.fireEvent('domready');
		document.fireEvent('domready');
	};
	
	var repeat;
	if (Browser.ie){
		Element.Events.load = {
			base: 'load',
			onAdd: function(fn){
				if (Browser.loaded) fn.call(this);
			},
			condition: function(){
				domready();
				return true;
			}
		};
		var temp = document.createElement('div');
		repeat = function(){
			(Function.attempt(function(){
				temp.doScroll(); // Technique by Diego Perini
				return document.id(temp).inject(document.body).set('html', 'temp').dispose();
			})) ? domready() : repeat.delay(50);
		};
		repeat();
	} else if (Browser.safari && Browser.version < 4){
		repeat = function(){
			(['loaded', 'complete'].contains(document.readyState)) ? domready() : repeat.delay(50);
		};
		repeat();
	} else {
		document.addEvent('DOMContentLoaded', domready);
	}

})();


/*
---

name: Swiff

description: Wrapper for embedding SWF movies. Supports External Interface Communication.

license: MIT-style license.

credits: 
  - Flash detection & Internet Explorer + Flash Player 9 fix inspired by SWFObject.

requires: [Options, Object]

provides: Swiff

...
*/

var Swiff = new Class({

	Implements: Options,

	options: {
		id: null,
		height: 1,
		width: 1,
		container: null,
		properties: {},
		params: {
			quality: 'high',
			allowScriptAccess: 'always',
			wMode: 'window',
			swLiveConnect: true
		},
		callBacks: {},
		vars: {}
	},

	toElement: function(){
		return this.object;
	},

	initialize: function(path, options){
		this.instance = 'Swiff_' + Date.now();

		this.setOptions(options);
		options = this.options;
		var id = this.id = options.id || this.instance;
		var container = document.id(options.container);

		Swiff.CallBacks[this.instance] = {};

		var params = options.params, vars = options.vars, callBacks = options.callBacks;
		var properties = Object.append({height: options.height, width: options.width}, options.properties);

		var self = this;

		for (var callBack in callBacks){
			Swiff.CallBacks[this.instance][callBack] = (function(option){
				return function(){
					return option.apply(self.object, arguments);
				};
			})(callBacks[callBack]);
			vars[callBack] = 'Swiff.CallBacks.' + this.instance + '.' + callBack;
		}

		params.flashVars = Object.toQueryString(vars);
		if (Browser.ie){
			properties.classid = 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';
			params.movie = path;
		} else {
			properties.type = 'application/x-shockwave-flash';
		}
		properties.data = path;
		
		var build = '<object id="' + id + '"';
		for (var property in properties) build += ' ' + property + '="' + properties[property] + '"';
		build += '>';
		for (var param in params){
			if (params[param]) build += '<param name="' + param + '" value="' + params[param] + '" />';
		}
		build += '</object>';
		this.object = ((container) ? container.empty() : new Element('div')).set('html', build).firstChild;
	},

	replaces: function(element){
		element = document.id(element, true);
		element.parentNode.replaceChild(this.toElement(), element);
		return this;
	},

	inject: function(element){
		document.id(element, true).appendChild(this.toElement());
		return this;
	},

	remote: function(){
		return Swiff.remote.apply(Swiff, [this.toElement()].extend(arguments));
	}

});

Swiff.CallBacks = {};

Swiff.remote = function(obj, fn){
	var rs = obj.CallFunction('<invoke name="' + fn + '" returntype="javascript">' + __flash__argumentsToXML(arguments, 2) + '</invoke>');
	return eval(rs);
};


/*
---

script: More.js

name: More

description: MooTools More

license: MIT-style license

authors:
  - Guillermo Rauch
  - Thomas Aylott
  - Scott Kyle

requires:
  - Core/MooTools

provides: [MooTools.More]

...
*/

MooTools.More = {
	'version': '1.3.0.1dev',
	'build': '8f95701740ad861b4777a4046ac09134c14984f7'
};


/*
---

script: MooTools.Lang.js

name: MooTools.Lang

description: Provides methods for localization.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Events
  - /MooTools.More

provides: [Lang]

...
*/

(function(){

	var data = {
		language: 'en-US',
		languages: {
			'en-US': {}
		},
		cascades: ['en-US']
	};
	
	var cascaded;

	MooTools.lang = new Events();

	Object.append(MooTools.lang, {

		setLanguage: function(lang){
			if (!data.languages[lang]) return this;
			data.language = lang;
			this.load();
			this.fireEvent('langChange', lang);
			return this;
		},

		load: function() {
			var langs = this.cascade(this.getCurrentLanguage());
			cascaded = {};
			Object.each(langs, function(set, setName){
				cascaded[setName] = this.lambda(set);
			}, this);
		},

		getCurrentLanguage: function(){
			return data.language;
		},

		addLanguage: function(lang){
			data.languages[lang] = data.languages[lang] || {};
			return this;
		},

		cascade: function(lang){
			var cascades = (data.languages[lang] || {}).cascades || [];
			cascades.combine(data.cascades);
			cascades.erase(lang).push(lang);
			var langs = cascades.map(function(lng){
				return data.languages[lng];
			}, this);
			return Object.merge.apply(this, langs);
		},

		lambda: function(set) {
			(set || {}).get = function(key, args){
				return Function.from(set[key]).apply(this, Array.from(args));
			};
			return set;
		},

		get: function(set, key, args){
			if (cascaded && cascaded[set]){
				return (key ? cascaded[set].get(key, args) : cascaded[set]);
			}
		},

		set: function(lang, set, members){
			this.addLanguage(lang);
			langData = data.languages[lang];
			if (!langData[set]) langData[set] = {};
			Object.append(langData[set], members);
			if (lang == this.getCurrentLanguage()){
				this.load();
				this.fireEvent('langChange', lang);
			}
			return this;
		},

		list: function(){
			return Hash.getKeys(data.languages);
		}

	});

})();


/*
---

script: Log.js

name: Log

description: Provides basic logging functionality for plugins to implement.

license: MIT-style license

authors:
  - Guillermo Rauch
  - Thomas Aylott
  - Scott Kyle

requires:
  - Core/Class
  - /MooTools.More

provides: [Log]

...
*/

(function(global){

var log = function(){
	if (global.console && console.log){
		try {
			console.log.apply(console, arguments);
		} catch(e) {
			console.log(Array.slice(arguments));
		}
	} else {
		Log.logged.push(arguments);
	}
	return this;
};

var disabled = function(){
	this.logged.push(arguments);
	return this;
};

this.Log = new Class({
	
	logged: [],
	
	log: disabled,
	
	resetLog: function(){
		this.logged.empty();
		return this;
	},

	enableLog: function(){
		this.log = log;
		this.logged.each(function(args){
			this.log.apply(this, args);
		}, this);
		return this.resetLog();
	},

	disableLog: function(){
		this.log = disabled;
		return this;
	}
	
});

Log.extend(new Log).enableLog();

//<1.2compat>
Log.logger = function(){
	return this.log.apply(this, arguments);
};
//</1.2compat>

})(this);


/*
---

script: Class.Refactor.js

name: Class.Refactor

description: Extends a class onto itself with new property, preserving any items attached to the class's namespace.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Class
  - /MooTools.More

# Some modules declare themselves dependent on Class.Refactor
provides: [Class.refactor, Class.Refactor]

...
*/

Class.refactor = function(original, refactors){

	Object.each(refactors, function(item, name){
		var origin = original.prototype[name];
		if (origin) origin = origin.$origin;
		if (origin && typeof item == 'function') {
			original.implement(name, function(){
				var old = this.previous;
				this.previous = origin;
				var value = item.apply(this, arguments);
				this.previous = old;
				return value;
			});
		} else {
			original.implement(name, item);
		}
	});

	return original;

};


/*
---

script: Class.Binds.js

name: Class.Binds

description: Automagically binds specified methods in a class to the instance of the class.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Class
  - /MooTools.More

provides: [Class.Binds]

...
*/

Class.Mutators.Binds = function(binds){
    return binds;
};

//Class.Mutators.initialize = function(initialize){
//	return function(){
//		Array.from(this.Binds).each(function(name){
//			var original = this[name];
//			if (original) this[name] = original.bind(this);
//		}, this);
//		return initialize.apply(this, arguments);
//	};
//};


/*
---

script: Class.Occlude.js

name: Class.Occlude

description: Prevents a class from being applied to a DOM element twice.

license: MIT-style license.

authors:
  - Aaron Newton

requires: 
  - Core/Class
  - Core/Element
  - /MooTools.More

provides: [Class.Occlude]

...
*/

Class.Occlude = new Class({

	occlude: function(property, element){
		element = document.id(element || this.element);
		var instance = element.retrieve(property || this.property);
		if (instance && this.occluded != null)
			return this.occluded = instance;

		this.occluded = false;
		element.store(property || this.property, this);
		return this.occluded;
	}

});


/*
---

script: Chain.Wait.js

name: Chain.Wait

description: value, Adds a method to inject pauses between chained events.

license: MIT-style license.

authors:
  - Aaron Newton

requires: 
  - Core/Chain
  - Core/Element
  - Core/Fx
  - /MooTools.More

provides: [Chain.Wait]

...
*/

(function(){

	var wait = {
		wait: function(duration){
			return this.chain(function(){
				this.callChain.delay(duration == null ? 500 : duration, this);
			}.bind(this));
		}
	};

	Chain.implement(wait);

	if (window.Fx){
		Fx.implement(wait);
		['Css', 'Tween', 'Elements'].each(function(cls){
			if (Fx[cls]) Fx[cls].implement(wait);
		});
	}

	Element.implement({
		
		chains: function(effects){
			Array.from(effects || ['tween', 'morph', 'reveal']).each(function(effect){
				effect = this.get(effect);
				if (!effect) return;
				effect.setOptions({
					link:'chain'
				});
			}, this);
			return this;
		},
		
		pauseFx: function(duration, effect){
			this.chains(effect).get(effect || 'tween').wait(duration);
			return this;
		}
		
	});

})();


/*
---

script: Array.Extras.js

name: Array.Extras

description: Extends the Array native object to include useful methods to work with arrays.

license: MIT-style license

authors:
  - Christoph Pojer

requires:
  - Core/Array

provides: [Array.Extras]

...
*/
Array.implement({

	min: function(){
		return Math.min.apply(null, this);
	},

	max: function(){
		return Math.max.apply(null, this);
	},

	average: function(){
		return this.length ? this.sum() / this.length : 0;
	},

	sum: function(){
		var result = 0, l = this.length;
		if (l){
			while(l--) result += this[l];
		}
		return result;
	},

	unique: function(){
		return [].combine(this);
	},

	shuffle: function(){
		for (var i = this.length; i && --i;){
			var temp = this[i], r = Math.floor(Math.random() * ( i + 1 ));
			this[i] = this[r];
			this[r] = temp;
		}
		return this;
	}

});


/*
---

script: Date.English.US.js

name: Date.English.US

description: Date messages for US English.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - /Lang

provides: [Date.English.US]

...
*/

MooTools.lang.set('en-US', 'Date', {

	months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	//culture's date order: MM/DD/YYYY
	dateOrder: ['month', 'date', 'year'],
	shortDate: '%m/%d/%Y',
	shortTime: '%I:%M%p',
	AM: 'AM',
	PM: 'PM',

	/* Date.Extras */
	ordinal: function(dayOfMonth){
		//1st, 2nd, 3rd, etc.
		return (dayOfMonth > 3 && dayOfMonth < 21) ? 'th' : ['th', 'st', 'nd', 'rd', 'th'][Math.min(dayOfMonth % 10, 4)];
	},

	lessThanMinuteAgo: 'less than a minute ago',
	minuteAgo: 'about a minute ago',
	minutesAgo: '{delta} minutes ago',
	hourAgo: 'about an hour ago',
	hoursAgo: 'about {delta} hours ago',
	dayAgo: '1 day ago',
	daysAgo: '{delta} days ago',
	weekAgo: '1 week ago',
	weeksAgo: '{delta} weeks ago',
	monthAgo: '1 month ago',
	monthsAgo: '{delta} months ago',
	yearAgo: '1 year ago',
	yearsAgo: '{delta} years ago',
	lessThanMinuteUntil: 'less than a minute from now',
	minuteUntil: 'about a minute from now',
	minutesUntil: '{delta} minutes from now',
	hourUntil: 'about an hour from now',
	hoursUntil: 'about {delta} hours from now',
	dayUntil: '1 day from now',
	daysUntil: '{delta} days from now',
	weekUntil: '1 week from now',
	weeksUntil: '{delta} weeks from now',
	monthUntil: '1 month from now',
	monthsUntil: '{delta} months from now',
	yearUntil: '1 year from now',
	yearsUntil: '{delta} years from now'

});


/*
---

script: Date.js

name: Date

description: Extends the Date native object to include methods useful in managing dates.

license: MIT-style license

authors:
  - Aaron Newton
  - Nicholas Barthelemy - https://svn.nbarthelemy.com/date-js/
  - Harald Kirshner - mail [at] digitarald.de; http://digitarald.de
  - Scott Kyle - scott [at] appden.com; http://appden.com

requires:
  - Core/Array
  - Core/String
  - Core/Number
  - /Lang
  - /Date.English.US
  - /MooTools.More

provides: [Date]

...
*/

(function(){

var Date = this.Date;

Date.Methods = {
	ms: 'Milliseconds',
	year: 'FullYear',
	min: 'Minutes',
	mo: 'Month',
	sec: 'Seconds',
	hr: 'Hours'
};

['Date', 'Day', 'FullYear', 'Hours', 'Milliseconds', 'Minutes', 'Month', 'Seconds', 'Time', 'TimezoneOffset',
	'Week', 'Timezone', 'GMTOffset', 'DayOfYear', 'LastMonth', 'LastDayOfMonth', 'UTCDate', 'UTCDay', 'UTCFullYear',
	'AMPM', 'Ordinal', 'UTCHours', 'UTCMilliseconds', 'UTCMinutes', 'UTCMonth', 'UTCSeconds', 'UTCMilliseconds'].each(function(method){
	Date.Methods[method.toLowerCase()] = method;
});

var pad = function(what, length){
	return new Array(length - String(what).length + 1).join('0') + what;
};

Date.implement({

	set: function(prop, value){
		switch (typeOf(prop)){
			case 'object':
				for (var p in prop) this.set(p, prop[p]);
				break;
			case 'string':
				prop = prop.toLowerCase();
				var m = Date.Methods;
				if (m[prop]) this['set' + m[prop]](value);
		}
		return this;
	},

	get: function(prop){
		prop = prop.toLowerCase();
		var m = Date.Methods;
		if (m[prop]) return this['get' + m[prop]]();
		return null;
	},

	clone: function(){
		return new Date(this.get('time'));
	},

	increment: function(interval, times){
		interval = interval || 'day';
		times = times != null ? times : 1;

		switch (interval){
			case 'year':
				return this.increment('month', times * 12);
			case 'month':
				var d = this.get('date');
				this.set('date', 1).set('mo', this.get('mo') + times);
				return this.set('date', d.min(this.get('lastdayofmonth')));
			case 'week':
				return this.increment('day', times * 7);
			case 'day':
				return this.set('date', this.get('date') + times);
		}

		if (!Date.units[interval]) throw new Error(interval + ' is not a supported interval');

		return this.set('time', this.get('time') + times * Date.units[interval]());
	},

	decrement: function(interval, times){
		return this.increment(interval, -1 * (times != null ? times : 1));
	},

	isLeapYear: function(){
		return Date.isLeapYear(this.get('year'));
	},

	clearTime: function(){
		return this.set({hr: 0, min: 0, sec: 0, ms: 0});
	},

	diff: function(date, resolution){
		if (typeOf(date) == 'string') date = Date.parse(date);
		
		return ((date - this) / Date.units[resolution || 'day'](3, 3)).toInt(); // non-leap year, 30-day month
	},

	getLastDayOfMonth: function(){
		return Date.daysInMonth(this.get('mo'), this.get('year'));
	},

	getDayOfYear: function(){
		return (Date.UTC(this.get('year'), this.get('mo'), this.get('date') + 1) 
			- Date.UTC(this.get('year'), 0, 1)) / Date.units.day();
	},

	getWeek: function(){
		return (this.get('dayofyear') / 7).ceil();
	},
	
	getOrdinal: function(day){
		return Date.getMsg('ordinal', day || this.get('date'));
	},

	getTimezone: function(){
		return this.toString()
			.replace(/^.*? ([A-Z]{3}).[0-9]{4}.*$/, '$1')
			.replace(/^.*?\(([A-Z])[a-z]+ ([A-Z])[a-z]+ ([A-Z])[a-z]+\)$/, '$1$2$3');
	},

	getGMTOffset: function(){
		var off = this.get('timezoneOffset');
		return ((off > 0) ? '-' : '+') + pad((off.abs() / 60).floor(), 2) + pad(off % 60, 2);
	},

	setAMPM: function(ampm){
		ampm = ampm.toUpperCase();
		var hr = this.get('hr');
		if (hr > 11 && ampm == 'AM') return this.decrement('hour', 12);
		else if (hr < 12 && ampm == 'PM') return this.increment('hour', 12);
		return this;
	},

	getAMPM: function(){
		return (this.get('hr') < 12) ? 'AM' : 'PM';
	},

	parse: function(str){
		this.set('time', Date.parse(str));
		return this;
	},

	isValid: function(date) {
		return !!(date || this).valueOf();
	},

	format: function(f){
		if (!this.isValid()) return 'invalid date';
		f = f || '%x %X';
		f = formats[f.toLowerCase()] || f; // replace short-hand with actual format
		var d = this;
		return f.replace(/%([a-z%])/gi,
			function($0, $1){
				switch ($1){
					case 'a': return Date.getMsg('days')[d.get('day')].substr(0, 3);
					case 'A': return Date.getMsg('days')[d.get('day')];
					case 'b': return Date.getMsg('months')[d.get('month')].substr(0, 3);
					case 'B': return Date.getMsg('months')[d.get('month')];
					case 'c': return d.toString();
					case 'd': return pad(d.get('date'), 2);
					case 'e': return d.get('date');
					case 'H': return pad(d.get('hr'), 2);
					case 'I': return ((d.get('hr') % 12) || 12);
					case 'j': return pad(d.get('dayofyear'), 3);
					case 'm': return pad((d.get('mo') + 1), 2);
					case 'M': return pad(d.get('min'), 2);
					case 'o': return d.get('ordinal');
					case 'p': return Date.getMsg(d.get('ampm'));
					case 'S': return pad(d.get('seconds'), 2);
					case 'U': return pad(d.get('week'), 2);
					case 'w': return d.get('day');
					case 'x': return d.format(Date.getMsg('shortDate'));
					case 'X': return d.format(Date.getMsg('shortTime'));
					case 'y': return d.get('year').toString().substr(2);
					case 'Y': return d.get('year');
					case 'T': return d.get('GMTOffset');
					case 'Z': return d.get('Timezone');
					case 'z': return pad(d.get('ms'));
				}
				return $1;
			}
		);
	},

	toISOString: function(){
		return this.format('iso8601');
	}

});


Date.alias('toJSON', 'toISOString');
Date.alias('compare', 'diff');
Date.alias('strftime', 'format');

var formats = {
	db: '%Y-%m-%d %H:%M:%S',
	compact: '%Y%m%dT%H%M%S',
	iso8601: '%Y-%m-%dT%H:%M:%S%T',
	rfc822: '%a, %d %b %Y %H:%M:%S %Z',
	'short': '%d %b %H:%M',
	'long': '%B %d, %Y %H:%M'
};

var parsePatterns = [];
var nativeParse = Date.parse;

var parseWord = function(type, word, num){
	var ret = -1;
	var translated = Date.getMsg(type + 's');
	switch (typeOf(word)){
		case 'object':
			ret = translated[word.get(type)];
			break;
		case 'number':
			ret = translated[word];
			if (!ret) throw new Error('Invalid ' + type + ' index: ' + word);
			break;
		case 'string':
			var match = translated.filter(function(name){
				return this.test(name);
			}, new RegExp('^' + word, 'i'));
			if (!match.length)    throw new Error('Invalid ' + type + ' string');
			if (match.length > 1) throw new Error('Ambiguous ' + type);
			ret = match[0];
	}

	return (num) ? translated.indexOf(ret) : ret;
};

Date.extend({

	getMsg: function(key, args) {
		return MooTools.lang.get('Date', key, args);
	},

	units: {
		ms: Function.from(1),
		second: Function.from(1000),
		minute: Function.from(60000),
		hour: Function.from(3600000),
		day: Function.from(86400000),
		week: Function.from(608400000),
		month: function(month, year){
			var d = new Date;
			return Date.daysInMonth(month != null ? month : d.get('mo'), year != null ? year : d.get('year')) * 86400000;
		},
		year: function(year){
			year = year || new Date().get('year');
			return Date.isLeapYear(year) ? 31622400000 : 31536000000;
		}
	},

	daysInMonth: function(month, year){
		return [31, Date.isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
	},

	isLeapYear: function(year){
		return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
	},

	parse: function(from){
		var t = typeOf(from);
		if (t == 'number') return new Date(from);
		if (t != 'string') return from;
		from = from.clean();
		if (!from.length) return null;

		var parsed;
		parsePatterns.some(function(pattern){
			var bits = pattern.re.exec(from);
			return (bits) ? (parsed = pattern.handler(bits)) : false;
		});

		return parsed || new Date(nativeParse(from));
	},

	parseDay: function(day, num){
		return parseWord('day', day, num);
	},

	parseMonth: function(month, num){
		return parseWord('month', month, num);
	},

	parseUTC: function(value){
		var localDate = new Date(value);
		var utcSeconds = Date.UTC(
			localDate.get('year'),
			localDate.get('mo'),
			localDate.get('date'),
			localDate.get('hr'),
			localDate.get('min'),
			localDate.get('sec'),
			localDate.get('ms')
		);
		return new Date(utcSeconds);
	},

	orderIndex: function(unit){
		return Date.getMsg('dateOrder').indexOf(unit) + 1;
	},

	defineFormat: function(name, format){
		formats[name] = format;
	},

	defineFormats: function(formats){
		for (var name in formats) Date.defineFormat(name, formats[name]);
	},

//<1.2compat>
	parsePatterns: parsePatterns, // this is deprecated
//</1.2compat>
	
	defineParser: function(pattern){
		parsePatterns.push((pattern.re && pattern.handler) ? pattern : build(pattern));
	},
	
	defineParsers: function(){
		Array.flatten(arguments).each(Date.defineParser);
	},
	
	define2DigitYearStart: function(year){
		startYear = year % 100;
		startCentury = year - startYear;
	}

});

var startCentury = 1900;
var startYear = 70;

var regexOf = function(type){
	return new RegExp('(?:' + Date.getMsg(type).map(function(name){
		return name.substr(0, 3);
	}).join('|') + ')[a-z]*');
};

var replacers = function(key){
	switch(key){
		case 'x': // iso8601 covers yyyy-mm-dd, so just check if month is first
			return ((Date.orderIndex('month') == 1) ? '%m[.-/]%d' : '%d[.-/]%m') + '([.-/]%y)?';
		case 'X':
			return '%H([.:]%M)?([.:]%S([.:]%s)?)? ?%p? ?%T?';
	}
	return null;
};

var keys = {
	d: /[0-2]?[0-9]|3[01]/,
	H: /[01]?[0-9]|2[0-3]/,
	I: /0?[1-9]|1[0-2]/,
	M: /[0-5]?\d/,
	s: /\d+/,
	o: /[a-z]*/,
	p: /[ap]\.?m\.?/,
	y: /\d{2}|\d{4}/,
	Y: /\d{4}/,
	T: /Z|[+-]\d{2}(?::?\d{2})?/
};

keys.m = keys.I;
keys.S = keys.M;

var currentLanguage;

var recompile = function(language){
	currentLanguage = language;
	
	keys.a = keys.A = regexOf('days');
	keys.b = keys.B = regexOf('months');
	
	parsePatterns.each(function(pattern, i){
		if (pattern.format) parsePatterns[i] = build(pattern.format);
	});
};

var build = function(format){
	if (!currentLanguage) return {format: format};
	
	var parsed = [];
	var re = (format.source || format) // allow format to be regex
	 .replace(/%([a-z])/gi,
		function($0, $1){
			return replacers($1) || $0;
		}
	).replace(/\((?!\?)/g, '(?:') // make all groups non-capturing
	 .replace(/ (?!\?|\*)/g, ',? ') // be forgiving with spaces and commas
	 .replace(/%([a-z%])/gi,
		function($0, $1){
			var p = keys[$1];
			if (!p) return $1;
			parsed.push($1);
			return '(' + p.source + ')';
		}
	).replace(/\[a-z\]/gi, '[a-z\\u00c0-\\uffff]'); // handle unicode words

	return {
		format: format,
		re: new RegExp('^' + re + '$', 'i'),
		handler: function(bits){
			bits = bits.slice(1).associate(parsed);
			var date = new Date().clearTime();
			['d', 'm', 'b', 'B'].each(function(letter){
				if (letter in bits) handle.call(date, letter, 1);
			});
			for (var key in bits) handle.call(date, key, bits[key]);
			return date;
		}
	};
};

var handle = function(key, value){
	if (!value) return this;

	switch(key){
		case 'a': case 'A': return this.set('day', Date.parseDay(value, true));
		case 'b': case 'B': return this.set('mo', Date.parseMonth(value, true));
		case 'd': return this.set('date', value);
		case 'H': case 'I': return this.set('hr', value);
		case 'm': return this.set('mo', value - 1);
		case 'M': return this.set('min', value);
		case 'p': return this.set('ampm', value.replace(/\./g, ''));
		case 'S': return this.set('sec', value);
		case 's': return this.set('ms', ('0.' + value) * 1000);
		case 'w': return this.set('day', value);
		case 'Y': return this.set('year', value);
		case 'y':
			value = +value;
			if (value < 100) value += startCentury + (value < startYear ? 100 : 0);
			return this.set('year', value);
		case 'T':
			if (value == 'Z') value = '+00';
			var offset = value.match(/([+-])(\d{2}):?(\d{2})?/);
			offset = (offset[1] + '1') * (offset[2] * 60 + (+offset[3] || 0)) + this.getTimezoneOffset();
			return this.set('time', this - offset * 60000);
	}

	return this;
};

Date.defineParsers(
	'%Y([-./]%m([-./]%d((T| )%X)?)?)?', // "1999-12-31", "1999-12-31 11:59pm", "1999-12-31 23:59:59", ISO8601
	'%Y%m%d(T%H(%M%S?)?)?', // "19991231", "19991231T1159", compact
	'%x( %X)?', // "12/31", "12.31.99", "12-31-1999", "12/31/2008 11:59 PM"
	'%d%o( %b( %Y)?)?( %X)?', // "31st", "31st December", "31 Dec 1999", "31 Dec 1999 11:59pm"
	'%b( %d%o)?( %Y)?( %X)?', // Same as above with month and day switched
	'%Y %b( %d%o( %X)?)?', // Same as above with year coming first
	'%o %b %d %X %T %Y' // "Thu Oct 22 08:11:23 +0000 2009"
);

MooTools.lang.addEvent('langChange', function(language){
	if (MooTools.lang.get('Date')) recompile(language);
}).fireEvent('langChange', MooTools.lang.getCurrentLanguage());

})();


/*
---

script: Date.Extras.js

name: Date.Extras

description: Extends the Date native object to include extra methods (on top of those in Date.js).

license: MIT-style license

authors:
  - Aaron Newton
  - Scott Kyle

requires:
  - /Date

provides: [Date.Extras]

...
*/

Date.implement({

	timeDiffInWords: function(relative_to){
		return Date.distanceOfTimeInWords(this, relative_to || new Date);
	},

	timeDiff: function(to, joiner){
		if (to == null) to = new Date;
		var delta = ((to - this) / 1000).toInt();
		if (!delta) return '0s';
		
		var durations = {s: 60, m: 60, h: 24, d: 365, y: 0};
		var duration, vals = [];
		
		for (var step in durations){
			if (!delta) break;
			if ((duration = durations[step])){
				vals.unshift((delta % duration) + step);
				delta = (delta / duration).toInt();
			} else {
				vals.unshift(delta + step);
			}
		}
		
		return vals.join(joiner || ':');
	}

});

Date.alias('timeAgoInWords', 'timeDiffInWords');

Date.extend({

	distanceOfTimeInWords: function(from, to){
		return Date.getTimePhrase(((to - from) / 1000).toInt());
	},

	getTimePhrase: function(delta){
		var suffix = (delta < 0) ? 'Until' : 'Ago';
		if (delta < 0) delta *= -1;
		
		var units = {
			minute: 60,
			hour: 60,
			day: 24,
			week: 7,
			month: 52 / 12,
			year: 12,
			eon: Infinity
		};
		
		var msg = 'lessThanMinute';
		
		for (var unit in units){
			var interval = units[unit];
			if (delta < 1.5 * interval){
				if (delta > 0.75 * interval) msg = unit;
				break;
			}
			delta /= interval;
			msg = unit + 's';
		}
		
		return Date.getMsg(msg + suffix, delta).substitute({delta: delta.round()});
	}

});


Date.defineParsers(

	{
		// "today", "tomorrow", "yesterday"
		re: /^(?:tod|tom|yes)/i,
		handler: function(bits){
			var d = new Date().clearTime();
			switch(bits[0]){
				case 'tom': return d.increment();
				case 'yes': return d.decrement();
				default: 	return d;
			}
		}
	},

	{
		// "next Wednesday", "last Thursday"
		re: /^(next|last) ([a-z]+)$/i,
		handler: function(bits){
			var d = new Date().clearTime();
			var day = d.getDay();
			var newDay = Date.parseDay(bits[2], true);
			var addDays = newDay - day;
			if (newDay <= day) addDays += 7;
			if (bits[1] == 'last') addDays -= 7;
			return d.set('date', d.getDate() + addDays);
		}
	}

);


/*
---

script: Object.Extras.js

name: Object.Extras

description: Extra Object generics, like getFromPath which allows a path notation to child elements.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Object
  - /MooTools.More

provides: [Object.Extras]

...
*/

Object.extend({

	getFromPath: function(source, notation){
		notation.replace(/\[([^\]]+)\]|\.([^.[]+)|[^[.]+/g, function(match){
			if (!source) return null;
			var prop = arguments[2] || arguments[1] || arguments[0];
			source = (prop in source && source.hasOwnProperty(prop)) ? source[prop] : null;
			return match;
		});
		return source;
	},

	cleanValues: function(object, method){
		method = method || function(obj){
			return obj != null;
		};
		for(key in object){
			if(!method(object[key])) delete object[key];
		}
		return object;
	},

	erase: function(object, key){
		if(object.hasOwnProperty(key)) delete object[key];
		return object;
	},

	run: function(object){
		var args = Array.slice(arguments, 1);
		for(key in object){
			if(typeOf(object[key]) == 'function') object[key].apply(object,  args);
		}
	}

});


/*
---

script: String.Extras.js

name: String.Extras

description: Extends the String native object to include methods useful in managing various kinds of strings (query strings, urls, html, etc).

license: MIT-style license

authors:
  - Aaron Newton
  - Guillermo Rauch
  - Christopher Pitt

requires:
  - Core/String
  - Core/Array

provides: [String.Extras]

...
*/

(function(){

var special = {
	'a': '[àáâãäåăą]',
	'A': '[ÀÁÂÃÄÅĂĄ]',
	'c': '[ćčç]',
	'C': '[ĆČÇ]',
	'd': '[ďđ]',
	'D': '[ĎÐ]',
	'e': '[èéêëěę]',
	'E': '[ÈÉÊËĚĘ]',
	'g': '[ğ]',
	'G': '[Ğ]',
	'i': '[ìíîï]',
	'I': '[ÌÍÎÏ]',
	'l': '[ĺľł]',
	'L': '[ĹĽŁ]',
	'n': '[ñňń]',
	'N': '[ÑŇŃ]',
	'o': '[òóôõöøő]',
	'O': '[ÒÓÔÕÖØ]',
	'r': '[řŕ]',
	'R': '[ŘŔ]',
	's': '[ššş]',
	'S': '[ŠŞŚ]',
	't': '[ťţ]',
	'T': '[ŤŢ]',
	'ue': '[ü]',
	'UE': '[Ü]',
	'u': '[ùúûůµ]',
	'U': '[ÙÚÛŮ]',
	'y': '[ÿý]',
	'Y': '[ŸÝ]',
	'z': '[žźż]',
	'Z': '[ŽŹŻ]',
	'th': '[þ]',
	'TH': '[Þ]',
	'dh': '[ð]',
	'DH': '[Ð]',
	'ss': '[ß]',
	'oe': '[œ]',
	'OE': '[Œ]',
	'ae': '[æ]',
	'AE': '[Æ]'
},

tidy = {
	' ': '[\xa0\u2002\u2003\u2009]',
	'*': '[\xb7]',
	'\'': '[\u2018\u2019]',
	'"': '[\u201c\u201d]',
	'...': '[\u2026]',
	'-': '[\u2013]',
	'--': '[\u2014]',
	'&raquo;': '[\uFFFD]'
};

function walk(string, replacements) {
	var result = string;

	for (key in replacements) {
		result = result.replace(new RegExp(replacements[key], 'g'), key);
	}

	return result;
}

function getRegexForTag(tag, contents) {
	tag = tag || '';
	var regstr = contents ? "<" + tag + "[^>]*>([\\s\\S]*?)<\/" + tag + ">" : "<\/?" + tag + "([^>]+)?>";
	reg = new RegExp(regstr, "gi");
	return reg;
};

String.implement({

	standardize: function(){
		return walk(this, special);
	},

	repeat: function(times){
		return new Array(times + 1).join(this);
	},

	pad: function(length, str, direction){
		if (this.length >= length) return this;
		
		var pad = (str == null ? ' ' : '' + str)
			.repeat(length - this.length)
			.substr(0, length - this.length);
	
		if (!direction || direction == 'right') return this + pad;
		if (direction == 'left') return pad + this;
	
		return pad.substr(0, (pad.length / 2).floor()) + this + pad.substr(0, (pad.length / 2).ceil());
	},

	getTags: function(tag, contents){
		return this.match(getRegexForTag(tag, contents)) || [];
	},

	stripTags: function(tag, contents){
		return this.replace(getRegexForTag(tag, contents), '');
	},

	tidy: function(){
		return walk(this, tidy);
	}

});

})();


/*
---

script: String.QueryString.js

name: String.QueryString

description: Methods for dealing with URI query strings.

license: MIT-style license

authors:
  - Sebastian Markbåge, Aaron Newton, Lennart Pilon, Valerio Proietti

requires:
  - Core/Array
  - Core/String
  - /MooTools.More

provides: [String.QueryString]

...
*/

String.implement({

	parseQueryString: function(){
		var vars = this.split(/[&;]/), res = {};
		
		if (vars.length){
			
			vars.each(function(val){
			
				var index = val.indexOf('='),
					keys = index < 0 ? [''] : val.substr(0, index).match(/[^\]\[]+/g),
					value = decodeURIComponent(val.substr(index + 1)),
					obj = res;
					
				keys.each(function(key, i){
					var current = obj[key];
					if(i < keys.length - 1){
						obj = obj[key] = current || {};
					}else if(typeOf(current) == 'array'){
						current.push(value);
					}else{
						obj[key] = current != null ? [current, value] : value;
					}
				});
			});

		}
		return res;
	},

	cleanQueryString: function(method){
		return this.split('&').filter(function(val){
			
			var index = val.indexOf('='),
				key = index < 0 ? '' : val.substr(0, index),
				value = val.substr(index + 1);
			return method ? method.run([key, value]) : (value || value === 0);
			
		}).join('&');
	}

});


/*
---

script: URI.js

name: URI

description: Provides methods useful in managing the window location and uris.

license: MIT-style license

authors:
  - Sebastian Markbåge
  - Aaron Newton

requires:
  - Core/Class
  - Core/Class.Extras
  - Core/Element
  - /String.QueryString

provides: [URI]

...
*/

var URI = new Class({

	Implements: Options,

	options: {
		/*base: false*/
	},

	regex: /^(?:(\w+):)?(?:\/\/(?:(?:([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?)?(\.\.?$|(?:[^?#\/]*\/)*)([^?#]*)(?:\?([^#]*))?(?:#(.*))?/,
	parts: ['scheme', 'user', 'password', 'host', 'port', 'directory', 'file', 'query', 'fragment'],
	schemes: {http: 80, https: 443, ftp: 21, rtsp: 554, mms: 1755, file: 0},

	initialize: function(uri, options){
		this.setOptions(options);
		var base = this.options.base || URI.base;
		if(!uri) uri = base;

		if (uri && uri.parsed) this.parsed = Object.clone(uri.parsed);
		else this.set('value', uri.href || uri.toString(), base ? new URI(base) : false);
	},

	parse: function(value, base){
		var bits = value.match(this.regex);
		if (!bits) return false;
		bits.shift();
		return this.merge(bits.associate(this.parts), base);
	},

	merge: function(bits, base){
		if ((!bits || !bits.scheme) && (!base || !base.scheme)) return false;
		if (base){
			this.parts.every(function(part){
				if (bits[part]) return false;
				bits[part] = base[part] || '';
				return true;
			});
		}
		bits.port = bits.port || this.schemes[bits.scheme.toLowerCase()];
		bits.directory = bits.directory ? this.parseDirectory(bits.directory, base ? base.directory : '') : '/';
		return bits;
	},

	parseDirectory: function(directory, baseDirectory) {
		directory = (directory.substr(0, 1) == '/' ? '' : (baseDirectory || '/')) + directory;
		if (!directory.test(URI.regs.directoryDot)) return directory;
		var result = [];
		directory.replace(URI.regs.endSlash, '').split('/').each(function(dir){
			if (dir == '..' && result.length > 0) result.pop();
			else if (dir != '.') result.push(dir);
		});
		return result.join('/') + '/';
	},

	combine: function(bits){
		return bits.value || bits.scheme + '://' +
			(bits.user ? bits.user + (bits.password ? ':' + bits.password : '') + '@' : '') +
			(bits.host || '') + (bits.port && bits.port != this.schemes[bits.scheme] ? ':' + bits.port : '') +
			(bits.directory || '/') + (bits.file || '') +
			(bits.query ? '?' + bits.query : '') +
			(bits.fragment ? '#' + bits.fragment : '');
	},

	set: function(part, value, base){
		if (part == 'value'){
			var scheme = value.match(URI.regs.scheme);
			if (scheme) scheme = scheme[1];
			if (scheme && this.schemes[scheme.toLowerCase()] == null) this.parsed = { scheme: scheme, value: value };
			else this.parsed = this.parse(value, (base || this).parsed) || (scheme ? { scheme: scheme, value: value } : { value: value });
		} else if (part == 'data') {
			this.setData(value);
		} else {
			this.parsed[part] = value;
		}
		return this;
	},

	get: function(part, base){
		switch(part){
			case 'value': return this.combine(this.parsed, base ? base.parsed : false);
			case 'data' : return this.getData();
		}
		return this.parsed[part] || '';
	},

	go: function(){
		document.location.href = this.toString();
	},

	toURI: function(){
		return this;
	},

	getData: function(key, part){
		var qs = this.get(part || 'query');
		if (!(qs || qs === 0)) return key ? null : {};
		var obj = qs.parseQueryString();
		return key ? obj[key] : obj;
	},

	setData: function(values, merge, part){
		if (typeof values == 'string'){
			data = this.getData();
			data[arguments[0]] = arguments[1];
			values = data;
		} else if (merge) {
			values = Object.merge(this.getData(), values);
		}
		return this.set(part || 'query', Hash.toQueryString(values));
	},

	clearData: function(part){
		return this.set(part || 'query', '');
	}

});

URI.prototype.toString = URI.prototype.valueOf = function(){
	return this.get('value');
};

URI.regs = {
	endSlash: /\/$/,
	scheme: /^(\w+):/,
	directoryDot: /\.\/|\.$/
};

URI.base = new URI(Array.from(document.getElements('base[href]', true)).getLast(), {base: document.location});

String.implement({

	toURI: function(options){
		return new URI(this, options);
	}

});


/*
---

script: URI.Relative.js

name: URI.Relative

description: Extends the URI class to add methods for computing relative and absolute urls.

license: MIT-style license

authors:
  - Sebastian Markbåge


requires:
  - /Class.refactor
  - /URI

provides: [URI.Relative]

...
*/

URI = Class.refactor(URI, {

	combine: function(bits, base){
		if (!base || bits.scheme != base.scheme || bits.host != base.host || bits.port != base.port)
			return this.previous.apply(this, arguments);
		var end = bits.file + (bits.query ? '?' + bits.query : '') + (bits.fragment ? '#' + bits.fragment : '');

		if (!base.directory) return (bits.directory || (bits.file ? '' : './')) + end;

		var baseDir = base.directory.split('/'),
			relDir = bits.directory.split('/'),
			path = '',
			offset;

		var i = 0;
		for(offset = 0; offset < baseDir.length && offset < relDir.length && baseDir[offset] == relDir[offset]; offset++);
		for(i = 0; i < baseDir.length - offset - 1; i++) path += '../';
		for(i = offset; i < relDir.length - 1; i++) path += relDir[i] + '/';

		return (path || (bits.file ? '' : './')) + end;
	},

	toAbsolute: function(base){
		base = new URI(base);
		if (base) base.set('directory', '').set('file', '');
		return this.toRelative(base);
	},

	toRelative: function(base){
		return this.get('value', new URI(base));
	}

});


/*
---

name: Hash

description: Contains Hash Prototypes. Provides a means for overcoming the JavaScript practical impossibility of extending native Objects.

license: MIT-style license.

requires:
  - Core/Object
  - /MooTools.More

provides: [Hash]

...
*/

if(!Hash){

var Hash = new Type('Hash', function(object){
	if (typeOf(object) == 'hash') object = Object.clone(object.getClean());
	for (var key in object) this[key] = object[key];
	return this;
});


Hash.implement({

	forEach: function(fn, bind){
		Object.forEach(this, fn, bind);
	},

	getClean: function(){
		var clean = {};
		for (var key in this){
			if (this.hasOwnProperty(key)) clean[key] = this[key];
		}
		return clean;
	},

	getLength: function(){
		var length = 0;
		for (var key in this){
			if (this.hasOwnProperty(key)) length++;
		}
		return length;
	}

});

Hash.alias('each', 'forEach');

Hash.implement({

	has: Object.prototype.hasOwnProperty,

	keyOf: function(value){
		return Object.keyOf(this, value);
	},

	hasValue: function(value){
		return Object.contains(this, value);
	},

	extend: function(properties){
		Hash.each(properties || {}, function(value, key){
			Hash.set(this, key, value);
		}, this);
		return this;
	},

	combine: function(properties){
		Hash.each(properties || {}, function(value, key){
			Hash.include(this, key, value);
		}, this);
		return this;
	},

	erase: function(key){
		if (this.hasOwnProperty(key)) delete this[key];
		return this;
	},

	get: function(key){
		return (this.hasOwnProperty(key)) ? this[key] : null;
	},

	set: function(key, value){
		if (!this[key] || this.hasOwnProperty(key)) this[key] = value;
		return this;
	},

	empty: function(){
		Hash.each(this, function(value, key){
			delete this[key];
		}, this);
		return this;
	},

	include: function(key, value){
		if (this[key] == undefined) this[key] = value;
		return this;
	},

	map: function(fn, bind){
		return new Hash(Object.map(this, fn, bind));
	},

	filter: function(fn, bind){
		return new Hash(Object.filter(this, fn, bind));
	},

	every: function(fn, bind){
		return Object.every(this, fn, bind);
	},

	some: function(fn, bind){
		return Object.some(this, fn, bind);
	},

	getKeys: function(){
		return Object.keys(this);
	},

	getValues: function(){
		return Object.values(this);
	},

	toQueryString: function(base){
		return Object.toQueryString(this, base);
	}

});

Hash.alias({indexOf: 'keyOf', contains: 'hasValue'});

}


/*
---

script: Hash.Extras.js

name: Hash.Extras

description: Extends the Hash Type to include getFromPath which allows a path notation to child elements.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - /Hash
  - /Object.Extras

provides: [Hash.Extras]

...
*/

Hash.implement({

	getFromPath: function(notation){
		return Object.getFromPath(this, notation);
	},

	cleanValues: function(method){
		return new Hash(Object.cleanValues(this, method));
	},

	run: function(){
		Object.run(arguments);
	}

});


/*
---

script: Element.Forms.js

name: Element.Forms

description: Extends the Element native object to include methods useful in managing inputs.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Element
  - /String.Extras
  - /MooTools.More

provides: [Element.Forms]

...
*/

Element.implement({

	tidy: function(){
		this.set('value', this.get('value').tidy());
	},

	getTextInRange: function(start, end){
		return this.get('value').substring(start, end);
	},

	getSelectedText: function(){
		if (this.setSelectionRange) return this.getTextInRange(this.getSelectionStart(), this.getSelectionEnd());
		return document.selection.createRange().text;
	},

	getSelectedRange: function() {
		if (this.selectionStart != null){
			return {
				start: this.selectionStart, 
				end: this.selectionEnd
			};
		}
		
		var pos = {
			start: 0,
			end: 0
		};
		var range = this.getDocument().selection.createRange();
		if (!range || range.parentElement() != this) return pos;
		var duplicate = range.duplicate();
		
		if (this.type == 'text') {
			pos.start = 0 - duplicate.moveStart('character', -100000);
			pos.end = pos.start + range.text.length;
		} else {
			var value = this.get('value');
			var offset = value.length;
			duplicate.moveToElementText(this);
			duplicate.setEndPoint('StartToEnd', range);
			if(duplicate.text.length) offset -= value.match(/[\n\r]*$/)[0].length;
			pos.end = offset - duplicate.text.length;
			duplicate.setEndPoint('StartToStart', range);
			pos.start = offset - duplicate.text.length;
		}
		return pos;
	},

	getSelectionStart: function(){
		return this.getSelectedRange().start;
	},

	getSelectionEnd: function(){
		return this.getSelectedRange().end;
	},

	setCaretPosition: function(pos){
		if (pos == 'end') pos = this.get('value').length;
		this.selectRange(pos, pos);
		return this;
	},

	getCaretPosition: function(){
		return this.getSelectedRange().start;
	},

	selectRange: function(start, end){
		if (this.setSelectionRange) {
			this.focus();
			this.setSelectionRange(start, end);
		} else {
			var value = this.get('value');
			var diff = value.substr(start, end - start).replace(/\r/g, '').length;
			start = value.substr(0, start).replace(/\r/g, '').length;
			var range = this.createTextRange();
			range.collapse(true);
			range.moveEnd('character', start + diff);
			range.moveStart('character', start);
			range.select();
		}
		return this;
	},

	insertAtCursor: function(value, select){
		var pos = this.getSelectedRange();
		var text = this.get('value');
		this.set('value', text.substring(0, pos.start) + value + text.substring(pos.end, text.length));
		if (select !== false) this.selectRange(pos.start, pos.start + value.length);
		else this.setCaretPosition(pos.start + value.length);
		return this;
	},

	insertAroundCursor: function(options, select){
		options = Object.append({
			before: '',
			defaultMiddle: '',
			after: ''
		}, options);
		
		var value = this.getSelectedText() || options.defaultMiddle;
		var pos = this.getSelectedRange();
		var text = this.get('value');
		
		if (pos.start == pos.end){
			this.set('value', text.substring(0, pos.start) + options.before + value + options.after + text.substring(pos.end, text.length));
			this.selectRange(pos.start + options.before.length, pos.end + options.before.length + value.length);
		} else {
			var current = text.substring(pos.start, pos.end);
			this.set('value', text.substring(0, pos.start) + options.before + current + options.after + text.substring(pos.end, text.length));
			var selStart = pos.start + options.before.length;
			if (select !== false) this.selectRange(selStart, selStart + current.length);
			else this.setCaretPosition(selStart + text.length);
		}
		return this;
	}

});


/*
---

script: Elements.From.js

name: Elements.From

description: Returns a collection of elements from a string of html.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/String
  - Core/Element
  - /MooTools.More

provides: [Elements.from, Elements.From]

...
*/

Elements.from = function(text, excludeScripts){
	if (excludeScripts || excludeScripts == null) text = text.stripScripts();

	var container, match = text.match(/^\s*<(t[dhr]|tbody|tfoot|thead)/i);

	if (match){
		container = new Element('table');
		var tag = match[1].toLowerCase();
		if (['td', 'th', 'tr'].contains(tag)){
			container = new Element('tbody').inject(container);
			if (tag != 'tr') container = new Element('tr').inject(container);
		}
	}

	return (container || new Element('div')).set('html', text).getChildren();
};


/*
---

script: Element.Delegation.js

name: Element.Delegation

description: Extends the Element native object to include the delegate method for more efficient event management.

credits:
  - "Event checking based on the work of Daniel Steigerwald. License: MIT-style license.	Copyright: Copyright (c) 2008 Daniel Steigerwald, daniel.steigerwald.cz"

license: MIT-style license

authors:
  - Aaron Newton
  - Daniel Steigerwald

requires:
  - Core/Element.Event
  - Core/Selectors
  - /MooTools.More

provides: [Element.Delegation]

...
*/

//(function(addEvent, removeEvent){
//	
//	var key = 'delegation:_delegateMonitors',
//		splitType = function(type){
//			var parsed = Slick.parse(type).expressions[0][0],
//				pseudos = parsed.pseudos;
//			
//			return (pseudos && pseudos[0].key == 'relay') ? {
//				event: parsed.tag,
//				selector: pseudos[0].value
//			} : null;
//		},
//		
//		check = function(element, event, selector){
//			for (var target = event.target; target && target != element; target = target.parentNode)
//				if (Slick.match(target, selector)) return document.id(target);
//			
//			return null;
//		};
//
//	Element.implement({
//
//		addEvent: function(type, fn){
//			var split = splitType(type);
//			if (split.selector){
//				var monitors = this.retrieve(key, {});
//				if (!monitors[type]){
//					var monitor = function(event){
//						var element = check(this, event, split.selector);
//						if (element) this.fireEvent(type, [event, element], 0, element);
//					}.bind(this);
//					monitors[type] = monitor;
//					addEvent.call(this, split.event, monitor);
//				}
//			}
//			return addEvent.call(this, type, fn);
//		},
//
//		removeEvent: function(type, fn){
//			var split = splitType(type);
//			if (!split.selector) return removeEvent.apply(this, arguments);
//
//			var events = this.retrieve('events');
//			if (!events || !events[type] || (fn && !events[type].keys.contains(fn))) return this;
//
//			if (fn) removeEvent.call(this, type, fn);
//			else removeEvent.call(this, type);
//
//			events = this.retrieve('events');
//			if (events && events[type] && !events[type].keys.length){
//				var monitors = this.retrieve(key, {});
//				removeEvent.call(this, split.event, monitors[type]);
//				delete monitors[type];
//			}
//			return this;
//		},
//
//		fireEvent: function(type, args, delay, bind){
//			var events = this.retrieve('events');
//			if (!events || !events[type]) return this;
//			if (!bind) bind = this;
//
//			events[type].keys.each(function(fn){
//				if (delay) fn.delay(delay, bind, args);
//				else fn.apply(bind, args);
//			});
//			return this;
//		}
//
//	});
//
//})(Element.prototype.addEvent, Element.prototype.removeEvent);


/*
---

script: Element.Measure.js

name: Element.Measure

description: Extends the Element native object to include methods useful in measuring dimensions.

credits: "Element.measure / .expose methods by Daniel Steigerwald License: MIT-style license. Copyright: Copyright (c) 2008 Daniel Steigerwald, daniel.steigerwald.cz"

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Element.Style
  - Core/Element.Dimensions
  - /MooTools.More

provides: [Element.Measure]

...
*/

(function(){

var getStylesList = function(styles, planes){
	var list = [];
	Object.each(planes, function(directions){
		Object.each(directions, function(edge){
			styles.each(function(style){
				if (style == 'border') list.push(style + '-' + edge + '-width');
				else list.push(style + '-' + edge);
			});
		});
	});
	return list;
};

var calculateEdgeSize = function(edge, styles){
	var total = 0;
	Object.each(styles, function(value, style){
		if (style.test(edge)) total += value.toInt();
	});
	return total;
};


Element.implement({

	measure: function(fn){
		var visibility = function(el) {
			return !!(!el || el.offsetHeight || el.offsetWidth);
		};
		if (visibility(this)) return fn.apply(this);
		var parent = this.getParent(),
			restorers = [],
			toMeasure = [];
		while (!visibility(parent) && parent != document.body) {
			toMeasure.push(parent.expose());
			parent = parent.getParent();
		}
		var restore = this.expose();
		var result = fn.apply(this);
		restore();
		toMeasure.each(function(restore){
			restore();
		});
		return result;
	},

	expose: function(){
		if (this.getStyle('display') != 'none') return function(){};
		var before = this.style.cssText;
		this.setStyles({
			display: 'block',
			position: 'absolute',
			visibility: 'hidden'
		});
		return function(){
			this.style.cssText = before;
		}.bind(this);
	},

	getDimensions: function(options){
		options = Object.merge({computeSize: false}, options);
		var dim = {};
		
		var getSize = function(el, options){
			return (options.computeSize) ? el.getComputedSize(options) : el.getSize();
		};
		
		var parent = this.getParent('body');
		
		if (parent && this.getStyle('display') == 'none'){
			dim = this.measure(function(){
				return getSize(this, options);
			});
		} else if (parent){
			try { //safari sometimes crashes here, so catch it
				dim = getSize(this, options);
			}catch(e){}
		} else {
			dim = {x: 0, y: 0};
		}
		
		return Object.append(dim, (dim.x || dim.x === 0) ?  {
				width: dim.x,
				height: dim.y
			} : {
				x: dim.width,
				y: dim.height
			}
		);
	},

	getComputedSize: function(options){
		//<1.2compat>
		//legacy support for my stupid spelling error
		if (options && options.plains) options.planes = options.plains;
		//</1.2compat>
		
		options = Object.merge({
			styles: ['padding','border'],
			planes: {
				height: ['top','bottom'],
				width: ['left','right']
			},
			mode: 'both'
		}, options);

		var styles = {},
			size = {width: 0, height: 0};

		switch (options.mode){
			case 'vertical':
				delete size.width;
				delete options.planes.width;
				break;
			case 'horizontal':
				delete size.height;
				delete options.planes.height;
				break;
		}


		getStylesList(options.styles, options.planes).each(function(style){
			styles[style] = this.getStyle(style).toInt();
		}, this);

		Object.each(options.planes, function(edges, plane){

			var capitalized = plane.capitalize();
			styles[plane] = this.getStyle(plane).toInt();
			size['total' + capitalized] = styles[plane];

			edges.each(function(edge){
				var edgesize = calculateEdgeSize(edge, styles);
				size['computed' + edge.capitalize()] = edgesize;
				size['total' + capitalized] += edgesize;
			});
			
		}, this);
		
		return Object.append(size, styles);
	}

});

})();


/*
---

script: Element.Pin.js

name: Element.Pin

description: Extends the Element native object to include the pin method useful for fixed positioning for elements.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Element.Event
  - Core/Element.Dimensions
  - Core/Element.Style
  - /MooTools.More

provides: [Element.Pin]

...
*/

(function(){
	
	var supportsPositionFixed = false;
	window.addEvent('domready', function(){
		var test = new Element('div').setStyles({
			position: 'fixed',
			top: 0,
			right: 0
		}).inject(document.body);
		supportsPositionFixed = (test.offsetTop === 0);
		test.dispose();
	});

	Element.implement({

		pin: function(enable){
			if (this.getStyle('display') == 'none') return null;
			
			var pinnedPosition,
				scroll = window.getScroll();
				
			if (enable !== false){
				pinnedPosition = this.getPosition();
				
				if (!this.retrieve('pin:_pinned')){
					var currentPosition = {
						top: pinnedPosition.y - scroll.y,
						left: pinnedPosition.x - scroll.x
					};
					
					if (supportsPositionFixed){
						this.setStyle('position', 'fixed').setStyles(currentPosition);
					} else {
						
						this.store('pin:_pinnedByJS', true);
						this.setStyles({
							position: 'absolute',
							top: pinnedPosition.y,
							left: pinnedPosition.x
						}).addClass('isPinned');
						
						var scrollFixer = function(){
							if (this.retrieve('pin:_pinned'))
								var scroll = window.getScroll();
								this.setStyles({
									top: currentPosition.top.toInt() + scroll.y,
									left: currentPosition.left.toInt() + scroll.x
								});
						}.bind(this);
						
						this.store('pin:_scrollFixer', scrollFixer);
						window.addEvent('scroll', scrollFixer);
					}
					this.store('pin:_pinned', true);
				}
				
			} else {
				var offsetParent;
				if (!Browser.ie){
					var parent = this.getParent();
					offsetParent = (parent.getComputedStyle('position') != 'static' ? parent : parent.getOffsetParent());
				}
				pinnedPosition = this.getPosition(offsetParent);
				this.store('pin:_pinned', false);
				var reposition;
				if (supportsPositionFixed && !this.retrieve('pin:_pinnedByJS')){
					reposition = {
						top: pinnedPosition.y + scroll.y,
						left: pinnedPosition.x + scroll.x
					};
				} else {
					this.store('pin:_pinnedByJS', false);
					window.removeEvent('scroll', this.retrieve('pin:_scrollFixer'));
					reposition = {
						top: pinnedPosition.y,
						left: pinnedPosition.x
					};
				}
				this.setStyles(Object.merge(reposition, {position: 'absolute'})).removeClass('isPinned');
			}
			return this;
		},

		unpin: function(){
			return this.pin(false);
		},

		togglepin: function(){
			this.pin(!this.retrieve('pin:_pinned'));
		}

	});

})();


/*
---

script: Element.Position.js

name: Element.Position

description: Extends the Element native object to include methods useful positioning elements relative to others.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Element.Dimensions
  - /Element.Measure

provides: [Element.Position]

...
*/

(function(){

var original = Element.prototype.position;

Element.implement({

	position: function(options){
		//call original position if the options are x/y values
		if (options && (options.x != null || options.y != null)){
			return original ? original.apply(this, arguments) : this;
		}
		
		Object.each(options || {}, function(v, k){
			if (v == null) delete options[k];
		});
		
		options = Object.merge({
			// minimum: { x: 0, y: 0 },
			// maximum: { x: 0, y: 0},
			relativeTo: document.body,
			position: {
				x: 'center', //left, center, right
				y: 'center' //top, center, bottom
			},
			edge: false,
			offset: {x: 0, y: 0},
			returnPos: false,
			relFixedPosition: false,
			ignoreMargins: false,
			ignoreScroll: false,
			allowNegative: false
		}, options);
		
		//compute the offset of the parent positioned element if this element is in one
		var parentOffset = {x: 0, y: 0},
			parentPositioned = false;
			
		/* dollar around getOffsetParent should not be necessary, but as it does not return
		 * a mootools extended element in IE, an error occurs on the call to expose. See:
		 * http://mootools.lighthouseapp.com/projects/2706/tickets/333-element-getoffsetparent-inconsistency-between-ie-and-other-browsers */
		var offsetParent = this.measure(function(){
			return document.id(this.getOffsetParent());
		});
		if (offsetParent && offsetParent != this.getDocument().body){
			parentOffset = offsetParent.measure(function(){
				return this.getPosition();
			});
			parentPositioned = offsetParent != document.id(options.relativeTo);
			options.offset.x = options.offset.x - parentOffset.x;
			options.offset.y = options.offset.y - parentOffset.y;
		}
		
		//upperRight, bottomRight, centerRight, upperLeft, bottomLeft, centerLeft
		//topRight, topLeft, centerTop, centerBottom, center
		var fixValue = function(option){
			if (typeOf(option) != 'string') return option;
			option = option.toLowerCase();
			var val = {};
			
			if (option.test('left')){
				val.x = 'left';
			} else if (option.test('right')){
				val.x = 'right';
			} else {
				val.x = 'center';
			}
				
			if (option.test('upper') || option.test('top')){
				val.y = 'top';
			} else if (option.test('bottom')) {
				val.y = 'bottom';
			} else {
				val.y = 'center';
			}
			
			return val;
		};
		
		options.edge = fixValue(options.edge);
		options.position = fixValue(options.position);
		if (!options.edge){
			if (options.position.x == 'center' && options.position.y == 'center') options.edge = {x:'center', y:'center'};
			else options.edge = {x:'left', y:'top'};
		}

		this.setStyle('position', 'absolute');
		var rel = document.id(options.relativeTo) || document.body,
				calc = rel == document.body ? window.getScroll() : rel.getPosition(),
				top = calc.y, left = calc.x;

		var dim = this.getDimensions({
			computeSize: true,
			styles:['padding', 'border','margin']
		});
		
		var pos = {},
			prefY = options.offset.y,
			prefX = options.offset.x,
			winSize = window.getSize();

		switch(options.position.x){
			case 'left':
				pos.x = left + prefX;
				break;
			case 'right':
				pos.x = left + prefX + rel.offsetWidth;
				break;
			default: //center
				pos.x = left + ((rel == document.body ? winSize.x : rel.offsetWidth)/2) + prefX;
				break;
		}
		
		switch(options.position.y){
			case 'top':
				pos.y = top + prefY;
				break;
			case 'bottom':
				pos.y = top + prefY + rel.offsetHeight;
				break;
			default: //center
				pos.y = top + ((rel == document.body ? winSize.y : rel.offsetHeight)/2) + prefY;
				break;
		}
		
		if (options.edge){
			var edgeOffset = {};

			switch(options.edge.x){
				case 'left':
					edgeOffset.x = 0;
					break;
				case 'right':
					edgeOffset.x = -dim.x-dim.computedRight-dim.computedLeft;
					break;
				default: //center
					edgeOffset.x = -(dim.totalWidth/2);
					break;
			}
			
			switch(options.edge.y){
				case 'top':
					edgeOffset.y = 0;
					break;
				case 'bottom':
					edgeOffset.y = -dim.y-dim.computedTop-dim.computedBottom;
					break;
				default: //center
					edgeOffset.y = -(dim.totalHeight/2);
					break;
			}
			
			pos.x += edgeOffset.x;
			pos.y += edgeOffset.y;
		}
		
		pos = {
			left: ((pos.x >= 0 || parentPositioned || options.allowNegative) ? pos.x : 0).toInt(),
			top: ((pos.y >= 0 || parentPositioned || options.allowNegative) ? pos.y : 0).toInt()
		};
		
		var xy = {left: 'x', top: 'y'};
		
		['minimum', 'maximum'].each(function(minmax) {
			['left', 'top'].each(function(lr) {
				var val = options[minmax] ? options[minmax][xy[lr]] : null;
				if (val != null && pos[lr] < val) pos[lr] = val;
			});
		});
		
		if (rel.getStyle('position') == 'fixed' || options.relFixedPosition){
			var winScroll = window.getScroll();
			pos.top+= winScroll.y;
			pos.left+= winScroll.x;
		}
		var relScroll = rel.getScroll();
		if (options.ignoreScroll) {
			pos.top -= relScroll.y;
			pos.left -= relScroll.x;
		} else {
			pos.top += relScroll.y;
			pos.left += relScroll.x;
		}
		
		if (options.ignoreMargins) {
			pos.left += (
				options.edge.x == 'right' ? dim['margin-right'] :
				options.edge.x == 'center' ? -dim['margin-left'] + ((dim['margin-right'] + dim['margin-left'])/2) : 
					- dim['margin-left']
			);
			pos.top += (
				options.edge.y == 'bottom' ? dim['margin-bottom'] : 
				options.edge.y == 'center' ? -dim['margin-top'] + ((dim['margin-bottom'] + dim['margin-top'])/2) : 
					- dim['margin-top']
			);
		}
		
		pos.left = Math.ceil(pos.left);
		pos.top = Math.ceil(pos.top);
		if (options.returnPos) return pos;
		else this.setStyles(pos);
		return this;
	}

});

})();


/*
---

script: Element.Shortcuts.js

name: Element.Shortcuts

description: Extends the Element native object to include some shortcut methods.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Element.Style
  - /MooTools.More

provides: [Element.Shortcuts]

...
*/

Element.implement({

	isDisplayed: function(){
		return this.getStyle('display') != 'none';
	},

	isVisible: function(){
		var w = this.offsetWidth,
			h = this.offsetHeight;
		return (w == 0 && h == 0) ? false : (w > 0 && h > 0) ? true : this.isDisplayed();
	},

	toggle: function(){
		return this[this.isDisplayed() ? 'hide' : 'show']();
	},

	hide: function(){
		var d;
		try {
			//IE fails here if the element is not in the dom
			d = this.getStyle('display');
		} catch(e){}
		return this.store('element:_originalDisplay', d || '').setStyle('display', 'none');
	},

	show: function(display){
		display = display || this.retrieve('element:_originalDisplay') || 'block';
		return this.setStyle('display', (display == 'none') ? 'block' : display);
	},

	swapClass: function(remove, add){
		return this.removeClass(remove).addClass(add);
	}

});


/*
---

script: IframeShim.js

name: IframeShim

description: Defines IframeShim, a class for obscuring select lists and flash objects in IE.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Element.Event
  - Core/Element.Style
  - Core/Options
  - Core/Events
  - /Element.Position
  - /Class.Occlude

provides: [IframeShim]

...
*/

var IframeShim = new Class({

	Implements: [Options, Events, Class.Occlude],

	options: {
		className: 'iframeShim',
		src: 'javascript:false;document.write("");',
		display: false,
		zIndex: null,
		margin: 0,
		offset: {x: 0, y: 0},
		browsers: ((Browser.ie && Browser.version == 6) || (Browser.firefox && Browser.version < 3 && Browser.Platform.mac))
	},

	property: 'IframeShim',

	initialize: function(element, options){
		this.element = document.id(element);
		if (this.occlude()) return this.occluded;
		this.setOptions(options);
		this.makeShim();
		return this;
	},

	makeShim: function(){
		if(this.options.browsers){
			var zIndex = this.element.getStyle('zIndex').toInt();

			if (!zIndex){
				zIndex = 1;
				var pos = this.element.getStyle('position');
				if (pos == 'static' || !pos) this.element.setStyle('position', 'relative');
				this.element.setStyle('zIndex', zIndex);
			}
			zIndex = ((this.options.zIndex != null || this.options.zIndex === 0) && zIndex > this.options.zIndex) ? this.options.zIndex : zIndex - 1;
			if (zIndex < 0) zIndex = 1;
			this.shim = new Element('iframe', {
				src: this.options.src,
				scrolling: 'no',
				frameborder: 0,
				styles: {
					zIndex: zIndex,
					position: 'absolute',
					border: 'none',
					filter: 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)'
				},
				'class': this.options.className
			}).store('IframeShim', this);
			var inject = (function(){
				this.shim.inject(this.element, 'after');
				this[this.options.display ? 'show' : 'hide']();
				this.fireEvent('inject');
			}).bind(this);
			if (!IframeShim.ready) window.addEvent('load', inject);
			else inject();
		} else {
			this.position = this.hide = this.show = this.dispose = Function.from(this);
		}
	},

	position: function(){
		if (!IframeShim.ready || !this.shim) return this;
		var size = this.element.measure(function(){ 
			return this.getSize(); 
		});
		if (this.options.margin != undefined){
			size.x = size.x - (this.options.margin * 2);
			size.y = size.y - (this.options.margin * 2);
			this.options.offset.x += this.options.margin;
			this.options.offset.y += this.options.margin;
		}
		this.shim.set({width: size.x, height: size.y}).position({
			relativeTo: this.element,
			offset: this.options.offset
		});
		return this;
	},

	hide: function(){
		if (this.shim) this.shim.setStyle('display', 'none');
		return this;
	},

	show: function(){
		if (this.shim) this.shim.setStyle('display', 'block');
		return this.position();
	},

	dispose: function(){
		if (this.shim) this.shim.dispose();
		return this;
	},

	destroy: function(){
		if (this.shim) this.shim.destroy();
		return this;
	}

});

window.addEvent('load', function(){
	IframeShim.ready = true;
});


/*
---

script: Mask.js

name: Mask

description: Creates a mask element to cover another.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Options
  - Core/Events
  - Core/Element.Event
  - /Class.Binds
  - /Element.Position
  - /IframeShim

provides: [Mask]

...
*/

var Mask = new Class({

	Implements: [Options, Events],

	Binds: ['position'],

	options: {/*
		onShow: function(){},
		onHide: function(){},
		onDestroy: function(){},
		onClick: function(){},
		inject: {
			where: 'after',
			target: null,
		},
		hideOnClick: false,
		id: null,
		destroyOnHide: false,*/
		style: {},
		'class': 'mask',
		maskMargins: false,
		useIframeShim: true,
		iframeShimOptions: {}
	},

	initialize: function(target, options){
		this.target = document.id(target) || document.id(document.body);
		this.target.store('Mask', this);
		this.setOptions(options);
		this.render();
		this.inject();
	},
	
	render: function() {
		this.element = new Element('div', {
			'class': this.options['class'],
			id: this.options.id || 'mask-' + Date.now(),
			styles: Object.merge(this.options.style, {
				display: 'none'
			}),
			events: {
				click: function(){
					this.fireEvent('click');
					if (this.options.hideOnClick) this.hide();
				}.bind(this)
			}
		});
		this.hidden = true;
	},

	toElement: function(){
		return this.element;
	},

	inject: function(target, where){
		where = where || this.options.inject ? this.options.inject.where : '' || this.target == document.body ? 'inside' : 'after';
		target = target || this.options.inject ? this.options.inject.target : '' || this.target;
		this.element.inject(target, where);
		if (this.options.useIframeShim) {
			this.shim = new IframeShim(this.element, this.options.iframeShimOptions);
			this.addEvents({
				show: this.shim.show.bind(this.shim),
				hide: this.shim.hide.bind(this.shim),
				destroy: this.shim.destroy.bind(this.shim)
			});
		}
	},

	position: function(){
		this.resize(this.options.width, this.options.height);
		this.element.position({
			relativeTo: this.target,
			position: 'topLeft',
			ignoreMargins: !this.options.maskMargins,
			ignoreScroll: this.target == document.body
		});
		return this;
	},

	resize: function(x, y){
		var opt = {
			styles: ['padding', 'border']
		};
		if (this.options.maskMargins) opt.styles.push('margin');
		var dim = this.target.getComputedSize(opt);
		if (this.target == document.body) {
			var win = window.getSize();
			if (dim.totalHeight < win.y) dim.totalHeight = win.y;
			if (dim.totalWidth < win.x) dim.totalWidth = win.x;
		}
		this.element.setStyles({
			width: Array.pick([x, dim.totalWidth, dim.x]),
			height: Array.pick([y, dim.totalHeight, dim.y])
		});
		return this;
	},

	show: function(){
		if (!this.hidden) return this;
		window.addEvent('resize', this.position);
		this.position();
		this.showMask.apply(this, arguments);
		return this;
	},

	showMask: function(){
		this.element.setStyle('display', 'block');
		this.hidden = false;
		this.fireEvent('show');
	},

	hide: function(){
		if (this.hidden) return this;
		window.removeEvent('resize', this.position);
		this.hideMask.apply(this, arguments);
		if (this.options.destroyOnHide) return this.destroy();
		return this;
	},

	hideMask: function(){
		this.element.setStyle('display', 'none');
		this.hidden = true;
		this.fireEvent('hide');
	},

	toggle: function(){
		this[this.hidden ? 'show' : 'hide']();
	},

	destroy: function(){
		this.hide();
		this.element.destroy();
		this.fireEvent('destroy');
		this.target.eliminate('mask');
	}

});

Element.Properties.mask = {

	set: function(options){
		var mask = this.retrieve('mask');
		return this.eliminate('mask').store('mask:options', options);
	},

	get: function(options){
		if (options || !this.retrieve('mask')){
			if (this.retrieve('mask')) this.retrieve('mask').destroy();
			if (options || !this.retrieve('mask:options')) this.set('mask', options);
			this.store('mask', new Mask(this, this.retrieve('mask:options')));
		}
		return this.retrieve('mask');
	}

};

Element.implement({

	mask: function(options){
		this.get('mask', options).show();
		return this;
	},

	unmask: function(){
		this.get('mask').hide();
		return this;
	}

});





/*
---

script: Form.Request.js

name: Form.Request

description: Handles the basic functionality of submitting a form and updating a dom element with the result.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Request.HTML
  - /Class.Binds
  - /Class.Occlude
  - /Spinner
  - /String.QueryString
  - /Element.Delegation

provides: [Form.Request]

...
*/

if (!window.Form) window.Form = {};

(function(){

	Form.Request = new Class({

		Binds: ['onSubmit', 'onFormValidate'],

		Implements: [Options, Events, Class.Occlude],

		options: {
			//onFailure: function(){},
			//onSuccess: #function(){}, //aliased to onComplete,
			//onSend: function(){}
			requestOptions: {
				evalScripts: true,
				useSpinner: true,
				emulation: false,
				link: 'ignore'
			},
			sendButtonClicked: true,
			extraData: {},
			resetForm: true
		},

		property: 'form.request',

		initialize: function(form, update, options) {
			this.element = document.id(form);
			if (this.occlude()) return this.occluded;
			this.update = document.id(update);
			this.setOptions(options);
			this.makeRequest();
			if (this.options.resetForm) {
				this.request.addEvent('success', function(){
					Function.attempt(function(){ this.element.reset(); }.bind(this));
					if (window.OverText) OverText.update();
				}.bind(this));
			}
			this.attach();
		},

		toElement: function() {
			return this.element;
		},

		makeRequest: function(){
			this.request = new Request.HTML(Object.merge({
					update: this.update,
					emulation: false,
					spinnerTarget: this.element,
					method: this.element.get('method') || 'post'
			}, this.options.requestOptions)).addEvents({
				success: function(tree, elements, html, javascript){
					['complete', 'success'].each(function(evt){
						this.fireEvent(evt, [this.update, tree, elements, html, javascript]);
					}, this);
				}.bind(this),
				failure: function(){
					this.fireEvent('complete', arguments).fireEvent('failure', arguments);
				}.bind(this),
				exception: function(){
					this.fireEvent('failure', arguments);
				}.bind(this)
			});
		},

		attach: function(attach){
			attach = attach != null ? attach : true;
			method = attach ? 'addEvent' : 'removeEvent';
			
			this.element[method]('click:relay(button, input[type=submit])', this.saveClickedButton.bind(this));
			
			var fv = this.element.retrieve('validator');
			if (fv) fv[method]('onFormValidate', this.onFormValidate);
			else this.element[method]('submit', this.onSubmit);
		},

		detach: function(){
			this.attach(false);
			return this;
		},

		//public method
		enable: function(){
			this.attach();
			return this;
		},

		//public method
		disable: function(){
			this.detach();
			return this;
		},

		onFormValidate: function(valid, form, e) {
			//if there's no event, then this wasn't a submit event
			if (!e) return;
			var fv = this.element.retrieve('validator');
			if (valid || (fv && !fv.options.stopOnFailure)) {
				if (e && e.stop) e.stop();
				this.send();
			}
		},

		onSubmit: function(e){
			var fv = this.element.retrieve('validator');
			if (fv) {
				//form validator was created after Form.Request
				this.element.removeEvent('submit', this.onSubmit);
				fv.addEvent('onFormValidate', this.onFormValidate);
				this.element.validate();
				return;
			}
			if (e) e.stop();
			this.send();
		},

		saveClickedButton: function(event, target) {
			if (!this.options.sendButtonClicked) return;
			if (!target.get('name')) return;
			this.options.extraData[target.get('name')] = target.get('value') || true;
			this.clickedCleaner = function(){
				delete this.options.extraData[target.get('name')];
				this.clickedCleaner = function(){};
			}.bind(this);
		},

		clickedCleaner: function(){},

		send: function(){
			var str = this.element.toQueryString().trim();
			var data = Object.toQueryString(this.options.extraData);
			if (str) str += "&" + data;
			else str = data;
			this.fireEvent('send', [this.element, str.parseQueryString()]);
			this.request.send({data: str, url: this.element.get("action")});
			this.clickedCleaner();
			return this;
		}

	});

	Element.Properties.formRequest = {

		set: function(){
			var opt = Array.link(arguments, {options: Type.isObject, update: Type.isElement, updateId: Type.isString});
			var update = opt.update || opt.updateId;
			var updater = this.retrieve('form.request');
			if (update) {
				if (updater) updater.update = document.id(update);
				this.store('form.request:update', update);
			}
			if (opt.options) {
				if (updater) updater.setOptions(opt.options);
				this.store('form.request:options', opt.options);
			}
			return this;
		},

		get: function(){
			var opt = Array.link(arguments, {options: Type.isObject, update: Type.isElement, updateId: Type.isString});
			var update = opt.update || opt.updateId;
			if (opt.options || update || !this.retrieve('form.request')){
				if (opt.options || !this.retrieve('form.request:options')) this.set('form.request', opt.options);
				if (update) this.set('form.request', update);
				this.store('form.request', new Form.Request(this, this.retrieve('form.request:update'), this.retrieve('form.request:options')));
			}
			return this.retrieve('form.request');
		}

	};

	Element.implement({

		formUpdate: function(update, options){
			this.get('formRequest', update, options).send();
			return this;
		}

	});

})();


/*
---

script: Fx.Reveal.js

name: Fx.Reveal

description: Defines Fx.Reveal, a class that shows and hides elements with a transition.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Fx.Morph
  - /Element.Shortcuts
  - /Element.Measure

provides: [Fx.Reveal]

...
*/

Fx.Reveal = new Class({

	Extends: Fx.Morph,

	options: {/*
		onShow: function(thisElement){},
		onHide: function(thisElement){},
		onComplete: function(thisElement){},
		heightOverride: null,
		widthOverride: null,*/
		link: 'cancel',
		styles: ['padding', 'border', 'margin'],
		transitionOpacity: !Browser.ie6,
		mode: 'vertical',
		display: 'block',
		opacity: 1,
		hideInputs: Browser.ie ? 'select, input, textarea, object, embed' : null
	},

	dissolve: function(){
		if (!this.hiding && !this.showing){
			if (this.element.getStyle('display') != 'none'){
				this.hiding = true;
				this.showing = false;
				this.hidden = true;
				this.cssText = this.element.style.cssText;

				var startStyles = this.element.getComputedSize({
					styles: this.options.styles,
					mode: this.options.mode
				});
				if (this.options.transitionOpacity) startStyles.opacity = this.options.opacity;

				var zero = {};
				Object.each(startStyles, function(style, name){
					zero[name] = [style, 0];
				});

				this.element.setStyles({
					display: this.options.display,
					overflow: 'hidden'
				});

				var hideThese = this.options.hideInputs ? this.element.getElements(this.options.hideInputs) : null;
				if (hideThese) hideThese.setStyle('visibility', 'hidden');

				this.$chain.unshift(function(){
					if (this.hidden){
						this.hiding = false;
						this.element.style.cssText = this.cssText;
						this.element.setStyle('display', 'none');
						if (hideThese) hideThese.setStyle('visibility', 'visible');
					}
					this.fireEvent('hide', this.element);
					this.callChain();
				}.bind(this));

				this.start(zero);
			} else {
				this.callChain.delay(10, this);
				this.fireEvent('complete', this.element);
				this.fireEvent('hide', this.element);
			}
		} else if (this.options.link == 'chain'){
			this.chain(this.dissolve.bind(this));
		} else if (this.options.link == 'cancel' && !this.hiding){
			this.cancel();
			this.dissolve();
		}
		return this;
	},

	reveal: function(){
		if (!this.showing && !this.hiding){
			if (this.element.getStyle('display') == 'none' ||
				this.element.getStyle('visiblity') == 'hidden' ||
				this.element.getStyle('opacity') == 0){
				this.hiding = false;
				this.showing = true;
				this.hidden = false;
				this.cssText = this.element.style.cssText;

				var startStyles;
				this.element.measure(function(){
					startStyles = this.element.getComputedSize({
						styles: this.options.styles,
						mode: this.options.mode
					});
				}.bind(this));
				if (this.options.heightOverride != null) startStyles.height = this.options.heightOverride.toInt();
				if (this.options.widthOverride != null) startStyles.width = this.options.widthOverride.toInt();
				if (this.options.transitionOpacity){
					this.element.setStyle('opacity', 0);
					startStyles.opacity = this.options.opacity;
				}

				var zero = {
					height: 0,
					display: this.options.display
				};
				Object.each(startStyles, function(style, name){
					zero[name] = 0;
				});
				zero.overflow = 'hidden';

				this.element.setStyles(zero);

				var hideThese = this.options.hideInputs ? this.element.getElements(this.options.hideInputs) : null;
				if (hideThese) hideThese.setStyle('visibility', 'hidden');

				this.$chain.unshift(function(){
					this.element.style.cssText = this.cssText;
					this.element.setStyle('display', this.options.display);
					if (!this.hidden) this.showing = false;
					if (hideThese) hideThese.setStyle('visibility', 'visible');
					this.callChain();
					this.fireEvent('show', this.element);
				}.bind(this));

				this.start(startStyles);
			} else {
				this.callChain();
				this.fireEvent('complete', this.element);
				this.fireEvent('show', this.element);
			}
		} else if (this.options.link == 'chain'){
			this.chain(this.reveal.bind(this));
		} else if (this.options.link == 'cancel' && !this.showing){
			this.cancel();
			this.reveal();
		}
		return this;
	},

	toggle: function(){
		if (this.element.getStyle('display') == 'none' ||
			this.element.getStyle('visiblity') == 'hidden' ||
			this.element.getStyle('opacity') == 0){
			this.reveal();
		} else {
			this.dissolve();
		}
		return this;
	},

	cancel: function(){
		this.parent.apply(this, arguments);
		this.element.style.cssText = this.cssText;
		this.hiding = false;
		this.showing = false;
	}

});

Element.Properties.reveal = {

	set: function(options){
		this.get('reveal').cancel().setOptions(options);
		return this;
	},

	get: function(){
		var reveal = this.retrieve('reveal');
		if (!reveal){
			reveal = new Fx.Reveal(this);
			this.store('reveal', reveal);
		}
		return reveal;
	}

};

Element.Properties.dissolve = Element.Properties.reveal;

Element.implement({

	reveal: function(options){
		this.get('reveal').setOptions(options).reveal();
		return this;
	},

	dissolve: function(options){
		this.get('reveal').setOptions(options).dissolve();
		return this;
	},

	nix: function(options){
		var params = Array.link(arguments, {destroy: Boolean.type, options: Object.type});
		this.get('reveal').setOptions(options).dissolve().chain(function(){
			this[params.destroy ? 'destroy' : 'dispose']();
		}.bind(this));
		return this;
	},

	wink: function(){
		var params = Array.link(arguments, {duration: Number.type, options: Object.type});
		var reveal = this.get('reveal').setOptions(params.options);
		reveal.reveal().chain(function(){
			(function(){
				reveal.dissolve();
			}).delay(params.duration || 2000);
		});
	}

});


/*
---

script: Form.Request.Append.js

name: Form.Request.Append

description: Handles the basic functionality of submitting a form and updating a dom element with the result. The result is appended to the DOM element instead of replacing its contents.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - /Form.Request
  - /Fx.Reveal
  - /Elements.from

provides: [Form.Request.Append]

...
*/

Form.Request.Append = new Class({

	Extends: Form.Request,

	options: {
		//onBeforeEffect: function(){},
		useReveal: true,
		revealOptions: {},
		inject: 'bottom'
	},

	makeRequest: function(){
		this.request = new Request.HTML(Object.merge({
				url: this.element.get('action'),
				method: this.element.get('method') || 'post',
				spinnerTarget: this.element
			}, this.options.requestOptions, {
				evalScripts: false
			})
		).addEvents({
			success: function(tree, elements, html, javascript){
				var container;
				var kids = Elements.from(html);
				if (kids.length == 1) {
					container = kids[0];
				} else {
					 container = new Element('div', {
						styles: {
							display: 'none'
						}
					}).adopt(kids);
				}
				container.inject(this.update, this.options.inject);
				if (this.options.requestOptions.evalScripts) Browser.exec(javascript);
				this.fireEvent('beforeEffect', container);
				var finish = function(){
					this.fireEvent('success', [container, this.update, tree, elements, html, javascript]);
				}.bind(this);
				if (this.options.useReveal) {
					container.get('reveal', this.options.revealOptions).chain(finish);
					container.reveal();
				} else {
					finish();
				}
			}.bind(this),
			failure: function(xhr){
				this.fireEvent('failure', xhr);
			}.bind(this)
		});
	}

});


/*
---

script: Form.Validator.English.js

name: Form.Validator.English

description: Form Validator messages for English.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - /Lang

provides: [Form.Validator.English]

...
*/

MooTools.lang.set('en-US', 'Form.Validator', {

	required:'This field is required.',
	minLength:'Please enter at least {minLength} characters (you entered {length} characters).',
	maxLength:'Please enter no more than {maxLength} characters (you entered {length} characters).',
	integer:'Please enter an integer in this field. Numbers with decimals (e.g. 1.25) are not permitted.',
	numeric:'Please enter only numeric values in this field (i.e. "1" or "1.1" or "-1" or "-1.1").',
	digits:'Please use numbers and punctuation only in this field (for example, a phone number with dashes or dots is permitted).',
	alpha:'Please use letters only (a-z) with in this field. No spaces or other characters are allowed.',
	alphanum:'Please use only letters (a-z) or numbers (0-9) only in this field. No spaces or other characters are allowed.',
	dateSuchAs:'Please enter a valid date such as {date}',
	dateInFormatMDY:'Please enter a valid date such as MM/DD/YYYY (i.e. "12/31/1999")',
	email:'Please enter a valid email address. For example "fred@domain.com".',
	url:'Please enter a valid URL such as http://www.google.com.',
	currencyDollar:'Please enter a valid $ amount. For example $100.00 .',
	oneRequired:'Please enter something for at least one of these inputs.',
	errorPrefix: 'Error: ',
	warningPrefix: 'Warning: ',

	//Form.Validator.Extras

	noSpace: 'There can be no spaces in this input.',
	reqChkByNode: 'No items are selected.',
	requiredChk: 'This field is required.',
	reqChkByName: 'Please select a {label}.',
	match: 'This field needs to match the {matchName} field',
	startDate: 'the start date',
	endDate: 'the end date',
	currendDate: 'the current date',
	afterDate: 'The date should be the same or after {label}.',
	beforeDate: 'The date should be the same or before {label}.',
	startMonth: 'Please select a start month',
	sameMonth: 'These two dates must be in the same month - you must change one or the other.',
	creditcard: 'The credit card number entered is invalid. Please check the number and try again. {length} digits entered.'

});


/*
---

script: Form.Validator.js

name: Form.Validator

description: A css-class based form validation system.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Options
  - Core/Events
  - Core/Selectors
  - Core/Element.Event
  - Core/Element.Style
  - Core/JSON
  - /Lang
  - /Class.Binds
  - /Date 
  - /Element.Forms
  - /Form.Validator.English
  - /Element.Shortcuts

provides: [Form.Validator, InputValidator, FormValidator.BaseValidators]

...
*/
if (!window.Form) window.Form = {};

var InputValidator = new Class({

	Implements: [Options],

	options: {
		errorMsg: 'Validation failed.',
		test: function(field){return true;}
	},

	initialize: function(className, options){
		this.setOptions(options);
		this.className = className;
	},

	test: function(field, props){
		if (document.id(field)) return this.options.test(document.id(field), props || this.getProps(field));
		else return false;
	},

	getError: function(field, props){
		var err = this.options.errorMsg;
		if (typeOf(err) == 'function') err = err(document.id(field), props || this.getProps(field));
		return err;
	},

	getProps: function(field){
		if (!document.id(field)) return {};
		return field.get('validatorProps');
	}

});

Element.Properties.validatorProps = {

	set: function(props){
		return this.eliminate('validatorProps').store('validatorProps', props);
	},

	get: function(props){
		if (props) this.set(props);
		if (this.retrieve('validatorProps')) return this.retrieve('validatorProps');
		if (this.getProperty('validatorProps')){
			try {
				this.store('validatorProps', JSON.decode(this.getProperty('validatorProps')));
			}catch(e){
				return {};
			}
		} else {
			var vals = this.get('class').split(' ').filter(function(cls){
				return cls.test(':');
			});
			if (!vals.length){
				this.store('validatorProps', {});
			} else {
				props = {};
				vals.each(function(cls){
					var split = cls.split(':');
					if (split[1]) {
						try {
							props[split[0]] = JSON.decode(split[1]);
						} catch(e) {}
					}
				});
				this.store('validatorProps', props);
			}
		}
		return this.retrieve('validatorProps');
	}

};

Form.Validator = new Class({

	Implements:[Options, Events],

	Binds: ['onSubmit'],

	options: {/*
		onFormValidate: function(isValid, form, event){},
		onElementValidate: function(isValid, field, className, warn){},
		onElementPass: function(field){},
		onElementFail: function(field, validatorsFailed){}, */
		fieldSelectors: 'input, select, textarea',
		ignoreHidden: true,
		ignoreDisabled: true,
		useTitles: false,
		evaluateOnSubmit: true,
		evaluateFieldsOnBlur: true,
		evaluateFieldsOnChange: true,
		serial: true,
		stopOnFailure: true,
		warningPrefix: function(){
			return Form.Validator.getMsg('warningPrefix') || 'Warning: ';
		},
		errorPrefix: function(){
			return Form.Validator.getMsg('errorPrefix') || 'Error: ';
		}
	},

	initialize: function(form, options){
		this.setOptions(options);
		this.element = document.id(form);
		this.element.store('validator', this);
		this.warningPrefix = Function.from(this.options.warningPrefix)();
		this.errorPrefix = Function.from(this.options.errorPrefix)();
		if (this.options.evaluateOnSubmit) this.element.addEvent('submit', this.onSubmit);
		if (this.options.evaluateFieldsOnBlur || this.options.evaluateFieldsOnChange) this.watchFields(this.getFields());
	},

	toElement: function(){
		return this.element;
	},

	getFields: function(){
		return (this.fields = this.element.getElements(this.options.fieldSelectors));
	},

	watchFields: function(fields){
		fields.each(function(el){
			if (this.options.evaluateFieldsOnBlur)
				el.addEvent('blur', this.validationMonitor.pass([el, false], this));
			if (this.options.evaluateFieldsOnChange)
				el.addEvent('change', this.validationMonitor.pass([el, true], this));
		}, this);
	},

	validationMonitor: function(){
		clearTimeout(this.timer);
		this.timer = this.validateField.delay(50, this, arguments);
	},

	onSubmit: function(event){
		if (!this.validate(event) && event) event.preventDefault();
		else this.reset();
	},

	reset: function(){
		this.getFields().each(this.resetField, this);
		return this;
	},

	validate: function(event){
		var result = this.getFields().map(function(field){
			return this.validateField(field, true);
		}, this).every(function(v){ return v;});
		this.fireEvent('formValidate', [result, this.element, event]);
		if (this.options.stopOnFailure && !result && event) event.preventDefault();
		return result;
	},

	validateField: function(field, force){
		if (this.paused) return true;
		field = document.id(field);
		var passed = !field.hasClass('validation-failed');
		var failed, warned;
		if (this.options.serial && !force){
			failed = this.element.getElement('.validation-failed');
			warned = this.element.getElement('.warning');
		}
		if (field && (!failed || force || field.hasClass('validation-failed') || (failed && !this.options.serial))){
			var validators = field.className.split(' ').some(function(cn){
				return this.getValidator(cn);
			}, this);
			var validatorsFailed = [];
			field.className.split(' ').each(function(className){
				if (className && !this.test(className, field)) validatorsFailed.include(className);
			}, this);
			passed = validatorsFailed.length === 0;
			if (validators && !field.hasClass('warnOnly')){
				if (passed){
					field.addClass('validation-passed').removeClass('validation-failed');
					this.fireEvent('elementPass', field);
				} else {
					field.addClass('validation-failed').removeClass('validation-passed');
					this.fireEvent('elementFail', [field, validatorsFailed]);
				}
			}
			if (!warned){
				var warnings = field.className.split(' ').some(function(cn){
					if (cn.test('^warn-') || field.hasClass('warnOnly'))
						return this.getValidator(cn.replace(/^warn-/,''));
					else return null;
				}, this);
				field.removeClass('warning');
				var warnResult = field.className.split(' ').map(function(cn){
					if (cn.test('^warn-') || field.hasClass('warnOnly'))
						return this.test(cn.replace(/^warn-/,''), field, true);
					else return null;
				}, this);
			}
		}
		return passed;
	},

	test: function(className, field, warn){
		field = document.id(field);
		if((this.options.ignoreHidden && !field.isVisible()) || (this.options.ignoreDisabled && field.get('disabled'))) return true;
		var validator = this.getValidator(className);
		warn = warn != null ? warn : false;
		if (field.hasClass('warnOnly')) warn = true;
		var isValid = field.hasClass('ignoreValidation') || (validator ? validator.test(field) : true);
		if (validator && field.isVisible()) this.fireEvent('elementValidate', [isValid, field, className, warn]);
		if (warn) return true;
		return isValid;
	},

	resetField: function(field){
		field = document.id(field);
		if (field){
			field.className.split(' ').each(function(className){
				if (className.test('^warn-')) className = className.replace(/^warn-/, '');
				field.removeClass('validation-failed');
				field.removeClass('warning');
				field.removeClass('validation-passed');
			}, this);
		}
		return this;
	},

	stop: function(){
		this.paused = true;
		return this;
	},

	start: function(){
		this.paused = false;
		return this;
	},

	ignoreField: function(field, warn){
		field = document.id(field);
		if (field){
			this.enforceField(field);
			if (warn) field.addClass('warnOnly');
			else field.addClass('ignoreValidation');
		}
		return this;
	},

	enforceField: function(field){
		field = document.id(field);
		if (field) field.removeClass('warnOnly').removeClass('ignoreValidation');
		return this;
	}

});

Form.Validator.getMsg = function(key){
	return MooTools.lang.get('Form.Validator', key);
};

Form.Validator.adders = {

	validators:{},

	add : function(className, options){
		this.validators[className] = new InputValidator(className, options);
		//if this is a class (this method is used by instances of Form.Validator and the Form.Validator namespace)
		//extend these validators into it
		//this allows validators to be global and/or per instance
		if (!this.initialize){
			this.implement({
				validators: this.validators
			});
		}
	},

	addAllThese : function(validators){
		Array.from(validators).each(function(validator){
			this.add(validator[0], validator[1]);
		}, this);
	},

	getValidator: function(className){
		return this.validators[className.split(':')[0]];
	}

};

Object.append(Form.Validator, Form.Validator.adders);

Form.Validator.implement(Form.Validator.adders);

Form.Validator.add('IsEmpty', {

	errorMsg: false,
	test: function(element){
		if (element.type == 'select-one' || element.type == 'select')
			return !(element.selectedIndex >= 0 && element.options[element.selectedIndex].value != '');
		else
			return ((element.get('value') == null) || (element.get('value').length == 0));
	}

});

Form.Validator.addAllThese([

	['required', {
		errorMsg: function(){
			return Form.Validator.getMsg('required');
		},
		test: function(element){
			return !Form.Validator.getValidator('IsEmpty').test(element);
		}
	}],

	['minLength', {
		errorMsg: function(element, props){
			if (typeOf(props.minLength))
				return Form.Validator.getMsg('minLength').substitute({minLength:props.minLength,length:element.get('value').length });
			else return '';
		},
		test: function(element, props){
			if (typeOf(props.minLength)) return (element.get('value').length >= props.minLength || 0);
			else return true;
		}
	}],

	['maxLength', {
		errorMsg: function(element, props){
			//props is {maxLength:10}
			if (typeOf(props.maxLength))
				return Form.Validator.getMsg('maxLength').substitute({maxLength:props.maxLength,length:element.get('value').length });
			else return '';
		},
		test: function(element, props){
			//if the value is <= than the maxLength value, element passes test
			return (element.get('value').length <= props.maxLength || 10000);
		}
	}],

	['validate-integer', {
		errorMsg: Form.Validator.getMsg.pass('integer'),
		test: function(element){
			return Form.Validator.getValidator('IsEmpty').test(element) || (/^(-?[1-9]\d*|0)$/).test(element.get('value'));
		}
	}],

	['validate-numeric', {
		errorMsg: Form.Validator.getMsg.pass('numeric'),
		test: function(element){
			return Form.Validator.getValidator('IsEmpty').test(element) ||
				(/^-?(?:0$0(?=\d*\.)|[1-9]|0)\d*(\.\d+)?$/).test(element.get('value'));
		}
	}],

	['validate-digits', {
		errorMsg: Form.Validator.getMsg.pass('digits'),
		test: function(element){
			return Form.Validator.getValidator('IsEmpty').test(element) || (/^[\d() .:\-\+#]+$/.test(element.get('value')));
		}
	}],

	['validate-alpha', {
		errorMsg: Form.Validator.getMsg.pass('alpha'),
		test: function(element){
			return Form.Validator.getValidator('IsEmpty').test(element) ||  (/^[a-zA-Z]+$/).test(element.get('value'));
		}
	}],

	['validate-alphanum', {
		errorMsg: Form.Validator.getMsg.pass('alphanum'),
		test: function(element){
			return Form.Validator.getValidator('IsEmpty').test(element) || !(/\W/).test(element.get('value'));
		}
	}],

	['validate-date', {
		errorMsg: function(element, props){
			if (Date.parse){
				var format = props.dateFormat || '%x';
				return Form.Validator.getMsg('dateSuchAs').substitute({date: new Date().format(format)});
			} else {
				return Form.Validator.getMsg('dateInFormatMDY');
			}
		},
		test: function(element, props){
			if (Form.Validator.getValidator('IsEmpty').test(element)) return true;
			var d;
			if (Date.parse){
				var format = props.dateFormat || '%x';
				d = Date.parse(element.get('value'));
				var formatted = d.format(format);
				if (formatted != 'invalid date') element.set('value', formatted);
				return !isNaN(d);
			} else {
				var regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
				if (!regex.test(element.get('value'))) return false;
				d = new Date(element.get('value').replace(regex, '$1/$2/$3'));
				return (parseInt(RegExp.$1, 10) == (1 + d.getMonth())) &&
					(parseInt(RegExp.$2, 10) == d.getDate()) &&
					(parseInt(RegExp.$3, 10) == d.getFullYear());
			}
		}
	}],

	['validate-email', {
		errorMsg: Form.Validator.getMsg.pass('email'),
		test: function(element){
			return Form.Validator.getValidator('IsEmpty').test(element) || (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i).test(element.get('value'));
		}
	}],

	['validate-url', {
		errorMsg: Form.Validator.getMsg.pass('url'),
		test: function(element){
			return Form.Validator.getValidator('IsEmpty').test(element) || (/^(https?|ftp|rmtp|mms):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i).test(element.get('value'));
		}
	}],

	['validate-currency-dollar', {
		errorMsg: Form.Validator.getMsg.pass('currencyDollar'),
		test: function(element){
			// [$]1[##][,###]+[.##]
			// [$]1###+[.##]
			// [$]0.##
			// [$].##
			return Form.Validator.getValidator('IsEmpty').test(element) ||  (/^\$?\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/).test(element.get('value'));
		}
	}],

	['validate-one-required', {
		errorMsg: Form.Validator.getMsg.pass('oneRequired'),
		test: function(element, props){
			var p = document.id(props['validate-one-required']) || element.getParent(props['validate-one-required']);
			return p.getElements('input').some(function(el){
				if (['checkbox', 'radio'].contains(el.get('type'))) return el.get('checked');
				return el.get('value');
			});
		}
	}]

]);

Element.Properties.validator = {

	set: function(options){
		var validator = this.retrieve('validator');
		if (validator) validator.setOptions(options);
		return this.store('validator:options');
	},

	get: function(options){
		if (options || !this.retrieve('validator')){
			if (options || !this.retrieve('validator:options')) this.set('validator', options);
			this.store('validator', new Form.Validator(this, this.retrieve('validator:options')));
		}
		return this.retrieve('validator');
	}

};

Element.implement({

	validate: function(options){
		this.set('validator', options);
		return this.get('validator', options).validate();
	}

});
//<1.2compat>
//legacy
var FormValidator = Form.Validator;
//</1.2compat>


/*
---

script: Form.Validator.Inline.js

name: Form.Validator.Inline

description: Extends Form.Validator to add inline messages.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - /Form.Validator

provides: [Form.Validator.Inline]

...
*/

Form.Validator.Inline = new Class({

	Extends: Form.Validator,

	options: {
		showError: function(errorElement){
			if (errorElement.reveal) errorElement.reveal();
			else errorElement.setStyle('display', 'block');
		},
		hideError: function(errorElement){
			if (errorElement.dissolve) errorElement.dissolve();
			else errorElement.setStyle('display', 'none');
		},
		scrollToErrorsOnSubmit: true,
		scrollFxOptions: {
			transition: 'quad:out',
			offset: {
				y: -20
			}
		}
	},

	initialize: function(form, options){
		this.parent(form, options);
		this.addEvent('onElementValidate', function(isValid, field, className, warn){
			var validator = this.getValidator(className);
			if (!isValid && validator.getError(field)){
				if (warn) field.addClass('warning');
				var advice = this.makeAdvice(className, field, validator.getError(field), warn);
				this.insertAdvice(advice, field);
				this.showAdvice(className, field);
			} else {
				this.hideAdvice(className, field);
			}
		});
	},

	makeAdvice: function(className, field, error, warn){
		var errorMsg = (warn) ? this.warningPrefix : this.errorPrefix;
			errorMsg += (this.options.useTitles) ? field.title || error:error;
		var cssClass = (warn) ? 'warning-advice' : 'validation-advice';
		var advice = this.getAdvice(className, field);
		if(advice) {
			advice = advice.set('html', errorMsg);
		} else {
			advice = new Element('div', {
				html: errorMsg,
				styles: { display: 'none' },
				id: 'advice-' + className + '-' + this.getFieldId(field)
			}).addClass(cssClass);
		}
		field.store('$moo:advice-' + className, advice);
		return advice;
	},

	getFieldId : function(field){
		return field.id ? field.id : field.id = 'input_' + field.name;
	},

	showAdvice: function(className, field){
		var advice = this.getAdvice(className, field);
		if (advice && !field.retrieve('$moo:' + this.getPropName(className))
				&& (advice.getStyle('display') == 'none'
				|| advice.getStyle('visiblity') == 'hidden'
				|| advice.getStyle('opacity') == 0)){
			field.store('$moo:' + this.getPropName(className), true);
			this.options.showError(advice);
			this.fireEvent('showAdvice', [field, advice, className]);
		}
	},

	hideAdvice: function(className, field){
		var advice = this.getAdvice(className, field);
		if (advice && field.retrieve('$moo:' + this.getPropName(className))){
			field.store('$moo:' + this.getPropName(className), false);
			this.options.hideError(advice);
			this.fireEvent('hideAdvice', [field, advice, className]);
		}
	},

	getPropName: function(className){
		return 'advice' + className;
	},

	resetField: function(field){
		field = document.id(field);
		if (!field) return this;
		this.parent(field);
		field.className.split(' ').each(function(className){
			this.hideAdvice(className, field);
		}, this);
		return this;
	},

	getAllAdviceMessages: function(field, force){
		var advice = [];
		if (field.hasClass('ignoreValidation') && !force) return advice;
		var validators = field.className.split(' ').some(function(cn){
			var warner = cn.test('^warn-') || field.hasClass('warnOnly');
			if (warner) cn = cn.replace(/^warn-/, '');
			var validator = this.getValidator(cn);
			if (!validator) return;
			advice.push({
				message: validator.getError(field),
				warnOnly: warner,
				passed: validator.test(),
				validator: validator
			});
		}, this);
		return advice;
	},

	getAdvice: function(className, field){
		return field.retrieve('$moo:advice-' + className);
	},

	insertAdvice: function(advice, field){
		//Check for error position prop
		var props = field.get('validatorProps');
		//Build advice
		if (!props.msgPos || !document.id(props.msgPos)){
			if(field.type.toLowerCase() == 'radio') field.getParent().adopt(advice);
			else advice.inject(document.id(field), 'after');
		} else {
			document.id(props.msgPos).grab(advice);
		}
	},

	validateField: function(field, force){
		var result = this.parent(field, force);
		if (this.options.scrollToErrorsOnSubmit && !result){
			var failed = document.id(this).getElement('.validation-failed');
			var par = document.id(this).getParent();
			while (par != document.body && par.getScrollSize().y == par.getSize().y){
				par = par.getParent();
			}
			var fx = par.retrieve('fvScroller');
			if (!fx && window.Fx && Fx.Scroll){
				fx = new Fx.Scroll(par, this.options.scrollFxOptions);
				par.store('fvScroller', fx);
			}
			if (failed){
				if (fx) fx.toElement(failed);
				else par.scrollTo(par.getScroll().x, failed.getPosition(par).y - 20);
			}
		}
		return result;
	}

});


/*
---

script: Form.Validator.Extras.js

name: Form.Validator.Extras

description: Additional validators for the Form.Validator class.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - /Form.Validator

provides: [Form.Validator.Extras]

...
*/
Form.Validator.addAllThese([

	['validate-enforce-oncheck', {
		test: function(element, props){
			if (element.checked){
				var fv = element.getParent('form').retrieve('validator');
				if (!fv) return true;
				(props.toEnforce || document.id(props.enforceChildrenOf).getElements('input, select, textarea')).map(function(item){
					fv.enforceField(item);
				});
			}
			return true;
		}
	}],

	['validate-ignore-oncheck', {
		test: function(element, props){
			if (element.checked){
				var fv = element.getParent('form').retrieve('validator');
				if (!fv) return true;
				(props.toIgnore || document.id(props.ignoreChildrenOf).getElements('input, select, textarea')).each(function(item){
					fv.ignoreField(item);
					fv.resetField(item);
				});
			}
			return true;
		}
	}],

	['validate-nospace', {
		errorMsg: function(){
			return Form.Validator.getMsg('noSpace');
		},
		test: function(element, props){
			return !element.get('value').test(/\s/);
		}
	}],

	['validate-toggle-oncheck', {
		test: function(element, props){
			var fv = element.getParent('form').retrieve('validator');
			if (!fv) return true;
			var eleArr = props.toToggle || document.id(props.toToggleChildrenOf).getElements('input, select, textarea');
			if (!element.checked){
				eleArr.each(function(item){
					fv.ignoreField(item);
					fv.resetField(item);
				});
			} else {
				eleArr.each(function(item){
					fv.enforceField(item);
				});
			}
			return true;
		}
	}],

	['validate-reqchk-bynode', {
		errorMsg: function(){
			return Form.Validator.getMsg('reqChkByNode');
		},
		test: function(element, props){
			return (document.id(props.nodeId).getElements(props.selector || 'input[type=checkbox], input[type=radio]')).some(function(item){
				return item.checked;
			});
		}
	}],

	['validate-required-check', {
		errorMsg: function(element, props){
			return props.useTitle ? element.get('title') : Form.Validator.getMsg('requiredChk');
		},
		test: function(element, props){
			return !!element.checked;
		}
	}],

	['validate-reqchk-byname', {
		errorMsg: function(element, props){
			return Form.Validator.getMsg('reqChkByName').substitute({label: props.label || element.get('type')});
		},
		test: function(element, props){
			var grpName = props.groupName || element.get('name');
			var oneCheckedItem = $$(document.getElementsByName(grpName)).some(function(item, index){
				return item.checked;
			});
			var fv = element.getParent('form').retrieve('validator');
			if (oneCheckedItem && fv) fv.resetField(element);
			return oneCheckedItem;
		}
	}],

	['validate-match', {
		errorMsg: function(element, props){
			return Form.Validator.getMsg('match').substitute({matchName: props.matchName || document.id(props.matchInput).get('name')});
		},
		test: function(element, props){
			var eleVal = element.get('value');
			var matchVal = document.id(props.matchInput) && document.id(props.matchInput).get('value');
			return eleVal && matchVal ? eleVal == matchVal : true;
		}
	}],

	['validate-after-date', {
		errorMsg: function(element, props){
			return Form.Validator.getMsg('afterDate').substitute({
				label: props.afterLabel || (props.afterElement ? Form.Validator.getMsg('startDate') : Form.Validator.getMsg('currentDate'))
			});
		},
		test: function(element, props){
			var start = document.id(props.afterElement) ? Date.parse(document.id(props.afterElement).get('value')) : new Date();
			var end = Date.parse(element.get('value'));
			return end && start ? end >= start : true;
		}
	}],

	['validate-before-date', {
		errorMsg: function(element, props){
			return Form.Validator.getMsg('beforeDate').substitute({
				label: props.beforeLabel || (props.beforeElement ? Form.Validator.getMsg('endDate') : Form.Validator.getMsg('currentDate'))
			});
		},
		test: function(element, props){
			var start = Date.parse(element.get('value'));
			var end = document.id(props.beforeElement) ? Date.parse(document.id(props.beforeElement).get('value')) : new Date();
			return end && start ? end >= start : true;
		}
	}],

	['validate-custom-required', {
		errorMsg: function(){
			return Form.Validator.getMsg('required');
		},
		test: function(element, props){
			return element.get('value') != props.emptyValue;
		}
	}],

	['validate-same-month', {
		errorMsg: function(element, props){
			var startMo = document.id(props.sameMonthAs) && document.id(props.sameMonthAs).get('value');
			var eleVal = element.get('value');
			if (eleVal != '') return Form.Validator.getMsg(startMo ? 'sameMonth' : 'startMonth');
		},
		test: function(element, props){
			var d1 = Date.parse(element.get('value'));
			var d2 = Date.parse(document.id(props.sameMonthAs) && document.id(props.sameMonthAs).get('value'));
			return d1 && d2 ? d1.format('%B') == d2.format('%B') : true;
		}
	}],


	['validate-cc-num', {
		errorMsg: function(element){
			var ccNum = element.get('value').replace(/[^0-9]/g, '');
			return Form.Validator.getMsg('creditcard').substitute({length: ccNum.length});
		},
		test: function(element){
			// required is a different test
			if (Form.Validator.getValidator('IsEmpty').test(element)) { return true; }

			// Clean number value
			var ccNum = element.get('value');
			ccNum = ccNum.replace(/[^0-9]/g, '');

			var valid_type = false;

			if (ccNum.test(/^4[0-9]{12}([0-9]{3})?$/)) valid_type = 'Visa';
			else if (ccNum.test(/^5[1-5]([0-9]{14})$/)) valid_type = 'Master Card';
			else if (ccNum.test(/^3[47][0-9]{13}$/)) valid_type = 'American Express';
			else if (ccNum.test(/^6011[0-9]{12}$/)) valid_type = 'Discover';

			if (valid_type) {
				var sum = 0;
				var cur = 0;

				for(var i=ccNum.length-1; i>=0; --i) {
					cur = ccNum.charAt(i).toInt();
					if (cur == 0) { continue; }

					if ((ccNum.length-i) % 2 == 0) { cur += cur; }
					if (cur > 9) { cur = cur.toString().charAt(0).toInt() + cur.toString().charAt(1).toInt(); }

					sum += cur;
				}
				if ((sum % 10) == 0) { return true; }
			}

			var chunks = '';
			while (ccNum != '') {
				chunks += ' ' + ccNum.substr(0,4);
				ccNum = ccNum.substr(4);
			}

			element.getParent('form').retrieve('validator').ignoreField(element);
			element.set('value', chunks.clean());
			element.getParent('form').retrieve('validator').enforceField(element);
			return false;
		}
	}]


]);


/*
---

script: OverText.js

name: OverText

description: Shows text over an input that disappears when the user clicks into it. The text remains hidden if the user adds a value.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Options
  - Core/Events
  - Core/Element.Event
  - /Class.Binds
  - /Class.Occlude
  - /Element.Position
  - /Element.Shortcuts

provides: [OverText]

...
*/

var OverText = new Class({

	Implements: [Options, Events, Class.Occlude],

	Binds: ['reposition', 'assert', 'focus', 'hide'],

	options: {/*
		textOverride: null,
		onFocus: function(){},
		onTextHide: function(textEl, inputEl){},
		onTextShow: function(textEl, inputEl){}, */
		element: 'label',
		positionOptions: {
			position: 'upperLeft',
			edge: 'upperLeft',
			offset: {
				x: 4,
				y: 2
			}
		},
		poll: false,
		pollInterval: 250,
		wrap: false
	},

	property: 'OverText',

	initialize: function(element, options){
		this.element = document.id(element);
		if (this.occlude()) return this.occluded;
		this.setOptions(options);
		this.attach(this.element);
		OverText.instances.push(this);
		if (this.options.poll) this.poll();
		return this;
	},

	toElement: function(){
		return this.element;
	},

	attach: function(){
		var val = this.options.textOverride || this.element.get('alt') || this.element.get('title');
		if (!val) return;
		this.text = new Element(this.options.element, {
			'class': 'overTxtLabel',
			styles: {
				lineHeight: 'normal',
				position: 'absolute',
				cursor: 'text'
			},
			html: val,
			events: {
				click: this.hide.pass(this.options.element == 'label', this)
			}
		}).inject(this.element, 'after');
		if (this.options.element == 'label') {
			if (!this.element.get('id')) this.element.set('id', 'input_' + new Date().getTime());
			this.text.set('for', this.element.get('id'));
		}

		if (this.options.wrap) {
			this.textHolder = new Element('div', {
				styles: {
					lineHeight: 'normal',
					position: 'relative'
				},
				'class':'overTxtWrapper'
			}).adopt(this.text).inject(this.element, 'before');
		}

		return this.enable();
	},

	destroy: function(){
		this.element.eliminate('OverTextDiv').eliminate('OverText');
		this.disable();
		this.text.destroy();
		if (this.textHolder) this.textHolder.destroy();
		return this;
	},

	disable: function(){
		this.element.removeEvents({
			focus: this.focus,
			blur: this.assert,
			change: this.assert
		});
		window.removeEvent('resize', this.reposition);
		this.hide(true, true);
		return this;
	},

	enable: function(){
		this.element.addEvents({
			focus: this.focus,
			blur: this.assert,
			change: this.assert
		});
		window.addEvent('resize', this.reposition);
		this.assert(true);
		this.reposition();
		return this;
	},

	wrap: function(){
		if (this.options.element == 'label') {
			if (!this.element.get('id')) this.element.set('id', 'input_' + new Date().getTime());
			this.text.set('for', this.element.get('id'));
		}
	},

	startPolling: function(){
		this.pollingPaused = false;
		return this.poll();
	},

	poll: function(stop){
		//start immediately
		//pause on focus
		//resumeon blur
		if (this.poller && !stop) return this;
		var test = function(){
			if (!this.pollingPaused) this.assert(true);
		}.bind(this);
		if (stop) clearInterval(this.poller);
		else this.poller = test.periodical(this.options.pollInterval, this);
		return this;
	},

	stopPolling: function(){
		this.pollingPaused = true;
		return this.poll(true);
	},

	focus: function(){
		if (this.text && (!this.text.isDisplayed() || this.element.get('disabled'))) return;
		this.hide();
	},

	hide: function(suppressFocus, force){
		if (this.text && (this.text.isDisplayed() && (!this.element.get('disabled') || force))){
			this.text.hide();
			this.fireEvent('textHide', [this.text, this.element]);
			this.pollingPaused = true;
			if (!suppressFocus){
				try {
					this.element.fireEvent('focus');
					this.element.focus();
				} catch(e){} //IE barfs if you call focus on hidden elements
			}
		}
		return this;
	},

	show: function(){
		if (this.text && !this.text.isDisplayed()){
			this.text.show();
			this.reposition();
			this.fireEvent('textShow', [this.text, this.element]);
			this.pollingPaused = false;
		}
		return this;
	},

	assert: function(suppressFocus){
		this[this.test() ? 'show' : 'hide'](suppressFocus);
	},

	test: function(){
		var v = this.element.get('value');
		return !v;
	},

	reposition: function(){
		this.assert(true);
		if (!this.element.isVisible()) return this.stopPolling().hide();
		if (this.text && this.test()) this.text.position(Object.merge(this.options.positionOptions, {relativeTo: this.element}));
		return this;
	}

});

OverText.instances = [];

Object.append(OverText, {

	each: function(fn) {
		return OverText.instances.map(function(ot, i){
			if (ot.element && ot.text) return fn.apply(OverText, [ot, i]);
			return null; //the input or the text was destroyed
		});
	},
	
	update: function(){

		return OverText.each(function(ot){
			return ot.reposition();
		});

	},

	hideAll: function(){

		return OverText.each(function(ot){
			return ot.hide(true, true);
		});

	},

	showAll: function(){
		return OverText.each(function(ot) {
			return ot.show();
		});
	}

});

if (window.Fx && Fx.Reveal) {
	Fx.Reveal.implement({
		hideInputs: Browser.ie ? 'select, input, textarea, object, embed, .overTxtLabel' : false
	});
}


/*
---

script: Fx.Elements.js

name: Fx.Elements

description: Effect to change any number of CSS properties of any number of Elements.

license: MIT-style license

authors:
  - Valerio Proietti

requires:
  - Core/Fx.CSS
  - /MooTools.More

provides: [Fx.Elements]

...
*/

Fx.Elements = new Class({

	Extends: Fx.CSS,

	initialize: function(elements, options){
		this.elements = this.subject = $$(elements);
		this.parent(options);
	},

	compute: function(from, to, delta){
		var now = {};
		for (var i in from){
			var iFrom = from[i], iTo = to[i], iNow = now[i] = {};
			for (var p in iFrom) iNow[p] = this.parent(iFrom[p], iTo[p], delta);
		}
		return now;
	},

	set: function(now){
		for (var i in now){
			var iNow = now[i];
			for (var p in iNow) this.render(this.elements[i], p, iNow[p], this.options.unit);
		}
		return this;
	},

	start: function(obj){
		if (!this.check(obj)) return this;
		var from = {}, to = {};
		for (var i in obj){
			var iProps = obj[i], iFrom = from[i] = {}, iTo = to[i] = {};
			for (var p in iProps){
				var parsed = this.prepare(this.elements[i], p, iProps[p]);
				iFrom[p] = parsed.from;
				iTo[p] = parsed.to;
			}
		}
		return this.parent(from, to);
	}

});


/*
---

script: Fx.Accordion.js

name: Fx.Accordion

description: An Fx.Elements extension which allows you to easily create accordion type controls.

license: MIT-style license

authors:
  - Valerio Proietti

requires:
  - Core/Element.Event
  - /Fx.Elements

provides: [Fx.Accordion]

...
*/

Fx.Accordion = new Class({

	Extends: Fx.Elements,

	options: {/*
		onActive: function(toggler, section){},
		onBackground: function(toggler, section){},*/
		fixedHeight: false,
		fixedWidth: false,
		display: 0,
		show: false,
		height: true,
		width: false,
		opacity: true,
		alwaysHide: false,
		trigger: 'click',
		initialDisplayFx: true,
		returnHeightToAuto: true
	},

	initialize: function(){
		var defined = function(obj){
			return obj != null;
		};
		
		var params = Array.link(arguments, {
			'container': Type.isElement, //deprecated
			'options': Type.isObject,
			'togglers': defined,
			'elements': defined
		});
		this.parent(params.elements, params.options);
		
		this.togglers = $$(params.togglers);
		this.previous = -1;
		this.internalChain = new Chain();
		
		if (this.options.alwaysHide) this.options.wait = true;
		
		if (this.options.show || this.options.show === 0){
			this.options.display = false;
			this.previous = this.options.show;
		}
		
		if (this.options.start){
			this.options.display = false;
			this.options.show = false;
		}
		
		this.effects = {};
		
		if (this.options.opacity) this.effects.opacity = 'fullOpacity';
		if (this.options.width) this.effects.width = this.options.fixedWidth ? 'fullWidth' : 'offsetWidth';
		if (this.options.height) this.effects.height = this.options.fixedHeight ? 'fullHeight' : 'scrollHeight';
		
		for (var i = 0, l = this.togglers.length; i < l; i++) this.addSection(this.togglers[i], this.elements[i]);
		
		this.elements.each(function(el, i){
			if (this.options.show === i){
				this.fireEvent('active', [this.togglers[i], el]);
			} else {
				for (var fx in this.effects) el.setStyle(fx, 0);
			}
		}, this);
		
		if (this.options.display || this.options.display === 0 || this.options.initialDisplayFx === false) {
			this.display(this.options.display, this.options.initialDisplayFx);
		}
		
		if (this.options.fixedHeight !== false) this.options.returnHeightToAuto = false;
		this.addEvent('complete', this.internalChain.callChain.bind(this.internalChain));
	},

	addSection: function(toggler, element){
		toggler = document.id(toggler);
		element = document.id(element);
		this.togglers.include(toggler);
		this.elements.include(element);
		
		var test = this.togglers.contains(toggler);
		var idx = this.togglers.indexOf(toggler);
		var displayer = this.display.bind(this, idx);

		toggler.store('accordion:display', displayer)
			.addEvent(this.options.trigger, displayer);

		if (this.options.height) element.setStyles({'padding-top': 0, 'border-top': 'none', 'padding-bottom': 0, 'border-bottom': 'none'});
		if (this.options.width) element.setStyles({'padding-left': 0, 'border-left': 'none', 'padding-right': 0, 'border-right': 'none'});
		
		element.fullOpacity = 1;
		if (this.options.fixedWidth) element.fullWidth = this.options.fixedWidth;
		if (this.options.fixedHeight) element.fullHeight = this.options.fixedHeight;
		element.setStyle('overflow', 'hidden');
		
		if (!test){
			for (var fx in this.effects) element.setStyle(fx, 0);
		}
		return this;
	},

	removeSection: function(toggler, displayIndex) {
		var idx = this.togglers.indexOf(toggler);
		var element = this.elements[idx];
		var remover = function(){
			this.togglers.erase(toggler);
			this.elements.erase(element);
			this.detach(toggler);
		}.bind(this);
		
		if (this.now == idx || displayIndex != null) {
			this.display(displayIndex != null ? displayIndex : (idx - 1 >= 0 ? idx - 1 : 0)).chain(remover);
		} else {
			remover();
		}
		return this;
	},

	detach: function(toggler){
		var remove = function(toggler) {
			toggler.removeEvent(this.options.trigger, toggler.retrieve('accordion:display'));
		}.bind(this);
		
		if (!toggler) this.togglers.each(remove);
		else remove(toggler);
		return this;
	},

	display: function(index, useFx){
		if (!this.check(index, useFx)) return this;
		useFx = useFx != null ? useFx : true;
		index = (typeOf(index) == 'element') ? this.elements.indexOf(index) : index;
		if (index == this.previous) return this;
		if (this.options.returnHeightToAuto){
			var prev = this.elements[this.previous];
			if (prev && !this.selfHidden){
				for (var fx in this.effects){
					prev.setStyle(fx, prev[this.effects[fx]]);
				}
			}
		}
		
		if ((this.timer && this.options.wait) || (index === this.previous && !this.options.alwaysHide)) return this;
		this.previous = index;
		var obj = {};
		this.elements.each(function(el, i){
			obj[i] = {};
			var hide;
			if (i != index){
				hide = true;
			} else if (this.options.alwaysHide && ((el.offsetHeight > 0 && this.options.height) || el.offsetWidth > 0 && this.options.width)){
				hide = true;
				this.selfHidden = true;
			}
			this.fireEvent(hide ? 'background' : 'active', [this.togglers[i], el]);
			for (var fx in this.effects) obj[i][fx] = hide ? 0 : el[this.effects[fx]];
		}, this);
		
		this.internalChain.chain(function(){
			if (this.options.returnHeightToAuto && !this.selfHidden){
				var el = this.elements[index];
				if (el) el.setStyle('height', 'auto');
			};
		}.bind(this));
		return useFx ? this.start(obj) : this.set(obj);
	}

});

/*<1.2compat>*/
/*
	Compatibility with 1.2.0
*/
var Accordion = new Class({

	Extends: Fx.Accordion,

	initialize: function(){
		this.parent.apply(this, arguments);
		var params = Array.link(arguments, {'container': Type.isElement});
		this.container = params.container;
	},

	addSection: function(toggler, element, pos){
		toggler = document.id(toggler);
		element = document.id(element);
		
		var test = this.togglers.contains(toggler);
		var len = this.togglers.length;
		if (len && (!test || pos)){
			pos = pos != null ? pos : len - 1;
			toggler.inject(this.togglers[pos], 'before');
			element.inject(toggler, 'after');
		} else if (this.container && !test){
			toggler.inject(this.container);
			element.inject(this.container);
		}
		return this.parent.apply(this, arguments);
	}

});
/*</1.2compat>*/


/*
---

script: Fx.Move.js

name: Fx.Move

description: Defines Fx.Move, a class that works with Element.Position.js to transition an element from one location to another.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Fx.Morph
  - /Element.Position

provides: [Fx.Move]

...
*/

Fx.Move = new Class({

	Extends: Fx.Morph,

	options: {
		relativeTo: document.body,
		position: 'center',
		edge: false,
		offset: {x: 0, y: 0}
	},

	start: function(destination){
		return this.parent(this.element.position(Object.merge(this.options, destination, {returnPos: true})));
	}

});

Element.Properties.move = {

	set: function(options){
		this.get('move').cancel().setOptions(options);
		return this;
	},

	get: function(){
		var move = this.retrieve('move');
		if (!move){
			move = new Fx.Move(this, {link: 'cancel'});
			this.store('move', move);
		}
		return move;
	}

};

Element.implement({

	move: function(options){
		this.get('move').start(options);
		return this;
	}

});


/*
---

script: Fx.Scroll.js

name: Fx.Scroll

description: Effect to smoothly scroll any element, including the window.

license: MIT-style license

authors:
  - Valerio Proietti

requires:
  - Core/Fx
  - Core/Element.Event
  - Core/Element.Dimensions
  - /MooTools.More

provides: [Fx.Scroll]

...
*/

Fx.Scroll = new Class({

	Extends: Fx,

	options: {
		offset: {x: 0, y: 0},
		wheelStops: true
	},

	initialize: function(element, options){
		this.element = this.subject = document.id(element);
		this.parent(options);
		var cancel = this.cancel.bind(this, false);

		if (typeOf(this.element) != 'element') this.element = document.id(this.element.getDocument().body);

		var stopper = this.element;

		if (this.options.wheelStops){
			this.addEvent('start', function(){
				stopper.addEvent('mousewheel', cancel);
			}, true);
			this.addEvent('complete', function(){
				stopper.removeEvent('mousewheel', cancel);
			}, true);
		}
	},

	set: function(){
		var now = Array.flatten(arguments);
		if (Browser.firefox) now = [Math.round(now[0]), Math.round(now[1])];
		this.element.scrollTo(now[0] + this.options.offset.x, now[1] + this.options.offset.y);
	},

	compute: function(from, to, delta){
		return [0, 1].map(function(i){
			return Fx.compute(from[i], to[i], delta);
		});
	},

	start: function(x, y){
		if (!this.check(x, y)) return this;
		var scrollSize = this.element.getScrollSize(),
			scroll = this.element.getScroll(), 
			values = {x: x, y: y};
		for (var z in values){
			var max = scrollSize[z];
			if (values[z] != null || values[z] === 0) values[z] = (typeOf(values[z]) == 'number') ? values[z] : max;
			else values[z] = scroll[z];
			values[z] += this.options.offset[z];
		}
		return this.parent([scroll.x, scroll.y], [values.x, values.y]);
	},

	toTop: function(){
		return this.start(false, 0);
	},

	toLeft: function(){
		return this.start(0, false);
	},

	toRight: function(){
		return this.start('right', false);
	},

	toBottom: function(){
		return this.start(false, 'bottom');
	},

	toElement: function(el){
		var position = document.id(el).getPosition(this.element);
		return this.start(position.x, position.y);
	},

	scrollIntoView: function(el, axes, offset){
		axes = axes ? Array.from(axes) : ['x','y'];
		var to = {};
		el = document.id(el);
		var pos = el.getPosition(this.element);
		var size = el.getSize();
		var scroll = this.element.getScroll();
		var containerSize = this.element.getSize();
		var edge = {
			x: pos.x + size.x,
			y: pos.y + size.y
		};
		['x','y'].each(function(axis) {
			if (axes.contains(axis)) {
				if (edge[axis] > scroll[axis] + containerSize[axis]) to[axis] = edge[axis] - containerSize[axis];
				if (pos[axis] < scroll[axis]) to[axis] = pos[axis];
			}
			if (to[axis] == null) to[axis] = scroll[axis];
			if (offset && offset[axis]) to[axis] = to[axis] + offset[axis];
		}, this);
		if (to.x != scroll.x || to.y != scroll.y) this.start(to.x, to.y);
		return this;
	},

	scrollToCenter: function(el, axes, offset){
		axes = axes ? Array.from(axes) : ['x', 'y'];
		el = document.id(el);
		var to = {},
			pos = el.getPosition(this.element),
			size = el.getSize(),
			scroll = this.element.getScroll(),
			containerSize = this.element.getSize(),
			edge = {
				x: pos.x + size.x,
				y: pos.y + size.y
			};

		['x','y'].each(function(axis){
			if(axes.contains(axis)){
				to[axis] = pos[axis] - (containerSize[axis] - size[axis])/2;
			}
			if(to[axis] == null) to[axis] = scroll[axis];
			if(offset && offset[axis]) to[axis] = to[axis] + offset[axis];
		}, this);
		if (to.x != scroll.x || to.y != scroll.y) this.start(to.x, to.y);
		return this;
	}

});


/*
---

script: Fx.Slide.js

name: Fx.Slide

description: Effect to slide an element in and out of view.

license: MIT-style license

authors:
  - Valerio Proietti

requires:
  - Core/Fx
  - Core/Element.Style
  - /MooTools.More

provides: [Fx.Slide]

...
*/

Fx.Slide = new Class({

	Extends: Fx,

	options: {
		mode: 'vertical',
		wrapper: false,
		hideOverflow: true
	},

	initialize: function(element, options){
		this.addEvent('complete', function(){
			this.open = (this.wrapper['offset' + this.layout.capitalize()] != 0);
			if (this.open) this.wrapper.setStyle('height', '');
			if (this.open && Browser.safari && Browser.version == 2) this.element.dispose().inject(this.wrapper);
		}, true);
		
		this.element = this.subject = document.id(element);
		this.parent(options);
		var wrapper = this.element.retrieve('wrapper');
		var styles = this.element.getStyles('margin', 'position', 'overflow');
		
		if (this.options.hideOverflow) styles = Object.append(styles, {overflow: 'hidden'});
		if (this.options.wrapper) wrapper = document.id(this.options.wrapper).setStyles(styles);
		
		this.wrapper = wrapper || new Element('div', {
			styles: styles
		}).wraps(this.element);
		
		this.element.store('wrapper', this.wrapper).setStyle('margin', 0);
		this.now = [];
		this.open = true;
	},

	vertical: function(){
		this.margin = 'margin-top';
		this.layout = 'height';
		this.offset = this.element.offsetHeight;
	},

	horizontal: function(){
		this.margin = 'margin-left';
		this.layout = 'width';
		this.offset = this.element.offsetWidth;
	},

	set: function(now){
		this.element.setStyle(this.margin, now[0]);
		this.wrapper.setStyle(this.layout, now[1]);
		return this;
	},

	compute: function(from, to, delta){
		return [0, 1].map(function(i){
			return Fx.compute(from[i], to[i], delta);
		});
	},

	start: function(how, mode){
		if (!this.check(how, mode)) return this;
		this[mode || this.options.mode]();
		var margin = this.element.getStyle(this.margin).toInt();
		var layout = this.wrapper.getStyle(this.layout).toInt();
		var caseIn = [[margin, layout], [0, this.offset]];
		var caseOut = [[margin, layout], [-this.offset, 0]];
		var start;
		switch (how){
			case 'in': start = caseIn; break;
			case 'out': start = caseOut; break;
			case 'toggle': start = (layout == 0) ? caseIn : caseOut;
		}
		return this.parent(start[0], start[1]);
	},

	slideIn: function(mode){
		return this.start('in', mode);
	},

	slideOut: function(mode){
		return this.start('out', mode);
	},

	hide: function(mode){
		this[mode || this.options.mode]();
		this.open = false;
		return this.set([-this.offset, 0]);
	},

	show: function(mode){
		this[mode || this.options.mode]();
		this.open = true;
		return this.set([0, this.offset]);
	},

	toggle: function(mode){
		return this.start('toggle', mode);
	}

});

Element.Properties.slide = {
	
	set: function(options){
		this.get('slide').cancel().setOptions(options);
		return this;
	},

	get: function(){
		var slide = this.retrieve('slide');
		if (!slide){
			slide = new Fx.Slide(this, {link: 'cancel'});
			this.store('slide', slide);
		}
		return slide;
	}

};

Element.implement({

	slide: function(how, mode){
		how = how || 'toggle';
		var slide = this.get('slide'), toggle;
		switch (how){
			case 'hide': slide.hide(mode); break;
			case 'show': slide.show(mode); break;
			case 'toggle':
				var flag = this.retrieve('slide:flag', slide.open);
				slide[flag ? 'slideOut' : 'slideIn'](mode);
				this.store('slide:flag', !flag);
				toggle = true;
			break;
			default: slide.start(how, mode);
		}
		if (!toggle) this.eliminate('slide:flag');
		return this;
	}

});


/*
---

script: Fx.SmoothScroll.js

name: Fx.SmoothScroll

description: Class for creating a smooth scrolling effect to all internal links on the page.

license: MIT-style license

authors:
  - Valerio Proietti

requires:
  - Core/Selectors
  - /Fx.Scroll

provides: [Fx.SmoothScroll]

...
*/

/*<1.2compat>*/var SmoothScroll = /*</1.2compat>*/Fx.SmoothScroll = new Class({

	Extends: Fx.Scroll,

	initialize: function(options, context){
		context = context || document;
		this.doc = context.getDocument();
		var win = context.getWindow();
		this.parent(this.doc, options);
		this.links = $$(this.options.links || this.doc.links);
		var location = win.location.href.match(/^[^#]*/)[0] + '#';
		this.links.each(function(link){
			if (link.href.indexOf(location) != 0) {return;}
			var anchor = link.href.substr(location.length);
			if (anchor) this.useLink(link, anchor);
		}, this);
		if (!(Browser.safari && Browser.version == 2)) {
			this.addEvent('complete', function(){
				win.location.hash = this.anchor;
			}, true);
		}
	},

	useLink: function(link, anchor){
		var el;
		link.addEvent('click', function(event){
			if (el !== false && !el) el = document.id(anchor) || this.doc.getElement('a[name=' + anchor + ']');
			if (el) {
				event.preventDefault();
				this.anchor = anchor;
				this.toElement(el).chain(function(){
					this.fireEvent('scrolledTo', [link, el]);
				}.bind(this));
				link.blur();
			}
		}.bind(this));
	}
});


/*
---

script: Fx.Sort.js

name: Fx.Sort

description: Defines Fx.Sort, a class that reorders lists with a transition.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Element.Dimensions
  - /Fx.Elements
  - /Element.Measure

provides: [Fx.Sort]

...
*/

Fx.Sort = new Class({

	Extends: Fx.Elements,

	options: {
		mode: 'vertical'
	},

	initialize: function(elements, options){
		this.parent(elements, options);
		this.elements.each(function(el){
			if (el.getStyle('position') == 'static') el.setStyle('position', 'relative');
		});
		this.setDefaultOrder();
	},

	setDefaultOrder: function(){
		this.currentOrder = this.elements.map(function(el, index){
			return index;
		});
	},

	sort: function(){
		if(!this.check(arguments)) return this;
		var newOrder = Array.flatten(arguments);
		
		var top = 0,
			left = 0,
			next = {},
			zero = {},
			vert = this.options.mode == 'vertical';
		
		var current = this.elements.map(function(el, index){
			var size = el.getComputedSize({styles: ['border', 'padding', 'margin']});
			var val;
			if (vert){
				val = {
					top: top,
					margin: size['margin-top'],
					height: size.totalHeight
				};
				top += val.height - size['margin-top'];
			} else {
				val = {
					left: left,
					margin: size['margin-left'],
					width: size.totalWidth
				};
				left += val.width;
			}
			var plane = vert ? 'top' : 'left';
			zero[index] = {};
			var start = el.getStyle(plane).toInt();
			zero[index][plane] = start || 0;
			return val;
		}, this);
		
		this.set(zero);
		newOrder = newOrder.map(function(i){ return i.toInt(); });
		if (newOrder.length != this.elements.length){
			this.currentOrder.each(function(index){
				if (!newOrder.contains(index)) newOrder.push(index);
			});
			if (newOrder.length > this.elements.length)
				newOrder.splice(this.elements.length-1, newOrder.length - this.elements.length);
		}
		var margin = top = left = 0;
		newOrder.each(function(item, index){
			var newPos = {};
			if (vert){
				newPos.top = top - current[item].top - margin;
				top += current[item].height;
			} else {
				newPos.left = left - current[item].left;
				left += current[item].width;
			}
			margin = margin + current[item].margin;
			next[item]=newPos;
		}, this);
		var mapped = {};
		Array.clone(newOrder).sort().each(function(index){
			mapped[index] = next[index];
		});
		this.start(mapped);
		this.currentOrder = newOrder;
		
		return this;
	},

	rearrangeDOM: function(newOrder){
		newOrder = newOrder || this.currentOrder;
		var parent = this.elements[0].getParent();
		var rearranged = [];
		this.elements.setStyle('opacity', 0);
		//move each element and store the new default order
		newOrder.each(function(index){
			rearranged.push(this.elements[index].inject(parent).setStyles({
				top: 0,
				left: 0
			}));
		}, this);
		this.elements.setStyle('opacity', 1);
		this.elements = $$(rearranged);
		this.setDefaultOrder();
		return this;
	},

	getDefaultOrder: function(){
		return this.elements.map(function(el, index){
			return index;
		});
	},

	forward: function(){
		return this.sort(this.getDefaultOrder());
	},

	backward: function(){
		return this.sort(this.getDefaultOrder().reverse());
	},

	reverse: function(){
		return this.sort(this.currentOrder.reverse());
	},

	sortByElements: function(elements){
		return this.sort(elements.map(function(el){
			return this.elements.indexOf(el);
		}, this));
	},

	swap: function(one, two){
		if (typeOf(one) == 'element') one = this.elements.indexOf(one);
		if (typeOf(two) == 'element') two = this.elements.indexOf(two);

		var newOrder = Array.clone(this.currentOrder);
		newOrder[this.currentOrder.indexOf(one)] = two;
		newOrder[this.currentOrder.indexOf(two)] = one;

		return this.sort(newOrder);
	}

});


/*
---

script: Drag.js

name: Drag

description: The base Drag Class. Can be used to drag and resize Elements using mouse events.

license: MIT-style license

authors:
  - Valerio Proietti
  - Tom Occhinno
  - Jan Kassens

requires:
  - Core/Events
  - Core/Options
  - Core/Element.Event
  - Core/Element.Style
  - /MooTools.More

provides: [Drag]
...

*/

var Drag = new Class({

	Implements: [Events, Options],

	options: {/*
		onBeforeStart: function(thisElement){},
		onStart: function(thisElement, event){},
		onSnap: function(thisElement){},
		onDrag: function(thisElement, event){},
		onCancel: function(thisElement){},
		onComplete: function(thisElement, event){},*/
		snap: 6,
		unit: 'px',
		grid: false,
		style: true,
		limit: false,
		handle: false,
		invert: false,
		preventDefault: false,
		stopPropagation: false,
		modifiers: {x: 'left', y: 'top'}
	},

	initialize: function(){
		var params = Array.link(arguments, {
			'options': Type.isObject, 
			'element': function(obj){
				return obj != null;
			}
		});
		this.element = document.id(params.element);
		this.document = this.element.getDocument();
		this.setOptions(params.options || {});
		var htype = typeOf(this.options.handle);
		this.handles = ((htype == 'array' || htype == 'collection') ? $$(this.options.handle) : document.id(this.options.handle)) || this.element;
		this.mouse = {'now': {}, 'pos': {}};
		this.value = {'start': {}, 'now': {}};

		this.selection = (Browser.ie) ? 'selectstart' : 'mousedown';

		this.bound = {
			start: this.start.bind(this),
			check: this.check.bind(this),
			drag: this.drag.bind(this),
			stop: this.stop.bind(this),
			cancel: this.cancel.bind(this),
			eventStop: Function.from(false)
		};
		this.attach();
	},

	attach: function(){
		this.handles.addEvent('mousedown', this.bound.start);
		return this;
	},

	detach: function(){
		this.handles.removeEvent('mousedown', this.bound.start);
		return this;
	},

	start: function(event){
		if (event.rightClick) return;
		if (this.options.preventDefault) event.preventDefault();
		if (this.options.stopPropagation) event.stopPropagation();
		this.mouse.start = event.page;
		this.fireEvent('beforeStart', this.element);
		var limit = this.options.limit;
		this.limit = {x: [], y: []};
		for (var z in this.options.modifiers){
			if (!this.options.modifiers[z]) continue;
			if (this.options.style) this.value.now[z] = this.element.getStyle(this.options.modifiers[z]).toInt();
			else this.value.now[z] = this.element[this.options.modifiers[z]];
			if (this.options.invert) this.value.now[z] *= -1;
			this.mouse.pos[z] = event.page[z] - this.value.now[z];
			if (limit && limit[z]){
				for (var i = 2; i--; i){
					if ((limit[z][i] || limit[z][i] === 0)) this.limit[z][i] = Function.from(limit[z][i])();
				}
			}
		}
		if (typeOf(this.options.grid) == 'number') this.options.grid = {x: this.options.grid, y: this.options.grid};
		this.document.addEvents({mousemove: this.bound.check, mouseup: this.bound.cancel});
		this.document.addEvent(this.selection, this.bound.eventStop);
	},

	check: function(event){
		if (this.options.preventDefault) event.preventDefault();
		var distance = Math.round(Math.sqrt(Math.pow(event.page.x - this.mouse.start.x, 2) + Math.pow(event.page.y - this.mouse.start.y, 2)));
		if (distance > this.options.snap){
			this.cancel();
			this.document.addEvents({
				mousemove: this.bound.drag,
				mouseup: this.bound.stop
			});
			this.fireEvent('start', [this.element, event]).fireEvent('snap', this.element);
		}
	},

	drag: function(event){
		if (this.options.preventDefault) event.preventDefault();
		this.mouse.now = event.page;
		for (var z in this.options.modifiers){
			if (!this.options.modifiers[z]) continue;
			this.value.now[z] = this.mouse.now[z] - this.mouse.pos[z];
			if (this.options.invert) this.value.now[z] *= -1;
			if (this.options.limit && this.limit[z]){
				if ((this.limit[z][1] || this.limit[z][1] === 0) && (this.value.now[z] > this.limit[z][1])){
					this.value.now[z] = this.limit[z][1];
				} else if ((this.limit[z][0] || this.limit[z][0] === 0) && (this.value.now[z] < this.limit[z][0])){
					this.value.now[z] = this.limit[z][0];
				}
			}
			if (this.options.grid[z]) this.value.now[z] -= ((this.value.now[z] - (this.limit[z][0]||0)) % this.options.grid[z]);
			if (this.options.style) {
				this.element.setStyle(this.options.modifiers[z], this.value.now[z] + this.options.unit);
			} else {
				this.element[this.options.modifiers[z]] = this.value.now[z];
			}
		}
		this.fireEvent('drag', [this.element, event]);
	},

	cancel: function(event){
		this.document.removeEvent('mousemove', this.bound.check);
		this.document.removeEvent('mouseup', this.bound.cancel);
		if (event){
			this.document.removeEvent(this.selection, this.bound.eventStop);
			this.fireEvent('cancel', this.element);
		}
	},

	stop: function(event){
		this.document.removeEvent(this.selection, this.bound.eventStop);
		this.document.removeEvent('mousemove', this.bound.drag);
		this.document.removeEvent('mouseup', this.bound.stop);
		if (event) this.fireEvent('complete', [this.element, event]);
	}

});

Element.implement({

	makeResizable: function(options){
		var drag = new Drag(this, Object.merge({modifiers: {x: 'width', y: 'height'}}, options));
		this.store('resizer', drag);
		return drag.addEvent('drag', function(){
			this.fireEvent('resize', drag);
		}.bind(this));
	}

});


	/*
---

script: Drag.Move.js

name: Drag.Move

description: A Drag extension that provides support for the constraining of draggables to containers and droppables.

license: MIT-style license

authors:
  - Valerio Proietti
  - Tom Occhinno
  - Jan Kassens
  - Aaron Newton
  - Scott Kyle

requires:
  - Core/Element.Dimensions
  - /Drag

provides: [Drag.Move]

...
*/

Drag.Move = new Class({

	Extends: Drag,

	options: {/*
		onEnter: function(thisElement, overed){},
		onLeave: function(thisElement, overed){},
		onDrop: function(thisElement, overed, event){},*/
		droppables: [],
		container: false,
		precalculate: false,
		includeMargins: true,
		checkDroppables: true
	},

	initialize: function(element, options){
		this.parent(element, options);
		element = this.element;
		
		this.droppables = $$(this.options.droppables);
		this.container = document.id(this.options.container);
		
		if (this.container && typeOf(this.container) != 'element')
			this.container = document.id(this.container.getDocument().body);
		
		var styles = element.getStyles('left', 'top', 'position');
		if (styles.left == 'auto' || styles.top == 'auto')
			element.setPosition(element.getPosition(element.getOffsetParent()));
		
		if (styles.position == 'static')
			element.setStyle('position', 'absolute');

		this.addEvent('start', this.checkDroppables, true);

		this.overed = null;
	},

	start: function(event){
		if (this.container) this.options.limit = this.calculateLimit();
		
		if (this.options.precalculate){
			this.positions = this.droppables.map(function(el){
				return el.getCoordinates();
			});
		}
		
		this.parent(event);
	},
	
	calculateLimit: function(){
		var offsetParent = document.id(this.element.getOffsetParent() || this.element.parentNode),
			containerCoordinates = this.container.getCoordinates(offsetParent),
			containerBorder = {},
			elementMargin = {},
			elementBorder = {},
			containerMargin = {},
			offsetParentPadding = {};

		['top', 'right', 'bottom', 'left'].each(function(pad){
			containerBorder[pad] = this.container.getStyle('border-' + pad).toInt();
			elementBorder[pad] = this.element.getStyle('border-' + pad).toInt();
			elementMargin[pad] = this.element.getStyle('margin-' + pad).toInt();
			containerMargin[pad] = this.container.getStyle('margin-' + pad).toInt();
			offsetParentPadding[pad] = offsetParent.getStyle('padding-' + pad).toInt();
		}, this);

		var width = this.element.offsetWidth + elementMargin.left + elementMargin.right,
			height = this.element.offsetHeight + elementMargin.top + elementMargin.bottom,
			left = 0,
			top = 0,
			right = containerCoordinates.right - containerBorder.right - width,
			bottom = containerCoordinates.bottom - containerBorder.bottom - height;

		if (this.options.includeMargins){
			left += elementMargin.left;
			top += elementMargin.top;
		} else {
			right += elementMargin.right;
			bottom += elementMargin.bottom;
		}
		
		if (this.element.getStyle('position') == 'relative'){
			var coords = this.element.getCoordinates(offsetParent);
			coords.left -= this.element.getStyle('left').toInt();
			coords.top -= this.element.getStyle('top').toInt();
			
			left += containerBorder.left - coords.left;
			top += containerBorder.top - coords.top;
			right += elementMargin.left - coords.left;
			bottom += elementMargin.top - coords.top;
			
			if (this.container != offsetParent){
				left += containerMargin.left + offsetParentPadding.left;
				top += (Browser.Engine.trident4 ? 0 : containerMargin.top) + offsetParentPadding.top;
			}
		} else {
			left -= elementMargin.left;
			top -= elementMargin.top;
			
			if (this.container == offsetParent){
				right -= containerBorder.left;
				bottom -= containerBorder.top;
			} else {
				left += containerCoordinates.left + containerBorder.left;
				top += containerCoordinates.top + containerBorder.top;
			}
		}
		
		return {
			x: [left, right],
			y: [top, bottom]
		};
	},

	checkAgainst: function(el, i){
		el = (this.positions) ? this.positions[i] : el.getCoordinates();
		var now = this.mouse.now;
		return (now.x > el.left && now.x < el.right && now.y < el.bottom && now.y > el.top);
	},

	checkDroppables: function(){
		var overed = Array.from(this.droppables).filter(this.checkAgainst, this).getLast();
		if (this.overed != overed){
			if (this.overed) this.fireEvent('leave', [this.element, this.overed]);
			if (overed) this.fireEvent('enter', [this.element, overed]);
			this.overed = overed;
		}
	},

	drag: function(event){
		this.parent(event);
		if (this.options.checkDroppables && this.droppables.length) this.checkDroppables();
	},

	stop: function(event){
		this.checkDroppables();
		this.fireEvent('drop', [this.element, this.overed, event]);
		this.overed = null;
		return this.parent(event);
	}

});

Element.implement({

	makeDraggable: function(options){
		var drag = new Drag.Move(this, options);
		this.store('dragger', drag);
		return drag;
	}

});


/*
---

script: Slider.js

name: Slider

description: Class for creating horizontal and vertical slider controls.

license: MIT-style license

authors:
  - Valerio Proietti

requires:
  - Core/Element.Dimensions
  - /Class.Binds
  - /Drag
  - /Element.Measure

provides: [Slider]

...
*/

var Slider = new Class({

	Implements: [Events, Options],

	Binds: ['clickedElement', 'draggedKnob', 'scrolledElement'],

	options: {/*
		onTick: function(intPosition){},
		onChange: function(intStep){},
		onComplete: function(strStep){},*/
		onTick: function(position){
			if (this.options.snap) position = this.toPosition(this.step);
			this.knob.setStyle(this.property, position);
		},
		initialStep: 0,
		snap: false,
		offset: 0,
		range: false,
		wheel: false,
		steps: 100,
		mode: 'horizontal'
	},

	initialize: function(element, knob, options){
		this.setOptions(options);
		this.element = document.id(element);
		this.knob = document.id(knob);
		this.previousChange = this.previousEnd = this.step = -1;
		var offset, limit = {}, modifiers = {'x': false, 'y': false};
		switch (this.options.mode){
			case 'vertical':
				this.axis = 'y';
				this.property = 'top';
				offset = 'offsetHeight';
				break;
			case 'horizontal':
				this.axis = 'x';
				this.property = 'left';
				offset = 'offsetWidth';
		}
		
		this.full = this.element.measure(function(){ 
			this.half = this.knob[offset] / 2; 
			return this.element[offset] - this.knob[offset] + (this.options.offset * 2); 
		}.bind(this));
		
		this.setRange(this.options.range);

		this.knob.setStyle('position', 'relative').setStyle(this.property, this.options.initialStep ? this.toPosition(this.options.initialStep) : - this.options.offset);
		modifiers[this.axis] = this.property;
		limit[this.axis] = [- this.options.offset, this.full - this.options.offset];

		var dragOptions = {
			snap: 0,
			limit: limit,
			modifiers: modifiers,
			onDrag: this.draggedKnob,
			onStart: this.draggedKnob,
			onBeforeStart: (function(){
				this.isDragging = true;
			}).bind(this),
			onCancel: function() {
				this.isDragging = false;
			}.bind(this),
			onComplete: function(){
				this.isDragging = false;
				this.draggedKnob();
				this.end();
			}.bind(this)
		};
		if (this.options.snap){
			dragOptions.grid = Math.ceil(this.stepWidth);
			dragOptions.limit[this.axis][1] = this.full;
		}

		this.drag = new Drag(this.knob, dragOptions);
		this.attach();
	},

	attach: function(){
		this.element.addEvent('mousedown', this.clickedElement);
		if (this.options.wheel) this.element.addEvent('mousewheel', this.scrolledElement);
		this.drag.attach();
		return this;
	},

	detach: function(){
		this.element.removeEvent('mousedown', this.clickedElement);
		this.element.removeEvent('mousewheel', this.scrolledElement);
		this.drag.detach();
		return this;
	},

	set: function(step){
		if (!((this.range > 0) ^ (step < this.min))) step = this.min;
		if (!((this.range > 0) ^ (step > this.max))) step = this.max;

		this.step = Math.round(step);
		this.checkStep();
		this.fireEvent('tick', this.toPosition(this.step));
		this.end();
		return this;
	},
	
	setRange: function(range, pos){
		this.min = Array.pick([range[0], 0]);
		this.max = Array.pick([range[1], this.options.steps]);
		this.range = this.max - this.min;
		this.steps = this.options.steps || this.full;
		this.stepSize = Math.abs(this.range) / this.steps;
		this.stepWidth = this.stepSize * this.full / Math.abs(this.range);
		this.set(Array.pick([pos, this.step]).floor(this.min).max(this.max));
		return this;
	},

	clickedElement: function(event){
		if (this.isDragging || event.target == this.knob) return;

		var dir = this.range < 0 ? -1 : 1;
		var position = event.page[this.axis] - this.element.getPosition()[this.axis] - this.half;
		position = position.limit(-this.options.offset, this.full -this.options.offset);

		this.step = Math.round(this.min + dir * this.toStep(position));
		this.checkStep();
		this.fireEvent('tick', position);
		this.end();
	},

	scrolledElement: function(event){
		var mode = (this.options.mode == 'horizontal') ? (event.wheel < 0) : (event.wheel > 0);
		this.set(mode ? this.step - this.stepSize : this.step + this.stepSize);
		event.stop();
	},

	draggedKnob: function(){
		var dir = this.range < 0 ? -1 : 1;
		var position = this.drag.value.now[this.axis];
		position = position.limit(-this.options.offset, this.full -this.options.offset);
		this.step = Math.round(this.min + dir * this.toStep(position));
		this.checkStep();
	},

	checkStep: function(){
		if (this.previousChange != this.step){
			this.previousChange = this.step;
			this.fireEvent('change', this.step);
		}
	},

	end: function(){
		if (this.previousEnd !== this.step){
			this.previousEnd = this.step;
			this.fireEvent('complete', this.step + '');
		}
	},

	toStep: function(position){
		var step = (position + this.options.offset) * this.stepSize / this.full * this.steps;
		return this.options.steps ? Math.round(step -= step % this.stepSize) : step;
	},

	toPosition: function(step){
		return (this.full * Math.abs(this.min - step)) / (this.steps * this.stepSize) - this.options.offset;
	}

});


/*
---

script: Sortables.js

name: Sortables

description: Class for creating a drag and drop sorting interface for lists of items.

license: MIT-style license

authors:
  - Tom Occhino

requires:
  - Core/Fx.Morph
  - /Drag.Move

provides: [Sortables]

...
*/

var Sortables = new Class({

	Implements: [Events, Options],

	options: {/*
		onSort: function(element, clone){},
		onStart: function(element, clone){},
		onComplete: function(element){},*/
		snap: 4,
		opacity: 1,
		clone: false,
		revert: false,
		handle: false,
		constrain: false,
		preventDefault: false
	},

	initialize: function(lists, options){
		this.setOptions(options);
		this.elements = [];
		this.lists = [];
		this.idle = true;

		this.addLists($$(document.id(lists) || lists));
		
		if (!this.options.clone) this.options.revert = false;
		if (this.options.revert) this.effect = new Fx.Morph(null, Object.merge({duration: 250, link: 'cancel'}, this.options.revert));
	},

	attach: function(){
		this.addLists(this.lists);
		return this;
	},

	detach: function(){
		this.lists = this.removeLists(this.lists);
		return this;
	},

	addItems: function(){
		Array.flatten(arguments).each(function(element){
			this.elements.push(element);
			var start = element.retrieve('sortables:start', function(event){
				this.start(event, element);
			}.bind(this));
			(this.options.handle ? element.getElement(this.options.handle) || element : element).addEvent('mousedown', start);
		}, this);
		return this;
	},

	addLists: function(){
		Array.flatten(arguments).each(function(list){
			this.lists.push(list);
			this.addItems(list.getChildren());
		}, this);
		return this;
	},

	removeItems: function(){
		return new Elements(Array.flatten(arguments).map(function(element){
			this.elements.erase(element);
			var start = element.retrieve('sortables:start');
			(this.options.handle ? element.getElement(this.options.handle) || element : element).removeEvent('mousedown', start);
			
			return element;
		}, this));
	},

	removeLists: function(){
		return new Elements(Array.flatten(arguments).map(function(list){
			this.lists.erase(list);
			this.removeItems(list.getChildren());
			
			return list;
		}, this));
	},

	getClone: function(event, element){
		if (!this.options.clone) return new Element('div').inject(document.body);
		if (typeOf(this.options.clone) == 'function') return this.options.clone.call(this, event, element, this.list);
		var clone = element.clone(true).setStyles({
			margin: '0px',
			position: 'absolute',
			visibility: 'hidden',
			'width': element.getStyle('width')
		});
		//prevent the duplicated radio inputs from unchecking the real one
		if (clone.get('html').test('radio')) {
			clone.getElements('input[type=radio]').each(function(input, i) {
				input.set('name', 'clone_' + i);
			});
		}
		
		return clone.inject(this.list).setPosition(element.getPosition(element.getOffsetParent()));
	},

	getDroppables: function(){
		var droppables = this.list.getChildren();
		if (!this.options.constrain) droppables = this.lists.concat(droppables).erase(this.list);
		return droppables.erase(this.clone).erase(this.element);
	},

	insert: function(dragging, element){
		var where = 'inside';
		if (this.lists.contains(element)){
			this.list = element;
			this.drag.droppables = this.getDroppables();
		} else {
			where = this.element.getAllPrevious().contains(element) ? 'before' : 'after';
		}
		this.element.inject(element, where);
		this.fireEvent('sort', [this.element, this.clone]);
	},

	start: function(event, element){
		if (!this.idle || event.rightClick) return;
		this.idle = false;
		this.element = element;
		this.opacity = element.get('opacity');
		this.list = element.getParent();
		this.clone = this.getClone(event, element);
		this.drag = new Drag.Move(this.clone, {
			preventDefault: this.options.preventDefault,
			snap: this.options.snap,
			container: this.options.constrain && this.element.getParent(),
			droppables: this.getDroppables(),
			onSnap: function(){
				event.stop();
				this.clone.setStyle('visibility', 'visible');
				this.element.set('opacity', this.options.opacity || 0);
				this.fireEvent('start', [this.element, this.clone]);
			}.bind(this),
			onEnter: this.insert.bind(this),
			onCancel: this.reset.bind(this),
			onComplete: this.end.bind(this)
		});

		this.clone.inject(this.element, 'before');
		this.drag.start(event);
	},

	end: function(){
		this.drag.detach();
		this.element.set('opacity', this.opacity);
		if (this.effect){
			var dim = this.element.getStyles('width', 'height');
			var pos = this.clone.computePosition(this.element.getPosition(this.clone.offsetParent));
			this.effect.element = this.clone;
			this.effect.start({
				top: pos.top,
				left: pos.left,
				width: dim.width,
				height: dim.height,
				opacity: 0.25
			}).chain(this.reset.bind(this));
		} else {
			this.reset();
		}
	},

	reset: function(){
		this.idle = true;
		this.clone.destroy();
		this.fireEvent('complete', this.element);
	},

	serialize: function(){
		var params = Array.link(arguments, {
			modifier: function(obj){
				return typeOf(obj) == 'function'
			},
			index: function(obj){
				return obj != null;
			}
		});
		var serial = this.lists.map(function(list){
			return list.getChildren().map(params.modifier || function(element){
				return element.get('id');
			}, this);
		}, this);

		var index = params.index;
		if (this.lists.length == 1) index = 0;
		return (index || index === 0) && index >= 0 && index < this.lists.length ? serial[index] : serial;
	}

});


/*
---

script: Request.JSONP.js

name: Request.JSONP

description: Defines Request.JSONP, a class for cross domain javascript via script injection.

license: MIT-style license

authors:
  - Aaron Newton
  - Guillermo Rauch
  - Arian Stolwijk

requires:
  - Core/Element
  - Core/Request

provides: [Request.JSONP]

...
*/

Request.JSONP = new Class({
	
	Implements: [Chain, Events, Options],
	
	options: {
	/*
		onRequest: function(src, scriptElement){},
		onComplete: function(data){},
		onSuccess: function(data){},
		onCancel: function(){},
		onTimeout: function(){},
		onError: function(){}, */
		onRequest: function(src){
			if (this.options.log && window.console && console.log) {
				console.log('JSONP retrieving script with url:' + src);
			}
		},
		onError: function(src){
			if (this.options.log && window.console && console.warn) {
				console.warn('JSONP '+ src +' will fail in Internet Explorer, which enforces a 2083 bytes length limit on URIs');
			}
		},
		url: '',
		callbackKey: 'callback',
		injectScript: document.head,
		data: {},
		link: 'ignore',
		timeout: 0,
		log: false
	},
	
	initialize: function(options){
		this.setOptions(options);
	},

	send: function(options){
		if (!Request.prototype.check.call(this, options)) return this;
		this.running = true;
		
		var type = typeOf(options);
		if (type == 'string' || type == 'element') options = {data: options};
		options = Object.merge(this.options, options || {});

		var data = options.data;
		switch (typeOf(data)){
			case 'element': data = document.id(data).toQueryString(); break;
			case 'object': case 'hash': data = Object.toQueryString(data);
		}

		var index = this.index = Request.JSONP.counter++;

		var src = options.url +
			(options.url.test('\\?') ? '&' :'?') + 
			(options.callbackKey) + 
			'=Request.JSONP.request_map.request_'+ index + 
			(data ? '&' + data : '');
				
		if(src.length > 2083) this.fireEvent('error', src);
		
		var script = this.getScript(src).inject(options.injectScript);
		
		this.fireEvent('request', [script.get('src'), script]);
		
		Request.JSONP.request_map['request_' + index] = function(){
			this.success(arguments, index);
		}.bind(this);
		
		if(options.timeout){
			(function(){
				this.cancel().fireEvent('timeout', [script.get('src'), script]);
			}).delay(options.timeout, this);
		}
		
		return this;
	},
	
	getScript: function(src){
		return this.script = new Element('script', {
			type: 'text/javascript',
			src: src
		});
	},
	
	success: function(args, index){
		this.clear()
			.fireEvent('complete', args).fireEvent('success', args)
			.callChain();
	},
	
	cancel: function(){
		return this.clear().fireEvent('cancel');
	},
	
	clear: function(){
		if (this.script) this.script.destroy();
		this.running = false;
		return this;
	}
	
});

Request.JSONP.counter = 0;
Request.JSONP.request_map = {};


/*
---

script: Request.Queue.js

name: Request.Queue

description: Controls several instances of Request and its variants to run only one request at a time.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Element
  - Core/Request
  - /Class.Binds

provides: [Request.Queue]

...
*/

Request.Queue = new Class({

	Implements: [Options, Events],

	Binds: ['attach', 'request', 'complete', 'cancel', 'success', 'failure', 'exception'],

	options: {/*
		onRequest: function(argsPassedToOnRequest){},
		onSuccess: function(argsPassedToOnSuccess){},
		onComplete: function(argsPassedToOnComplete){},
		onCancel: function(argsPassedToOnCancel){},
		onException: function(argsPassedToOnException){},
		onFailure: function(argsPassedToOnFailure){},
		onEnd: function(){},
		*/
		stopOnFailure: true,
		autoAdvance: true,
		concurrent: 1,
		requests: {}
	},

	initialize: function(options){
		if(options){
			var requests = options.requests;
			delete options.requests;	
		}
		this.setOptions(options);
		this.requests = {};
		this.queue = [];
		this.reqBinders = {};
		
		if(requests) this.addRequests(requests);
	},

	addRequest: function(name, request){
		this.requests[name] = request;
		this.attach(name, request);
		return this;
	},

	addRequests: function(obj){
		Object.each(obj, function(req, name){
			this.addRequest(name, req);
		}, this);
		return this;
	},

	getName: function(req){
		return Object.keyOf(this.requests, req);
	},

	attach: function(name, req){
		if (req._groupSend) return this;
		['request', 'complete', 'cancel', 'success', 'failure', 'exception'].each(function(evt){
			if(!this.reqBinders[name]) this.reqBinders[name] = {};
			this.reqBinders[name][evt] = function(){
				this['on' + evt.capitalize()].apply(this, [name, req].append(arguments));
			}.bind(this);
			req.addEvent(evt, this.reqBinders[name][evt]);
		}, this);
		req._groupSend = req.send;
		req.send = function(options){
			this.send(name, options);
			return req;
		}.bind(this);
		return this;
	},

	removeRequest: function(req){
		var name = typeOf(req) == 'object' ? this.getName(req) : req;
		if (!name && typeOf(name) != 'string') return this;
		req = this.requests[name];
		if (!req) return this;
		['request', 'complete', 'cancel', 'success', 'failure', 'exception'].each(function(evt){
			req.removeEvent(evt, this.reqBinders[name][evt]);
		}, this);
		req.send = req._groupSend;
		delete req._groupSend;
		return this;
	},

	getRunning: function(){
		return Object.filter(this.requests, function(r){
			return r.running;
		});
	},

	isRunning: function(){
		return !!(Object.keys(this.getRunning()).length);
	},

	send: function(name, options){
		var q = function(){
			this.requests[name]._groupSend(options);
			this.queue.erase(q);
		}.bind(this);
		
		q.name = name;
		if (Object.keys(this.getRunning()).length >= this.options.concurrent || (this.error && this.options.stopOnFailure)) this.queue.push(q);
		else q();
		return this;
	},

	hasNext: function(name){
		return (!name) ? !!this.queue.length : !!this.queue.filter(function(q){ return q.name == name; }).length;
	},

	resume: function(){
		this.error = false;
		(this.options.concurrent - Object.keys(this.getRunning()).length).times(this.runNext, this);
		return this;
	},

	runNext: function(name){
		if (!this.queue.length) return this;
		if (!name){
			this.queue[0]();
		} else {
			var found;
			this.queue.each(function(q){
				if (!found && q.name == name){
					found = true;
					q();
				}
			});
		}
		return this;
	},

	runAll: function() {
		this.queue.each(function(q) {
			q();
		});
		return this;
	},

	clear: function(name){
		if (!name){
			this.queue.empty();
		} else {
			this.queue = this.queue.map(function(q){
				if (q.name != name) return q;
				else return false;
			}).filter(function(q){
				return q;
			});
		}
		return this;
	},

	cancel: function(name){
		this.requests[name].cancel();
		return this;
	},

	onRequest: function(){
		this.fireEvent('request', arguments);
	},

	onComplete: function(){
		this.fireEvent('complete', arguments);
		if (!this.queue.length) this.fireEvent('end');
	},

	onCancel: function(){
		if (this.options.autoAdvance && !this.error) this.runNext();
		this.fireEvent('cancel', arguments);
	},

	onSuccess: function(){
		if (this.options.autoAdvance && !this.error) this.runNext();
		this.fireEvent('success', arguments);
	},

	onFailure: function(){
		this.error = true;
		if (!this.options.stopOnFailure && this.options.autoAdvance) this.runNext();
		this.fireEvent('failure', arguments);
	},

	onException: function(){
		this.error = true;
		if (!this.options.stopOnFailure && this.options.autoAdvance) this.runNext();
		this.fireEvent('exception', arguments);
	}

});


/*
---

script: Request.Periodical.js

name: Request.Periodical

description: Requests the same URL to pull data from a server but increases the intervals if no data is returned to reduce the load

license: MIT-style license

authors:
  - Christoph Pojer

requires:
  - Core/Request
  - /MooTools.More

provides: [Request.Periodical]

...
*/

Request.implement({

	options: {
		initialDelay: 5000,
		delay: 5000,
		limit: 60000
	},

	startTimer: function(data){
		var fn = function(){
			if (!this.running) this.send({data: data});
		};
		this.lastDelay = this.options.initialDelay;
		this.timer = fn.delay(this.lastDelay, this);
		this.completeCheck = function(response){
			clearTimeout(this.timer);
			this.lastDelay = (response) ? this.options.delay : (this.lastDelay + this.options.delay).min(this.options.limit);
			this.timer = fn.delay(this.lastDelay, this);
		};
		return this.addEvent('complete', this.completeCheck);
	},

	stopTimer: function(){
		clearTimeout(this.timer);
		return this.removeEvent('complete', this.completeCheck);
	}

});


/*
---

script: Assets.js

name: Assets

description: Provides methods to dynamically load JavaScript, CSS, and Image files into the document.

license: MIT-style license

authors:
  - Valerio Proietti

requires:
  - Core/Element.Event
  - /MooTools.More

provides: [Assets]

...
*/

var Asset = {

	javascript: function(source, properties){
		properties = Object.append({
			onload: function(){},
			document: document,
			check: Function.from(true)
		}, properties);
		
		if (properties.onLoad) {
			properties.onload = properties.onLoad;
			delete properties.onLoad;
		}
		var script = new Element('script', {src: source, type: 'text/javascript'});

		var load = properties.onload.bind(script), 
			check = properties.check, 
			doc = properties.document;
		delete properties.onload;
		delete properties.check;
		delete properties.document;

		script.addEvents({
			load: load,
			readystatechange: function(){
				if (['loaded', 'complete'].contains(this.readyState)) load();
			}
		}).set(properties);

		if ((Browser.safari || Browser.chrome) && Browser.version == 2) {
			var checker = (function(){
				if (!Function.attempt(check)) return;
				clearInterval(checker);
				load();
			}).periodical(50);
		}

		return script.inject(doc.head);
	},

	css: function(source, properties){
		var onload = properties.onload || properties.onLoad;
		if (onload) {
			properties.events = properties.events || {};
			properties.events.load = onload;
			delete properties.onload;
			delete properties.onLoad;
		}
		return new Element('link', Object.merge({
			rel: 'stylesheet',
			media: 'screen',
			type: 'text/css',
			href: source
		}, properties)).inject(document.head);
	},

	image: function(source, properties){
		properties = Object.merge({
			onload: function(){},
			onabort: function(){},
			onerror: function(){}
		}, properties);
		var image = new Image();
		var element = document.id(image) || new Element('img');
		['load', 'abort', 'error'].each(function(name){
			var type = 'on' + name;
			var cap = name.capitalize();
			if (properties['on' + cap]) {
				properties[type] = properties['on' + cap];
				delete properties['on' + cap];
			}
			var event = properties[type];
			delete properties[type];
			image[type] = function(){
				if (!image) return;
				if (!element.parentNode){
					element.width = image.width;
					element.height = image.height;
				}
				image = image.onload = image.onabort = image.onerror = null;
				event.delay(1, element, element);
				element.fireEvent(name, element, 1);
			};
		});
		image.src = element.src = source;
		if (image && image.complete) image.onload.delay(1);
		return element.set(properties);
	},

	images: function(sources, options){
		options = Object.merge({
			onComplete: function(){},
			onProgress: function(){},
			onError: function(){},
			properties: {}
		}, options);
		sources = Array.from(sources);
		var images = [];
		var counter = 0;
		return new Elements(sources.map(function(source){
			return Asset.image(source, Object.append(options.properties, {
				onload: function(){
					options.onProgress.call(this, counter, sources.indexOf(source));
					counter++;
					if (counter == sources.length) options.onComplete();
				},
				onerror: function(){
					options.onError.call(this, counter, sources.indexOf(source));
					counter++;
					if (counter == sources.length) options.onComplete();
				}
			}));
		}));
	}

};


/*
---

script: Color.js

name: Color

description: Class for creating and manipulating colors in JavaScript. Supports HSB -> RGB Conversions and vice versa.

license: MIT-style license

authors:
  - Valerio Proietti

requires:
  - Core/Array
  - Core/String
  - Core/Number
  - Core/Hash
  - Core/Function
  - Core/$util

provides: [Color]

...
*/

var Color = new Type('Color', function(color, type){
	if (arguments.length >= 3){
		type = 'rgb'; color = Array.slice(arguments, 0, 3);
	} else if (typeof color == 'string'){
		if (color.match(/rgb/)) color = color.rgbToHex().hexToRgb(true);
		else if (color.match(/hsb/)) color = color.hsbToRgb();
		else color = color.hexToRgb(true);
	}
	type = type || 'rgb';
	switch (type){
		case 'hsb':
			var old = color;
			color = color.hsbToRgb();
			color.hsb = old;
		break;
		case 'hex': color = color.hexToRgb(true); break;
	}
	color.rgb = color.slice(0, 3);
	color.hsb = color.hsb || color.rgbToHsb();
	color.hex = color.rgbToHex();
	return Object.append(color, this);
});

Color.implement({

	mix: function(){
		var colors = Array.slice(arguments);
		var alpha = (typeOf(colors.getLast()) == 'number') ? colors.pop() : 50;
		var rgb = this.slice();
		colors.each(function(color){
			color = new Color(color);
			for (var i = 0; i < 3; i++) rgb[i] = Math.round((rgb[i] / 100 * (100 - alpha)) + (color[i] / 100 * alpha));
		});
		return new Color(rgb, 'rgb');
	},

	invert: function(){
		return new Color(this.map(function(value){
			return 255 - value;
		}));
	},

	setHue: function(value){
		return new Color([value, this.hsb[1], this.hsb[2]], 'hsb');
	},

	setSaturation: function(percent){
		return new Color([this.hsb[0], percent, this.hsb[2]], 'hsb');
	},

	setBrightness: function(percent){
		return new Color([this.hsb[0], this.hsb[1], percent], 'hsb');
	}

});

var $RGB = function(r, g, b){
	return new Color([r, g, b], 'rgb');
};

var $HSB = function(h, s, b){
	return new Color([h, s, b], 'hsb');
};

var $HEX = function(hex){
	return new Color(hex, 'hex');
};

Array.implement({

	rgbToHsb: function(){
		var red = this[0],
				green = this[1],
				blue = this[2],
				hue = 0;
		var max = Math.max(red, green, blue),
				min = Math.min(red, green, blue);
		var delta = max - min;
		var brightness = max / 255,
				saturation = (max != 0) ? delta / max : 0;
		if(saturation != 0) {
			var rr = (max - red) / delta;
			var gr = (max - green) / delta;
			var br = (max - blue) / delta;
			if (red == max) hue = br - gr;
			else if (green == max) hue = 2 + rr - br;
			else hue = 4 + gr - rr;
			hue /= 6;
			if (hue < 0) hue++;
		}
		return [Math.round(hue * 360), Math.round(saturation * 100), Math.round(brightness * 100)];
	},

	hsbToRgb: function(){
		var br = Math.round(this[2] / 100 * 255);
		if (this[1] == 0){
			return [br, br, br];
		} else {
			var hue = this[0] % 360;
			var f = hue % 60;
			var p = Math.round((this[2] * (100 - this[1])) / 10000 * 255);
			var q = Math.round((this[2] * (6000 - this[1] * f)) / 600000 * 255);
			var t = Math.round((this[2] * (6000 - this[1] * (60 - f))) / 600000 * 255);
			switch (Math.floor(hue / 60)){
				case 0: return [br, t, p];
				case 1: return [q, br, p];
				case 2: return [p, br, t];
				case 3: return [p, q, br];
				case 4: return [t, p, br];
				case 5: return [br, p, q];
			}
		}
		return false;
	}

});

String.implement({

	rgbToHsb: function(){
		var rgb = this.match(/\d{1,3}/g);
		return (rgb) ? rgb.rgbToHsb() : null;
	},

	hsbToRgb: function(){
		var hsb = this.match(/\d{1,3}/g);
		return (hsb) ? hsb.hsbToRgb() : null;
	}

});


/*
---

script: Group.js

name: Group

description: Class for monitoring collections of events

license: MIT-style license

authors:
  - Valerio Proietti

requires:
  - Core/Events
  - /MooTools.More

provides: [Group]

...
*/

var Group = new Class({

	initialize: function(){
		this.instances = Array.flatten(arguments);
		this.events = {};
		this.checker = {};
	},

	addEvent: function(type, fn){
		this.checker[type] = this.checker[type] || {};
		this.events[type] = this.events[type] || [];
		if (this.events[type].contains(fn)) return false;
		else this.events[type].push(fn);
		this.instances.each(function(instance, i){
			instance.addEvent(type, this.check.bind(this, [type, instance, i]));
		}, this);
		return this;
	},

	check: function(type, instance, i){
		this.checker[type][i] = true;
		var every = this.instances.every(function(current, j){
			return this.checker[type][j] || false;
		}, this);
		if (!every) return;
		this.checker[type] = {};
		this.events[type].each(function(event){
			event.call(this, this.instances, instance);
		}, this);
	}

});


/*
---

script: Hash.Cookie.js

name: Hash.Cookie

description: Class for creating, reading, and deleting Cookies in JSON format.

license: MIT-style license

authors:
  - Valerio Proietti
  - Aaron Newton

requires:
  - Core/Cookie
  - Core/JSON
  - /MooTools.More
  - /Hash

provides: [Hash.Cookie]

...
*/

Hash.Cookie = new Class({

	Extends: Cookie,

	options: {
		autoSave: true
	},

	initialize: function(name, options){
		this.parent(name, options);
		this.load();
	},

	save: function(){
		var value = JSON.encode(this.hash);
		if (!value || value.length > 4096) return false; //cookie would be truncated!
		if (value == '{}') this.dispose();
		else this.write(value);
		return true;
	},

	load: function(){
		this.hash = new Hash(JSON.decode(this.read(), true));
		return this;
	}

});

Hash.each(Hash.prototype, function(method, name){
	if (typeof method == 'function') Hash.Cookie.implement(name, function(){
		var value = method.apply(this.hash, arguments);
		if (this.options.autoSave) this.save();
		return value;
	});
});


/*
---

script: HtmlTable.js

name: HtmlTable

description: Builds table elements with methods to add rows.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - Core/Options
  - Core/Events
  - /Class.Occlude

provides: [HtmlTable]

...
*/

var HtmlTable = new Class({

	Implements: [Options, Events, Class.Occlude],

	options: {
		properties: {
			cellpadding: 0,
			cellspacing: 0,
			border: 0
		},
		rows: [],
		headers: [],
		footers: []
	},

	property: 'HtmlTable',

	initialize: function(){
		var params = Array.link(arguments, {options: Type.isObject, table: Type.isElement});
		this.setOptions(params.options);
		this.element = params.table || new Element('table', this.options.properties);
		if (this.occlude()) return this.occluded;
		this.build();
	},

	build: function(){
		this.element.store('HtmlTable', this);

		this.body = document.id(this.element.tBodies[0]) || new Element('tbody').inject(this.element);
		$$(this.body.rows);

		if (this.options.headers.length) this.setHeaders(this.options.headers);
		else this.thead = document.id(this.element.tHead);
		if (this.thead) this.head = document.id(this.thead.rows[0]);

		if (this.options.footers.length) this.setFooters(this.options.footers);
		this.tfoot = document.id(this.element.tFoot);
		if (this.tfoot) this.foot = document.id(this.thead.rows[0]);

		this.options.rows.each(function(row){
			this.push(row);
		}, this);

		['adopt', 'inject', 'wraps', 'grab', 'replaces', 'dispose'].each(function(method){
				this[method] = this.element[method].bind(this.element);
		}, this);
	},

	toElement: function(){
		return this.element;
	},

	empty: function(){
		this.body.empty();
		return this;
	},

	set: function(what, items) {
		var target = (what == 'headers') ? 'tHead' : 'tFoot';
		this[target.toLowerCase()] = (document.id(this.element[target]) || new Element(target.toLowerCase()).inject(this.element, 'top')).empty();
		var data = this.push(items, {}, this[target.toLowerCase()], what == 'headers' ? 'th' : 'td');
		if (what == 'headers') this.head = document.id(this.thead.rows[0]);
		else this.foot = document.id(this.thead.rows[0]);
		return data;
	},

	setHeaders: function(headers){
		this.set('headers', headers);
		return this;
	},

	setFooters: function(footers){
		this.set('footers', footers);
		return this;
	},

	push: function(row, rowProperties, target, tag){
		var tds = row.map(function(data){
			var td = new Element(tag || 'td', data ? data.properties : {}),
				type = (data ? data.content : '') || data,
				element = document.id(type);
			if(typeOf(type) != 'string' && element) td.adopt(element);
			else td.set('html', type);

			return td;
		});

		return {
			tr: new Element('tr', rowProperties).inject(target || this.body).adopt(tds),
			tds: tds
		};
	}

});


/*
---

script: HtmlTable.Zebra.js

name: HtmlTable.Zebra

description: Builds a stripy table with methods to add rows.

license: MIT-style license

authors:
  - Harald Kirschner
  - Aaron Newton

requires:
  - /HtmlTable
  - /Class.refactor

provides: [HtmlTable.Zebra]

...
*/

HtmlTable = Class.refactor(HtmlTable, {

	options: {
		classZebra: 'table-tr-odd',
		zebra: true
	},

	initialize: function(){
		this.previous.apply(this, arguments);
		if (this.occluded) return this.occluded;
		if (this.options.zebra) this.updateZebras();
	},

	updateZebras: function(){
		Array.each(this.body.rows, this.zebra, this);
	},

	zebra: function(row, i){
		return row[((i % 2) ? 'remove' : 'add')+'Class'](this.options.classZebra);
	},

	push: function(){
		var pushed = this.previous.apply(this, arguments);
		if (this.options.zebra) this.updateZebras();
		return pushed;
	}

});


/*
---

script: HtmlTable.Sort.js

name: HtmlTable.Sort

description: Builds a stripy, sortable table with methods to add rows.

license: MIT-style license

authors:
  - Harald Kirschner
  - Aaron Newton

requires:
  - Core/Hash
  - /HtmlTable
  - /Class.refactor
  - /Element.Delegation
  - /String.Extras
  - /Date

provides: [HtmlTable.Sort]

...
*/

HtmlTable = Class.refactor(HtmlTable, {

	options: {/*
		onSort: function(){}, */
		sortIndex: 0,
		sortReverse: false,
		parsers: [],
		defaultParser: 'string',
		classSortable: 'table-sortable',
		classHeadSort: 'table-th-sort',
		classHeadSortRev: 'table-th-sort-rev',
		classNoSort: 'table-th-nosort',
		classGroupHead: 'table-tr-group-head',
		classGroup: 'table-tr-group',
		classCellSort: 'table-td-sort',
		classSortSpan: 'table-th-sort-span',
		sortable: false
	},

	initialize: function () {
		this.previous.apply(this, arguments);
		if (this.occluded) return this.occluded;
		this.sorted = {index: null, dir: 1};
		this.bound = {
			headClick: this.headClick.bind(this)
		};
		this.sortSpans = new Elements();
		if (this.options.sortable) {
			this.enableSort();
			if (this.options.sortIndex != null) this.sort(this.options.sortIndex, this.options.sortReverse);
		}
	},

	attachSorts: function(attach){
		this.element.removeEvents('click:relay(th)');
		this.element[attach !== false ? 'addEvent' : 'removeEvent']('click:relay(th)', this.bound.headClick);
	},

	setHeaders: function(){
		this.previous.apply(this, arguments);
		if (this.sortEnabled) this.detectParsers();
	},
	
	detectParsers: function(force){
		if (!this.head) return;
		var parsers = this.options.parsers, 
			rows = this.body.rows;

		// auto-detect
		this.parsers = $$(this.head.cells).map(function(cell, index) {
			if (!force && (cell.hasClass(this.options.classNoSort) || cell.retrieve('htmltable-parser'))) return cell.retrieve('htmltable-parser');
			var thDiv = new Element('div');
			Array.each(cell.childNodes, function(node) {
				thDiv.adopt(node);
			});
			thDiv.inject(cell);
			var sortSpan = new Element('span', {'html': '&#160;', 'class': this.options.classSortSpan}).inject(thDiv, 'top');
			
			this.sortSpans.push(sortSpan);

			var parser = parsers[index], 
					cancel;
			switch (typeOf(parser)) {
				case 'function': parser = {convert: parser}; cancel = true; break;
				case 'string': parser = parser; cancel = true; break;
			}
			if (!cancel) {
				HtmlTable.Parsers.some(function(current) {
					var match = current.match;
					if (!match) return false;
					for (var i = 0, j = rows.length; i < j; i++) {
						var text = document.id(rows[i].cells[index]).get('html').stripTags().clean();
						if (text && match.test(text)) {
							parser = current;
							return true;
						}
					}
				});
			}

			if (!parser) parser = this.options.defaultParser;
			cell.store('htmltable-parser', parser);
			return parser;
		}, this);
	},

	headClick: function(event, el) {
		if (!this.head || el.hasClass(this.options.classNoSort)) return;
		var index = Array.indexOf(this.head.cells, el);
		this.sort(index);
		return false;
	},

	sort: function(index, reverse, pre) {
		if (!this.head) return;
		var classCellSort = this.options.classCellSort;
		var classGroup = this.options.classGroup, 
			classGroupHead = this.options.classGroupHead;

		if (!pre) {
			if (index != null) {
				if (this.sorted.index == index) {
					this.sorted.reverse = !(this.sorted.reverse);
				} else {
					if (this.sorted.index != null) {
						this.sorted.reverse = false;
						this.head.cells[this.sorted.index].removeClass(this.options.classHeadSort).removeClass(this.options.classHeadSortRev);
					} else {
						this.sorted.reverse = true;
					}
					this.sorted.index = index;
				}
			} else {
				index = this.sorted.index;
			}

			if (reverse != null) this.sorted.reverse = reverse;

			var head = document.id(this.head.cells[index]);
			if (head) {
				head.addClass(this.options.classHeadSort);
				if (this.sorted.reverse) head.addClass(this.options.classHeadSortRev);
				else head.removeClass(this.options.classHeadSortRev);
			}

			this.body.getElements('td').removeClass(this.options.classCellSort);
		}

		var parser = this.parsers[index];
		if (typeOf(parser) == 'string') parser = HtmlTable.Parsers.get(parser);
		if (!parser) return;

		if (!Browser.ie) {
			var rel = this.body.getParent();
			this.body.dispose();
		}

		var data = Array.map(this.body.rows, function(row, i) {
			var value = parser.convert.call(document.id(row.cells[index]));

			return {
				position: i,
				value: value,
				toString:  function() {
					return value.toString();
				}
			};
		}, this);
		data.reverse(true);

		data.sort(function(a, b){
			if (a.value === b.value) return 0;
			return a.value > b.value ? 1 : -1;
		});

		if (!this.sorted.reverse) data.reverse(true);

		var i = data.length, body = this.body;
		var j, position, entry, group;

		while (i) {
			var item = data[--i];
			position = item.position;
			var row = body.rows[position];
			if (row.disabled) continue;

			if (!pre) {
				if (group === item.value) {
					row.removeClass(classGroupHead).addClass(classGroup);
				} else {
					group = item.value;
					row.removeClass(classGroup).addClass(classGroupHead);
				}
				if (this.options.zebra) this.zebra(row, i);

				row.cells[index].addClass(classCellSort);
			}

			body.appendChild(row);
			for (j = 0; j < i; j++) {
				if (data[j].position > position) data[j].position--;
			}
		};
		data = null;
		if (rel) rel.grab(body);

		return this.fireEvent('sort', [body, index]);
	},

	reSort: function(){
		if (this.sortEnabled) this.sort.call(this, this.sorted.index, this.sorted.reverse);
		return this;
	},

	enableSort: function(){
		this.element.addClass(this.options.classSortable);
		this.attachSorts(true);
		this.detectParsers();
		this.sortEnabled = true;
		return this;
	},

	disableSort: function(){
		this.element.removeClass(this.options.classSortable);
		this.attachSorts(false);
		this.sortSpans.each(function(span) { span.destroy(); });
		this.sortSpans.empty();
		this.sortEnabled = false;
		return this;
	}

});

HtmlTable.Parsers = new Hash({

	'date': {
		match: /^\d{2}[-\/ ]\d{2}[-\/ ]\d{2,4}$/,
		convert: function() {
			return Date.parse(this.get('text')).format('db');
		},
		type: 'date'
	},
	'input-checked': {
		match: / type="(radio|checkbox)" /,
		convert: function() {
			return this.getElement('input').checked;
		}
	},
	'input-value': {
		match: /<input/,
		convert: function() {
			return this.getElement('input').value;
		}
	},
	'number': {
		match: /^\d+[^\d.,]*$/,
		convert: function() {
			return this.get('text').toInt();
		},
		number: true
	},
	'numberLax': {
		match: /^[^\d]+\d+$/,
		convert: function() {
			return this.get('text').replace(/[^-?^0-9]/, '').toInt();
		},
		number: true
	},
	'float': {
		match: /^[\d]+\.[\d]+/,
		convert: function() {
			return this.get('text').replace(/[^-?^\d.]/, '').toFloat();
		},
		number: true
	},
	'floatLax': {
		match: /^[^\d]+[\d]+\.[\d]+$/,
		convert: function() {
			return this.get('text').replace(/[^-?^\d.]/, '');
		},
		number: true
	},
	'string': {
		match: null,
		convert: function() {
			return this.get('text');
		}
	},
	'title': {
		match: null,
		convert: function() {
			return this.title;
		}
	}

});


/*
---

script: Keyboard.js

name: Keyboard

description: KeyboardEvents used to intercept events on a class for keyboard and format modifiers in a specific order so as to make alt+shift+c the same as shift+alt+c.

license: MIT-style license

authors:
  - Perrin Westrich
  - Aaron Newton
  - Scott Kyle

requires:
  - Core/Events
  - Core/Options
  - Core/Element.Event
  - /Log

provides: [Keyboard]

...
*/

(function(){
	
	var Keyboard = this.Keyboard = new Class({

		Extends: Events,

		Implements: [Options, Log],

		options: {/*
			onActivate: function(){},
			onDeactivate: function(){},*/
			defaultEventType: 'keydown',
			active: false,
			manager: null,
			events: {},
			nonParsedEvents: ['activate', 'deactivate', 'onactivate', 'ondeactivate', 'changed', 'onchanged']
		},

		initialize: function(options){
			if (options && options.manager) {
				this.manager = options.manager;
				delete options.manager;
			}
			this.setOptions(options);
			this.setup();
		}, 
		setup: function(){
			this.addEvents(this.options.events);
			//if this is the root manager, nothing manages it
			if (Keyboard.manager && !this.manager) Keyboard.manager.manage(this);
			if (this.options.active) this.activate();
		},

		handle: function(event, type){
			//Keyboard.stop(event) prevents key propagation
			if (event.preventKeyboardPropagation) return;
			
			var bubbles = !!this.manager;
			if (bubbles && this.activeKB){
				this.activeKB.handle(event, type);
				if (event.preventKeyboardPropagation) return;
			}
			this.fireEvent(type, event);
			
			if (!bubbles && this.activeKB) this.activeKB.handle(event, type);
		},

		addEvent: function(type, fn, internal){
			return this.parent(Keyboard.parse(type, this.options.defaultEventType, this.options.nonParsedEvents), fn, internal);
		},

		removeEvent: function(type, fn){
			return this.parent(Keyboard.parse(type, this.options.defaultEventType, this.options.nonParsedEvents), fn);
		},

		toggleActive: function(){
			return this[this.active ? 'deactivate' : 'activate']();
		},

		activate: function(instance){
			if (instance) {
				if (instance.isActive()) return this;
				//if we're stealing focus, store the last keyboard to have it so the relinquish command works
				if (instance != this.activeKB) this.previous = this.activeKB;
				//if we're enabling a child, assign it so that events are now passed to it
				this.activeKB = instance.fireEvent('activate');
				Keyboard.manager.fireEvent('changed');
			} else if (this.manager) {
				//else we're enabling ourselves, we must ask our parent to do it for us
				this.manager.activate(this);
			}
			return this;
		},

		isActive: function(){
			return this.manager ? this.manager.activeKB == this :  Keyboard.manager == this;
		},

		deactivate: function(instance){
			if (instance) {
				if(instance === this.activeKB) {
					this.activeKB = null;
					instance.fireEvent('deactivate');
					Keyboard.manager.fireEvent('changed');
				}
			} else if (this.manager) {
				this.manager.deactivate(this);
			}
			return this;
		},

		relinquish: function(){
			if (this.isActive() && this.manager && this.manager.previous) this.manager.activate(this.manager.previous);
		},

		//management logic
		manage: function(instance){
			if (instance.manager && instance.manager != Keyboard.manager && this != Keyboard.manager) instance.manager.drop(instance);
			this.instances.push(instance);
			instance.manager = this;
			if (!this.activeKB) this.activate(instance);
		},

		_disable: function(instance){
			if (this.activeKB == instance) this.activeKB = null;
		},

		drop: function(instance){
			this._disable(instance);
			this.instances.erase(instance);
			Keyboard.manager.manage(instance);
			if (this.activeKB == instance && this.previous && this.instances.contains(this.previous)) this.activate(this.previous);
		},

		instances: [],

		trace: function(){
			Keyboard.trace(this);
		},

		each: function(fn){
			Keyboard.each(this, fn);
		}

	});
	
	var parsed = {};
	var modifiers = ['shift', 'control', 'alt', 'meta'];
	var regex = /^(?:shift|control|ctrl|alt|meta)$/;
	
	Keyboard.parse = function(type, eventType, ignore){
		if (ignore && ignore.contains(type.toLowerCase())) return type;
		
		type = type.toLowerCase().replace(/^(keyup|keydown):/, function($0, $1){
			eventType = $1;
			return '';
		});

		if (!parsed[type]){
			var key, mods = {};
			type.split('+').each(function(part){
				if (regex.test(part)) mods[part] = true;
				else key = part;
			});

			mods.control = mods.control || mods.ctrl; // allow both control and ctrl
			
			var keys = [];
			modifiers.each(function(mod){
				if (mods[mod]) keys.push(mod);
			});
			
			if (key) keys.push(key);
			parsed[type] = keys.join('+');
		}

		return eventType + ':' + parsed[type];
	};

	Keyboard.each = function(keyboard, fn){
		var current = keyboard || Keyboard.manager;
		while (current){
			fn.run(current);
			current = current.activeKB;
		}
	};

	Keyboard.stop = function(event){
		event.preventKeyboardPropagation = true;
	};

	Keyboard.manager = new Keyboard({
		active: true
	});
	
	Keyboard.trace = function(keyboard){
		keyboard = keyboard || Keyboard.manager;
		keyboard.enableLog();
		keyboard.log('the following items have focus: ');
		Keyboard.each(keyboard, function(current){
			keyboard.log(document.id(current.widget) || current.wiget || current);
		});
	};
	
	var handler = function(event){
		var keys = [];
		modifiers.each(function(mod){
			if (event[mod]) keys.push(mod);
		});
		
		if (!regex.test(event.key)) keys.push(event.key);
		Keyboard.manager.handle(event, event.type + ':' + keys.join('+'));
	};
	
	document.addEvents({
		'keyup': handler,
		'keydown': handler
	});

	Object.append(Event.Keys, {
		'shift': 16,
		'control': 17,
		'alt': 18,
		'capslock': 20,
		'pageup': 33,
		'pagedown': 34,
		'end': 35,
		'home': 36,
		'numlock': 144,
		'scrolllock': 145,
		';': 186,
		'=': 187,
		',': 188,
		'-': Browser.firefox ? 109 : 189,
		'.': 190,
		'/': 191,
		'`': 192,
		'[': 219,
		'\\': 220,
		']': 221,
		"'": 222
	});

})();


/*
---

script: HtmlTable.Select.js

name: HtmlTable.Select

description: Builds a stripy, sortable table with methods to add rows. Rows can be selected with the mouse or keyboard navigation.

license: MIT-style license

authors:
  - Harald Kirschner
  - Aaron Newton

requires:
  - /Keyboard
  - /HtmlTable
  - /Class.refactor
  - /Element.Delegation

provides: [HtmlTable.Select]

...
*/

HtmlTable = Class.refactor(HtmlTable, {

	options: {
		/*onRowFocus: function(){},
		onRowUnfocus: function(){},*/
		useKeyboard: true,
		classRowSelected: 'table-tr-selected',
		classRowHovered: 'table-tr-hovered',
		classSelectable: 'table-selectable',
		allowMultiSelect: true,
		selectable: false
	},

	initialize: function(){
		this.previous.apply(this, arguments);
		if (this.occluded) return this.occluded;
		this.selectedRows = new Elements();
		this.bound = {
			mouseleave: this.mouseleave.bind(this),
			focusRow: this.focusRow.bind(this)
		};
		if (this.options.selectable) this.enableSelect();
	},

	enableSelect: function(){
		this.selectEnabled = true;
		this.attachSelects();
		this.element.addClass(this.options.classSelectable);
	},

	disableSelect: function(){
		this.selectEnabled = false;
		this.attach(false);
		this.element.removeClass(this.options.classSelectable);
	},

	attachSelects: function(attach){
		attach = attach != null ? attach : true;
		var method = attach ? 'addEvents' : 'removeEvents';
		this.element[method]({
			mouseleave: this.bound.mouseleave
		});
		this.body[method]({
			'click:relay(tr)': this.bound.focusRow,
			'contextmenu:relay(tr)': this.bound.focusRow
		});
		if (this.options.useKeyboard || this.keyboard){
			if (!this.keyboard) this.keyboard = new Keyboard({
				events: {
					down: function(e) {
						e.preventDefault();
						this.shiftFocus(1);
					}.bind(this),
					up: function(e) {
						e.preventDefault();
						this.shiftFocus(-1);
					}.bind(this),
					enter: function(e) {
						e.preventDefault();
						if (this.hover) this.focusRow(this.hover);
					}.bind(this)
				},
				active: true
			});
			this.keyboard[attach ? 'activate' : 'deactivate']();
		}
		this.updateSelects();
	},

	mouseleave: function(){
		if (this.hover) this.leaveRow(this.hover);
	},

	focus: function(){
		if (this.keyboard) this.keyboard.activate();
	},

	blur: function(){
		if (this.keyboard) this.keyboard.deactivate();
	},

	push: function(){
		var ret = this.previous.apply(this, arguments);
		this.updateSelects();
		return ret;
	},

	updateSelects: function(){
		Array.each(this.body.rows, function(row){
			var binders = row.retrieve('binders');
			if ((binders && this.selectEnabled) || (!binders && !this.selectEnabled)) return;
			if (!binders){
				binders = {
					mouseenter: this.enterRow.bind(this, [row]),
					mouseleave: this.leaveRow.bind(this, [row])
				};
				row.store('binders', binders).addEvents(binders);
			} else {
				row.removeEvents(binders);
			}
		}, this);
	},

	enterRow: function(row){
		if (this.hover) this.hover = this.leaveRow(this.hover);
		this.hover = row.addClass(this.options.classRowHovered);
	},

	shiftFocus: function(offset){
		if (!this.hover) return this.enterRow(this.body.rows[0]);
		var to = Array.indexOf(this.body.rows, this.hover) + offset;
		if (to < 0) to = 0;
		if (to >= this.body.rows.length) to = this.body.rows.length - 1;
		if (this.hover == this.body.rows[to]) return this;
		this.enterRow(this.body.rows[to]);
	},

	leaveRow: function(row){
		row.removeClass(this.options.classRowHovered);
	},

	focusRow: function(){
		var row = arguments[1] || arguments[0]; //delegation passes the event first
		if (!this.body.getChildren().contains(row)) return;
		var unfocus = function(row){
			this.selectedRows.erase(row);
			row.removeClass(this.options.classRowSelected);
			this.fireEvent('rowUnfocus', [row, this.selectedRows]);
		}.bind(this);
		if (!this.options.allowMultiSelect) this.selectedRows.each(unfocus);
		if (!this.selectedRows.contains(row)) {
			this.selectedRows.push(row);
			row.addClass(this.options.classRowSelected);
			this.fireEvent('rowFocus', [row, this.selectedRows]);
		} else {
			unfocus(row);
		}
		return false;
	},

	selectAll: function(status){
		status = status != null ? status : true;
		if (!this.options.allowMultiSelect && status) return;
		if (!status) this.selectedRows.removeClass(this.options.classRowSelected).empty();
		else this.selectedRows.combine(this.body.rows).addClass(this.options.classRowSelected);
		return this;
	},

	selectNone: function(){
		return this.selectAll(false);
	}

});


/*
---

script: Keyboard.Extras.js

name: Keyboard.Extras

description: Enhances Keyboard by adding the ability to name and describe keyboard shortcuts, and the ability to grab shortcuts by name and bind the shortcut to different keys.

license: MIT-style license

authors:
  - Perrin Westrich

requires:
  - /Keyboard
  - /MooTools.More

provides: [Keyboard.Extras]

...
*/
Keyboard.prototype.options.nonParsedEvents.combine(['rebound', 'onrebound']);

Keyboard.implement({

	/*
		shortcut should be in the format of:
		{
			'keys': 'shift+s', // the default to add as an event.
			'description': 'blah blah blah', // a brief description of the functionality.
			'handler': function(){} // the event handler to run when keys are pressed.
		}
	*/
	addShortcut: function(name, shortcut) {
		this.shortcuts = this.shortcuts || [];
		this.shortcutIndex = this.shortcutIndex || {};
		
		shortcut.getKeyboard = Function.from(this);
		shortcut.name = name;
		this.shortcutIndex[name] = shortcut;
		this.shortcuts.push(shortcut);
		if(shortcut.keys) this.addEvent(shortcut.keys, shortcut.handler);
		return this;
	},

	addShortcuts: function(obj){
		for(var name in obj) this.addShortcut(name, obj[name]);
		return this;
	},

	removeShortcut: function(name) {
		var shortcut = this.getShortcut(name);
		if (shortcut && shortcut.keys) {
			this.removeEvent(shortcut.keys, shortcut.handler);
			delete this.shortcutIndex[name];
			this.shortcuts.erase(shortcut);
		}
		return this;
	},

	removeShortcuts: function(names) {
		names.each(this.removeShortcut, this);
		return this;
	},

	getShortcuts: function(){
		return this.shortcuts || [];
	},

	getShortcut: function(name){
		return (this.shortcutIndex || {})[name];
	}

});

Keyboard.rebind = function(newKeys, shortcuts){
	Array.from(shortcuts).each(function(shortcut){
		shortcut.getKeyboard().removeEvent(shortcut.keys, shortcut.handler);
		shortcut.getKeyboard().addEvent(newKeys, shortcut.handler);
		shortcut.keys = newKeys;
		shortcut.getKeyboard().fireEvent('rebound');
	});
};


Keyboard.getActiveShortcuts = function(keyboard) {
	var activeKBS = [], activeSCS = [];
	Keyboard.each(keyboard, [].push.bind(activeKBS));
	activeKBS.each(function(kb){ activeSCS.extend(kb.getShortcuts()); });
	return activeSCS;
};

Keyboard.getShortcut = function(name, keyboard, opts){
	opts = opts || {};
	var shortcuts = opts.many ? [] : null,
		set = opts.many ? function(kb){
				var shortcut = kb.getShortcut(name);
				if(shortcut) shortcuts.push(shortcut);
			} : function(kb) { 
				if(!shortcuts) shortcuts = kb.getShortcut(name);
			};
	Keyboard.each(keyboard, set);
	return shortcuts;
};

Keyboard.getShortcuts = function(name, keyboard) {
	return Keyboard.getShortcut(name, keyboard, { many: true });
};


/*
---

script: Scroller.js

name: Scroller

description: Class which scrolls the contents of any Element (including the window) when the mouse reaches the Element's boundaries.

license: MIT-style license

authors:
  - Valerio Proietti

requires:
  - Core/Events
  - Core/Options
  - Core/Element.Event
  - Core/Element.Dimensions

provides: [Scroller]

...
*/

var Scroller = new Class({

	Implements: [Events, Options],

	options: {
		area: 20,
		velocity: 1,
		onChange: function(x, y){
			this.element.scrollTo(x, y);
		},
		fps: 50
	},

	initialize: function(element, options){
		this.setOptions(options);
		this.element = document.id(element);
		this.docBody = document.id(this.element.getDocument().body);
		this.listener = (typeOf(this.element) != 'element') ?  this.docBody : this.element;
		this.timer = null;
		this.bound = {
			attach: this.attach.bind(this),
			detach: this.detach.bind(this),
			getCoords: this.getCoords.bind(this)
		};
	},

	start: function(){
		this.listener.addEvents({
			mouseover: this.bound.attach,
			mouseout: this.bound.detach
		});
		return this;
	},

	stop: function(){
		this.listener.removeEvents({
			mouseover: this.bound.attach,
			mouseout: this.bound.detach
		});
		this.detach();
		this.timer = clearInterval(this.timer);
		return this;
	},

	attach: function(){
		this.listener.addEvent('mousemove', this.bound.getCoords);
	},

	detach: function(){
		this.listener.removeEvent('mousemove', this.bound.getCoords);
		this.timer = clearInterval(this.timer);
	},

	getCoords: function(event){
		this.page = (this.listener.get('tag') == 'body') ? event.client : event.page;
		if (!this.timer) this.timer = this.scroll.periodical(Math.round(1000 / this.options.fps), this);
	},

	scroll: function(){
		var size = this.element.getSize(),
			scroll = this.element.getScroll(),
			pos = this.element != this.docBody ? this.element.getOffsets() : {x: 0, y:0},
			scrollSize = this.element.getScrollSize(),
			change = {x: 0, y: 0},
			top = this.options.area.top || this.options.area,
			bottom = this.options.area.bottom || this.options.area;
		for (var z in this.page){
			if (this.page[z] < (top + pos[z]) && scroll[z] != 0){
				change[z] = (this.page[z] - top - pos[z]) * this.options.velocity;
			} else if (this.page[z] + bottom > (size[z] + pos[z]) && scroll[z] + size[z] != scrollSize[z]){
				change[z] = (this.page[z] - size[z] + bottom - pos[z]) * this.options.velocity;
			}
		}
		if (change.y || change.x) this.fireEvent('change', [scroll.x + change.x, scroll.y + change.y]);
	}

});


/*
---

script: Tips.js

name: Tips

description: Class for creating nice tips that follow the mouse cursor when hovering an element.

license: MIT-style license

authors:
  - Valerio Proietti
  - Christoph Pojer

requires:
  - Core/Options
  - Core/Events
  - Core/Element.Event
  - Core/Element.Style
  - Core/Element.Dimensions
  - /MooTools.More

provides: [Tips]

...
*/

(function(){

var read = function(option, element){
	return (option) ? (typeOf(option) == 'function' ? option(element) : element.get(option)) : '';
};

this.Tips = new Class({

	Implements: [Events, Options],

	options: {/*
		onAttach: function(element){},
		onDetach: function(element){},*/
		onShow: function(){
			this.tip.setStyle('display', 'block');
		},
		onHide: function(){
			this.tip.setStyle('display', 'none');
		},
		title: 'title',
		text: function(element){
			return element.get('rel') || element.get('href');
		},
		showDelay: 100,
		hideDelay: 100,
		className: 'tip-wrap',
		offset: {x: 16, y: 16},
		windowPadding: {x:0, y:0},
		fixed: false
	},

	initialize: function(){
		var params = Array.link(arguments, {
			options: Type.isObject, 
			elements: function(obj){
				return obj != null;
			}
		});
		this.setOptions(params.options);
		if (params.elements) this.attach(params.elements);
		this.container = new Element('div', {'class': 'tip'});
	},

	toElement: function(){
		if (this.tip) return this.tip;

		return this.tip = new Element('div', {
			'class': this.options.className,
			styles: {
				position: 'absolute',
				top: 0,
				left: 0
			}
		}).adopt(
			new Element('div', {'class': 'tip-top'}),
			this.container,
			new Element('div', {'class': 'tip-bottom'})
		).inject(document.body);
	},

	attach: function(elements){
		$$(elements).each(function(element){
			var title = read(this.options.title, element),
				text = read(this.options.text, element);
			
			element.set('title', '').store('tip:native', title).retrieve('tip:title', title);
			element.retrieve('tip:text', text);
			this.fireEvent('attach', [element]);
			
			var events = ['enter', 'leave'];
			if (!this.options.fixed) events.push('move');
			
			events.each(function(value){
				var event = element.retrieve('tip:' + value);
				if (!event) event = function(event){
					this['element' + value.capitalize()].apply(this, [event, element]);
				}.bind(this);
				
				element.store('tip:' + value, event).addEvent('mouse' + value, event);
			}, this);
		}, this);
		
		return this;
	},

	detach: function(elements){
		$$(elements).each(function(element){
			['enter', 'leave', 'move'].each(function(value){
				element.removeEvent('mouse' + value, element.retrieve('tip:' + value)).eliminate('tip:' + value);
			});
			
			this.fireEvent('detach', [element]);
			
			if (this.options.title == 'title'){ // This is necessary to check if we can revert the title
				var original = element.retrieve('tip:native');
				if (original) element.set('title', original);
			}
		}, this);
		
		return this;
	},

	elementEnter: function(event, element){
		this.container.empty();
		
		['title', 'text'].each(function(value){
			var content = element.retrieve('tip:' + value);
			if (content) this.fill(new Element('div', {'class': 'tip-' + value}).inject(this.container), content);
		}, this);
		
		clearTimeout(this.timer);
		this.timer = (function(){
			this.show(element);
			this.position((this.options.fixed) ? {page: element.getPosition()} : event);
		}).delay(this.options.showDelay, this);
	},

	elementLeave: function(event, element){
		clearTimeout(this.timer);
		this.timer = this.hide.delay(this.options.hideDelay, this, element);
		this.fireForParent(event, element);
	},

	fireForParent: function(event, element){
		element = element.getParent();
		if (!element || element == document.body) return;
		if (element.retrieve('tip:enter')) element.fireEvent('mouseenter', event);
		else this.fireForParent(event, element);
	},

	elementMove: function(event, element){
		this.position(event);
	},

	position: function(event){
		if (!this.tip) document.id(this);

		var size = window.getSize(), scroll = window.getScroll(),
			tip = {x: this.tip.offsetWidth, y: this.tip.offsetHeight},
			props = {x: 'left', y: 'top'},
			obj = {};
		
		for (var z in props){
			obj[props[z]] = event.page[z] + this.options.offset[z];
			if ((obj[props[z]] + tip[z] - scroll[z]) > size[z] - this.options.windowPadding[z]) obj[props[z]] = event.page[z] - this.options.offset[z] - tip[z];
		}
		
		this.tip.setStyles(obj);
	},

	fill: function(element, contents){
		if(typeof contents == 'string') element.set('html', contents);
		else element.adopt(contents);
	},

	show: function(element){
		if (!this.tip) document.id(this);
		this.fireEvent('show', [this.tip, element]);
	},

	hide: function(element){
		if (!this.tip) document.id(this);
		this.fireEvent('hide', [this.tip, element]);
	}

});

})();


/*
---

script: Date.Catalan.js

name: Date.Catalan

description: Date messages for Catalan.

license: MIT-style license

authors:
  - Alfons Sanchez

requires:
  - /Lang

provides: [Date.Catalan]

...
*/

MooTools.lang.set('ca-CA', 'Date', {

	months: ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juli', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'],
	days: ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'],
	//culture's date order: MM/DD/YYYY
	dateOrder: ['date', 'month', 'year'],

	shortDate: '%d/%m/%Y',
	shortTime: '%H:%M',

	AM: 'AM',
	PM: 'PM',

	/* Date.Extras */
	ordinal: '',

	lessThanMinuteAgo: 'fa menys d`un minut',
	minuteAgo: 'fa un minut',
	minutesAgo: 'fa {delta} minuts',
	hourAgo: 'fa un hora',
	hoursAgo: 'fa unes {delta} hores',
	dayAgo: 'fa un dia',
	daysAgo: 'fa {delta} dies',
	lessThanMinuteUntil: 'menys d`un minut des d`ara',
	minuteUntil: 'un minut des d`ara',
	minutesUntil: '{delta} minuts des d`ara',
	hourUntil: 'un hora des d`ara',
	hoursUntil: 'unes {delta} hores des d`ara',
	dayUntil: '1 dia des d`ara',
	daysUntil: '{delta} dies des d`ara'

});


/*
---

script: Date.Czech.js

name: Date.Czech

description: Date messages for Czech.

license: MIT-style license

authors:
  - Jan Černý chemiX

requires:
  - /Lang

provides: [Date.Czech]

...
*/

MooTools.lang.set('cs-CZ', 'Date', {

	months: ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'],
	days: ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'],
	//culture's date order: MM/DD/YYYY
	dateOrder: ['date', 'month', 'year'],
	shortDate: '%d/%m/%Y',
	shortTime: '%H:%M',
	AM: 'dop.',
	PM: 'odp.',

	/* Date.Extras */
	ordinal: function(dayOfMonth){
		return '.';
	},

    // TODO : in examples use and fix it
	lessThanMinuteAgo: 'méně než minutou',
	minuteAgo: 'přibližně před minutou',
	minutesAgo: 'před {delta} minutami',
	hourAgo: 'přibližně před hodinou',
	hoursAgo: 'před {delta} hodinami',
	dayAgo: 'před dnem',
	daysAgo: 'před {delta} dni',
	lessThanMinuteUntil: 'před méně než minutou',
	minuteUntil: 'asi před minutou',
	minutesUntil: ' asi před {delta} minutami',
	hourUntil: 'asi před hodinou',
	hoursUntil: 'před {delta} hodinami',
	dayUntil: 'před dnem',
	daysUntil: 'před {delta} dni',
	weekUntil: 'před týdnem',
	weeksUntil: 'před {delta} týdny',
	monthUntil: 'před měsícem',
	monthsUntil: 'před {delta} měsíci',
	yearUntil: 'před rokem',
	yearsUntil: 'před {delta} lety'

});


/*
---

script: Date.Danish.js

name: Date.Danish

description: Date messages for Danish.

license: MIT-style license

authors:
  - Martin Overgaard
  - Henrik Hansen

requires:
  - /Lang

provides: [Date.Danish]

...
*/
 
MooTools.lang.set('da-DK', 'Date', {

	months: ['Januar', 'Februa', 'Marts', 'April', 'Maj', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'December'],
	days: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'],
	//culture's date order: DD/MM/YYYY
	dateOrder: ['date', 'month', 'year'],

	AM: 'AM',
	PM: 'PM',

	shortDate: '%d-%m-%Y',
	shortTime: '%H:%M',

	/* Date.Extras */
	ordinal: function(dayOfMonth){
	  //1st, 2nd, 3rd, etc.
	  return (dayOfMonth > 3 && dayOfMonth < 21) ? 'th' : ['th', 'st', 'nd', 'rd', 'th'][Math.min(dayOfMonth % 10, 4)];
	},

	lessThanMinuteAgo: 'mindre end et minut siden',
	minuteAgo: 'omkring et minut siden',
	minutesAgo: '{delta} minutter siden',
	hourAgo: 'omkring en time siden',
	hoursAgo: 'omkring {delta} timer siden',
	dayAgo: '1 dag siden',
	daysAgo: '{delta} dage siden',
	weekAgo: '1 uge siden',
	weeksAgo: '{delta} uger siden',
	monthAgo: '1 måned siden',
	monthsAgo: '{delta} måneder siden',
	yearthAgo: '1 år siden',
	yearsAgo: '{delta} år siden',
	lessThanMinuteUntil: 'mindre end et minut fra nu',
	minuteUntil: 'omkring et minut fra nu',
	minutesUntil: '{delta} minutter fra nu',
	hourUntil: 'omkring en time fra nu',
	hoursUntil: 'omkring {delta} timer fra nu',
	dayUntil: '1 dag fra nu',
	daysUntil: '{delta} dage fra nu',
	weekUntil: '1 uge fra nu',
	weeksUntil: '{delta} uger fra nu',
	monthUntil: '1 måned fra nu',
	monthsUntil: '{delta} måneder fra nu',
	yearUntil: '1 år fra nu',
	yearsUntil: '{delta} år fra nu'

});


/*
---

script: Date.Dutch.js

name: Date.Dutch

description: Date messages in Dutch.

license: MIT-style license

authors:
  - Lennart Pilon

requires:
  - /Lang

provides: [Date.Dutch]

...
*/

MooTools.lang.set('nl-NL', 'Date', {

	months: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
	days: ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'],
	//culture's date order: DD/MM/YYYY
	dateOrder: ['date', 'month', 'year'],

	AM: 'AM',
	PM: 'PM',

	shortDate: '%d-%m-%Y',
	shortTime: '%H:%M',

	/* Date.Extras */
	ordinal: 'e',

	lessThanMinuteAgo: 'minder dan een minuut geleden',
	minuteAgo: 'ongeveer een minuut geleden',
	minutesAgo: 'minuten geleden',
	hourAgo: 'ongeveer een uur geleden',
	hoursAgo: 'ongeveer {delta} uur geleden',
	dayAgo: '{delta} dag geleden',
	daysAgo: 'dagen geleden',
	weekAgo: 'een week geleden',
	weeksAgo: '{delta} weken geleden',
	monthAgo: 'een maand geleden',
	monthsAgo: '{delta} maanden geleden',
	yearAgo: 'een jaar geleden',
	yearsAgo: '{delta} jaar geleden',
	lessThanMinuteUntil: 'minder dan een minuut vanaf nu',
	minuteUntil: 'ongeveer een minuut vanaf nu',
	minutesUntil: '{delta} minuten vanaf nu',
	hourUntil: 'ongeveer een uur vanaf nu',
	hoursUntil: 'ongeveer {delta} uur vanaf nu',
	dayUntil: '1 dag vanaf nu',
	daysUntil: '{delta} dagen vanaf nu',
	weekAgo: 'een week geleden',
	weeksAgo: '{delta} weken geleden',
	monthAgo: 'een maand geleden',
	monthsAgo: '{delta} maanden geleden',
	yearthAgo: 'een jaar geleden',
	yearsAgo: '{delta} jaar geleden',

	weekUntil: 'over een week',
	weeksUntil: 'over {delta} weken',
	monthUntil: 'over een maand',
	monthsUntil: 'over {delta} maanden',
	yearUntil: 'over een jaar',
	yearsUntil: 'over {delta} jaar' 

});


/*
---

script: Date.English.GB.js

name: Date.English.GB

description: Date messages for British English.

license: MIT-style license

authors:
  - Aaron Newton

requires:
  - /Lang

provides: [Date.English.GB]

...
*/

MooTools.lang.set('en-GB', 'Date', {

	dateOrder: ['date', 'month', 'year'],
	
	shortDate: '%d/%m/%Y',
	shortTime: '%H:%M'

}).set('cascade', ['en-US']);


/*
---

script: Date.Estonian.js

name: Date.Estonian

description: Date messages for Estonian.

license: MIT-style license

authors:
  - Kevin Valdek

requires:
  - /Lang

provides: [Date.Estonian]

...
*/

MooTools.lang.set('et-EE', 'Date', {

	months: ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'],
	days: ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev'],
	//culture's date order: MM.DD.YYYY
	dateOrder: ['month', 'date', 'year'],

	AM: 'AM',
	PM: 'PM',

	shortDate: '%m.%d.%Y',
	shortTime: '%H:%M',

	/* Date.Extras */
	ordinal: '',

	lessThanMinuteAgo: 'vähem kui minut aega tagasi',
	minuteAgo: 'umbes minut aega tagasi',
	minutesAgo: '{delta} minutit tagasi',
	hourAgo: 'umbes tund aega tagasi',
	hoursAgo: 'umbes {delta} tundi tagasi',
	dayAgo: '1 päev tagasi',
	daysAgo: '{delta} päeva tagasi',
	weekAgo: '1 nädal tagasi',
	weeksAgo: '{delta} nädalat tagasi',
	monthAgo: '1 kuu tagasi',
	monthsAgo: '{delta} kuud tagasi',
	yearAgo: '1 aasta tagasi',
	yearsAgo: '{delta} aastat tagasi',
	lessThanMinuteUntil: 'vähem kui minuti aja pärast',
	minuteUntil: 'umbes minuti aja pärast',
	minutesUntil: '{delta} minuti pärast',
	hourUntil: 'umbes tunni aja pärast',
	hoursUntil: 'umbes {delta} tunni pärast',
	dayUntil: '1 päeva pärast',
	daysUntil: '{delta} päeva pärast',
	weekUntil: '1 nädala pärast',
	weeksUntil: '{delta} nädala pärast',
	monthUntil: '1 kuu pärast',
	monthsUntil: '{delta} kuu pärast',
	yearUntil: '1 aasta pärast',
	yearsUntil: '{delta} aasta pärast'

});


/*
---

script: Date.French.js

name: Date.French

description: Date messages in French.

license: MIT-style license

authors:
  - Nicolas Sorosac
  - Antoine Abt

requires:
  - /Lang

provides: [Date.French]

...
*/
 
MooTools.lang.set('fr-FR', 'Date', {

	months: ['Janvier', 'F&eacute;vrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Ao&ucirc;t', 'Septembre', 'Octobre', 'Novembre', 'D&eacute;cembre'],
	days: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
	dateOrder: ['date', 'month', 'year'],

	AM: 'AM',
	PM: 'PM',

	shortDate: '%d/%m/%Y',
	shortTime: '%H:%M',

	/* Date.Extras */
	getOrdinal: function(dayOfMonth){
	  return (dayOfMonth > 1) ? '' : 'er';
	},

	lessThanMinuteAgo: 'il y a moins d\'une minute',
	minuteAgo: 'il y a une minute',
	minutesAgo: 'il y a {delta} minutes',
	hourAgo: 'il y a une heure',
	hoursAgo: 'il y a {delta} heures',
	dayAgo: 'il y a un jour',
	daysAgo: 'il y a {delta} jours',
	weekAgo: 'il y a une semaine',
	weeksAgo: 'il y a {delta} semaines',
	monthAgo: 'il y a 1 mois',
	monthsAgo: 'il y a {delta} mois',
	yearthAgo: 'il y a 1 an',
	yearsAgo: 'il y a {delta} ans',
	lessThanMinuteUntil: 'dans moins d\'une minute',
	minuteUntil: 'dans une minute',
	minutesUntil: 'dans {delta} minutes',
	hourUntil: 'dans une heure',
	hoursUntil: 'dans {delta} heures',
	dayUntil: 'dans un jour',
	daysUntil: 'dans {delta} jours',
	weekUntil: 'dans 1 semaine',
	weeksUntil: 'dans {delta} semaines',
	monthUntil: 'dans 1 mois',
	monthsUntil: 'dans {delta} mois',
	yearUntil: 'dans 1 an',
	yearsUntil: 'dans {delta} ans'

});


/*
---

script: Date.German.js

name: Date.German

description: Date messages for German.

license: MIT-style license

authors:
  - Christoph Pojer
  - Frank Rossi
  - Ulrich Petri
  - Fabian Beiner

requires:
  - /Lang

provides: [Date.German]

...
*/

MooTools.lang.set('de-DE', 'Date', {

	months: ['Januar', 'Februar', 'M&auml;rz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
	days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
	//culture's date order: MM/DD/YYYY
	dateOrder: [ 'date', 'month', 'year', '.'],

	AM: 'vormittags',
	PM: 'nachmittags',

	shortDate: '%d.%m.%Y',
	shortTime: '%H:%M',

	/* Date.Extras */
	ordinal: '.',

	lessThanMinuteAgo: 'Vor weniger als einer Minute',
	minuteAgo: 'Vor einer Minute',
	minutesAgo: 'Vor {delta} Minuten',
	hourAgo: 'Vor einer Stunde',
	hoursAgo: 'Vor {delta} Stunden',
	dayAgo: 'Vor einem Tag',
	daysAgo: 'Vor {delta} Tagen',
	weekAgo: 'Vor einer Woche',
	weeksAgo: 'Vor {delta} Wochen',
	monthAgo: 'Vor einem Monat',
	monthsAgo: 'Vor {delta} Monaten',
	yearAgo: 'Vor einem Jahr',
	yearsAgo: 'Vor {delta} Jahren',
	lessThanMinuteUntil: 'In weniger als einer Minute',
	minuteUntil: 'In einer Minute',
	minutesUntil: 'In {delta} Minuten',
	hourUntil: 'In ca. einer Stunde',
	hoursUntil: 'In ca. {delta} Stunden',
	dayUntil: 'In einem Tag',
	daysUntil: 'In {delta} Tagen',
	weekUntil: 'In einer Woche',
	weeksUntil: 'In {delta} Wochen',
	monthUntil: 'In einem Monat',
	monthsUntil: 'In {delta} Monaten',
	yearUntil: 'In einem Jahr',
	yearsUntil: 'In {delta} Jahren'
});


/*
---

script: Date.German.CH.js

name: Date.German.CH

description: Date messages for German (Switzerland).

license: MIT-style license

authors: 
  - Michael van der Weg

requires:
  - /Lang
  - /Date.German

provides: [Date.German.CH]

...
*/

MooTools.lang.set('de-CH', 'cascade', ['de-DE']);


/*
---

script: Date.Italian.js

name: Date.Italian

description: Date messages for Italian.

license: MIT-style license.

authors:
  - Andrea Novero
  - Valerio Proietti

requires:
  - /Lang

provides: [Date.Italian]

...
*/
 
MooTools.lang.set('it-IT', 'Date', {
 
	months: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
	days: ['Domenica', 'Luned&igrave;', 'Marted&igrave;', 'Mercoled&igrave;', 'Gioved&igrave;', 'Venerd&igrave;', 'Sabato'],
	//culture's date order: DD/MM/YYYY
	dateOrder: ['date', 'month', 'year'],

	AM: 'AM',
	PM: 'PM',

	shortDate: '%d/%m/%Y',
	shortTime: '%H.%M',

	/* Date.Extras */
	ordinal: '&ordm;',

	lessThanMinuteAgo: 'meno di un minuto fa',
	minuteAgo: 'circa un minuto fa',
	minutesAgo: 'circa {delta} minuti fa',
	hourAgo: 'circa un\'ora fa',
	hoursAgo: 'circa {delta} ore fa',
	dayAgo: 'circa 1 giorno fa',
	daysAgo: 'circa {delta} giorni fa',
	lessThanMinuteUntil: 'tra meno di un minuto',
	minuteUntil: 'tra circa un minuto',
	minutesUntil: 'tra circa {delta} minuti',
	hourUntil: 'tra circa un\'ora',
	hoursUntil: 'tra circa {delta} ore',
	dayUntil: 'tra circa un giorno',
	daysUntil: 'tra circa {delta} giorni'

});


/*
---

script: Date.Norwegian.js

name: Date.Norwegian

description: Date messages in Norwegian.

license: MIT-style license

authors:
  - Espen 'Rexxars' Hovlandsdal

requires:
  - /Lang

provides: [Date.Norwegian]

...
*/

MooTools.lang.set('no-NO', 'Date', {

	dateOrder: ['date', 'month', 'year'],

	shortDate: '%d.%m.%Y',
	shortTime: '%H:%M',

	lessThanMinuteAgo: 'kortere enn et minutt siden',
	minuteAgo: 'omtrent et minutt siden',
	minutesAgo: '{delta} minutter siden',
	hourAgo: 'omtrent en time siden',
	hoursAgo: 'omtrent {delta} timer siden',
	dayAgo: '{delta} dag siden',
	daysAgo: '{delta} dager siden'

});


/*
---

script: Date.Persian.js

name: Date.Persian

description: Date messages for Persian.

license: MIT-style license

authors:
  - Amir Hossein Hodjaty Pour

requires:
  - /Lang

provides: [Date.Persian]

...
*/

MooTools.lang.set('fa', 'Date', {

	months: ['ژانویه', 'فوریه', 'مارس', 'آپریل', 'مه', 'ژوئن', 'ژوئیه', 'آگوست', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'],
	days: ['یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
	//culture's date order: MM/DD/YYYY
	dateOrder: ['ماه', 'روز', 'سال'],
	shortDate: '%m/%d/%Y',
	shortTime: '%I:%M%p',
	AM: 'ق.ظ',
	PM: 'ب.ظ',

	/* Date.Extras */
	ordinal: function(dayOfMonth){
		//1st, 2nd, 3rd, etc.
		return 'ام';
	},

	lessThanMinuteAgo: 'کمتر از یک دقیقه پیش',
	minuteAgo: 'حدود یک دقیقه پیش',
	minutesAgo: '{delta} دقیقه پیش',
	hourAgo: 'حدود یک ساعت پیش',
	hoursAgo: 'حدود {delta} ساعت پیش',
	dayAgo: '1 روز پیش',
	daysAgo: '{delta} روز پیش',
	weekAgo: '1 هفته پیش',
	weeksAgo: '{delta} هفته پیش',
	monthAgo: '1 ماه پیش',
	monthsAgo: '{delta} ماه پیش',
	yearAgo: '1 سال پیش',
	yearsAgo: '{delta} سال پیش',
	lessThanMinuteUntil: 'کمتر از یک دقیقه از حالا',
	minuteUntil: 'حدود یک دقیقه از حالا',
	minutesUntil: '{delta} دقیقه از حالا',
	hourUntil: 'حدود یک ساعت از حالا',
	hoursUntil: 'حدود {delta} ساعت از حالا',
	dayUntil: '1 روز از حالا',
	daysUntil: '{delta} روز از حالا',
	weekUntil: '1 هفته از حالا',
	weeksUntil: '{delta} هفته از حالا',
	monthUntil: '1 ماه از حالا',
	monthsUntil: '{delta} ماه از حالا',
	yearUntil: '1 سال از حالا',
	yearsUntil: '{delta} سال از حالا'

});


/*
---

script: Date.Polish.js

name: Date.Polish

description: Date messages for Polish.

license: MIT-style license

authors:
  - Oskar Krawczyk

requires:
  - /Lang

provides: [Date.Polish]

...
*/

MooTools.lang.set('pl-PL', 'Date', {
	months: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
	days: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
	dateOrder: ['year', 'month', 'date'],
	AM: 'nad ranem',
	PM: 'po południu',

	shortDate: '%Y-%m-%d',
	shortTime: '%H:%M',

	/* Date.Extras */
	ordinal: function(dayOfMonth){
		return (dayOfMonth > 3 && dayOfMonth < 21) ? 'ty' : ['ty', 'szy', 'gi', 'ci', 'ty'][Math.min(dayOfMonth % 10, 4)];
	},

	lessThanMinuteAgo: 'mniej niż minute temu',
	minuteAgo: 'około minutę temu',
	minutesAgo: '{delta} minut temu',
	hourAgo: 'około godzinę temu',
	hoursAgo: 'około {delta} godzin temu',
	dayAgo: 'Wczoraj',
	daysAgo: '{delta} dni temu',
	lessThanMinuteUntil: 'za niecałą minutę',
	minuteUntil: 'za około minutę',
	minutesUntil: 'za {delta} minut',
	hourUntil: 'za około godzinę',
	hoursUntil: 'za około {delta} godzin',
	dayUntil: 'za 1 dzień',
	daysUntil: 'za {delta} dni'
});


/*
---

script: Date.Portuguese.BR.js

name: Date.Portuguese.BR

description: Date messages in Portuguese-BR (Brazil).

license: MIT-style license

authors:
  - Fabio Miranda Costa

requires:
  - /Lang

provides: [Date.Portuguese.BR]

...
*/

MooTools.lang.set('pt-BR', 'Date', {

	months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
	days: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
	//culture's date order: DD/MM/YYYY
	dateOrder: ['date', 'month', 'year'],
	shortDate: '%d/%m/%Y',
	shortTime: '%H:%M',

	/* Date.Extras */
	ordinal: function(dayOfMonth){
		//1º, 2º, 3º, etc.
    	return '&ordm;';
	},

	lessThanMinuteAgo: 'há menos de um minuto',
	minuteAgo: 'há cerca de um minuto',
	minutesAgo: 'há {delta} minutos',
	hourAgo: 'há cerca de uma hora',
	hoursAgo: 'há cerca de {delta} horas',
	dayAgo: 'há um dia',
	daysAgo: 'há {delta} dias',
    weekAgo: 'há uma semana',
	weeksAgo: 'há {delta} semanas',
	monthAgo: 'há um mês',
	monthsAgo: 'há {delta} meses',
	yearAgo: 'há um ano',
	yearsAgo: 'há {delta} anos',
	lessThanMinuteUntil: 'em menos de um minuto',
	minuteUntil: 'em um minuto',
	minutesUntil: 'em {delta} minutos',
	hourUntil: 'em uma hora',
	hoursUntil: 'em {delta} horas',
	dayUntil: 'em um dia',
	daysUntil: 'em {delta} dias',
	weekUntil: 'em uma semana',
	weeksUntil: 'em {delta} semanas',
	monthUntil: 'em um mês',
	monthsUntil: 'em {delta} meses',
	yearUntil: 'em um ano',
	yearsUntil: 'em {delta} anos'

});


/*
---

script: Date.Russian.js

name: Date.Russian

description: Date messages in Russian.

license: MIT-style license

authors:
  - Evstigneev Pavel

requires:
  - /Lang

provides: [Date.Russian]

...
*/


MooTools.lang.set('ru-RU-unicode', 'Date', {

	months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
	days: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
	//culture's date order: MM/DD/YYYY
	dateOrder: ['date', 'month', 'year'],
	AM: 'AM',
	PM: 'PM',

	shortDate: '%d.%m.%Y',
	shortTime: '%H:%M',


  /*
   *  Russian language pluralization rules, taken from CLDR project, http://unicode.org/cldr/
   *
   *  one -> n mod 10 is 1 and n mod 100 is not 11;
   *  few -> n mod 10 in 2..4 and n mod 100 not in 12..14;
   *  many -> n mod 10 is 0 or n mod 10 in 5..9 or n mod 100 in 11..14;
   *  other -> everything else (example 3.14)
   */

  pluralize: function (n, one, few, many, other) {
    var modulo10 = n % 10
    var modulo100 = n % 100

    if (modulo10 == 1 && modulo100 != 11) {
      return one;
    } else if ((modulo10 == 2 || modulo10 == 3 || modulo10 == 4) && !(modulo100 == 12 || modulo100 == 13 || modulo100 == 14)) {
      return few;
    } else if (modulo10 == 0 || (modulo10 == 5 || modulo10 == 6 || modulo10 == 7 || modulo10 == 8 || modulo10 == 9) || (modulo100 == 11 || modulo100 == 12 || modulo100 == 13 || modulo100 == 14)) {
      return many;
    } else {
      return other;
    }
  },

	/* Date.Extras */
	ordinal: '',
	lessThanMinuteAgo: 'меньше минуты назад',
	minuteAgo: 'минута назад',
	minutesAgo: function (delta) { return  '{delta} ' + this.pluralize(delta, 'минута', 'минуты', 'минут') + ' назад'},
	hourAgo: 'час назад',
	hoursAgo: function (delta) { return  '{delta} ' + this.pluralize(delta, 'час', 'часа', 'часов') + ' назад'},
	dayAgo: 'вчера',
	daysAgo: function (delta) { return '{delta} ' + this.pluralize(delta, 'день', 'дня', 'дней') + ' назад' },
	lessThanMinuteUntil: 'меньше минуты назад',
	minuteUntil: 'через минуту',
	minutesUntil: function (delta) { return  'через {delta} ' + this.pluralize(delta, 'час', 'часа', 'часов') + ''},
	hourUntil: 'через час',
	hoursUntil: function (delta) { return  'через {delta} ' + this.pluralize(delta, 'час', 'часа', 'часов') + ''},
	dayUntil: 'завтра',
	daysUntil: function (delta) { return 'через {delta} ' + this.pluralize(delta, 'день', 'дня', 'дней') + '' }

});


/*
---

script: Date.Spanish.US.js

name: Date.Spanish.US

description: Date messages for Spanish.

license: MIT-style license

authors:
  - Ãlfons Sanchez

requires:
  - /Lang

provides: [Date.Spanish]

...
*/

MooTools.lang.set('es-ES', 'Date', {

	months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
	days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
	//culture's date order: MM/DD/YYYY
	dateOrder: ['date', 'month', 'year'],
	AM: 'AM',
	PM: 'PM',

	shortDate: '%d/%m/%Y',
	shortTime: '%H:%M',

	/* Date.Extras */
	ordinal: '',

	lessThanMinuteAgo: 'hace menos de un minuto',
	minuteAgo: 'hace un minuto',
	minutesAgo: 'hace {delta} minutos',
	hourAgo: 'hace una hora',
	hoursAgo: 'hace unas {delta} horas',
	dayAgo: 'hace un día',
	daysAgo: 'hace {delta} días',
	weekAgo: 'hace una semana',
	weeksAgo: 'hace unas {delta} semanas',
	monthAgo: 'hace un mes',
	monthsAgo: 'hace {delta} meses',
	yearAgo: 'hace un año',
	yearsAgo: 'hace {delta} años',
	lessThanMinuteUntil: 'menos de un minuto desde ahora',
	minuteUntil: 'un minuto desde ahora',
	minutesUntil: '{delta} minutos desde ahora',
	hourUntil: 'una hora desde ahora',
	hoursUntil: 'unas {delta} horas desde ahora',
	dayUntil: 'un día desde ahora',
	daysUntil: '{delta} días desde ahora',
	weekUntil: 'una semana desde ahora',
	weeksUntil: 'unas {delta} semanas desde ahora',
	monthUntil: 'un mes desde ahora',
	monthsUntil: '{delta} meses desde ahora',
	yearUntil: 'un año desde ahora',
	yearsUntil: '{delta} años desde ahora'

});


/*
---

script: Date.Swedish.js

name: Date.Swedish

description: Date messages for Swedish (SE).

license: MIT-style license

authors:
  - Martin Lundgren

requires:
  - /Lang

provides: [Date.Swedish]

...
*/

MooTools.lang.set('sv-SE', 'Date', {

	months: ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'],
	days: ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'],
	// culture's date order: YYYY-MM-DD
	dateOrder: ['year', 'month', 'date'],
	AM: '',
	PM: '',

	shortDate: '%Y-%m-%d',
	shortTime: '%H:%M',

	/* Date.Extras */
	ordinal: function(dayOfMonth){
		// Not used in Swedish
		return '';
	},

	lessThanMinuteAgo: 'mindre än en minut sedan',
	minuteAgo: 'ungefär en minut sedan',
	minutesAgo: '{delta} minuter sedan',
	hourAgo: 'ungefär en timme sedan',
	hoursAgo: 'ungefär {delta} timmar sedan',
	dayAgo: '1 dag sedan',
	daysAgo: '{delta} dagar sedan',
	lessThanMinuteUntil: 'mindre än en minut sedan',
	minuteUntil: 'ungefär en minut sedan',
	minutesUntil: '{delta} minuter sedan',
	hourUntil: 'ungefär en timme sedan',
	hoursUntil: 'ungefär {delta} timmar sedan',
	dayUntil: '1 dag sedan',
	daysUntil: '{delta} dagar sedan'

});


/*
---

script: Date.Ukrainian.js

name: Date.Ukrainian

description: Date messages for Ukrainian.

license: MIT-style license

authors:
  - Slik

requires:
  - /Lang

provides: [Date.Ukrainian]

...
*/

(function(){
	var pluralize = function(n, one, few, many, other){
		var d = (n / 10).toInt();
		var z = n % 10;
		var s = (n / 100).toInt();

		if(d == 1 && n > 10) return many;
		if(z == 1) return one;
		if(z > 0 && z < 5) return few;
		return many;
	};

	MooTools.lang.set('uk-UA', 'Date', {
			months: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'],
			days: ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'],
			//culture's date order: DD/MM/YYYY
			dateOrder: ['date', 'month', 'year'],
			AM: 'до полудня',
			PM: 'по полудню',

			shortDate: '%d/%m/%Y',
			shortTime: '%H:%M',

			/* Date.Extras */
			ordinal: '',
			lessThanMinuteAgo: 'меньше хвилини тому',
			minuteAgo: 'хвилину тому',
			minutesAgo: function (delta){
				return '{delta} ' + pluralize(delta, 'хвилину', 'хвилини', 'хвилин') + ' тому';
			},
			hourAgo: 'годину тому',
			hoursAgo: function (delta){
				return '{delta} ' + pluralize(delta, 'годину', 'години', 'годин') + ' тому';
			},
			dayAgo: 'вчора',
			daysAgo: function (delta){
				return '{delta} ' + pluralize(delta, 'день', 'дня', 'днів') + ' тому';
			},
			weekAgo: 'тиждень тому',
			weeksAgo: function (delta){
				return '{delta} ' + pluralize(delta, 'тиждень', 'тижні', 'тижнів') + ' тому';
			},
			monthAgo: 'місяць тому',
			monthsAgo: function (delta){
				return '{delta} ' + pluralize(delta, 'місяць', 'місяці', 'місяців') + ' тому';
			},
			yearAgo: 'рік тому',
			yearsAgo: function (delta){
				return '{delta} ' + pluralize(delta, 'рік', 'роки', 'років') + ' тому';
			},
			lessThanMinuteUntil: 'за мить',
			minuteUntil: 'через хвилину',
			minutesUntil: function (delta){
				return 'через {delta} ' + pluralize(delta, 'хвилину', 'хвилини', 'хвилин');
			},
			hourUntil: 'через годину',
			hoursUntil: function (delta){
				return 'через {delta} ' + pluralize(delta, 'годину', 'години', 'годин');
			},
			dayUntil: 'завтра',
			daysUntil: function (delta){
				return 'через {delta} ' + pluralize(delta, 'день', 'дня', 'днів');
			},
			weekUntil: 'через тиждень',
			weeksUntil: function (delta){
				return 'через {delta} ' + pluralize(delta, 'тиждень', 'тижні', 'тижнів');
			},
			monthUntil: 'через місяць',
			monthesUntil: function (delta){
				return 'через {delta} ' + pluralize(delta, 'місяць', 'місяці', 'місяців');
			},
			yearUntil: 'через рік',
			yearsUntil: function (delta){
				return 'через {delta} ' + pluralize(delta, 'рік', 'роки', 'років');
			}
	});

})();


/*
---

script: Form.Validator.Arabic.js

name: Form.Validator.Arabic

description: Form.Validator messages in Arabic.

license: MIT-style license

authors:
  - Chafik Barbar

requires:
  - /Lang

provides: [Form.Validator.Arabic]

...
*/

MooTools.lang.set('ar', 'Form.Validator', {
	required:'هذا الحقل مطلوب.',
	minLength:'رجاءً إدخال {minLength}  أحرف على الأقل (تم إدخال {length} أحرف).',
	maxLength:'الرجاء عدم إدخال أكثر من {maxLength} أحرف (تم إدخال {length} أحرف).',
	integer:'الرجاء إدخال عدد صحيح في هذا الحقل. أي رقم ذو كسر عشري أو مئوي (مثال 1.25 ) غير مسموح.',
	numeric:'الرجاء إدخال قيم رقمية في هذا الحقل (مثال "1" أو "1.1" أو "-1" أو "-1.1").',
	digits:'الرجاء أستخدام قيم رقمية وعلامات ترقيمية فقط في هذا الحقل (مثال, رقم هاتف مع نقطة أو شحطة)',
	alpha:'الرجاء أستخدام أحرف فقط (ا-ي) في هذا الحقل. أي فراغات أو علامات غير مسموحة.',
	alphanum:'الرجاء أستخدام أحرف فقط (ا-ي) أو أرقام (0-9) فقط في هذا الحقل. أي فراغات أو علامات غير مسموحة.',
	dateSuchAs:'الرجاء إدخال تاريخ صحيح كالتالي {date}',
	dateInFormatMDY:'الرجاء إدخال تاريخ صحيح (مثال, 31-12-1999)',
	email:'الرجاء إدخال بريد إلكتروني صحيح.',
	url:'الرجاء إدخال عنوان إلكتروني صحيح مثل http://www.google.com',
	currencyDollar:'الرجاء إدخال قيمة $ صحيحة.  مثال, 100.00$',
	oneRequired:'الرجاء إدخال قيمة في أحد هذه الحقول على الأقل.',
	errorPrefix: 'خطأ: ',
	warningPrefix: 'تحذير: '
}).set('ar', 'Date', {
	dateOrder: ['date', 'month', 'year', '/']
});


/*
---

script: Form.Validator.Catalan.js

name: Form.Validator.Catalan

description: Date messages for Catalan.

license: MIT-style license

authors:
  - Miquel Hudin
  - Alfons Sanchez

requires:
  - /Lang

provides: [Form.Validator.Catalan]

...
*/

MooTools.lang.set('ca-CA', 'Form.Validator', {

	required:'Aquest camp es obligatori.',
	minLength:'Per favor introdueix al menys {minLength} caracters (has introduit {length} caracters).',
	maxLength:'Per favor introdueix no mes de {maxLength} caracters (has introduit {length} caracters).',
	integer:'Per favor introdueix un nombre enter en aquest camp. Nombres amb decimals (p.e. 1,25) no estan permesos.',
	numeric:'Per favor introdueix sols valors numerics en aquest camp (p.e. "1" o "1,1" o "-1" o "-1,1").',
	digits:'Per favor usa sols numeros i puntuacio en aquest camp (per exemple, un nombre de telefon amb guions i punts no esta permes).',
	alpha:'Per favor utilitza lletres nomes (a-z) en aquest camp. No s´admiteixen espais ni altres caracters.',
	alphanum:'Per favor, utilitza nomes lletres (a-z) o numeros (0-9) en aquest camp. No s´admiteixen espais ni altres caracters.',
	dateSuchAs:'Per favor introdueix una data valida com {date}',
	dateInFormatMDY:'Per favor introdueix una data valida com DD/MM/YYYY (p.e. "31/12/1999")',
	email:'Per favor, introdueix una adreça de correu electronic valida. Per exemple,  "fred@domain.com".',
	url:'Per favor introdueix una URL valida com http://www.google.com.',
	currencyDollar:'Per favor introdueix una quantitat valida de €. Per exemple €100,00 .',
	oneRequired:'Per favor introdueix alguna cosa per al menys una d´aquestes entrades.',
	errorPrefix: 'Error: ',
	warningPrefix: 'Avis: ',

	//Form.Validator.Extras

	noSpace: 'No poden haver espais en aquesta entrada.',
	reqChkByNode: 'No hi han elements seleccionats.',
	requiredChk: 'Aquest camp es obligatori.',
	reqChkByName: 'Per favor selecciona una {label}.',
	match: 'Aquest camp necessita coincidir amb el camp {matchName}',
	startDate: 'la data de inici',
	endDate: 'la data de fi',
	currendDate: 'la data actual',
	afterDate: 'La data deu ser igual o posterior a {label}.',
	beforeDate: 'La data deu ser igual o anterior a {label}.',
	startMonth: 'Per favor selecciona un mes d´orige',
	sameMonth: 'Aquestes dos dates deuen estar dins del mateix mes - deus canviar una o altra.'

});


﻿/*
---

script: Form.Validator.Chinese.js

description: Form.Validator messages in chinese (both simplified and traditional).

license: MIT-style license

authors:
- YMind Chan

requires:
- /Lang
- /Form.Validator

provides: [Form.Validator.Chinese]

...
*/

// Simplified Chinese
MooTools.lang.set('zh-CHS', 'Form.Validator', {
	required:'此项必填。',
	minLength:'请至少输入 {minLength} 个字符 (已输入 {length} 个)。',
	maxLength:'最多只能输入 {maxLength} 个字符 (已输入 {length} 个)。',
	integer:'请输入一个整数，不能包含小数点。例如："1", "200"。',
	numeric:'请输入一个数字，例如："1", "1.1", "-1", "-1.1"。',
	digits:'请输入由数字和标点符号组成的内容。例如电话号码。',
	alpha:'请输入 A-Z 的 26 个字母，不能包含空格或任何其他字符。',
	alphanum:'请输入 A-Z 的 26 个字母或 0-9 的 10 个数字，不能包含空格或任何其他字符。',
	dateSuchAs:'请输入合法的日期格式，如：{date}。',
	dateInFormatMDY:'请输入合法的日期格式，例如：YYYY-MM-DD ("2010-12-31")。',
	email:'请输入合法的电子信箱地址，例如："fred@domain.com"。',
	url:'请输入合法的 Url 地址，例如：http://www.google.com。',
	currencyDollar:'请输入合法的货币符号，例如：￥100.0',
	oneRequired:'请至少选择一项。',
	errorPrefix: '错误：',
	warningPrefix: '警告：',

	//Form.Validator.Extras

	noSpace: '不能包含空格。',
	reqChkByNode: '未选择任何内容。',
	requiredChk: '此项必填。',
	reqChkByName: '请选择 {label}.',
	match: '必须与{matchName}相匹配',
	startDate: '起始日期',
	endDate: '结束日期',
	currendDate: '当前日期',
	afterDate: '日期必须等于或晚于 {label}.',
	beforeDate: '日期必须早于或等于 {label}.',
	startMonth: '请选择起始月份',
	sameMonth: '您必须修改两个日期中的一个，以确保它们在同一月份。',
	creditcard: '您输入的信用卡号码不正确。当前已输入{length}个字符。'
});

// Traditional Chinese
MooTools.lang.set('zh-CHT', 'Form.Validator', {
	required:'此項必填。 ', 
	minLength:'請至少輸入{minLength} 個字符(已輸入{length} 個)。 ', 
	maxLength:'最多只能輸入{maxLength} 個字符(已輸入{length} 個)。 ', 
	integer:'請輸入一個整數，不能包含小數點。例如："1", "200"。 ', 
	numeric:'請輸入一個數字，例如："1", "1.1", "-1", "-1.1"。 ', 
	digits:'請輸入由數字和標點符號組成的內容。例如電話號碼。 ', 
	alpha:'請輸入AZ 的26 個字母，不能包含空格或任何其他字符。 ', 
	alphanum:'請輸入AZ 的26 個字母或0-9 的10 個數字，不能包含空格或任何其他字符。 ', 
	dateSuchAs:'請輸入合法的日期格式，如：{date}。 ', 
	dateInFormatMDY:'請輸入合法的日期格式，例如：YYYY-MM-DD ("2010-12-31")。 ', 
	email:'請輸入合法的電子信箱地址，例如："fred@domain.com"。 ', 
	url:'請輸入合法的Url 地址，例如：http://www.google.com。 ', 
	currencyDollar:'請輸入合法的貨幣符號，例如：￥100.0', 
	oneRequired:'請至少選擇一項。 ', 
	errorPrefix: '錯誤：', 
	warningPrefix: '警告：', 

	//Form.Validator.Extras 

	noSpace: '不能包含空格。 ', 
	reqChkByNode: '未選擇任何內容。 ', 
	requiredChk: '此項必填。 ', 
	reqChkByName: '請選擇 {label}.', 
	match: '必須與{matchName}相匹配', 
	startDate: '起始日期', 
	endDate: '結束日期', 
	currendDate: '當前日期', 
	afterDate: '日期必須等於或晚於{label}.', 
	beforeDate: '日期必須早於或等於{label}.', 
	startMonth: '請選擇起始月份', 
	sameMonth: '您必須修改兩個日期中的一個，以確保它們在同一月份。 ', 
	creditcard: '您輸入的信用卡號碼不正確。當前已輸入{length}個字符。 '
});

Form.Validator.add('validate-currency-yuan', {
	errorMsg: function(){
		return Form.Validator.getMsg('currencyYuan');
	},
	test: function(element) {
		// [￥]1[##][,###]+[.##]
		// [￥]1###+[.##]
		// [￥]0.##
		// [￥].##
		return Form.Validator.getValidator('IsEmpty').test(element) ||  (/^￥?\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/).test(element.get('value'));
	}
});


/*
---

script: Form.Validator.Czech.js

name: Form.Validator.Czech

description: Form Validator messages for Czech.

license: MIT-style license

authors:
  - Jan Černý chemiX

requires:
  - /Lang

provides: [Form.Validator.Czech]

...
*/

MooTools.lang.set('cs-CZ', 'Form.Validator', {

	required:'Tato položka je povinná.',
	minLength:'Zadejte prosím alespoň {minLength} znaků (napsáno {length} znaků).',
	maxLength:'Zadejte prosím méně než {maxLength} znaků (nápsáno {length} znaků).',
	integer:'Zadejte prosím celé číslo. Desetinná čísla (např. 1.25) nejsou povolena.',
	numeric:'Zadejte jen číselné hodnoty  (tj. "1" nebo "1.1" nebo "-1" nebo "-1.1").',
	digits:'Zadejte prosím pouze čísla a interpunkční znaménka(například telefonní číslo s pomlčkami nebo tečkami je povoleno).',
	alpha:'Zadejte prosím pouze písmena (a-z). Mezery nebo jiné znaky nejsou povoleny.',
	alphanum:'Zadejte prosím pouze písmena (a-z) nebo číslice (0-9). Mezery nebo jiné znaky nejsou povoleny.',
	dateSuchAs:'Zadejte prosím platné datum jako {date}',
	dateInFormatMDY:'Zadejte prosím platné datum jako MM / DD / RRRR (tj. "12/31/1999")',
	email:'Zadejte prosím platnou e-mailovou adresu. Například "fred@domain.com".',
	url:'Zadejte prosím platnou URL adresu jako http://www.google.com.',
	currencyDollar:'Zadejte prosím platnou částku. Například $100.00.',
	oneRequired:'Zadejte prosím alespoň jednu hodnotu pro tyto položky.',
	errorPrefix: 'Chyba: ',
	warningPrefix: 'Upozornění: ',

	//Form.Validator.Extras

	noSpace: 'V této položce nejsou povoleny mezery',
	reqChkByNode: 'Nejsou vybrány žádné položky.',
	requiredChk: 'Tato položka je vyžadována.',
	reqChkByName: 'Prosím vyberte {label}.',
	match: 'Tato položka se musí shodovat s položkou {matchName}',
	startDate: 'datum zahájení',
	endDate: 'datum ukončení',
	currendDate: 'aktuální datum',
	afterDate: 'Datum by mělo být stejné nebo větší než {label}.',
	beforeDate: 'Datum by mělo být stejné nebo menší než {label}.',
	startMonth: 'Vyberte počáteční měsíc.',
	sameMonth: 'Tyto dva datumy musí být ve stejném měsíci - změňte jeden z nich.',
    creditcard: 'Zadané číslo kreditní karty je neplatné. Prosím opravte ho. Bylo zadáno {length} čísel.'

});


/*
---

script: Form.Validator.Danish.js

name: Form.Validator.Danish

description: Form.Validator messages for Danish.

license: MIT-style license

authors:
  - Martin Overgaard

requires:
  - /Lang

provides: [Form.Validator.Danish]

...
*/

MooTools.lang.set('da-DK', 'Form.Validator', {

	required:'Feltet skal udfyldes.',
	minLength:'Skriv mindst {minLength} tegn (du skrev {length} tegn).',
	maxLength:'Skriv maksimalt {maxLength} tegn (du skrev {length} tegn).',
	integer:'Skriv et tal i dette felt. Decimal tal (f.eks. 1.25) er ikke tilladt.',
	numeric:'Skriv kun tal i dette felt (i.e. "1" eller "1.1" eller "-1" eller "-1.1").',
	digits:'Skriv kun tal og tegnsætning i dette felt (eksempel, et telefon nummer med bindestreg eller punktum er tilladt).',
	alpha:'Skriv kun bogstaver (a-z) i dette felt. Mellemrum og andre tegn er ikke tilladt.',
	alphanum:'Skriv kun bogstaver (a-z) eller tal (0-9) i dette felt. Mellemrum og andre tegn er ikke tilladt.',
	dateSuchAs:'Skriv en gyldig dato som {date}',
	dateInFormatMDY:'Skriv dato i formatet DD-MM-YYYY (f.eks. "31-12-1999")',
	email:'Skriv en gyldig e-mail adresse. F.eks "fred@domain.com".',
	url:'Skriv en gyldig URL adresse. F.eks "http://www.google.com".',
	currencyDollar:'Skriv et gldigt beløb. F.eks Kr.100.00 .',
	oneRequired:'Et eller flere af felterne i denne formular skal udfyldes.',
	errorPrefix: 'Fejl: ',
	warningPrefix: 'Advarsel: ',

	//Form.Validator.Extras

	noSpace: 'Der må ikke benyttes mellemrum i dette felt.',
	reqChkByNode: 'Foretag et valg.',
	requiredChk: 'Dette felt skal udfyldes.',
	reqChkByName: 'Vælg en {label}.',
	match: 'Dette felt skal matche {matchName} feltet',
	startDate: 'start dato',
	endDate: 'slut dato',
	currendDate: 'dags dato',
	afterDate: 'Datoen skal være større end eller lig med {label}.',
	beforeDate: 'Datoen skal være mindre end eller lig med {label}.',
	startMonth: 'Vælg en start måned',
	sameMonth: 'De valgte datoer skal være i samme måned - skift en af dem.'

});


/*
---

script: Form.Validator.Dutch.js

name: Form.Validator.Dutch

description: Form.Validator messages in Dutch.

license: MIT-style license

authors:
- Lennart Pilon
- Arian Stolwijk

requires:
  - /Lang

provides: [Form.Validator.Dutch]

...
*/

MooTools.lang.set('nl-NL', 'Form.Validator', {
	required: 'Dit veld is verplicht.',
	minLength: 'Vul minimaal {minLength} karakters in (je hebt {length} karakters ingevoerd).',
	maxLength: 'Vul niet meer dan {maxLength} karakters in (je hebt {length} karakters ingevoerd).',
	integer: 'Vul een getal in. Getallen met decimalen (bijvoorbeeld 1,25) zijn niet toegestaan.',
	numeric: 'Vul alleen numerieke waarden in (bijvoorbeeld. "1" of "1.1" of "-1" of "-1.1").',
	digits: 'Vul alleen nummers en leestekens in (bijvoorbeeld een telefoonnummer met een streepje).',
	alpha: 'Vul alleen letters in (a-z). Spaties en andere karakters zijn niet toegestaan.',
	alphanum: 'Vul alleen letters in (a-z) of nummers (0-9). Spaties en andere karakters zijn niet toegestaan.',
	dateSuchAs: 'Vul een geldige datum in, zoals {date}',
	dateInFormatMDY: 'Vul een geldige datum, in het formaat MM/DD/YYYY (bijvoorbeeld "12/31/1999")',
	email: 'Vul een geldig e-mailadres in. Bijvoorbeeld "fred@domein.nl".',
	url: 'Vul een geldige URL in, zoals http://www.google.nl.',
	currencyDollar: 'Vul een geldig $ bedrag in. Bijvoorbeeld $100.00 .',
	oneRequired: 'Vul iets in bij minimaal een van de invoervelden.',
	warningPrefix: 'Waarschuwing: ',
	errorPrefix: 'Fout: ',

	//Form.Validator.Extras

	noSpace: 'Er is geen spatie toegestaan in dit veld.',
	reqChkByNode: 'Er zijn geen items geselecteerd.',
	requiredChk: 'Dit veld is verplicht.',
	reqChkByName: 'Selecteer een  {label}.',
	match: 'Dit veld moet overeen komen met het {matchName} veld',
	startDate: 'de begin datum',
	endDate: 'de eind datum',
	currendDate: 'de huidige datum',
	afterDate: 'De datum moet hetzelfde zijn of na {label}.',
	beforeDate: 'De datum moet hetzelfde zijn of voor {label}.',
	startMonth: 'Selecteer een begin maand',
	sameMonth: 'Deze twee datums moeten in dezelfde maand zijn - u moet een van beide aanpassen.',
	creditcard: 'Het ingevulde credit kaart nummer is niet geldig. Controleer het nummer en probeer opnieuw. {length} getallen ingevuld.'

});


/*
---

script: Form.Validator.Estonian.js

name: Form.Validator.Estonian

description: Date messages for Estonian.

license: MIT-style license

authors:
  - Kevin Valdek

requires:
  - /Lang

provides: [Form.Validator.Estonian]

...
*/

MooTools.lang.set('et-EE', 'Form.Validator', {

	required:'Väli peab olema täidetud.',
	minLength:'Palun sisestage vähemalt {minLength} tähte (te sisestasite {length} tähte).',
	maxLength:'Palun ärge sisestage rohkem kui {maxLength} tähte (te sisestasite {length} tähte).',
	integer:'Palun sisestage väljale täisarv. Kümnendarvud (näiteks 1.25) ei ole lubatud.',
	numeric:'Palun sisestage ainult numbreid väljale (näiteks "1", "1.1", "-1" või "-1.1").',
	digits:'Palun kasutage ainult numbreid ja kirjavahemärke (telefoninumbri sisestamisel on lubatud kasutada kriipse ja punkte).',
	alpha:'Palun kasutage ainult tähti (a-z). Tühikud ja teised sümbolid on keelatud.',
	alphanum:'Palun kasutage ainult tähti (a-z) või numbreid (0-9). Tühikud ja teised sümbolid on keelatud.',
	dateSuchAs:'Palun sisestage kehtiv kuupäev kujul {date}',
	dateInFormatMDY:'Palun sisestage kehtiv kuupäev kujul MM.DD.YYYY (näiteks: "12.31.1999").',
	email:'Palun sisestage kehtiv e-maili aadress (näiteks: "fred@domain.com").',
	url:'Palun sisestage kehtiv URL (näiteks: http://www.google.com).',
	currencyDollar:'Palun sisestage kehtiv $ summa (näiteks: $100.00).',
	oneRequired:'Palun sisestage midagi vähemalt ühele antud väljadest.',
	errorPrefix: 'Viga: ',
	warningPrefix: 'Hoiatus: ',

	//Form.Validator.Extras

	noSpace: 'Väli ei tohi sisaldada tühikuid.',
	reqChkByNode: 'Ükski väljadest pole valitud.',
	requiredChk: 'Välja täitmine on vajalik.',
	reqChkByName: 'Palun valige üks {label}.',
	match: 'Väli peab sobima {matchName} väljaga',
	startDate: 'algkuupäev',
	endDate: 'lõppkuupäev',
	currendDate: 'praegune kuupäev',
	afterDate: 'Kuupäev peab olema võrdne või pärast {label}.',
	beforeDate: 'Kuupäev peab olema võrdne või enne {label}.',
	startMonth: 'Palun valige algkuupäev.',
	sameMonth: 'Antud kaks kuupäeva peavad olema samas kuus - peate muutma ühte kuupäeva.'

});


/*
---

script: Form.Validator.French.js

name: Form.Validator.French

description: Form.Validator messages in French.

license: MIT-style license

authors: 
  - Miquel Hudin
  - Nicolas Sorosac <nicolas <dot> sorosac <at> gmail <dot> com>

requires:
  - /Lang

provides: [Form.Validator.French]

...
*/
 
MooTools.lang.set('fr-FR', 'Form.Validator', {
  required:'Ce champ est obligatoire.',
  minLength:'Veuillez saisir un minimum de {minLength} caract&egrave;re(s) (vous avez saisi {length} caract&egrave;re(s)).',
  maxLength:'Veuillez saisir un maximum de {maxLength} caract&egrave;re(s) (vous avez saisi {length} caract&egrave;re(s)).',
  integer:'Veuillez saisir un nombre entier dans ce champ. Les nombres d&eacute;cimaux (ex : "1,25") ne sont pas autoris&eacute;s.',
  numeric:'Veuillez saisir uniquement des chiffres dans ce champ (ex : "1" ou "1,1" ou "-1" ou "-1,1").',
  digits:'Veuillez saisir uniquement des chiffres et des signes de ponctuation dans ce champ (ex : un num&eacute;ro de t&eacute;l&eacute;phone avec des traits d\'union est autoris&eacute;).',
  alpha:'Veuillez saisir uniquement des lettres (a-z) dans ce champ. Les espaces ou autres caract&egrave;res ne sont pas autoris&eacute;s.',
  alphanum:'Veuillez saisir uniquement des lettres (a-z) ou des chiffres (0-9) dans ce champ. Les espaces ou autres caract&egrave;res ne sont pas autoris&eacute;s.',
  dateSuchAs:'Veuillez saisir une date correcte comme {date}',
  dateInFormatMDY:'Veuillez saisir une date correcte, au format JJ/MM/AAAA (ex : "31/11/1999").',
  email:'Veuillez saisir une adresse de courrier &eacute;lectronique. Par example "fred@domaine.com".',
  url:'Veuillez saisir une URL, comme http://www.google.com.',
  currencyDollar:'Veuillez saisir une quantit&eacute; correcte. Par example 100,00&euro;.',
  oneRequired:'Veuillez s&eacute;lectionner au moins une de ces options.',
  errorPrefix: 'Erreur : ',
  warningPrefix: 'Attention : ',
  
  //Form.Validator.Extras
 
  noSpace: 'Ce champ n\'accepte pas les espaces.',
  reqChkByNode: 'Aucun &eacute;l&eacute;ment n\'est s&eacute;lectionn&eacute;.',
  requiredChk: 'Ce champ est obligatoire.',
  reqChkByName: 'Veuillez s&eacute;lectionner un(e) {label}.',
  match: 'Ce champ doit correspondre avec le champ {matchName}.',
  startDate: 'date de d&eacute;but',
  endDate: 'date de fin',
  currendDate: 'date actuelle',
  afterDate: 'La date doit &ecirc;tre identique ou post&eacute;rieure &agrave; {label}.',
  beforeDate: 'La date doit &ecirc;tre identique ou ant&eacute;rieure &agrave; {label}.',
  startMonth: 'Veuillez s&eacute;lectionner un mois de d&eacute;but.',
  sameMonth: 'Ces deux dates doivent &ecirc;tre dans le m&ecirc;me mois - vous devez en modifier une.'
 
});


/*
---

script: Form.Validator.German.js

name: Form.Validator.German

description: Date messages for German.

license: MIT-style license

authors: 
  - Frank Rossi
  - Ulrich Petri
  - Fabian Beiner

requires:
  - /Lang

provides: [Form.Validator.German]

...
*/

MooTools.lang.set('de-DE', 'Form.Validator', {

	required: 'Dieses Eingabefeld muss ausgef&uuml;llt werden.',
	minLength: 'Geben Sie bitte mindestens {minLength} Zeichen ein (Sie haben nur {length} Zeichen eingegeben).',
	maxLength: 'Geben Sie bitte nicht mehr als {maxLength} Zeichen ein (Sie haben {length} Zeichen eingegeben).',
	integer: 'Geben Sie in diesem Eingabefeld bitte eine ganze Zahl ein. Dezimalzahlen (z.B. &quot;1.25&quot;) sind nicht erlaubt.',
	numeric: 'Geben Sie in diesem Eingabefeld bitte nur Zahlenwerte (z.B. &quot;1&quot;, &quot;1.1&quot;, &quot;-1&quot; oder &quot;-1.1&quot;) ein.',
	digits: 'Geben Sie in diesem Eingabefeld bitte nur Zahlen und Satzzeichen ein (z.B. eine Telefonnummer mit Bindestrichen und Punkten ist erlaubt).',
	alpha: 'Geben Sie in diesem Eingabefeld bitte nur Buchstaben (a-z) ein. Leerzeichen und andere Zeichen sind nicht erlaubt.',
	alphanum: 'Geben Sie in diesem Eingabefeld bitte nur Buchstaben (a-z) und Zahlen (0-9) ein. Leerzeichen oder andere Zeichen sind nicht erlaubt.',
	dateSuchAs: 'Geben Sie bitte ein g&uuml;ltiges Datum ein (z.B. &quot;{date}&quot;).',
	dateInFormatMDY: 'Geben Sie bitte ein g&uuml;ltiges Datum im Format TT.MM.JJJJ ein (z.B. &quot;31.12.1999&quot;).',
	email: 'Geben Sie bitte eine g&uuml;ltige E-Mail-Adresse ein (z.B. &quot;max@mustermann.de&quot;).',
	url: 'Geben Sie bitte eine g&uuml;ltige URL ein (z.B. &quot;http://www.google.de&quot;).',
	currencyDollar: 'Geben Sie bitte einen g&uuml;ltigen Betrag in EURO ein (z.B. 100.00&#8364;).',
	oneRequired: 'Bitte f&uuml;llen Sie mindestens ein Eingabefeld aus.',
	errorPrefix: 'Fehler: ',
	warningPrefix: 'Warnung: ',

	//Form.Validator.Extras

	noSpace: 'Es darf kein Leerzeichen in diesem Eingabefeld sein.',
	reqChkByNode: 'Es wurden keine Elemente gew&auml;hlt.',
	requiredChk: 'Dieses Feld muss ausgef&uuml;llt werden.',
	reqChkByName: 'Bitte w&auml;hlen Sie ein {label}.',
	match: 'Dieses Eingabefeld muss mit dem {matchName} Eingabefeld &uuml;bereinstimmen.',
	startDate: 'Das Anfangsdatum',
	endDate: 'Das Enddatum',
	currendDate: 'Das aktuelle Datum',
	afterDate: 'Das Datum sollte zur gleichen Zeit oder sp&auml;ter sein als {label}.',
	beforeDate: 'Das Datum sollte zur gleichen Zeit oder fr&uuml;her sein als {label}.',
	startMonth: 'W&auml;hlen Sie bitte einen Anfangsmonat',
	sameMonth: 'Diese zwei Datumsangaben m&uuml;ssen im selben Monat sein - Sie m&uuml;ssen eines von beiden ver&auml;ndern.',
	creditcard: 'Die eingegebene Kreditkartennummer ist ung&uuml;ltig. Bitte &uuml;berpr&uuml;fen Sie diese und versuchen Sie es erneut. {length} Zahlen eingegeben.'
});


/*
---

script: Form.Validator.German.CH.js

name: Form.Validator.German.CH

description: Date messages for German (Switzerland).
 
license: MIT-style license
 
authors:
  - Michael van der Weg

requires:
  - /Lang
  - /Form.Validator.German

provides: [Form.Validator.German.CH]

...
*/
 
MooTools.lang.set('de-CH', 'Form.Validator', {
 
  required:'Dieses Feld ist obligatorisch.',
  minLength:'Geben Sie bitte mindestens {minLength} Zeichen ein (Sie haben {length} Zeichen eingegeben).',
  maxLength:'Bitte geben Sie nicht mehr als {maxLength} Zeichen ein (Sie haben {length} Zeichen eingegeben).',
  integer:'Geben Sie bitte eine ganze Zahl ein. Dezimalzahlen (z.B. 1.25) sind nicht erlaubt.',
  numeric:'Geben Sie bitte nur Zahlenwerte in dieses Eingabefeld ein (z.B. &quot;1&quot;, &quot;1.1&quot;, &quot;-1&quot; oder &quot;-1.1&quot;).',
  digits:'Benutzen Sie bitte nur Zahlen und Satzzeichen in diesem Eingabefeld (erlaubt ist z.B. eine Telefonnummer mit Bindestrichen und Punkten).',
  alpha:'Benutzen Sie bitte nur Buchstaben (a-z) in diesem Feld. Leerzeichen und andere Zeichen sind nicht erlaubt.',
  alphanum:'Benutzen Sie bitte nur Buchstaben (a-z) und Zahlen (0-9) in diesem Eingabefeld. Leerzeichen und andere Zeichen sind nicht erlaubt.',
  dateSuchAs:'Geben Sie bitte ein g&uuml;ltiges Datum ein. Wie zum Beispiel {date}',
  dateInFormatMDY:'Geben Sie bitte ein g&uuml;ltiges Datum ein. Wie zum Beispiel TT.MM.JJJJ (z.B. &quot;31.12.1999&quot;)',
  email:'Geben Sie bitte eine g&uuml;ltige E-Mail Adresse ein. Wie zum Beispiel &quot;maria@bernasconi.ch&quot;.',
  url:'Geben Sie bitte eine g&uuml;ltige URL ein. Wie zum Beispiel http://www.google.ch.',
  currencyDollar:'Geben Sie bitte einen g&uuml;ltigen Betrag in Schweizer Franken ein. Wie zum Beispiel 100.00 CHF .',
  oneRequired:'Machen Sie f&uuml;r mindestens eines der Eingabefelder einen Eintrag.',
  errorPrefix: 'Fehler: ',
  warningPrefix: 'Warnung: ',
 
  //Form.Validator.Extras
 
  noSpace: 'In diesem Eingabefeld darf kein Leerzeichen sein.',
  reqChkByNode: 'Es wurden keine Elemente gew&auml;hlt.',
  requiredChk: 'Dieses Feld ist obligatorisch.',
  reqChkByName: 'Bitte w&auml;hlen Sie ein {label}.',
  match: 'Dieses Eingabefeld muss mit dem Feld {matchName} &uuml;bereinstimmen.',
  startDate: 'Das Anfangsdatum',
  endDate: 'Das Enddatum',
  currendDate: 'Das aktuelle Datum',
  afterDate: 'Das Datum sollte zur gleichen Zeit oder sp&auml;ter sein {label}.',
  beforeDate: 'Das Datum sollte zur gleichen Zeit oder fr&uuml;her sein {label}.',
  startMonth: 'W&auml;hlen Sie bitte einen Anfangsmonat',
  sameMonth: 'Diese zwei Datumsangaben m&uuml;ssen im selben Monat sein - Sie m&uuml;ssen eine von beiden ver&auml;ndern.'
 
});


/*
---

script: Form.Validator.Italian.js

name: Form.Validator.Italian

description: Form.Validator messages in Italian.

license: MIT-style license

authors:
  - Leonardo Laureti
  - Andrea Novero

requires:
  - /Lang

provides: [Form.Validator.Italian]

...
*/
 
MooTools.lang.set('it-IT', 'Form.Validator', {

	required:'Il campo &egrave; obbligatorio.',
	minLength:'Inserire almeno {minLength} caratteri (ne sono stati inseriti {length}).',
	maxLength:'Inserire al massimo {maxLength} caratteri (ne sono stati inseriti {length}).',
	integer:'Inserire un numero intero. Non sono consentiti decimali (es.: 1.25).',
	numeric:'Inserire solo valori numerici (es.: "1" oppure "1.1" oppure "-1" oppure "-1.1").',
	digits:'Inserire solo numeri e caratteri di punteggiatura. Per esempio &egrave; consentito un numero telefonico con trattini o punti.',
	alpha:'Inserire solo lettere (a-z). Non sono consentiti spazi o altri caratteri.',
	alphanum:'Inserire solo lettere (a-z) o numeri (0-9). Non sono consentiti spazi o altri caratteri.',
	dateSuchAs:'Inserire una data valida del tipo {date}',
	dateInFormatMDY:'Inserire una data valida nel formato MM/GG/AAAA (es.: "12/31/1999")',
	email:'Inserire un indirizzo email valido. Per esempio "nome@dominio.com".',
	url:'Inserire un indirizzo valido. Per esempio "http://www.dominio.com".',
	currencyDollar:'Inserire un importo valido. Per esempio "$100.00".',
	oneRequired:'Completare almeno uno dei campi richiesti.',
	errorPrefix: 'Errore: ',
	warningPrefix: 'Attenzione: ',

	//Form.Validator.Extras

	noSpace: 'Non sono consentiti spazi.',
	reqChkByNode: 'Nessuna voce selezionata.',
	requiredChk: 'Il campo &egrave; obbligatorio.',
	reqChkByName: 'Selezionare un(a) {label}.',
	match: 'Il valore deve corrispondere al campo {matchName}',
	startDate: 'data d\'inizio',
	endDate: 'data di fine',
	currendDate: 'data attuale',
	afterDate: 'La data deve corrispondere o essere successiva al {label}.',
	beforeDate: 'La data deve corrispondere o essere precedente al {label}.',
	startMonth: 'Selezionare un mese d\'inizio',
	sameMonth: 'Le due date devono essere dello stesso mese - occorre modificarne una.'

});


/*
---

script: Form.Validator.Norwegian.js

name: Form.Validator.Norwegian

description: Form.Validator messages in Norwegian.

license: MIT-style license

authors:
  - Espen 'Rexxars' Hovlandsdal

requires:
  - /Lang

provides: [Form.Validator.Norwegian]

...
*/

MooTools.lang.set('no-NO', 'Form.Validator', {
   required:'Dette feltet er pÃ¥krevd.',
   minLength:'Vennligst skriv inn minst {minLength} tegn (du skrev {length} tegn).',
   maxLength:'Vennligst skriv inn maksimalt {maxLength} tegn (du skrev {length} tegn).',
   integer:'Vennligst skriv inn et tall i dette feltet. Tall med desimaler (for eksempel 1,25) er ikke tillat.',
   numeric:'Vennligst skriv inn kun numeriske verdier i dette feltet (for eksempel "1", "1.1", "-1" eller "-1.1").',
   digits:'Vennligst bruk kun nummer og skilletegn i dette feltet.',
   alpha:'Vennligst bruk kun bokstaver (a-z) i dette feltet. Ingen mellomrom eller andre tegn er tillat.',
   alphanum:'Vennligst bruk kun bokstaver (a-z) eller nummer (0-9) i dette feltet. Ingen mellomrom eller andre tegn er tillat.',
   dateSuchAs:'Vennligst skriv inn en gyldig dato, som {date}',
   dateInFormatMDY:'Vennligst skriv inn en gyldig dato, i formatet MM/DD/YYYY (for eksempel "12/31/1999")',
   email:'Vennligst skriv inn en gyldig epost-adresse. For eksempel "espen@domene.no".',
   url:'Vennligst skriv inn en gyldig URL, for eksempel http://www.google.no.',
   currencyDollar:'Vennligst fyll ut et gyldig $ belÃ¸p. For eksempel $100.00 .',
   oneRequired:'Vennligst fyll ut noe i minst ett av disse feltene.',
   errorPrefix: 'Feil: ',
   warningPrefix: 'Advarsel: '
});


/*
---

script: Form.Validator.Persian.js

name: Form.Validator.Persian

description: Date messages for Persian.

license: MIT-style license

authors:
  - Amir Hossein Hodjaty Pour

requires:
  - /Lang

provides: [Form.Validator.Persian]

...
*/
MooTools.lang.set('fa', 'Form.Validator', {

	required:'این فیلد الزامی است.',
	minLength:'شما باید حداقل {minLength} حرف وارد کنید ({length} حرف وارد کرده اید).',
	maxLength:'لطفا حداکثر {maxLength} حرف وارد کنید (شما {length} حرف وارد کرده اید).',
	integer:'لطفا از عدد صحیح استفاده کنید. اعداد اعشاری (مانند 1.25) مجاز نیستند.',
	numeric:'لطفا فقط داده عددی وارد کنید (مانند "1" یا "1.1" یا "1-" یا "1.1-").',
	digits:'لطفا فقط از اعداد و علامتها در این فیلد استفاده کنید (برای مثال شماره تلفن با خط تیره و نقطه قابل قبول است).',
	alpha:'لطفا فقط از حروف الفباء برای این بخش استفاده کنید. کاراکترهای دیگر و فاصله مجاز نیستند.',
	alphanum:'لطفا فقط از حروف الفباء و اعداد در این بخش استفاده کنید. کاراکترهای دیگر و فاصله مجاز نیستند.',
	dateSuchAs:'لطفا یک تاریخ معتبر مانند {date} وارد کنید.',
	dateInFormatMDY:'لطفا یک تاریخ معتبر به شکل MM/DD/YYYY وارد کنید (مانند "12/31/1999").',
	email:'لطفا یک آدرس ایمیل معتبر وارد کنید. برای مثال "fred@domain.com".',
	url:'لطفا یک URL معتبر مانند http://www.google.com وارد کنید.',
	currencyDollar:'لطفا یک محدوده معتبر برای این بخش وارد کنید مانند 100.00$ .',
	oneRequired:'لطفا حداقل یکی از فیلدها را پر کنید.',
	errorPrefix: 'خطا: ',
	warningPrefix: 'هشدار: ',

	//Form.Validator.Extras

	noSpace: 'استفاده از فاصله در این بخش مجاز نیست.',
	reqChkByNode: 'موردی انتخاب نشده است.',
	requiredChk: 'این فیلد الزامی است.',
	reqChkByName: 'لطفا یک {label} را انتخاب کنید.',
	match: 'این فیلد باید با فیلد {matchName} مطابقت داشته باشد.',
	startDate: 'تاریخ شروع',
	endDate: 'تاریخ پایان',
	currendDate: 'تاریخ کنونی',
	afterDate: 'تاریخ میبایست برابر یا بعد از {label} باشد',
	beforeDate: 'تاریخ میبایست برابر یا قبل از {label} باشد',
	startMonth: 'لطفا ماه شروع را انتخاب کنید',
	sameMonth: 'این دو تاریخ باید در یک ماه باشند - شما باید یکی یا هر دو را تغییر دهید.',
	creditcard: 'شماره کارت اعتباری که وارد کرده اید معتبر نیست. لطفا شماره را بررسی کنید و مجددا تلاش کنید. {length} رقم وارد شده است.'

});


/*
---

script: Form.Validator.Polish.js

name: Form.Validator.Polish

description: Date messages for Polish.

license: MIT-style license

authors:
  - Oskar Krawczyk

requires:
  - /Lang

provides: [Form.Validator.Polish]

...
*/

MooTools.lang.set('pl-PL', 'Form.Validator', {

	required:'To pole jest wymagane.',
	minLength:'Wymagane jest przynajmniej {minLength} znaków (wpisanych zostało tylko {length}).',
	maxLength:'Dozwolone jest nie więcej niż {maxLength} znaków (wpisanych zostało {length})',
	integer:'To pole wymaga liczb całych. Liczby dziesiętne (np. 1.25) są niedozwolone.',
	numeric:'Prosimy używać tylko numerycznych wartości w tym polu (np. "1", "1.1", "-1" lub "-1.1").',
	digits:'Prosimy używać liczb oraz zankow punktuacyjnych w typ polu (dla przykładu, przy numerze telefonu myślniki i kropki są dozwolone).',
	alpha:'Prosimy używać tylko liter (a-z) w tym polu. Spacje oraz inne znaki są niedozwolone.',
	alphanum:'Prosimy używać tylko liter (a-z) lub liczb (0-9) w tym polu. Spacje oraz inne znaki są niedozwolone.',
	dateSuchAs:'Prosimy podać prawidłową datę w formacie: {date}',
	dateInFormatMDY:'Prosimy podać poprawną date w formacie DD.MM.RRRR (i.e. "12.01.2009")',
	email:'Prosimy podać prawidłowy adres e-mail, np. "jan@domena.pl".',
	url:'Prosimy podać prawidłowy adres URL, np. http://www.google.pl.',
	currencyDollar:'Prosimy podać prawidłową sumę w PLN. Dla przykładu: 100.00 PLN.',
	oneRequired:'Prosimy wypełnić chociaż jedno z pól.',
	errorPrefix: 'Błąd: ',
	warningPrefix: 'Uwaga: ',

	//Form.Validator.Extras

	noSpace: 'W tym polu nie mogą znajdować się spacje.',
	reqChkByNode: 'Brak zaznaczonych elementów.',
	requiredChk: 'To pole jest wymagane.',
	reqChkByName: 'Prosimy wybrać z {label}.',
	match: 'To pole musi być takie samo jak {matchName}',
	startDate: 'data początkowa',
	endDate: 'data końcowa',
	currendDate: 'aktualna data',
	afterDate: 'Podana data poinna być taka sama lub po {label}.',
	beforeDate: 'Podana data poinna być taka sama lub przed {label}.',
	startMonth: 'Prosimy wybrać początkowy miesiąc.',
	sameMonth: 'Te dwie daty muszą być w zakresie tego samego miesiąca - wymagana jest zmiana któregoś z pól.'

});


/*
---

script: Form.Validator.Portuguese.js

name: Form.Validator.Portuguese

description: Form.Validator messages in Portuguese.

license: MIT-style license

authors:
  - Miquel Hudin

requires:
  - /Lang

provides: [Form.Validator.Portuguese]

...
*/

MooTools.lang.set('pt-PT', 'Form.Validator', {
	required:'Este campo é necessário.',
	minLength:'Digite pelo menos{minLength} caracteres (comprimento {length} caracteres).',
	maxLength:'Não insira mais de {maxLength} caracteres (comprimento {length} caracteres).',
	integer:'Digite um número inteiro neste domínio. Com números decimais (por exemplo, 1,25), não são permitidas.',
	numeric:'Digite apenas valores numéricos neste domínio (p.ex., "1" ou "1.1" ou "-1" ou "-1,1").',
	digits:'Por favor, use números e pontuação apenas neste campo (p.ex., um número de telefone com traços ou pontos é permitida).',
	alpha:'Por favor use somente letras (a-z), com nesta área. Não utilize espaços nem outros caracteres são permitidos.',
	alphanum:'Use somente letras (a-z) ou números (0-9) neste campo. Não utilize espaços nem outros caracteres são permitidos.',
	dateSuchAs:'Digite uma data válida, como {date}',
	dateInFormatMDY:'Digite uma data válida, como DD/MM/YYYY (p.ex. "31/12/1999")',
	email:'Digite um endereço de email válido. Por exemplo "fred@domain.com".',
	url:'Digite uma URL válida, como http://www.google.com.',
	currencyDollar:'Digite um valor válido $. Por exemplo $ 100,00. ',
	oneRequired:'Digite algo para pelo menos um desses insumos.',
	errorPrefix: 'Erro: ',
	warningPrefix: 'Aviso: '

}).set('pt-PT', 'Date', {
	dateOrder: ['date', 'month', 'year', '/']
});


/*
---

script: Form.Validator.Portuguese.BR.js

name: Form.Validator.Portuguese.BR

description: Form.Validator messages in Portuguese-BR.

license: MIT-style license

authors:
  - Fábio Miranda Costa

requires:
  - /Lang
  - /Form.Validator.Portuguese

provides: [Form.Validator.Portuguese.BR]

...
*/

MooTools.lang.set('pt-BR', 'Form.Validator', {

	required: 'Este campo é obrigatório.',
	minLength: 'Digite pelo menos {minLength} caracteres (tamanho atual: {length}).',
	maxLength: 'Não digite mais de {maxLength} caracteres (tamanho atual: {length}).',
	integer: 'Por favor digite apenas um número inteiro neste campo. Não são permitidos números decimais (por exemplo, 1,25).',
	numeric: 'Por favor digite apenas valores numéricos neste campo (por exemplo, "1" ou "1.1" ou "-1" ou "-1,1").',
	digits: 'Por favor use apenas números e pontuação neste campo (por exemplo, um número de telefone com traços ou pontos é permitido).',
	alpha: 'Por favor use somente letras (a-z). Espaço e outros caracteres não são permitidos.',
	alphanum: 'Use somente letras (a-z) ou números (0-9) neste campo. Espaço e outros caracteres não são permitidos.',
	dateSuchAs: 'Digite uma data válida, como {date}',
	dateInFormatMDY: 'Digite uma data válida, como DD/MM/YYYY (por exemplo, "31/12/1999")',
	email: 'Digite um endereço de email válido. Por exemplo "nome@dominio.com".',
	url: 'Digite uma URL válida. Exemplo: http://www.google.com.',
	currencyDollar: 'Digite um valor em dinheiro válido. Exemplo: R$100,00 .',
	oneRequired: 'Digite algo para pelo menos um desses campos.',
	errorPrefix: 'Erro: ',
	warningPrefix: 'Aviso: ',

	//Form.Validator.Extras

	noSpace: 'Não é possível digitar espaços neste campo.',
	reqChkByNode: 'Não foi selecionado nenhum item.',
	requiredChk: 'Este campo é obrigatório.',
	reqChkByName: 'Por favor digite um {label}.',
	match: 'Este campo deve ser igual ao campo {matchName}.',
	startDate: 'a data inicial',
	endDate: 'a data final',
	currendDate: 'a data atual',
	afterDate: 'A data deve ser igual ou posterior a {label}.',
	beforeDate: 'A data deve ser igual ou anterior a {label}.',
	startMonth: 'Por favor selecione uma data inicial.',
	sameMonth: 'Estas duas datas devem ter o mesmo mês - você deve modificar uma das duas.',
	creditcard: 'O número do cartão de crédito informado é inválido. Por favor verifique o valor e tente novamente. {length} números informados.'

});


/*
---

script: Form.Validator.Russian.js

name: Form.Validator.Russian

description: Form.Validator messages in Russian (utf-8 and cp1251).

license: MIT-style license

authors:
  - Chernodarov Egor

requires:
  - /Lang

provides: [Form.Validator.Russian]

...
*/

MooTools.lang.set('ru-RU-unicode', 'Form.Validator', {
	required:'Это поле обязательно к заполнению.',
	minLength:'Пожалуйста, введите хотя бы {minLength} символов (Вы ввели {length}).',
	maxLength:'Пожалуйста, введите не больше {maxLength} символов (Вы ввели {length}).',
	integer:'Пожалуйста, введите в это поле число. Дробные числа (например 1.25) тут не разрешены.',
	numeric:'Пожалуйста, введите в это поле число (например "1" или "1.1", или "-1", или "-1.1").',
	digits:'В этом поле Вы можете использовать только цифры и знаки пунктуации (например, телефонный номер со знаками дефиса или с точками).',
	alpha:'В этом поле можно использовать только латинские буквы (a-z). Пробелы и другие символы запрещены.',
	alphanum:'В этом поле можно использовать только латинские буквы (a-z) и цифры (0-9). Пробелы и другие символы запрещены.',
	dateSuchAs:'Пожалуйста, введите корректную дату {date}',
	dateInFormatMDY:'Пожалуйста, введите дату в формате ММ/ДД/ГГГГ (например "12/31/1999")',
	email:'Пожалуйста, введите корректный емейл-адрес. Для примера "fred@domain.com".',
	url:'Пожалуйста, введите правильную ссылку вида http://www.google.com.',
	currencyDollar:'Пожалуйста, введите сумму в долларах. Например: $100.00 .',
	oneRequired:'Пожалуйста, выберите хоть что-нибудь в одном из этих полей.',
	errorPrefix: 'Ошибка: ',
	warningPrefix: 'Внимание: '
});

//translation in windows-1251 codepage
MooTools.lang.set('ru-RU', 'Form.Validator', {
	required:'Ýòî ïîëå îáÿçàòåëüíî ê çàïîëíåíèþ.',
	minLength:'Ïîæàëóéñòà, ââåäèòå õîòÿ áû {minLength} ñèìâîëîâ (Âû ââåëè {length}).',
	maxLength:'Ïîæàëóéñòà, ââåäèòå íå áîëüøå {maxLength} ñèìâîëîâ (Âû ââåëè {length}).',
	integer:'Ïîæàëóéñòà, ââåäèòå â ýòî ïîëå ÷èñëî. Äðîáíûå ÷èñëà (íàïðèìåð 1.25) òóò íå ðàçðåøåíû.',
	numeric:'Ïîæàëóéñòà, ââåäèòå â ýòî ïîëå ÷èñëî (íàïðèìåð "1" èëè "1.1", èëè "-1", èëè "-1.1").',
	digits:'Â ýòîì ïîëå Âû ìîæåòå èñïîëüçîâàòü òîëüêî öèôðû è çíàêè ïóíêòóàöèè (íàïðèìåð, òåëåôîííûé íîìåð ñî çíàêàìè äåôèñà èëè ñ òî÷êàìè).',
	alpha:'Â ýòîì ïîëå ìîæíî èñïîëüçîâàòü òîëüêî ëàòèíñêèå áóêâû (a-z). Ïðîáåëû è äðóãèå ñèìâîëû çàïðåùåíû.',
	alphanum:'Â ýòîì ïîëå ìîæíî èñïîëüçîâàòü òîëüêî ëàòèíñêèå áóêâû (a-z) è öèôðû (0-9). Ïðîáåëû è äðóãèå ñèìâîëû çàïðåùåíû.',
	dateSuchAs:'Ïîæàëóéñòà, ââåäèòå êîððåêòíóþ äàòó {date}',
	dateInFormatMDY:'Ïîæàëóéñòà, ââåäèòå äàòó â ôîðìàòå ÌÌ/ÄÄ/ÃÃÃÃ (íàïðèìåð "12/31/1999")',
	email:'Ïîæàëóéñòà, ââåäèòå êîððåêòíûé åìåéë-àäðåñ. Äëÿ ïðèìåðà "fred@domain.com".',
	url:'Ïîæàëóéñòà, ââåäèòå ïðàâèëüíóþ ññûëêó âèäà http://www.google.com.',
	currencyDollar:'Ïîæàëóéñòà, ââåäèòå ñóììó â äîëëàðàõ. Íàïðèìåð: $100.00 .',
	oneRequired:'Ïîæàëóéñòà, âûáåðèòå õîòü ÷òî-íèáóäü â îäíîì èç ýòèõ ïîëåé.',
	errorPrefix: 'Îøèáêà: ',
	warningPrefix: 'Âíèìàíèå: '
});


/*
---

script: Form.Validator.Spanish.js

name: Form.Validator.Spanish

description: Date messages for Spanish.

license: MIT-style license

authors:
  - Ãlfons Sanchez

requires:
  - /Lang

provides: [Form.Validator.Spanish]

...
*/

MooTools.lang.set('es-ES', 'Form.Validator', {

	required:'Este campo es obligatorio.',
	minLength:'Por favor introduce al menos {minLength} caracteres (has introducido {length} caracteres).',
	maxLength:'Por favor introduce no m&aacute;s de {maxLength} caracteres (has introducido {length} caracteres).',
	integer:'Por favor introduce un n&uacute;mero entero en este campo. N&uacute;meros con decimales (p.e. 1,25) no se permiten.',
	numeric:'Por favor introduce solo valores num&eacute;ricos en este campo (p.e. "1" o "1,1" o "-1" o "-1,1").',
	digits:'Por favor usa solo n&uacute;meros y puntuaci&oacute;n en este campo (por ejemplo, un n&uacute;mero de tel&eacute;fono con guiones y puntos no esta permitido).',
	alpha:'Por favor usa letras solo (a-z) en este campo. No se admiten espacios ni otros caracteres.',
	alphanum:'Por favor, usa solo letras (a-z) o n&uacute;meros (0-9) en este campo. No se admiten espacios ni otros caracteres.',
	dateSuchAs:'Por favor introduce una fecha v&aacute;lida como {date}',
	dateInFormatMDY:'Por favor introduce una fecha v&aacute;lida como DD/MM/YYYY (p.e. "31/12/1999")',
	email:'Por favor, introduce una direcci&oacute;n de email v&aacute;lida. Por ejemplo,  "fred@domain.com".',
	url:'Por favor introduce una URL v&aacute;lida como http://www.google.com.',
	currencyDollar:'Por favor introduce una cantidad v&aacute;lida de €. Por ejemplo €100,00 .',
	oneRequired:'Por favor introduce algo para por lo menos una de estas entradas.',
	errorPrefix: 'Error: ',
	warningPrefix: 'Aviso: ',

	//Form.Validator.Extras

	noSpace: 'No pueden haber espacios en esta entrada.',
	reqChkByNode: 'No hay elementos seleccionados.',
	requiredChk: 'Este campo es obligatorio.',
	reqChkByName: 'Por favor selecciona una {label}.',
	match: 'Este campo necesita coincidir con el campo {matchName}',
	startDate: 'la fecha de inicio',
	endDate: 'la fecha de fin',
	currendDate: 'la fecha actual',
	afterDate: 'La fecha debe ser igual o posterior a {label}.',
	beforeDate: 'La fecha debe ser igual o anterior a {label}.',
	startMonth: 'Por favor selecciona un mes de origen',
	sameMonth: 'Estas dos fechas deben estar en el mismo mes - debes cambiar una u otra.'

});


/*
---

script: Form.Validator.Swedish.js

name: Form.Validator.Swedish

description: Date messages for Swedish.

license: MIT-style license

authors:
  - Martin Lundgren

requires:
  - /Lang

provides: [Form.Validator.Swedish]

...
*/

MooTools.lang.set('sv-SE', 'Form.Validator', {

	required:'Fältet är obligatoriskt.',
	minLength:'Ange minst {minLength} tecken (du angav {length} tecken).',
	maxLength:'Ange högst {maxLength} tecken (du angav {length} tecken). ',
	integer:'Ange ett heltal i fältet. Tal med decimaler (t.ex. 1,25) är inte tillåtna.',
	numeric:'Ange endast numeriska värden i detta fält (t.ex. "1" eller "1.1" eller "-1" eller "-1,1").',
	digits:'Använd endast siffror och skiljetecken i detta fält (till exempel ett telefonnummer med bindestreck tillåtet).',
	alpha:'Använd endast bokstäver (a-ö) i detta fält. Inga mellanslag eller andra tecken är tillåtna.',
	alphanum:'Använd endast bokstäver (a-ö) och siffror (0-9) i detta fält. Inga mellanslag eller andra tecken är tillåtna.',
	dateSuchAs:'Ange ett giltigt datum som t.ex. {date}',
	dateInFormatMDY:'Ange ett giltigt datum som t.ex. YYYY-MM-DD (i.e. "1999-12-31")',
	email:'Ange en giltig e-postadress. Till exempel "erik@domain.com".',
	url:'Ange en giltig webbadress som http://www.google.com.',
	currencyDollar:'Ange en giltig belopp. Exempelvis 100,00.',
	oneRequired:'Vänligen ange minst ett av dessa alternativ.',
	errorPrefix: 'Fel: ',
	warningPrefix: 'Varning: ',

	//Form.Validator.Extras

	noSpace: 'Det får inte finnas några mellanslag i detta fält.',
	reqChkByNode: 'Inga objekt är valda.',
	requiredChk: 'Detta är ett obligatoriskt fält.',
	reqChkByName: 'Välj en {label}.',
	match: 'Detta fält måste matcha {matchName}',
	startDate: 'startdatumet',
	endDate: 'slutdatum',
	currendDate: 'dagens datum',
	afterDate: 'Datumet bör vara samma eller senare än {label}.',
	beforeDate: 'Datumet bör vara samma eller tidigare än {label}.',
	startMonth: 'Välj en start månad',
	sameMonth: 'Dessa två datum måste vara i samma månad - du måste ändra det ena eller det andra.'

});


/*
---

script: Form.Validator.Ukrainian.js

name: Form.Validator.Ukrainian

description: Form.Validator messages in Ukrainian (utf-8).

license: MIT-style license

authors:
  - Slik

requires:
  - /Lang

provides: [Form.Validator.Ukrainian]

...
*/

MooTools.lang.set('uk-UA', 'Form.Validator', {
	required:'Це поле повинне бути заповненим.',
	minLength:'Введіть хоча б {minLength} символів (Ви ввели {length}).',
	maxLength:'Кількість символів не може бути більше {maxLength} (Ви ввели {length}).',
	integer:'Введіть в це поле число. Дробові числа (наприклад 1.25) не дозволені.',
	numeric:'Введіть в це поле число (наприклад "1" або "1.1", або "-1", або "-1.1").',
	digits:'В цьому полі ви можете використовувати лише цифри і знаки пунктіації (наприклад, телефонний номер з знаками дефізу або з крапками).',
	alpha:'В цьому полі можна використовувати лише латинські літери (a-z). Пробіли і інші символи заборонені.',
	alphanum:'В цьому полі можна використовувати лише латинські літери (a-z) і цифри (0-9). Пробіли і інші символи заборонені.',
	dateSuchAs:'Введіть коректну дату {date}.',
	dateInFormatMDY:'Введіть дату в форматі ММ/ДД/РРРР (наприклад "12/31/2009").',
	email:'Введіть коректну адресу електронної пошти (наприклад "name@domain.com").',
	url:'Введіть коректне інтернет-посилання (наприклад http://www.google.com).',
	currencyDollar:'Введіть суму в доларах (наприклад "$100.00").',
	oneRequired:'Заповніть одне з полів.',
	errorPrefix: 'Помилка: ',
	warningPrefix: 'Увага: '
});

