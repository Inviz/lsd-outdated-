/*
---

name: ART

description: The heart of ART.

authors: [Valerio Proietti](http://mad4milk.net), [The MooTools development team](http://mootools.net/developers)

requires: [Core/Class, Color/Color, Table/Table]

provides: [ART, ART.Element, ART.Container]

...
*/

var ART = new Class;

ART.Element = new Class({
	
	/* dom */

	inject: function(element){
		if (element.element) element = element.element;
		element.appendChild(this.element);
		return this;
	},
	
	eject: function(){
		var element = this.element, parent = element.parentNode;
		if (parent) parent.removeChild(element);
		return this;
	},
	
	/* events */
	
	listen: function(type, fn){
		if (!this._events) this._events = {};
		
		if (typeof type != 'string'){ // listen type / fn with object
			for (var t in type) this.listen(t, type[t]);
		} else { // listen to one
			if (!this._events[type]) this._events[type] = new Table;
			var events = this._events[type];
			if (events.get(fn)) return this;
			var bound = fn.bind(this);
			events.set(fn, bound);
			var element = this.element;
			if (element.addEventListener) element.addEventListener(type, bound, false);
			else element.attachEvent('on' + type, bound);
		}

		return this;
	},
	
	ignore: function(type, fn){
		if (!this._events) return this;
		
		if (typeof type != 'string'){ // ignore type / fn with object
			for (var t in type) this.ignore(t, type[t]);
			return this;
		}
		
		var events = this._events[type];
		if (!events) return this;
		
		if (fn == null){ // ignore every of type
			events.each(function(fn, bound){
				this.ignore(type, fn);
			}, this);
		} else { // ignore one
			var bound = events.get(fn);
			if (!bound) return this;
			var element = this.element;
			if (element.removeEventListener) element.removeEventListener(type, bound, false);
			else element.detachEvent('on' + type, bound);
		}

		return this;
	}

});

ART.Container = new Class({

	push: function(){
		for (var i = 0; i < arguments.length; i++) arguments[i].inject(this);
		return this;
	},
	
	pull: function(){
		var element = this.element;
		for (var i = 0; i < arguments.length; i++){
			var child = arguments[i], parent = child.parentNode;
			if (child.parentNode && child.parentNode === element) child.eject();
		}
		return this;
	}

});

Color.detach = function(color){
	color = new Color(color);
	return [Color.rgb(color.red, color.green, color.blue).toString(), color.alpha];
};


Gradient = function() {
  this.element = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  this.colors = $A(arguments).flatten();
  return this;
}

Gradient.Radial = function() {
  this.element = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
  this.colors = $A(arguments).flatten();
  return this;
}

Gradient.prototype = {
  getStops: function() {
    var colors = this.colors;
    if (colors.length > 1) {
      if ($chk(colors[0].red)) {
        var result = {};
        for (var i = 0, j = colors.length; i < j; i++) result[i / (j - 1)] = colors[i];
        colors = result;
      } else {
        this.attributes = colors[1];
        colors = colors[0];
      }
    } else {
      colors = colors[0];
    }
    return colors;
  },
  
  getAttributes: function() {
    return {x1: '0%', x2: '0%', y1: '0%', y2: '100%'};
  },
  
  toElement: function() {
    return this.element;
  }
}
Gradient.Radial.prototype = $merge(Gradient.prototype, {
  getAttributes: function() {
    return $extend({cx: '50%', cy: '50%', r: '50%', fx: '50%', fy: '50%'}, this.attributes);
  }
});

Gradient.of = function() {
  var args = $A(arguments).flatten();
  if (args[0] == 'radial') {
    args.splice(0, 1);
    return new Gradient.Radial(args)
  } else {
    return new Gradient(args);
  }
}