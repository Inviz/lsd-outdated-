/*
Script: ART.Widget.Button.js

License:
	MIT-style license.
*/

// Button Widget. Work in progress.

ART.Sheet.define('button', {
	'font': 'moderna',
	'font-size': 11,
	'font-color': hsb(0, 100, 10),
	'padding': [0, 0, 0, 0],

	'height': false,
	'width': false,

	'glyph': false,
	'glyph-stroke': 2,
	'glyph-color': hsb(0, 0, 0, 0.8),
	'glyph-height': 13,
	'glyph-width': 13,
	'glyph-top': 1,
	'glyph-left': 1,
  
	'stroke-color': hsb(0, 0, 0, 0.7),
	'stroke-width': 1,
	
	'pill': false,

	'corner-radius': 3,
	'background-color': [hsb(0, 0, 80), hsb(0, 0, 60)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)],
	'shadow-color': hsb(0, 0, 100, 0.6)
});

ART.Widget.Button = new Class({

	Extends: Class.inherit(
		ART.Widget.Paint,
		ART.Widget.Traits.Touchable
	),

	name: 'button',

	options: {
		label: ''
	},
	
	events: {
	  element: {
	    click: 'onClick'
	  }
	},
	
	layered: {
    stroke: ['rectangle-stroke'],
	  background:  ['rectangle', ['backgroundColor', 'strokeWidth'], function(width, height, cornerRadius, color, stroke) {
	    this.draw(width, height, cornerRadius.map(function(r) { return r + stroke}));
  		if (color) this.fill.apply(this, $splat(color));
  		this.translate(stroke, stroke)
	  }],
	  reflection:  ['rectangle', ['reflectionColor', 'strokeWidth'], function(width, height, cornerRadius, color, stroke) {
	    this.draw(width - 1, height - 1, cornerRadius.map(function(r) { return r + stroke}));
  		if (color) this.fill.apply(this, $splat(color));
  		this.translate(stroke + 1, stroke + 1)
	  }],
    glyph: ['shape', ['glyphLeft', 'glyphTop', 'glyphScale', 'strokeWidth'], function(glyph, color, left, top, scale, stroke) {
	    if (!glyph) return;
	    this.draw(glyph);
  		if (color) this.fill.apply(this, $splat(color));
  		this.translate(left + stroke, top + stroke);
  		if (scale) this.scale(scale, scale)
	  }]
	},
	
	onClick: function() {
		this.fireEvent('click', arguments);
	},

	makeText: function(text, size){
		if (!this.layers.text) return;
		this.layers.text.draw(text, size);
		this.fontBounds = this.textLayer.measure();
	}

});
