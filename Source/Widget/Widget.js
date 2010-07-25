/*
Script: ART.Widget.js

License:
	MIT-style license.
*/

// Base widget class.

ART.Widget = new Class({
	Includes: Widget.Stateful({
	  'hidden': ['hide', 'show'],
	  'active': ['activate', 'deactivate'],
	  'focused': ['focus', 'blur'],
	  'disabled': ['disable', 'enable'],
	  'dirty': ['update', 'render'],
	  'built': ['build', 'destroy'],
		'attached': ['attach', 'detach']
	}),
	
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

		this.classes = (this.classes || []).concat(this.options.classes);
		if (!this.attributes) this.attributes = {};
		for (var attribute in this.options.attributes) {
		  if (!ART.Widget.Ignore.attributes[attribute]) this.attributes[attribute] = this.options.attributes[attribute];
		}
		this.pseudos = [];
		this.children = [];
		this.update();
	  this.offset = {
      paint: {},
      total: {},
      inside: {},
      padding: {},
      margin: {}
    }
		
		//this.log('Init', this)
	},
	
	build: Macro.onion(function() {
		var attrs = $unlink(this.options.element);
		var tag = attrs.tag;
		delete attrs.tag;
		this.element = new Element(tag, attrs).store('widget', this);
		this.element.addClass(this.ns);
		this.element.addClass(this.name);
		//this.element.addClass('tag-' + this.name);
		
		if (this.options.id) this.element.addClass('id-' + this.options.id);
		
		if (this.classes) this.classes.each(function(cls) {
		  this.addClass(cls);
		}, this);
		
		if (this.attributes) 
		  for (var name in this.attributes) 
		    if (name != 'width' && name != 'height') 
		      this.element.setAttribute(name, this.attributes[name]);
		      
		this.attach()
	}),
	
	destroy: Macro.onion(function() {
		this.detach();
		this.element.destroy();
		delete this.element;
	}),
	
	walk: function(callback) {
	  callback(this);
		this.getChildren().each(function(child){
			child.walk(callback);
		});
	},
	
	collect: function(fn) {
	  var result = []
	  this.walk(function(child) {
	    if (fn(child)) result.push(child)
	  });
	  return result;	  
	},
	
	render: function(style){
		if (this.selector && this.selector != this.getSelector()) this.update();
		if (!this.parent.apply(this, arguments)) return; //only renders if dirty == true
	  delete this.halted;
	  
  	var size = this.size;
  	if (this.findStyles() || style) this.renderStyles(style);
		this.walk(function(child){
			child.render();
		});
		if (size) {
  	  var newSize = {height: this.getStyle('height'), width: this.getStyle('width')};
  	  if (size.height != newSize.height) this.setHeight(newSize.height, true);
      if (size.width != newSize.width) this.setWidth(newSize.width, true);
  	  this.fireEvent('resize', [newSize, size])
		}
    
		return true;
	},
	
	//halt render process	
	halt: function() {
	  if (this.halted) return false;
	  //console.info('halted', this.getSelector(), $A(arguments))
	  this.halted = true;
	  return true;
	},
	
	update: function(recursive) {
		if (recursive) {
			this.walk(function(widget) {
				widget.update();
			});
		}
		if (!this.parent.apply(this, arguments)) return;
		this.style.calculated = {};
		this.style.computed = {};
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
		
		if (ART.Widget.Ignore.states[state]) return;
    this[value ? "setState" : "unsetState"].apply(this, args);
    if (this.redraws > 0) this.refresh();
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
    this.addClass('is-' + state);
		this.addPseudo(state);
  },
  
  unsetState: function(state) {
    this.removeClass('is-' + state);
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
	
	inject: function(widget, quiet) {
		widget.adopt(this);
		var element = $(widget);
		this.parentNode = element;
		this.fireEvent('inject', arguments);
		this.fireEvent('afterInject', arguments);
		if ((element == widget) && (quiet !== true)) {
		  var postponed = false
    	this.render();
		  this.walk(function(child) {
		    if (child.postponed) {
		      postponed = true;
		      child.update();
		    }
		    child.fireEvent('dominject', element)
		    child.dominjected = true;
		  });
		  if (postponed && !this.dirty) this.dirty = true;
    	this.render();
		}
	},
	
	dispose: function() {
	  this.element.dispose();
	},

	setParent: function(widget){
		this.parentWidget = widget;
	},
  
	getChildren: function() {
	  return this.children;
	},
	
	getWrapper: function() {
	  return this.wrapper || this.element;
	},
	
	onWidgetReady: function(callback) {
	  this.onDOMInject(callback.bind(this))
	},

  getRoot: function() {
    var widget = this;
    while (widget.parentWidget) widget = widget.parentWidget;
    return widget;
  },
	
	onDOMInject: function(callback) {
	  var root = this.getRoot();
	  if (!root.parentWidget && root.parentNode) callback(root) 
	  else this.addEvent('dominject', callback)
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

//Basic widget initialization
ART.Widget.count = 0;
ART.Widget.create = function(klasses, a, b, c, d) {
  klasses = $splat(klasses);
  var base = ART.Widget;
  var klass = klasses.shift();
  var original = klass;
  if (klass.indexOf('-') > -1) { 
    var bits = klass.split('-');
    while (bits.length > 1) base = base[bits.shift().camelCase().capitalize()];
    klass = bits.join('-');
  }
  klass = klass.camelCase().capitalize()
	if (!base[klass]) {
	  original = original.replace(/-(.)/g, function(whole, bit) {
	    return '.' + bit.toUpperCase();
	  }).capitalize();
	  throw new Exception.Misconfiguration(this, "ClassName ART.Widget." + original + " was not found");
	}
	var widget = base[klass];
	if (klasses.length) {
  	klasses = klasses.map(function(name) {
  	  return $type(name) == 'string' ? ART.Widget.Trait[name.camelCase().capitalize()] : name;
  	});
  	widget = Class.include(widget, klasses)
  }
	ART.Widget.count++;
	return new widget(a, b, c, d)
}



Element.Styles.More = new ART.Hash('float', 'display', 'clear', 'cursor', 'verticalAlign', 'textAlign');

ART.Widget.Base = new Class({
  Extends: ART.Widget
});
ART.Widget.Module = {};
ART.Widget.Trait = {};

ART.Widget.Ignore = {};
['events', 'states', 'attributes', 'styles'].each(function(type) {
  ART.Widget.Ignore[type] = new ART.Hash
});

ART.Widget.Ignore.states.push('dirty', 'built', 'attached');