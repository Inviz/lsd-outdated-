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
  'margin-left': 14,
  'margin-right': 14,
  'height': 14,
  'margin-top': 1
});

ART.Sheet.define('scrollbar:vertical track', {
  'margin-top': 14,
  'margin-bottom': 14,
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

	
ART.Widget.Slider = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint,
    ART.Widget.Traits.HasSlider
  ),
  
  name: 'slider',
	
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
	
	initialize: function() {
	  this.parent.apply(this, arguments);
	  this.addPseudo(this.options.mode);
	  this.getSlider();
	},
	
	layout: {
    'scrollbar-thumb#thumb': {}
	}
})

ART.Widget.Slider.Thumb = new Class({
  Extends: Class.inherit(
    ART.Widget.Button,
    ART.Widget.Absolute
  ),
  
  name: 'thumb'
});