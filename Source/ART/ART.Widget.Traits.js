ART.Widget.Traits = {};

ART.Widget.Traits.Expression = new Class({
	expression: false,
	
	applyExpression: function(expression) {
	  var parsed = SubtleSlickParse(expression)[0][0];
	  if (parsed.classes) {
	    this.classes.push.apply(this.classes, parsed.classes);
	    parsed.classes.each(function(cls) {
	      this.addClass(cls)
	    }, this)
	  }
	  
	  var options = {};
	  if (parsed.id) options.id = parsed.id;
	  if (parsed.attributes) {
  		if (parsed.attributes) parsed.attributes.each(function(attribute) {
  			options[attribute.name] = attribute.value || true;
  		});
	  }  
  	if (parsed.attributes || parsed.id) $extend(this.options, options);
	  this.fireEvent('expression', [parsed, expression]);
	}
});

ART.Widget.Traits.Aware = new Class({
  
  use: function() {
    var selectors = $A(arguments);
    var callback = selectors.getLast().call ? selectors.pop() : $empty;
    var resolved = [];
    var remove = function(selector, widget) {
      selectors.erase(selector);
      resolved.push(widget);
      if (selectors.length == 0) callback.apply(this, resolved);
    }.bind(this);
    selectors.each(function(selector) {
      var check = function(widget) {
        if (ART.Sheet.match(widget.getSelector(), selector)) widget.onWidgetReady(function() { 
          remove(selector, widget)
        });
      };
      (this.descendants || []).each(check);
      this.addEvent('hello', check);
    }, this)
  },
  
  attach: Macro.onion(function() {
    this.descendants = [];
    this.addEvent('hello', function(widget) {
      this.descendants.push(widget)
    }.bind(this));
  })
  
});


ART.Widget.Traits.Layered = new Class({

  layers: {},

  build: Macro.onion(function() {
    if (this.layered) {
      for (var name in this.layered) {
        this.layers[name] = this.getLayer.apply(this, this.layered[name]);
      }
    }
  }),

  getLayer: function() {
    var args = Array.link($splat(arguments), {name: String.type, options: Object.type, properties: Array.type, render: Function.type, klass: Class.type});
    var instance = new (args.klass || ART[args.name.camelCase().capitalize()]);
    var injected = false;
    this.addEvent('redraw', function() {
      var properties = (instance.properties || []).concat(args.properties)
      var style = this.getChangedStyles.apply(this, properties);
      if (style) {
        var value = (args.render || instance.paint).apply(instance, Hash.getValues(style));
        var stop = (value === false);
        if (!stop) {
          if (injected) return;
          this.paint.grab(instance);
          injected = true;
        } else{
          if (!injected) return;
          instance.eject();
          injected = false;
        }
      }
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


(function(addEvents, removeEvents) {

  ART.Widget.Traits.Events = new Class({

    events: {
      element: {},
      self: {
        'inject': function(widget) {
          if (widget instanceof ART.Widget) widget.addEvents(this.bindEvents(this.events.parent));
        },    
        'dispose': function(widget) {
          if (widget instanceof ART.Widget) widget.removeEvents(this.bindEvents(this.events.parent));
        }
      },
      parent: {}
    },
  	
  	addEvents: function(events) {
  	  if (events) {
  	    for (var i in events) { 
  	      if (events[i].call) { //stick to old behaviour when key: function object is passed
  	        addEvents.call(this, events);
  	      } else {
  	        this.addWidgetEvents(events);
  	      };  
  	      break;
  	    }
  	  }
  		return events;
  	},
  	
  	addWidgetEvents: function(events) {
  	  events = this.bindEvents($merge(events));
      addEvents.call(this, events.self);
  		this.element.addEvents(events.element);
  		return events;
  	},
	
  	removeEvents: function(events) {
  	  events = this.bindEvents($merge(events));
  	  console.info(events)
      removeEvents.call(this, events.self);
  		this.element.removeEvents(events.element);
  		return events;
  	},
  	
  	bindEvents: function(tree) {
      if (!tree || tree.call) return tree;
      if (!this.$bound) this.$bound = {}
      if (tree.indexOf) {
        if (!this.$bound[tree]) {
          if (!this[tree]) throw new Exception.Misconfiguration(this, "Cant find a method to bind " + tree + " on " + this.getSelector());
          this.$bound[tree] = this[tree].bind(this);
        }
        return this.$bound[tree];
      }
      for (var i in tree) tree[i] = this.bindEvents(tree[i]);
      return tree;
  	},

  	attach: Macro.onion(function() {
  		this.addEvents(this.events);
  	}),

  	detach: Macro.onion(function() {
  	  this.removeEvents(this.events);
  	})
  });

})(Events.prototype.addEvents, Events.prototype.removeEvents);

(function() {
  
var ignored = ['self', 'element', 'parent', 'dragger', 'resizer', 'hover', 'slider', 'outer', 'menu', 'observer', 'input', 'accessibility'];

ART.Widget.Traits.LayoutEvents = new Class({
  
  addEvents: Macro.onion(function(events) {
    this.attachLayoutEvents(this.parent.apply(this, arguments));
  }),
  
  attachLayoutEvents: function(events) {
		var callbacks = {};
		var walk = function(tree, prefix) {
		  if (!prefix) prefix = '';
  		for (var type in tree) {
  		  var event = tree[type];
  		  if (ignored.contains(type)) continue;
  		  if (event.call) {
  		    if (!prefix) continue;
  		    if (!callbacks[prefix]) callbacks[prefix] = {};
  		    callbacks[prefix][type] = event;
		    } else {
    		  walk(tree[type], ((prefix.length ? (prefix + ' ') : '') + '#' + type)); 
		    }
		  }
		}.bind(this);
		walk(this.bindEvents(events));
	  Hash.each(callbacks, function(events, selector) {
  	  this.use(selector, function(widget) {
  	    widget.addEvents(events);
  	  }.bind(this))
	  }, this);
  }
});


})();

ART.Widget.Base = new Class({
  Extends: Class.inherit(
    ART.Widget.Base, 
    ART.Widget.Traits.Layered, 
    ART.Widget.Traits.Layout,
    ART.Widget.Traits.Events, 
    ART.Widget.Traits.LayoutEvents,
    ART.Widget.Traits.Expression
  ),
  
  initialize: function() {
    this.parent.apply(this, arguments);
		if (this.expression) this.applyExpression(this.expression);
		if (this.layout) this.setLayout(this.layout);
  }
});


ART.Widget.Traits.Hoverable = new Class({
  Extends: Widget.Stateful({
    'hover': ['mouseenter', 'mouseleave']
  }),
  
  events: {
    hover: {
      element: {
        mouseenter: 'mouseenter',
        mouseleave: 'mouseleave'
      }
    }
  },
  
  
	attach: Macro.onion(function(){
		this.addAction({
		  enable: function() {
      	this.addEvents(this.events.hover);
  	  },
  	  
  	  disable: function() {
    	  this.removeEvents(this.events.hover);
  		}
  	})
	}),
});

ART.Widget.Traits.Touchable = new Class({
  options: {
    touch: {}
  },
  
	attach: Macro.onion(function(){
		this.addAction({
		  enable: function() {
      	this.getTouch().attach();
  	  },
  	  
  	  disable: function() {
    	  if (this.touch) this.touch.detach();
  		}
  	})
	}),
	
	getTouch: Macro.setter('touch', function() {
	  var touch = new Touch(this.element, this.options.touch);
	  touch.addEvents({
			start: this.activate.bind(this),
			end: this.deactivate.bind(this),
			cancel: this.deactivate.bind(this)//this.fireEvent('press', e);
		});
		return touch;
	})
});

ART.Widget.Traits.Resizable = new Class({
  Extends: Widget.Stateful({
    'resized': ['transform', 'finalize']
  }),

  options: {
    resizer: {
      modifiers: {
        x: 'width',
        y: 'height'
      },
      snap: false,
      style: false,
      container: true,
      limit: {
        x: [0, 3000],
        y: [0, 3000]
      }
    }
  },
  
  events: {
    resizer: {}
  },
  
  getResizer: Macro.setter('resizer', function() {
    var resized = this.getResized();
    var element = $(resized);
    resized.addEvent('resize', function(size) {
      $extend(element, size);
    });
    element.width  = resized.getStyle('width');
    element.height = resized.getStyle('height');
    var resizer = new Drag(element, $merge({
      handle: this.getHandle()
    }, this.options.resizer));
    resizer.addEvents(this.events.resizer);
    resizer.addEvents({
      'start': this.onResizeStart.bind(this),
      'complete': this.onResizeComplete.bind(this),
      'cancel': this.onResizeComplete.bind(this),
      'drag': this.onResize.bind(this)
    }, true);
    return resizer;
  }),
  
	build: Macro.onion(function() {
		this.use('#handle', '#content', function() {
  		this.addAction({
  		  enable: function() {
        	this.getResizer().attach();
    	  },

    	  disable: function() {
      	  if (this.resizer) this.resizer.detach();
    		}
    	});
    	
    	if (this.options.resizer.container) {
    	  this.content.addEvent('resize', this.checkOverflow.bind(this));
      }
		})
	}),
	
	checkOverflow: function(size) {
	  if (!this.resizer) return;
    if (!this.resizer.container) this.resizer.container = this.element;
    var resized = this.getResized();
    if (!size) size = {width: $(resized).width}
    var width = this.resizer.container.offsetWidth - this.offset.total.left - this.offset.total.right;
    var self = arguments.callee;  
    if (size.width < width) {
      if (!$chk(self.limit)) self.limit = this.resizer.options.limit.x[0];
      this.resizer.setMinX(width);
      resized.setWidth(width);
      if (resized.horizontal) resized.horizontal.adaptToSize()
      resized.refresh(true);
      $clear(self.delay);
      self.delay = (function() { //reset limit options in one second
        this.resizer.setMinX(self.limit);
      }).delay(1000, this);
    }
	},
	
	onResizeStart: function() {
	  this.transform.apply(this, arguments);
	},
	
	onResizeComplete: function() {
	  this.finalize.apply(this, arguments);
	},
	
	onResize: function() {
	  this.content.setHeight(this.resizer.value.now.y);
	  this.content.setWidth(this.resizer.value.now.x);
	  if (this.options.resizer.container) this.checkOverflow();
	  this.update(true);
	  this.render();
	},
	
	getHandle: Macro.defaults(function() {
	  return this.handle;
	}),

	getResized: Macro.defaults(function() {
	  return this;
	})
});

ART.Widget.Traits.Draggable = new Class({
  Extends: Widget.Stateful({
    'dragged': ['drag', 'drop']
  }),
  
  options: {
    dragger: {
      modifiers: {
        x: 'left',
        y: 'top'
      },
      snap: false,
      style: false,
      container: true,
      limit: {
        x: [0, 3000],
        y: [0, 3000]
      }
    }
  },
  
  position: 'absolute',
  
  events: {
    dragger: {}
  },
  
  getDragger: Macro.setter('dragger', function() {
    var dragged = this.getDragged();
    var element = $(dragged);
    this.onDOMInject(function() {
      var position = element.getPosition();
      element.left = position.x - element.getStyle('margin-left').toInt();
      element.top = position.y - element.getStyle('margin-top').toInt();
    }.create({delay: 50}));
    var dragger = new Drag(element, $merge({
      handle: $(this.getDragHandle())
    }, this.options.dragger));
    dragger.addEvents(this.events.dragger);
    dragger.addEvents({
      'start': this.onDragStart.bind(this),
      'complete': this.onDragComplete.bind(this),
      'cancel': this.onDragComplete.bind(this),
      'drag': this.onDrag.bind(this)
    }, true);
    return dragger;
  }),
  
	build: Macro.onion(function() {
		this.use('#title', '#content', function() {
  		this.addAction({
  		  enable: function() {
        	this.getDragger().attach();
    	  },

    	  disable: function() {
      	  if (this.dragger) this.dragger.detach();
    		}
    	})
		})
	}),

	onDragStart: function() {
	  this.drag.apply(this, arguments);
	},
	
	onDragComplete: function() {
	  this.drop.apply(this, arguments);
	},
	
	onDrag: function() {
	  this.setStyle('top', this.dragger.value.now.y);
	  this.setStyle('left', this.dragger.value.now.x);
	},
	
	getDragHandle: Macro.defaults(function() {
	  return this.header.title;
	}),

	getDragged: Macro.defaults(function() {
	  return this;
	})
});


ART.Widget.Traits.ResizableContainer = new Class({
  getResized: function() {
    return this.content;
  },
  
  getScrolled: function() {
    return this.content.wrapper || this.content
  }
});

ART.Widget.Traits.Fitting = new Class({
  fit: function() {
    var element = $(this.content.getContainer());
    var display = element.getStyle('display');
    element.setStyle('display', 'inline-block');
    var width = element.offsetWidth;
    var height = element.offsetHeight;
    this.content.setWidth(width);
    this.content.setHeight(height);
    if (this.resizer) {
      this.resizer.setMaxX(width);
      this.resizer.setMaxY(height);
    }
    element.setStyle('display', display)
    this.refresh(true)
  }
});

//Widgets take no space
ART.Widget.Traits.Shy = new Class({
  attach: Macro.onion(function() {
    this.addEvent(this.paint ? 'redraw' : 'render', function(size) {
      this.element.setStyle('margin-' + (this.styles.current['float'] == 'right' ? 'left' : 'right'), - this.element.scrollWidth)
      //this.element.setStyle('margin-top', - size.height)
    }.bind(this))
  })
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
    },
    slider: {
      
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
    	})).set(50);
    	this.slider.addEvent('change', this.onSet.bind(this));
    	this.slider.addEvents(this.events.slider)
	  }
	  return this.slider;
	},
	
	onSet: function() {
	  if (Class.hasParent(arguments)) return this.parent.apply(this, arguments);
	},
	
	getTrack: Macro.defaults(function() {
	  return $(this)
	}),
	
	getTrackThumb: Macro.defaults(function() {
	  return $(this.thumb);
	})
	
});

ART.Widget.Traits.HasInput = new Class({
  options: {
    input: {}
  },
  
  events: {
    input: {}
  },
	
	
	attach: Macro.onion(function() {
	  this.getInput().addEvents({
	    blur: this.blur.bind(this),
	    focus: this.focus.bind(this)
	  }).addEvents(this.events.input);
	  this.addEvent('resize', this.setInputSize.bind(this))
	}),
	
  build: Macro.onion(function() {
    this.getInput().inject(this.element);
  }),
  
  getInput: Macro.setter('input', function() {
    return new Element('input', $extend({'type': 'text'}, this.options.input));
  }),
  
  setInputSize: function(size) {
    var height = size.height - this.input.getStyle('padding-top').toInt() - this.input.getStyle('padding-bottom').toInt();
    this.input.setStyle('height', height);
    this.input.setStyle('line-height', height);
    var width = this.size.width - this.input.getStyle('padding-left').toInt() - this.input.getStyle('padding-right').toInt();
    if (this.styles.current.glyph) {
      var glyph = this.layers.glyph.measure().width + (this.styles.current.glyphRight || 0) + (this.styles.current.glyphLeft || 0);
      width -= glyph;
      this.input.setStyle('margin-left', glyph);
    }
    if (this.canceller) width -= this.canceller.getLayoutWidth();
    if (this.glyph) width -= this.glyph.getLayoutWidth();
    this.input.setStyle('width', width);
    return true;
  },
  
  getObservedElement: function() {
    return this.getInput();
  }
})



ART.Widget.Traits.OuterClick = new Class({
  
  attachOuterClick: function() {
    this.addEvents(this.events.outer);
  },
  
  detachOuterClick: function() {
    this.removeEvents(this.events.outer);
  }
});



ART.Widget.Traits.Observer = new Class({
  Extends: Widget.Stateful({
  	'filled': ['fill', 'empty']
  }),
  
  options: {
    observer: {
      periodical: true,
      delay: 200
    }
  },
  
  events: {
    observer: {
      input: {
        focus: 'attachObserver',
        blur: 'detachObserver'
      }
    }
  },
  
  attach: Macro.onion(function() {
    this.addEvents(this.events.observer);
  }),
  
  detach: Macro.onion(function() {
    this.removeEvents(this.events.observer);
  }),
  
  attachObserver: function() {
    if (!this.observer) this.observer = new Observer(this.getObservedElement(), this.onChange.bind(this), this.options.observer)
    this.observer.resume();
  },
  
  detachObserver: function() {
    this.observer.pause();
  },
  
  getObservedElement: Macro.defaults(function() {
    return this.element;
  }),
  
  onChange: function(value) {
    if (value.match(/^\s*$/)) {
      this.empty();
    } else {
      this.fill.apply(this, arguments);
    }
  },
  
  addWidgetEvents: function() {
    var events = this.parent.apply(this, arguments)
    this.getInput().addEvents(events.input);
    return events;
  }
});







ART.Widget.Traits.HasMenu = new Class({	
  Extends: ART.Widget.Traits.OuterClick,
  
  options: {
    menu: {
      position: 'top'
    }
  },
  
  events: {
    outer: {
     element: {
       outerClick: 'collapse'
     }
    },
    menu: {
      self: {
        redraw: 'repositionMenu',
        blur: 'collapse'
      }
    }
  },

	shortcuts: {
	  next: 'next',
	  previous: 'previous',
	  cancel: 'cancel',
	  ok: 'select'
	},

	cancel: function() {
	  this.collapse();
	},

	select: function() {
	  this.collapse();
	},

	next: function() {
	  this.expand();
	},

	previous: function() {
	  this.expand();
	},
  
  attach: Macro.onion(function() {
    this.addEvents(this.events.menu);
  }),
  
  detach: Macro.onion(function() {
    this.removeEvents(this.events.menu);
  }),
  
  repositionMenu: function() {
   if (!this.menu || this.collapsed) return;
   if (this.options.menu.position == 'bottom') this.menu.setStyle('top', this.getLayoutHeight() + 1);
   this.menu.setStyle('left', this.offset.paint.left);
   this.menu.setStyle('width', this.getStyle('width'));
  },
  
  buildMenu: function() {
    this.applyLayout('menu#menu');
    this.menu.getAnimation().hide();
  },
  
  expand: Macro.onion(function() {
    if (!this.menu) this.buildMenu();
    this.repositionMenu();
    this.menu.refresh();
    this.menu.show();
    this.attachOuterClick();
  }),
  
  collapse: Macro.onion(function() {
    this.menu.hide();
    //this.detachOuterClick();
  })
});

ART.Widget.Traits.Icon = new Class({
  layered: {
    triangle: ['shape', ['icon', 'iconLeft', 'iconTop', 'iconScale', 'strokeWidth', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'], function(glyph, color, icon, left, top, scale, stroke, shadow, x, y) {
	    this.draw(icon)
  		if (color) this.fill.apply(this, $splat(color));
  		this.translate(left + stroke + shadow - x, top + stroke + shadow - y);
  		if (scale) this.scale(scale, scale)
	  }]
  }
});


ART.Widget.Traits.Focusable = new Class({
  options: {
    tabindex: 0
  },
  
  getFocuser: Macro.setter('focuser', function() {
    return new QFocuser(this.getWrapper(), {
      onWidgetFocus: this.onFocus.bind(this),
      onWidgetBlur: this.onBlur.bind(this),
      tabIndex: this.options.tabindex
    })
  }),
  
  attach: Macro.onion(function() {
    this.getFocuser();
  }),
  
  focus: Macro.onion(function(element) {
    if (element !== false) this.getFocuser().focus(element || this.element)
  }),
  
  onFocus: Macro.defaults(function() {
    if (document.activeElement) {
      var element = $(document.activeElement).getParent()
      while (element) if (element == this.element) return this.focus(false); else element = element.getParent();
    }
    this.focus();
  }),
  
  onBlur: Macro.defaults(function() {
    this.blur();
    this.refresh(true)
  }),
  
  getKeyListener: function() {
    return this.getFocuser().getKeyListener()
  }
});


(function() {
	var parsed = {};
	var modifiers = ['shift', 'control', 'alt', 'meta'];
	var aliases = {
		'ctrl': 'control',
		'command': Browser.Platform.mac ? 'meta': 'control',
		'cmd': Browser.Platform.mac ? 'meta': 'control'
	}
	
	var presets = {
	  'next': ['right', 'down'],
	  'previous': ['left', 'up'],
	  'ok': ['enter', 'space'],
	  'cancel': ['esc']
	}

	var parse = function(expression){
	  if (presets[expression]) expression = presets[expression];
	  return $splat(expression).map(function(type) {
  		if (!parsed[type]){
  			var bits = [], mods = {}, string, event;
  			if (type.contains(':')) {
  				string = type.split(':');
  				event = string[0];
  				string = string[1];
  			} else {	
  				string = type;
  				event = 'keydown';
  			}
  			string.split('+').each(function(part){
  				if (aliases[part]) part = aliases[part];
  				if (modifiers.contains(part)) mods[part] = true;
  				else bits.push(part);
  			});

  			modifiers.each(function(mod){
  				if (mods[mod]) bits.unshift(mod);
  			});

  			parsed[type] = event + ':' + bits.join('+');
  		}
  		return parsed[type];
	  });
	};
	
	Shortcuts = new Class({
		shortcuts: {},		
		
		addShortcuts: function(shortcuts, internal) {
			Hash.each(shortcuts, function(fn, shortcut) {
				this.addShortcut(shortcut, fn, internal);
			}, this)
		},

		removeShortcuts: function(shortcuts, internal) {
			Hash.each(shortcuts, function(fn, shortcut) {
				this.removeShortcut(shortcut, fn, internal);
			}, this)
		},
		
		addShortcut: function(shortcut, fn, internal) {
		  parse(shortcut).each(function(cut) {
  			this.addEvent(cut, fn, internal)
		  }, this)
		},
		
		removeShortcut: function(shortcut, fn, internal) {
		  parse(shortcut).each(function(cut) {
  			this.removeEvent(cut, fn, internal)
		  }, this)
		},
		
		getKeyListener: function() {
			return this.element;
		},

		enableShortcuts: function() {
			if (!this.shortcutter) {
				this.shortcutter = function(event) {
					var bits = [event.key];
					modifiers.each(function(mod){
						if (event[mod]) bits.unshift(mod);
					});
					this.fireEvent(event.type + ':' + bits.join('+'), arguments)
				}.bind(this)
			}
			if (this.shortcutting) return;
			this.shortcutting = true;
			this.getKeyListener().addEvent('keydown', this.shortcutter);
		},

		disableShortcuts: function() {
			if (!this.shortcutting) return;
			this.shortcutting = false;
			this.getKeyListener().removeEvent('keydown', this.shortcutter);
		}
	});
	
})();



ART.Widget.Traits.Accessible = new Class({
	
	Implements: [Shortcuts],
	
	events: {
	  accessibility: {
	    focus: 'enableShortcuts',
	    blur: 'disableShortcuts'
	  }
	},
	
	setShortcuts: function() {
		return this.bindEvents(this.shortcuts || {});
	},
	
	attach: Macro.onion(function() {
	  var shortcuts = this.setShortcuts();
		for (var shortcut in this.shortcuts) this.addShortcut(shortcut, shortcuts[shortcut]);
		this.addEvents(this.events.accessibility);
	}),
	
	detach: Macro.onion(function() {
		this.removeEvents(this.events.accessibility)
	})
});
