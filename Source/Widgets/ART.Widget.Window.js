/*
Script: ART.Widget.Window.js

License:
	MIT-style license.
*/

// Window Widget. Work in progress.


ART.Sheet.define('section', {
	'width': 'inherit'
});


ART.Sheet.define('window', {		
	'display': 'inline-block',
	'vertical-align': 'top',
	'width': 'auto',
	'height': 'auto',
	'shadow-blur': 20,
	'shadow-offset-y': 5,
	'shadow-color': hsb(0, 0, 0, 1)
});

ART.Sheet.define('window.hud', {		
	'corner-radius': 15
});


ART.Sheet.define('window.hud #content', {
	'height': 70,
	'background-color': [hsb(0, 0, 0, 0.6), hsb(0, 0, 20, 0.5)],
	'reflection-color': [hsb(0, 0, 100, 0.6), hsb(0, 0, 10, 0)]
});



ART.Sheet.define('window.hud #header', {
	'corner-radius-top-left': 'inherit',
	'corner-radius-top-right': 'inherit',
	'height': 26,
	'background-color': [hsb(0, 0, 0, 0.55), hsb(0, 0, 0, 0.5)],
	'reflection-color': [hsb(0, 0, 0, 0), hsb(0, 0, 0, 0)]
});

ART.Sheet.define('window.hud #content', {
  'corner-radius-bottom-left': 'inherit',
  'corner-radius-bottom-right': 'inherit',
});


ART.Sheet.define('window.hud button', {
	'height': 16,
	'width': 16,
	'cursor': 'pointer',
	'background-color': [hsb(0, 0, 0, 0.4), hsb(0, 0, 0, 0.5)],
	'reflection-color': [hsb(0, 0, 0, 0.3), hsb(0, 0, 0, 0)],
	'shadow-color': hsb(0, 0, 100, 0.2),
	'glyph-color': hsb(82, 0, 100, 0.5),
	'corner-radius': 7,
	'float': 'left',
	'margin-left': 5
});


ART.Sheet.define('window.hud #buttons #close', {
	'stroke-color': hsb(82, 0, 100, 0.3),
	'glyph-height': 8,
	'glyph-width': 8,
	'glyph-top': 2,
	'glyph-left': 2
});

ART.Sheet.define('window #footer, window #header', {	
  'width': 'auto'
});

ART.Sheet.define('window #content', {
  'width': 300,
  'min-height': 50
})

ART.Sheet.define('window.fancy', {		
	'corner-radius': 5,
	'stroke-width': 5,
	'stroke-cap': 'square',
	'stroke-color': hsb(0, 0, 10, 0.5),
  'stroke-dash': false
});


ART.Sheet.define('window.fancy:dragged', {		
  'cursor': 'move',
  'stroke-dash': '10, 2, 2',
	'stroke-color': hsb(0, 0, 10, 0.2)
});



ART.Sheet.define('input, textarea', {		
	'corner-radius': 3,
	'stroke-color': hsb(0, 0, 50),
	'background-color': [hsb(0, 0, 90), hsb(0, 0, 95)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 70, 0)],
	'width': 200,
	'height': 26
});


ART.Sheet.define('textarea', {		
  'height': 88
});

ART.Sheet.define('input:focused, textarea:focused', {		
  'stroke-color': hsb(212, 58, 93)
});

ART.Sheet.define('window.fancy #header', {
	'corner-radius-top-left': 'inherit',
	'corner-radius-top-right': 'inherit',
	'padding-right': 5,
	'height': 'auto',
	'background-color': [hsb(0, 0, 80), hsb(0, 0, 60)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)],
	'border-bottom-width': 1,
	'border-bottom-style': 'solid',
	'border-bottom-color': '#979797'
});

ART.Sheet.define('window.fancy #header #toolbar', {
	'clear': 'both',
	'background-color': [hsb(0, 0, 80), hsb(0, 0, 60)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)]
});

ART.Sheet.define('window.fancy #content', {
	'stroke-cap': 'square',
	'stroke-color-y': 0,
	'height': 150,
	'background-color': [hsb(0, 0, 80, 0.3), hsb(0, 0, 70, 0.4)],
	'reflection-color': [hsb(0, 0, 100, 0.3), hsb(0, 0, 0, 0)]
});


ART.Sheet.define('window.fancy #footer', {	
	'corner-radius-bottom-left': 'inherit',
	'corner-radius-bottom-right': 'inherit',
	'background-color': [hsb(0, 0, 80), hsb(0, 0, 70)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)],
	'height': 'auto',
	'border-top-width': 1,
	'border-top-style': 'solid',
	'border-top-color': '#979797'
});

ART.Sheet.define('window #header #buttons', {
	'float': 'left',
	'height': 24,
	'margin-top': 5
});

ART.Sheet.define('window #header #toggler', {
	'float': 'right',
	'margin-left': -20,
	'margin-top': 5,
	'height': 8,
	'width': 18,
	'corner-radius': 4,
	'reflection-color': [hsb(0, 0, 100, 0.5), hsb(0, 0, 40, 0.5), hsb(0, 0, 100, 0.5)],
	'background-color': [hsb(0, 0, 90, 0.3), hsb(0, 0, 100, 0.9), ]
});

ART.Sheet.define('window #header #toggler:active', {
  'background-color': [hsb(210, 61, 90), hsb(202, 95, 100)],
	'reflection-color': [hsb(0, 0, 90, 0.7), hsb(0, 0, 70, 0.7), hsb(0, 0, 100, 0.7)]
})

ART.Sheet.define('window.fancy button', {
	'pill': true,
	'height': 14,
	'width': 14,
	'cursor': 'pointer',
	'fill-color': [hsb(0, 0, 75), hsb(0, 0, 100, 0.3)],
	'background-color': [hsb(0, 0, 95), hsb(0, 0, 0, 0)],
	'shadow-color': hsb(0, 0, 100, 0.4),
	'stroke-color': hsb(0, 0, 45),
	'glyph-color': hsb(0, 0, 30),
	
	'float': 'left',
	'margin-left': 5
});

ART.Sheet.define('window.fancy button:active', {
	'fill-color': [hsb(205, 25, 60), hsb(0, 0, 0, 0)],
	'glyph-color': hsb(0, 0, 100)
});

ART.Sheet.define('window #buttons button', {
	'glyph-height': 8,
	'glyph-width': 8,
	'corner-radius': 6,
  'reflection-color': ['radial', {0.3: hsb(0, 0, 100, 0.396875), 1: hsb(0, 0, 100, 0)}, {cy: '90%', r: '45%', fy: '90%'}],
  'fill-color': ['radial', {0.5: hsb(0, 0, 100, 0.496875), 0.9: hsb(0, 0, 100, 0)}, {cy: '5%', r: '20%', fy: '5%'}],
  'background-color': ['radial', {0.3: hsb(0, 0, 75, 0.4), 0.5: hsb(0, 0, 100, 0.3)}],
});

ART.Sheet.define('window #close', {
	'glyph': ART.Glyphs.smallCross
});

ART.Sheet.define('window #minimize', {
	'glyph': ART.Glyphs.smallMinus
});

ART.Sheet.define('window #maximize', {
	'glyph': ART.Glyphs.smallPlus
});

ART.Sheet.define('window:minified #minimize', {
	'display': 'none'
});

ART.Sheet.define('window.fancy:minified #content', {
	'background-color': [hsb(0, 0, 80, 0.5), hsb(0, 0, 70, 0.7)],
	'reflection-color': [hsb(0, 0, 100, 0.5), hsb(0, 0, 0, 0)],
});

ART.Sheet.define('window:minified #maximize', {
	'display': 'block'
});

ART.Sheet.define('window #maximize', {
	'display': 'none'
});

ART.Sheet.define('window #handle', {
	'glyph': ART.Glyphs.resize,
	'glyph-color': hsb(0, 0, 50, 0.5),
	'glyph-width': 15,
	'glyph-height': 15,
	'glyph-top': 2,
  'glyph-left': 0,
  
	
	'width': 15,
	'height': 15,
	'shadow-color': hsb(0, 0, 0, 0.4),
	
	'touchable': true,
	
	'float': 'right',
	'cursor': 'se-resize'
})

ART.Sheet.define('window #handle:active', {
	'glyph-color': hsb(0, 0, 100, 0.7),
	'shadow-color': hsb(0, 0, 0, 0.6)
});


ART.Sheet.define('window #toolbar button', {
	'height': 36,
	'width': 36,
	'stroke-offset-top': -2,
	'margin-bottom': 5,
});

ART.Sheet.define('window:minified #toolbar button', {
	'height': 16,
	'width': 16
});

ART.Sheet.define('window.fancy #header #toolbar button', {
	'glyph-scale': 2,
	'glyph-top': 5,
	'glyph-left': 5,
	'background-color': [hsb(0, 0, 99), hsb(0, 0, 74)],
	'reflection-color': [hsb(0, 0, 30, 0), hsb(0, 0, 40, 0.3)]
});

ART.Sheet.define('window.fancy #header #toolbar button:disabled', {
	'glyph-color': hsb(0, 0, 50),
	'cursor': 'default'
});

ART.Sheet.define('window.fancy #header #toolbar button:active', {
  'background-color': [hsb(0, 0, 40), hsb(0, 0, 74)]
});

ART.Sheet.define('window.fancy #header #toolbar button#search', {
	'glyph': ART.Glyphs.search
});
ART.Sheet.define('window.fancy #header #toolbar button#reload', {
	'glyph': ART.Glyphs.refresh
});
ART.Sheet.define('window.fancy #header #toolbar button#wrench', {
	'glyph': ART.Glyphs.wrench
});
ART.Sheet.define('window.fancy #header #toolbar button#back', {
	'glyph': ART.Glyphs.triangleLeft,
	'glyph-top': 11,
	'glyph-left': 10,
	'corner-radius': 18,
	'glyph-scale': 1.5,
	'z-index': 10
});
ART.Sheet.define('window.fancy #header #toolbar button#forward', {
	'glyph': ART.Glyphs.triangleRight,
	'height': 25,
	'corner-radius': [0, 13, 13, 0],
	'glyph-scale': 1.2,
	'glyph-left': 15,
	'glyph-top': 7,
	'margin-top': 5,
	'margin-left': -10,
	'z-index': 5
});

ART.Sheet.define('window.fancy:minified #header #toolbar button', {
	'glyph-scale': 1,
	'glyph-top': 2,
	'glyph-left': 2
});

ART.Sheet.define('window.fancy:minified #header #toolbar button#forward, window.fancy:minified #header #toolbar button#back', {
	'corner-radius': 5,
	'glyph-scale': 1,
	'glyph-top': 4,
	'glyph-left': 4
});

ART.Sheet.define('window.fancy:minified #header #toolbar button#forward', {
  'margin-left': 5,
	'margin-top': 0,
	'height': 16
});


ART.Widget.Window = new Class({
	
	Extends: Class.inherit(
		ART.Widget.Paint,
		ART.Widget.Traits.Aware,
		Widget.Animated,
		Widget.Stateful({
			'closed': ['close', 'open'],
			'collapsed': ['collapse', 'expand']
		})
	),
	
	name: 'window',
	
	layout: {},
	
	layered: {
	  stroke:  ['rectangle-stroke'],
	  reflection: ['rectangle', ['reflectionColor'], function(width, height, cornerRadius, color) {
  	  this.draw(width, height, cornerRadius);
  		if (color) this.fill.apply(this, $splat(color));
  	}],
  	background: ['rectangle', ['backgroundColor'], function(width, height, cornerRadius, color) {
  	  this.draw(width, height, cornerRadius);
  		if (color) this.fill.apply(this, $splat(color));
  	}],
	},
	
	initialize: function() {
		this.parent.apply(this, arguments);
		this.inject(document.body);
		
		if (this.header.buttons.close) this.header.buttons.close.addEvent('click', this.close.bind(this));
		if (this.header.buttons.minimize) this.header.buttons.minimize.addEvent('click', this.collapse.bind(this));
		if (this.header.buttons.maximize) this.header.buttons.maximize.addEvent('click', this.expand.bind(this));
		
		
		return true;
	},
	
	close: function() {
		if (!this.parent.apply(this, arguments)) return;
		this.hide();
	},
	
	getHandle: function() {
	  return $(this.footer.handle)
	},

	getResized: function() {
	  return this.content;
	}
	
});