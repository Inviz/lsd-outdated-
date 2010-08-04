if (!ART.Widget) ART.Widget = {};
ART.Widget.Base = new Class({
  Extends: Widget.Base,
	
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
		
	getName: function() {
		return this.getSelector();
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

	addPseudo: function(pseudo){
		this.pseudos.include(pseudo);
	},

	removePseudo: function(pseudo){
		this.pseudos.erase(pseudo);
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
	
	walk: function(callback) {
	  callback(this);
	  this.children.each(function(child) {
	    child.walk(callback)
	  });
	},
	
	collect: function(callback) {
	  var result = [];
	  this.walk(function(child) {
	    if (callback(child)) result.push(child);
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


	setParent: function(widget){
		this.parentWidget = widget;
	},
  
	getChildren: function() {
	  return this.children;
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

ART.Widget.Module = {};
ART.Widget.Trait = $mixin(Widget.Trait);

ART.Widget.Ignore = $mixin(Widget.Ignore);