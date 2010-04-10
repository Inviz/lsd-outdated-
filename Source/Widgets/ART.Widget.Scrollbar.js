ART.Sheet.define('scrollbar', {
	'height': 16,
	'width': 16,
	'cursor': 'pointer',
	'stroke-color': hsb(0, 0, 0, 0.3),
	'reflection-color': [hsb(0, 0, 0, 0.4), hsb(0, 0, 0, 0.5)],
	'background-color': [hsb(0, 0, 100, 0.3), hsb(0, 0, 50, 0)],
	'cornerRadius': 3,
	'glyph-color': hsb(82, 0, 100, 0.5)
});

ART.Sheet.define('window.fancy scrollbar button', {
	'height': 14,
	'width': 14,
	'margin-left': 0,
	'glyph-scale': 0.8,
	'glyph-top': 3,
	'glyph-left': 3
});

ART.Sheet.define('window.fancy scrollbar track', {
  'background-color': [hsb(0, 0, 30, 0.4), hsb(0, 0, 50, 0.5)],
  'reflection-color': [hsb(31, 0, 100, 0.3), hsb(45, 0, 50, 0)]
});

ART.Sheet.define('scrollbar:horizontal track', {
  'height': 14,
  'margin-top': 1
});

ART.Sheet.define('scrollbar:vertical track', {
  'width': 14,
  'margin-left': 1
});


ART.Sheet.define('scrollbar track thumb', {
  'width': 14,
  'height': 14,
  'corner-radius': 5,
  'reflection-color': [hsb(0, 0, 0, 0.4), hsb(0, 0, 0, 0.5)],
  'background-color': [hsb(44, 0, 100, 0.3), hsb(31, 0, 50, 0)]
});

ART.Sheet.define('scrollbar track thumb:active', {
  'reflection-color': [hsb(44, 0, 100, 0.3), hsb(31, 0, 50, 0)],
  'background-color': [hsb(0, 0, 0, 0.4), hsb(0, 0, 0, 0.5)]
});

ART.Sheet.define('window.fancy scrollbar:vertical button', {
	'margin-left': 1
});

ART.Sheet.define('window.fancy scrollbar:horizontal button', {
  'margin-top': 1
});

ART.Sheet.define('window.fancy scrollbar:vertical button#decrement', {
	'bottom': '0',
	'glyph': ART.Glyphs.triangleDown
});

ART.Sheet.define('window.fancy scrollbar:vertical button#increment', {
	'glyph': ART.Glyphs.triangleUp
});

ART.Sheet.define('window.fancy scrollbar:horizontal button#increment', {
	'right': '0',
	'glyph': ART.Glyphs.triangleRight
});

ART.Sheet.define('window.fancy scrollbar:horizontal button#decrement', {
	'glyph': ART.Glyphs.triangleLeft
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
    border: ['rectangle', ['borderColor']],
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
	
	events: {
	  parent: {
  	  redraw: 'adaptToSize'
	  }
	},
	
	initialize: function() {
	  this.parent.apply(this, arguments);
	  this.addPseudo(this.options.mode);
	},
	
	adaptToSize: function(size){
	  if (!size || $chk(size.height)) size = this.parentWidget.size;
	  var prop = (this.options.mode == 'vertical') ? 'height' : 'width';
	  var setter = 'set' + prop.capitalize();
    this[setter](size[prop] - 14);
    this.track[setter](size[prop] - 14 * 3);
    this.getSlider.delay(10, this, true)
    this.update();
    this.render();
	},
	
	inject: function(widget) {
	  if (!this.parent.apply(this, arguments)) return;
	  if (widget.size.height) this.adaptToSize(widget.size);
	  return true;
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
	}
})

ART.Widget.Scrollbar.Track = new Class({
  Extends: ART.Widget.Section,
  
  name: 'track',
  
  position: 'absolute'
});

ART.Widget.Absolute = new Class({
  build: function() {
    if (!this.wrapper) this.wrapper = new Element('div', {'class': 'wrapper'}).setStyle('position', 'relative')
    if (!this.parent.apply(this, arguments)) return;
    this.wrapper.inject(this.element);
    return true;
  },
  
  getWrapper: function() {
    return this.wrapper || this.element;
  }
})

ART.Widget.Scrollbar.Thumb = new Class({
  Extends: ART.Widget.Button,
  
  name: 'thumb'
});

ART.Widget.Scrollbar.Button = new Class({
  Extends: ART.Widget.Button,
  
  position: 'absolute'
});


Class.refactor(ART.Widget, {
  
  initialize: function() {
    this.previous.apply(this, arguments);
    if (this.options.scrollable) this.getScrollbars();
  },
  
  getScrollbars: function() {
    if (!this.vertical) {
      this.applyLayout({
  	    'scrollbar#vertical[mode=vertical]': {},
  	    'scrollbar#horizontal[mode=horizontal]': {}
  	  }); 
    }
  }
  
});