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
	
	styles: {
		current: {},    //styles that widget currently has
		last: {},       //styles that were rendered last frame
		found: {},      //styles that were found in stylesheets
		given: {},      //styles that were manually assigned
		
		calculated: {}, //styles that are calculated in runtime
		
		element: {},    //styles that are currently assigned to element
		paint: {},      //styles that are currently used to paint
	},
	
	size: {},
	
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
		for (var key in style) this.setStyle(key, style[key], temp)
  },
	
	setStyle: function(property, value, type) {
		if ($equals(this.styles.current[property], value)) return;
		this.styles.current[property] = value;
		switch (type) {
			case undefined:
				this.styles.given[property] = value;
				break;
			case "calculated": 
			case "given": 
				this.styles[type][property] = value;
				break;
		} 
		
	  return true;
	},
	
	getStyle: function(property) {
		var value = this.styles.current[property];
		if (value == "inherit") value = this.inheritStyle(property);
		if (value == "auto") value = this.calculateStyle(property);
		return value;
	},
	
	getStyles: function(properties) {
	  var result = {};
	  for (var i = 0, property; property = arguments[i++];) result[property] = this.getStyle(property);
	  return result;
	},

  getChangedStyles: function(property) {
    var styles = this.getStyles.apply(this, arguments);
    //var last = this.styles.last;
    //if (Hash.every(styles, function(value, key) { return $equals(last[key], value) }.bind(this))) return false;
    //$extend(this.styles.last, styles);
    return styles;
  },
	
	setElementStyle: function(property, value) {
		if (Element.Styles[property] || Element.Styles.More[property]) {
			if (this.styles.element[property] !== value) this.element.setStyle(property, value);
			this.styles.element[property] = value;
			return true;
		}	
		return false;
	},
	
	resetElementStyle: function(property) {
		this.element.setStyle(property, '');
		delete this.styles.element[property]
		return true;
	},

	inheritStyle: function(property) {
		var node = this;
		var style = node.styles.current[property];
		while ((style == 'inherit' || !style) && node.parentWidget) {
			node = node.parentWidget;
			style = node.styles.current[property];
		}
		return style;
	},
	
	calculateStyle: function(property) {
		if (this.styles.calculated[property]) return this.styles.calculated[property];
		var value;
		switch (property) {
			case "height":
				value = this.getClientHeight();
				break;
			case "width":
				value = this.inheritStyle(property);
				var el = this.element;
				//while (el = el.getParent()) console.log(el)
				if (value == "auto") value = this.getClientWidth();
				//if scrollWidth value is zero, then the widget is not in DOM yet
				//so we wait until the root widget is injected, and then try to repeat
				if (value == 0) {
				  var redraw = function() {
				    this.removeEvent('redraw', redraw)
				    this.update(true);
				  }.bind(this);
				  this.onDOMInject(redraw);
				}
		}
		this.styles.calculated[property] = value;
		return value;
	},
	
	setHeight: function(value, light) {
	  value = Math.max(this.styles.current.minHeight || 0, value);
		if (!light && (this.size.height == value)) return;
		this.size.height = value;
		if (!light) this.setStyle('height', value);
		return true;
	},
		
	setWidth: function(value, light) {
		if (this.size.width == value) return;
		this.size.width = value;
		if (!light) this.setStyle('width', value);
		return true;
	},
	
	getClientHeight: function() {
	  var height = this.styles.current.height;
	  var auto = height == "auto";
  	if (!height || auto) {
  	  height = this.element.offsetHeight;
  	  if (height > 0) height -= ((this.offset.total.top || 0) + (this.offset.total.bottom || 0))
			//height = 0;
      //var heights = [height]
      //this.getChildren().each(function(widget) {
			//  var value = widget.getOffsetHeight();
			//  var styles = widget.getStyles('float', 'clear');
			//  if (!value) return;
			//  if (styles.clear && (styles.clear != 'none')) heights = [heights[0] + (heights.length > 1 ? Math.max.apply(Math, heights.slice(1, heights.length)) : 0)]
			//  if (styles.float && (styles.float != 'auto')) {
			//    heights.push(value)
			//  } else {
			//    heights[0] += value;
			//  }
			//  console.info(widget.getSelector(), heights)
			//});  
			//height = heights[0] + (heights.length > 1 ? Math.max.apply(Math, heights.slice(1, heights.length)) : 0)
		}
  		height += this.styles.current.paddingTop || 0;
  		height += this.styles.current.paddingBottom || 0;
		return height;
	},
	
	getClientWidth: function() {
	  var width = this.element.scrollWidth;
	  if (width > 0) {
	    var parent = this.parentWidget;
	    if (this.styles.current.width == "auto" && this.styles.current.display != "block") width -= ((this.offset.padding.left || 0) + (this.offset.padding.right || 0)) 
	    width -= ((this.offset.paint.left || 0) + (this.offset.paint.right || 0)) 
	  }
		return width;
	},
	
	getOffsetHeight: function() {
		var height = this.getClientHeight();
		height += (this.styles.current.strokeWidth || 0) * 2
		height += this.styles.current.borderBottomWidth || 0;
		height += this.styles.current.borderTopWidth || 0;
		return height;
	},
	
	getOffsetWidth: function() {
		var width = this.getClientWidth();
		width += (this.styles.current.strokeWidth || 0) * 2
		width += this.styles.current.borderLeftWidth || 0;
		width += this.styles.current.borderBottomWidth || 0;
		return width;
	},
	
	getLayoutHeight: function() {
		var height = this.getOffsetHeight();
		height += ((this.offset.total.top || 0) - (this.offset.padding.top || 0));
		height += ((this.offset.total.bottom || 0) - (this.offset.padding.bottom || 0));
		return height;
	},

	getLayoutWidth: function() {
		var width = this.getOffsetWidth();
		width += ((this.offset.padding.left || 0) + (this.styles.current.marginLeft || 0));
		width += ((this.offset.padding.right || 0) + (this.styles.current.marginRight || 0));
		return width;
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
	
	inject: function(widget) {
	  if (!this.parent.apply(this, arguments)) return;
		widget.adopt(this);
		this.fireEvent('inject', widget)
		if (widget instanceof Element) this.render();
		return true;
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
    base = base[bits.shift().camelCase().capitalize()];
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