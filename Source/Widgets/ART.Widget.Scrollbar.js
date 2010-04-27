ART.Sheet.define('scrollbar', {
	'height': 16,
	'width': 16,
	'cursor': 'pointer',
	'stroke-color': hsb(0, 0, 0, 0.3),
	'stroke-width': 0,
	'cornerRadius': 3,
	'glyph-color': hsb(82, 0, 100, 0.5)
});

ART.Sheet.define('window.fancy scrollbar button', {
	'height': 14,
	'width': 14,
	'margin-left': 0,
	'glyph-scale': 0.8,
	'glyph-top': 3,
	'glyph-left': 3,
	'stroke-width': 1
});

ART.Sheet.define('window.fancy scrollbar track', {
  'fill-color': [hsb(0, 0, 30, 0.4), hsb(0, 0, 50, 0.5)],
  'reflection-color': [hsb(31, 0, 100, 0.3), hsb(45, 0, 50, 0)],
  'stroke-width': 1,
	'stroke-color': hsb(0, 0, 0, 0.3),
});

ART.Sheet.define('scrollbar:horizontal track', {
  'height': 14,
  'margin-left': 16
});

ART.Sheet.define('scrollbar:vertical track', {
  'width': 14,
  'margin-top': 16
});


ART.Sheet.define('scrollbar track thumb', {
  'width': 12,
  'height': 12,
  'stroke-width': 1,
  'stroke-color': hsb(0, 0, 100, 0.7),
  'corner-radius': 5,
  'background-color': [hsb(0, 0, 0, 0.2), hsb(0, 0, 0, 0.24)],
  'fill-color': [hsb(44, 0, 100, 0.15), hsb(31, 0, 50, 0)]
});

ART.Sheet.define('scrollbar track thumb:active', {
  'reflection-color': [hsb(44, 0, 100, 0.3), hsb(31, 0, 50, 0)],
  'background-color': [hsb(0, 0, 0, 0.4), hsb(0, 0, 0, 0.5)]
});
ART.Sheet.define('window.fancy scrollbar:vertical button#decrement', {
	'bottom': '0',
	'glyph': ART.Glyphs.triangleDown,
	'corner-radius': [0, 3, 0, 3]
});

ART.Sheet.define('window.fancy scrollbar:vertical button#increment', {
	'glyph': ART.Glyphs.triangleUp,
	'corner-radius': [3, 0, 3, 0]
});

ART.Sheet.define('window.fancy scrollbar:horizontal button#increment', {
	'right': '0',
	'corner-radius': [0, 3, 3, 0],
	'glyph': ART.Glyphs.triangleRight
});

ART.Sheet.define('window.fancy scrollbar:horizontal button#decrement', {
	'glyph': ART.Glyphs.triangleLeft,
	'corner-radius': [3, 0, 0, 3]
});

	
ART.Widget.Scrollbar = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint,
    ART.Widget.Traits.HasSlider
  ),
  
  name: 'scrollbar',
  
  position: 'absolute',
	
	layout: {
    'scrollbar-track#track': {
      'scrollbar-thumb#thumb': {},
    },
	  'scrollbar-button#decrement': {},
	  'scrollbar-button#increment': {}
	},
	
	layered: {
    stroke: ['rectangle-stroke'],
	  background: ['rectangle', ['backgroundColor'], function(width, height, cornerRadius, color) {
	    this.draw(width - 2, height - 3, cornerRadius.map(function(r) { return r - 1}));
  		if (color) this.fill.apply(this, $splat(color));
  		this.translate(1, 2);
	  }],
	  reflection:  ['rectangle', ['reflectionColor'], function(width, height, cornerRadius, color) {
	    this.draw(width - 2, height - 2, cornerRadius.map(function(r) { return r - 1}));
  		if (color) this.fill.apply(this, $splat(color));
  		this.translate(1, 1);
	  }]
	},
	
	options: {
	  slider: {
	    wheel: true
	  }
	},
	
	events: {
	  parent: {
  	  resize: 'adaptToSize'
	  }
	},
	
	initialize: function() {
	  this.parent.apply(this, arguments);
	  this.addPseudo(this.options.mode);
	},
	
	adaptToSize: function(size){
	  if (!size || $chk(size.height)) size = this.parentWidget.size;
	  var other = (this.options.mode == 'vertical') ? 'horizontal' : 'vertical';
	  var prop = (this.options.mode == 'vertical') ? 'height' : 'width';
	  var setter = 'set' + prop.capitalize();
	  var value = size[prop];
	  if (isNaN(value) || !value) return;
	  var invert = this.parentWidget[other];
	  var scrolled = this.getScrolled();
	  $(scrolled).setStyle(prop, size[prop])
	  var ratio = size[prop] / $(scrolled).scrollWidth
	  var delta = (!invert || invert.hidden ? 0 : invert.getStyle(prop));
    this[setter](size[prop] - delta);
    var trackWidth = size[prop] - 16 * 2 - delta;
	  //console.info(size[prop], ($(scrolled).offsetWidth), $(scrolled).scrollWidth, ratio, trackWidth)
    this.track[setter](trackWidth);
    this.track.thumb[setter](Math.ceil(trackWidth * ratio))
    this.getSlider()
    this.refresh();
	},
	
	inject: function(widget) {
	  if (!this.parent.apply(this, arguments)) return;
	  this.adaptToSize(widget.size);
	  return true;
	},
	
	onSet: function(value) {
    var prop = (this.options.mode == 'vertical') ? 'height' : 'width';
    var direction = (this.options.mode == 'vertical') ? 'top' : 'left';
    var result = value * this.parentWidget.element['scroll' + prop.capitalize()];
    $(this.getScrolled())['scroll' + direction.capitalize()] = result
	},
	
	getScrolled: function() {
	  if (!this.scrolled) {
	    var parent = this;
      while ((parent = parent.parentWidget) && !parent.getScrolled);
      this.scrolled = parent.getScrolled ? parent.getScrolled() : this.parentWidget.element;
	  }
	  return this.scrolled;
	},
	
	dispose: function() {
	  var parent = this.parentWidget;
	  if (!this.parent.apply(this, arguments)) return;
	  parent.removeEvents(this.events.parent);
	  return true;
	},
	
	getTrack: function() {
	  return $(this.track)
	},
	
	getTrackThumb: function() {
	  return $(this.track.thumb);
	},
	
	hide: function() {
	  if (!this.parent.apply(this, arguments)) return;
	  this.element.setStyle('display', 'none');
	  return true;
	},
	
	show: function() {
	  if (!this.parent.apply(this, arguments)) return;
	  this.element.setStyle('display', 'block');
	  return true;
	}
})

ART.Widget.Scrollbar.Track = new Class({
  Extends: ART.Widget.Section,
  
  name: 'track',
  
  position: 'absolute'
});

ART.Widget.Scrollbar.Thumb = new Class({
  Extends: ART.Widget.Button,
  
  name: 'thumb'
});

ART.Widget.Scrollbar.Button = new Class({
  Extends: ART.Widget.Button,
  
  position: 'absolute'
});

ART.Widget.Traits.Scrollable = new Class({
  build: Macro.onion(function() {
    if (!this.wrapper) this.wrapper = new Element('div', {'class': 'wrapper'}).setStyle('position', 'relative').setStyle('overflow', 'hidden')
    this.wrapper.inject(this.element);
    
    
    if (this.options.scrollable) this.addEvent('resize', function(size) {
      var scrolled = this.getScrolled ? $(this.getScrolled()) : this.element.getFirst();
      if (size.width < scrolled.scrollWidth) this.getHorizontalScrollbar().show();
      else if (this.horizontal) this.horizontal.hide();

      if (size.height < scrolled.scrollHeight) this.getVerticalScrollbar().show();
      else if (this.vertical) this.vertical.hide();
    }.bind(this))
  }),
  
  getVerticalScrollbar: Macro.setter('vertical', function() {
    this.applyLayout({
	    'scrollbar#vertical[mode=vertical]': {}
	  });
  }),
  
  getHorizontalScrollbar: Macro.setter('horizontal', function() {
    this.applyLayout({
	    'scrollbar#horizontal[mode=horizontal]': {}
	  });
  })
});