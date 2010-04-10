ART.Widget.Traits = {};

ART.Widget.Traits.Expression = new Class({
	expression: false,
	
	applyExpression: function(expression) {
	  var parsed = SubtleSlickParse(expression)[0][0];
	  if (parsed.classes) {
	    this.classes = this.classes.concat(parsed.classes);
	    parsed.classes.each(function(cls) {
	      this.addClass(cls)
	    }, this)
	  }
	  
	  if (parsed.attributes) {
	    var options = {id: parsed.id};
  		if (parsed.attributes) parsed.attributes.each(function(attribute) {
  			options[attribute.name] = attribute.value || true;
  		});
  		$extend(this.options, options);
	  }
	  this.fireEvent('expression', [parsed, expression]);
	}
});

ART.Widget.Traits.Layered = new Class({

  layers: {},

  build: function() {
    if (!this.parent.apply(this, arguments)) return;
    if (this.layered) {
      for (var name in this.layered) {
        this.layers[name] = this.getLayer.apply(this, this.layered[name]);
      }
    }
    return true;
  },

  getLayer: function() {
    var args = Array.link($splat(arguments), {name: String.type, options: Object.type, properties: Array.type, render: Function.type, klass: Class.type});
    var instance = new (args.klass || ART[args.name.capitalize()]);
    this.addEvent('redraw', function() {
      var properties = (instance.properties || []).concat(args.properties)
      var style = this.getChangedStyles.apply(this, properties);
      if (style) (args.render || instance.paint).apply(instance, Hash.getValues(style));
    });
    return instance;  
  }
});


ART.Widget.Traits.Layout = new Class({
	layout: false,
	
	setLayout: function(layout) {
	  this.layout = layout;
		this.tree = this.applyLayout(layout);
		this.fireEvent('layout', [this.tree, this.layout])
	},
	
	applyLayout: function(layout) {
	  return new ART.Layout(this, layout)
	}
});


ART.Widget.Traits.Events = new Class({

  events: {
    element: {},
    self: {
      'inject': function(widget) {
        if (widget instanceof ART.Widget) widget.addEvents(this.events.parent);
      },    
      'dispose': function(widget) {
        if (widget instanceof ART.Widget) widget.removeEvents(this.events.parent);
      }
    },
    parent: {}
  },
  
	
	attach: function(element) {
		if (!this.parent.apply(this, arguments)) return;
    this.addEvents(this.events.self);
		(element || this.element).addEvents(this.events.element);
		return true;
	},
	
	detach: function(element) {
		if (!this.parent.apply(this, arguments)) return;
		(element || this.element).removeEvents(this.events.element);
		return true;
	},
	
  build: function() {
    if (!this.built) this.addEvents(this.events.self)
    return this.parent.apply(this, arguments);
  }
})

ART.Widget.Base = new Class({
  Extends: Class.inherit(
    ART.Widget.Base, 
    ART.Widget.Traits.Layered, 
    ART.Widget.Traits.Layout,
    ART.Widget.Traits.Events, 
    ART.Widget.Traits.Expression
  ),
  
  initialize: function() {
    this.parent.apply(this, arguments);
		for (var type in this.events) {
		  var events = this.events[type];
		  for (var name in events) {
		    if (String.type(events[name])) {
		      var method = this[events[name]];
		      if (!method) this.log('Cannot bind ' +  events);
		      events[name] = method.bind(this)
		    }
		  }
		}
		if (this.expression) this.applyExpression(this.expression);
		if (this.layout) this.setLayout(this.layout);
  }
});


ART.Widget.Traits.Touchable = new Class({
  
	attach: function() {
		if (!this.parent.apply(this, arguments)) return;
		if (!this.disabled) this.getTouch();
		return true;
	},
	
	getTouch: function() {
	  if (!this.touch) {
	    this.touch = new Touch(this.element);
		
  		this.touch.addEvents({
  			start: this.activate.bind(this),
  			end: this.deactivate.bind(this),
  			cancel: this.deactivate.bind(this)//this.fireEvent('press', e);
  		});
  	}
  	return this.touch;
	},
	
	disable: function() {
		if (!this.parent.apply(this, arguments)) return;
	  if (this.touch) this.touch.detach();
	  return true;
	},
	
	enable: function() {
		if (!this.parent.apply(this, arguments)) return;
	  this.getTouch().attach();
	  return true;
	},
	
	detach: function() {
		if (!this.parent.apply(this, arguments)) return;
		if (this.touch) this.touch.detach();
		return true;
	}
});



ART.Widget.Traits.HasSlider = new Class({
  
  options: {
    slider: {
      
    },
    mode: 'horizontal'
  },
  
  events: {
    parent: {
      resize: 'onParentResize'
    }
  },
  
  onParentResize: function(current, old) {
    this.adaptSize(current, old);
    this.getSlider(true);
  },
  
  adaptSize: function(current, old) {
    var prop = this.options.mode == 'vertical' ? 'height' : 'width';
    if (current[prop] != old[prop]) this.setStyle(prop, this.parentWidget.getStyle(prop) - this.getStyle(prop));
  },
	
	getSlider: function(regenerate) {
	  if (this.slider && regenerate) {
	    this.getSlider().detach();
	    delete this.slider; 
	  }
	  if (!this.slider) {
	    this.slider = new Slider(this.getTrack(), this.getTrackThumb(), $merge(this.options.slider, {
	      mode: this.options.mode
    	})).set(50)
	  }
	  return this.slider;
	},
	
	getTrack: function() {
	  return $(this)
	},
	
	getTrackThumb: function() {
	  return $(this.thumb);
	}
	
})
