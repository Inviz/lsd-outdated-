/*
Script: ART.Widget.js

License:
	MIT-style license.
*/

// Base widget class.

ART.Widget = new Class({
	Extends: Widget.Stateful({
	  'hidden': ['hide', 'show'],
	  'active': ['activate', 'deactivate'],
	  'focused': ['focus', 'blur'],
	  'disabled': ['enable', 'disable'],
	  'orphaned': ['dispose', 'inject'],
	  'dirty': ['update', 'render'],
	  'built': ['build', 'destroy'],
		'attached': ['attach', 'detach']
	}),
	
	insensitive: ['dirty', 'built', 'attached'],
	
	Implements: [Options, Events, Logger],
	
	ns: 'art',
	name: 'widget',
	
	options: {
		classes: [],
		element: {
			tag: 'div'
		}
	},
	
	styles: {
		current: {},    //styles that widget currently has
		found: {},      //styles that were found in stylesheets
		given: {},      //styles that were manually assigned
		
		calculated: {}, //styles that are calculated in runtime
				
		element: {},    //styles that currently assigned to element
		paint: {},      //styles that currently used to paint
	},
	
	size: {},
	
	events: {},
	bound: {},
	
	attach: function() {
		if (!this.parent.apply(this, arguments)) return;
		this.element.addEvents(this.bound);
		return true;
	},
	
	detach: function() {
		if (!this.parent.apply(this, arguments)) return;
		this.element.removeEvents(this.bound);
		return true;
	},
	
	initialize: function(options){
		if (options) this.setOptions(options);

		this.classes = this.options.classes;
		this.pseudos = [];
		this.children = [];
		
		for (var event in this.events) this.bound[event] = this.events[event].bind(this);
		this.update();
		
		this.log('Init', this)
	},
	
	build: function() {
		if (!this.parent.apply(this, arguments)) return;
		
		var attrs = $merge(this.options.element);
		var tag = attrs.tag;
		delete attrs.tag;
		this.element = new Element(tag, attrs);
		this.element.addClass(this.ns);
		this.element.addClass(this.name);
		
		if (this.options.id) {
			this.element.addClass(this.options.id);
			//this.element.id = this.parentWidget ? this.parentWidget.name + '-' + this.options.id : this.options.id;
		}
		
		this.classes.each(function(cls) {
		  this.addClass(cls);
		}, this);
		
		this.attach();
		
		return true;
	},
	
	destroy: function() {
		if (!this.parent.apply(this, arguments)) return;
		
		this.detach();
		this.element.destroy();
		delete this.element;
		
		return true;
	},
	
	render: function(style){
		if (this.selector && this.selector != this.getSelector()) this.update();
		var s = this.parent.apply(this, arguments)
		if (!s) return; //only renders if dirty == true
		
		var found = this.lookupStyles();
		if (found) {
			for (var property in found) if (this.styles.given[property]) delete found[property];
			this.setStyles(found, true);
			this.styles.found = found;
		}
		
		$mixin(this.styles.given, style);
		this.setStyles(this.styles.given)
		
		for (var property in this.styles.element)	{
			if (!this.styles.given[property] && !this.styles.found[property]) {
				delete this.styles.current[property];
				this.resetElementStyle(property);
			}
	  }
		this.getChildren().each(function(child){
			child.render();
		});
		
		this.setHeight(this.getStyle('height'));
		this.setWidth(this.getStyle('width'));
		
		return true;
	},
	
	update: function(recursive) {
		if (recursive) {
			this.getChildren().each(function(widget) {
				widget.update(recursive);
			});
		}
		return this.parent.apply(this, arguments);
	},
	
	refresh: function(recursive) {
		this.update(recursive);
		this.render.apply(this, arguments);
	},
	
	toElement: function(){
		this.build();
		return this.element;
	},
		
	getName: function() {
		return this.getSelector();
	},
	
	onStateChange: function(state, value, args) {
	  var args = $A(arguments);
	  args.splice(1, 2); //state + args
		
		if (this.insensitive && this.insensitive.contains(state)) return;
		 
    this[value ? "setState" : "unsetState"].apply(this, args);
    this.refresh();
  },
  
	getSelector: function(){
		var selector = (this.parentWidget) ? this.parentWidget.getSelector() + ' ' : '';
		selector += this.name;
		if (this.options.id) selector += "#" + this.options.id;
		if (this.classes.length) selector += '.' + this.classes.join('.');
		if (this.pseudos.length) selector += ':' + this.pseudos.join(':');
		return selector;
	},

  setState: function(state) {
    this.addClass(state);
		this.addPseudo(state);
  },
  
  unsetState: function(state) {
    this.removeClass(state);
		this.removePseudo(state);
  },

	addPseudo: function(pseudo){
		this.pseudos.include(pseudo);
	},

	removePseudo: function(pseudo){
		this.pseudos.erase(pseudo);
	},
  
  addClass: function(name) {
    if (this.element) this.element.addClass(name);
  },
  
  removeClass: function(name) {
    if (this.element) this.element.removeClass(name);
  },
	
	setSize: function(width, height) {
		var size = {width: width,	height: height};
		$extend(this.options, size);
		this.refresh(size);
	},
	
	lookupStyles: function(selector) {
		if (!selector) selector = this.getSelector();
    if (this.selector != selector) {
			this.selector = selector;
			var result = ART.Sheet.lookup(selector);
			if (!$equals(result.rules, this.rules)) {
				this.rules = result.rules;
				for (var i in result.styles) return result.styles;
			}
		}
		return false;
	},
	
  setStyles: function(style, temp) {
		Hash.each(style, function(value, key) {
			this.setStyle(key, style[key], temp)
		}, this);
  },
	
	setStyle: function(property, value, temp) {
		if ($equals(this.styles.current[property], value)) return;
		this.styles.current[property] = value;
		
		//console.log('setStyle', property, value)
		if (!temp) this.styles.given[property] = value;
		
	  return true;
	},
	
	getStyle: function(property) {
		var value = this.styles.current[property];
		if (value == "inherit") value = this.inheritStyle(property);
		if (value == "auto") value = this.calculateStyle(property);
		return value;
	},
	
	setElementStyle: function(property, value) {
		if (Element.Styles[property] || Element.Styles.More[property]) {
			this.element.setStyle(property, value);
			this.styles.element[property] = value;
			return true;
		}	
		return false;
	},
	
	resetElementStyle: function(property) {
		this.element.setStyle(property, '');
		return true;
	},

	inheritStyle: function(property) {
		var node = this;
		var style = node.styles.current[property];
		while ((style == 'inherit' || !style) && node.parentWidget) {
			node = this.parentWidget;
			style = node.styles.current[property];
		}
		return style;
	},
	
	calculateStyle: function(property) {
		if (this.styles.calculated[property]) return this.styles.calculated[property];
		var value;
		switch (property) {
			case "height":
				value = this.getOffsetHeight();
				break;
			case "width":
				value = this.inheritStyle(property);
		}
		this.styles.calculated[property] = value;
		return value;
	},
	
	setHeight: function(value) {
		if (this.size.height == value) return;
		this.size.height = value;
		this.element.setStyle('height', value);
		return true;
	},
		
	setWidth: function(value) {
		if (this.size.width == value) return;
		this.size.width = value;
		this.element.setStyle('width', value);
		return true;
	},
	
	getOffsetHeight: function() {
		var height = this.styles.current.height;
		if (height == "auto") {
			height = 0;

			this.getChildren().each(function(widget) {
				height += widget.getOffsetHeight() || 0;
			});	
		}
		
		if (this.styles.current.paddingTop) height += this.styles.current.paddingTop
		if (this.styles.current.paddingBottom) height += this.styles.current.paddingBottom
		if (this.styles.current.borderTopWidth) height += this.styles.current.borderTopWidth
		if (this.styles.current.borderBottomWidth) height += this.styles.current.borderBottomWidth
		if (this.styles.current.strokeWidth) height += this.styles.current.strokeWidth * 2
		
		return height;
	},
	
	adopt: function(widget) {
		if (widget.options.id) {
			if (this[widget.options.id]) this[widget.options.id].dispose();
			this[widget.options.id] = widget;
		}
		this.children.push(widget);
	  widget.setParent(this);
	  $(this).adopt(widget);
	},
	
	inject: function(widget) {
	  this.parent.apply(this, arguments);
		widget.adopt(this);
		if ($type(widget) == 'element') this.render();
	},

	setParent: function(widget){
		this.parentWidget = widget;
	},

	getChildren: function() {
	  return this.children;
	},
	
	update: function() {
		if (!this.parent.apply(this, arguments)) return;
		this.styles.calculated = {};
		return true;
	}
	
});

Element.Styles.More = {
	'float': true,
	'display': true,
	'cursor': true
}

//Basic widget initialization
ART.Widget.create = function(klass, a, b, c, d) {
	if (!ART.Widget[klass]) throw new Exception.Misconfiguration(this, "ClassName ART.Widget." + klass + " was not found");
	return new ART.Widget[klass](a, b, c, d)
}

ART.Widget.Touchable = new Class({
	attach: function() {
		if (!this.parent.apply(this, arguments)) return;
		this.touch = new Touch(this.element);
		
		this.touch.addEvents({
			start: this.activate.bind(this),
			end: this.deactivate.bind(this),
			cancel: this.deactivate.bind(this)//this.fireEvent('press', e);
		});
		
		return true;
	},
	
	detach: function() {
		if (!this.parent.apply(this, arguments)) return;
		this.touch.detach();
		return true;
	}
});




Class.refactor(ART.Widget, {
	layout: false,
	
	initialize: function() {
		this.previous.apply(this, arguments);
		if (this.layout) {
			this.tree = new ART.Layout(this, this.layout);
			this.fireEvent('layout', [this.tree, this.layout])
		}
	}
});