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
	'width': 300,
	'height': 'auto',
	'shadow-blur': 20,
	'shadow-offset-y': 5,
	'shadow-color': hsb(0, 0, 0, 1),
	'stroke-width': 1,
	'stroke-color': hsb(0, 0, 0, 1)
});


ART.Sheet.define('window.hud', {		
	'corner-radius': 15
});


ART.Sheet.define('window.hud #content', {
	'stroke-cap': 'square',
	'stroke-color-y': 0,
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
	'border-color': hsb(82, 0, 100, 0.5),
	'glyph-color': hsb(82, 0, 100, 0.5),
	'corner-radius': 7,
	'float': 'left',
	'margin-left': 5
});


ART.Sheet.define('window.hud #buttons #close', {
	'stroke-width': 1,
	'stroke-color': hsb(82, 0, 100, 0.3),
	'glyph-height': 8,
	'glyph-width': 8,
	'glyph-top': 2,
	'glyph-left': 2
});

ART.Sheet.define('window #footer, window #content, window #header', {	
	'stroke-width': 0,
	'stroke-color': hsb(0, 0, 72, 100)
});

ART.Sheet.define('window.fancy', {		
	'corner-radius': 5
});


ART.Sheet.define('window.fancy #header', {
	'corner-radius-top-left': 'inherit',
	'corner-radius-top-right': 'inherit',
	'height': 'auto',
	'background-color': [hsb(0, 0, 80), hsb(0, 0, 60)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)],
	'border-bottom-width': 1,
	'border-bottom-style': 'solid',
	'border-bottom-color': '#979797'
});

ART.Sheet.define('window.fancy #header #toolbar', {
	'height': 30,
	'clear': 'both',
	'background-color': [hsb(0, 0, 80), hsb(0, 0, 60)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)],
	'border-bottom-width': 1,
	'border-bottom-style': 'solid',
	'border-bottom-color': '#979797'
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
	'height': 16,
	'border-top-width': 1,
	'border-top-style': 'solid',
	'border-top-color': '#979797'
});

ART.Sheet.define('window #header #buttons', {
	'float': 'left',
	'height': 24,
	'margin-left': 5,
	'margin-top': 5
});

ART.Sheet.define('window.fancy button', {
	'pill': true,
	'height': 14,
	'width': 14,
	'cursor': 'pointer',
	'background-color': [hsb(0, 0, 75), hsb(0, 0, 55)],
	'reflection-color': [hsb(0, 0, 95), hsb(0, 0, 0, 0)],
	'shadow-color': hsb(0, 0, 100, 0.4),
	'border-color': hsb(0, 0, 45),
	'glyph-color': hsb(0, 0, 0, 0.6),
	
	'float': 'left',
	'margin-left': 5
});

ART.Sheet.define('window.fancy button:active', {
	'reflection-color': [hsb(205, 25, 60), hsb(0, 0, 0, 0)],
	'border-color': hsb(200, 35, 45),
	'glyph-color': hsb(0, 0, 100)
});

ART.Sheet.define('window #buttons button', {
	'glyph-height': 8,
	'glyph-width': 8
});

ART.Sheet.define('window.fancy #buttons #close', {
	'glyph-height': 6,
	'glyph-width': 6
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

ART.Sheet.define('window:collapsed #minimize', {
	'display': 'none'
});

ART.Sheet.define('window:collapsed #content', {
	'background-color': [hsb(0, 0, 80, 0.5), hsb(0, 0, 70, 0.7)],
	'reflection-color': [hsb(0, 0, 100, 0.5), hsb(0, 0, 0, 0)],
});

ART.Sheet.define('window:collapsed #maximize', {
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

ART.Widget.Window = new Class({
	
	Extends: Class.inherit(
		ART.Widget.Paint,
		Widget.Animated,
		Widget.Stateful({
			'closed': ['close', 'open'],
			'collapsed': ['collapse', 'expand']
		})
	),
	
	name: 'window',
	
	layout: {},
	
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
	
	build: function() {
    if (!this.parent.apply(this, arguments)) return;
	  this.layers = {
	    border: new ART.Rectangle,
	    background: new ART.Rectangle,
	    fill: new ART.Rectangle
	  }
	  return true;
	},
	
	render: function() {
		if (!this.parent.apply(this, arguments)) return;
		
		var style = this.styles.current;
		var width = this.getStyle('width')// + (this.styles.current.strokeWidth || 0);
		var height = this.getStyle('height')// - (this.styles.current.strokeWidth || 0);
		
		var rad0 = [style.cornerRadiusTopLeft, style.cornerRadiusTopRight, style.cornerRadiusBottomRight, style.cornerRadiusBottomLeft];
		var radM1 = [style.cornerRadiusTopLeft - 1, style.cornerRadiusTopRight - 1, style.cornerRadiusBottomRight - 1, style.cornerRadiusBottomLeft - 1];
    
		//make the border
		this.layers.border.draw(width, height, rad0);
		this.layers.border.fill.apply(this.layers.border, $splat(style.borderColor));

		//reflection
		this.layers.fill.draw(width - 2, height - 2, radM1);
		this.layers.fill.fill.apply(this.layers.fill, $splat(style.reflectionColor));
		this.layers.fill.translate(1, 1);
		
		//background
		this.layers.background.draw(width - 2, height - 2, radM1);
		this.layers.background.fill.apply(this.layers.background, $splat(style.backgroundColor));
		this.layers.background.translate(1, 2);
		
		return true;
	}
	
});