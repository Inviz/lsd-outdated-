/*
Script: ART.js

License:
	MIT-style license.
*/

var ART = function(){};

ART.html5 = true;


var Touch = new Class({
 
	Implements: Events,
 
	initialize: function(element){
		this.element = document.id(element);
 
		this.bound = {
			start: this.start.bind(this),
			move: this.move.bind(this),
			end: this.end.bind(this)
		};
 
		if (Browser.Platform.ipod){
			this.context = this.element;
			this.startEvent = 'touchstart';
			this.endEvent = 'touchend';
			this.moveEvent = 'touchmove';
		} else {
			this.context = document;
			this.startEvent = 'mousedown';
			this.endEvent = 'mouseup';
			this.moveEvent = 'mousemove';
		}
 
		this.attach();
	},
 
	// public methods
 
	attach: function(){
		this.element.addListener(this.startEvent, this.bound.start);
	},
 
	detach: function(){
		this.element.removeListener(this.startEvent, this.bound.start);
	},
 
	// protected methods
 
	start: function(event){
		this.preventDefault(event);
		// this prevents the copy-paste dialog to show up when dragging. it only affects mobile safari.
		document.body.style.WebkitUserSelect = 'none';
 
		this.hasDragged = false;
 
		this.context.addListener(this.moveEvent, this.bound.move);
		this.context.addListener(this.endEvent, this.bound.end);
 
		var page = this.getPage(event);
 
		this.startX = page.pageX;
		this.startY = page.pageY;
 
		this.fireEvent('start');
	},
 
	move: function(event){
		this.preventDefault(event);
 
		this.hasDragged = true;
 
		var page = this.getPage(event);
 
		this.deltaX = page.pageX - this.startX;
		this.deltaY = page.pageY - this.startY;
 
		this.fireEvent('move', [this.deltaX, this.deltaY]);
	},
 
	end: function(event){
		this.preventDefault(event);
		// we re-enable the copy-paste dialog on drag end
		document.body.style.WebkitUserSelect = '';
 
		this.context.removeListener(this.moveEvent, this.bound.move);
		this.context.removeListener(this.endEvent, this.bound.end);
 
		this.fireEvent((this.hasDragged) ? 'end' : 'cancel');
	},
 
	preventDefault: function(event){
		if (event.preventDefault) event.preventDefault();
		else event.returnValue = false;
	},
 
	getPage: function(event){
		//when on mobile safari, the coordinates information is inside the targetTouches object
		if (event.targetTouches) event = event.targetTouches[0];
		if (event.pageX != null && event.pageY != null) return {pageX: event.pageX, pageY: event.pageY};
		var element = (!document.compatMode || document.compatMode == 'CSS1Compat') ? document.documentElement : document.body;
		return {pageX: event.clientX + element.scrollLeft, pageY: event.clientY + element.scrollTop};
	}
 
});


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
			console.log.apply(console, toArgs([name].concat($A(arguments))));
			return this;	
		}
	});

	Exception = new Class({
		name: "Exception",

		initialize: function(object, message) {
			this.object = object;
			this.message = message;
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
	if (!one || !another) return false;
	
	switch ($type(one)) {
		case "array":
			return (one.length == another.length) && one.every(function(value, i) {
				return $equals(value, another[i]);
			});
		case "color": 
			return $equals(one.color, another.color) && (one.type == another.type) 
		case "object":
			if (one.equals) return one.equals(another)
			for (var i in one) if ($equals(one[i], another[i])) return false;
			return true;
	}
	return false;
}