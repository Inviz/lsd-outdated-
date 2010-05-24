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
	  'disabled': ['disable', 'enable'],
	  'orphaned': ['dispose', 'inject'],
	  'dirty': ['update', 'render'],
	  'built': ['build', 'destroy'],
		'attached': ['attach', 'detach']
	}, true),
	
	orphaned: true,
	
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
	
	initialize: function(options){
		if (options) this.setOptions(options);

		this.classes = this.options.classes;
		this.pseudos = [];
		this.children = [];
		this.update();
		
		this.log('Init', this)
	},
	
	build: Macro.onion(function() {
		var attrs = $merge(this.options.element);
		var tag = attrs.tag;
		delete attrs.tag;
		this.element = new Element(tag, attrs).store('widget', this);
		this.element.addClass(this.ns);
		this.element.addClass(this.name);
		
		if (this.options.id) {
			this.element.addClass(this.options.id);
			//this.element.id = this.parentWidget ? this.parentWidget.name + '-' + this.options.id : this.options.id;
		}
		
		this.classes.each(function(cls) {
		  this.addClass(cls);
		}, this);
		
		this.attach()
	}),
	
	destroy: Macro.onion(function() {
		this.detach();
		this.element.destroy();
		delete this.element;
	}),
	
	render: function(style){
		if (this.selector && this.selector != this.getSelector()) this.update();
		if (!this.parent.apply(this, arguments)) return; //only renders if dirty == true
	  
  	var size = this.size;
		var found = this.lookupStyles();
		if (found) {
			for (var property in found) if (property in this.styles.given) delete found[property];
			this.setStyles(found, true);
			this.styles.found = found;
		}
		
		$extend(this.styles.given, style);
		this.setStyles(this.styles.given)
		for (var property in this.styles.element)	{
			if (!(property in this.styles.given) && !(property in this.styles.found) && !(property in this.styles.calculated)) {
				delete this.styles.current[property];
				this.resetElementStyle(property);
			}
	  }
		this.getChildren().each(function(child){
			child.render();
		});
		
		var newSize = {height: this.getStyle('height'), width: this.getStyle('width')};
		this.size = newSize
		if (true) {
      if (size.height != newSize.height) this.setHeight(newSize.height, true);
      if (size.width != newSize.width) this.setWidth(newSize.width, true);
		  this.fireEvent('resize', [newSize, size])
		}
    
		return true;
	},
	
	
	update: function(recursive) {
		if (recursive) {
			this.getChildren().each(function(widget) {
				widget.update(recursive);
			});
		}
		if (!this.parent.apply(this, arguments)) return;
		this.styles.calculated = {};
		this.styles.last = {};
		return true;
	},
	
	refresh: function(recursive) {
		this.update(recursive);
		return this.render();
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
    return true;
  },
  
	getSelector: function(){
		var selector = (this.parentWidget) ? this.parentWidget.getSelector() + ' ' : '';
		selector += this.name;
		if (this.options.id) selector += "#" + this.options.id;
		if (this.classes.length) selector += '.' + this.classes.join('.');
		if (this.pseudos.length) selector += ':' + this.pseudos.join(':');
		if (this.attributes) for (var name in this.attributes) selector += '[' + name + '=' + this.attributes[name] + ']';
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
	
	adopt: function(widget) {
		if (widget.options.id) {
			if (this[widget.options.id]) this[widget.options.id].dispose();
			this[widget.options.id] = widget;
		}
		this.children.push(widget);
	  widget.setParent(this);
	  $(this).adopt(widget);
		this.fireEvent('adopt', [widget, widget.options.id])
		
	  var parent = widget;
	  while (parent = parent.parentWidget) parent.fireEvent('hello', widget)
	},
	
	inject: Macro.onion(function(widget) {
		widget.adopt(this);
		this.fireEvent('inject', widget)
		if (widget instanceof Element) this.render();
	}),

	setParent: function(widget){
		this.parentWidget = widget;
	},

  getRoot: function() {
    var widget = this;
    while (widget = widget.parentWidget);
    if (widget) return widget;
    return null;
  },
  
	getChildren: function() {
	  return this.children;
	},
	
	getWrapper: function() {
	  return this.wrapper || this.element;
	},
	
	onWidgetReady: function(callback) {
	  var onReady = function() {
	    callback.call(this);
	  }.bind(this)
	  if (!this.orphaned) {
	    onReady();
	  } else {
	    var event = function() {
	      var redraw = function() {
  	      this.removeEvent('redraw', redraw);
  	      onReady();
	      }.bind(this)
	      this.addEvent('redraw', redraw)
	      this.removeEvent('inject', event);
	    }.bind(this);
	    this.addEvent('inject', event);
	  }
	},
	
	onDOMInject: function(callback) {
	  var parent = this;
	  while (parent.parentWidget) parent = parent.parentWidget;
	  parent.addEvent('inject', callback);
	},
	
	addAction: function(options) {
	  this.addEvents({
	    enable:  options.enable.bind(this),
	    attach:  options.enable.bind(this),
	    disable: options.disable.bind(this),
	    detach:  options.disable.bind(this)
	  });
	  this.onWidgetReady(function() {
	    if (!this.disabled) options.enable.call(this);
	  });
	  return true;
	},
	
	onChange: function() {
	  this.fireEvent('change', arguments)
	  return true;
	}
	
});

Element.Styles.More = {
	'float': true,
	'display': true,
	'clear': true,
	'cursor': true,
	'verticalAlign': true,
	'textAlign': true
}

//Basic widget initialization
ART.Widget.create = function(klasses, a, b, c, d) {
  klasses = $splat(klasses);
  var base = ART.Widget;
  var klass = klasses.shift();
  
  if (klass.indexOf('-') > -1) { 
    var bits = klass.split('-');
    while (bits.length > 1) base = base[bits.shift().camelCase().capitalize()];
    klass = bits.join('-');
  }
  klass = klass.camelCase().capitalize()
	if (!base[klass]) throw new Exception.Misconfiguration(this, "ClassName ART.Widget." + klass + " was not found");
	var widget = base[klass];
	if (klasses.length) {
  	klasses = klasses.map(function(name) {
  	  return ART.Widget.Traits[name.camelCase().capitalize()]
  	});
  	widget = Class.inherit.apply(Class, [widget].concat(klasses));
  }
	
	return new widget(a, b, c, d)
}



ART.Widget.Base = Class.inherit(ART.Widget);
ART.Widget.Modules = {};
ART.Widget.Traits = {};
ART.Widget.Cache = {};
ART.Widget.ignoredEvents = [];