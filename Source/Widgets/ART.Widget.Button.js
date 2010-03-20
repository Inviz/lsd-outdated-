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

	'pill': false,

	'corner-radius': 3,
	'background-color': [hsb(0, 0, 80), hsb(0, 0, 60)],
	'border-color': hsb(0, 0, 0, 0.7),
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)],
	'shadow-color': hsb(0, 0, 100, 0.6)
});

ART.Widget.Button = new Class({

	Extends: Class.inherit(
		ART.Widget.Paint,
		ART.Widget.Touchable
	),

	name: 'button',

	options: {
		label: ''
	},
	
	events: {
		'click': function() {
			this.click.apply(this, arguments);
		}
	},
	
	properties: ['borderColor', 'backgroundColor'],
	
	click: function() {
		this.fireEvent('click', arguments);
	},
	
	build: function() {
	  if (!this.parent.apply(this, arguments)) return;

    this.layers = {
      border: new ART.Rectangle,
      fill: new ART.Rectangle,
      background: new ART.Rectangle,
      glyph: new ART.Shape
    }
		return true;
	},
	
	render: function(){
		this.parent.apply(this, arguments);
		if (!this.paint) return this;
		
		var style = this.styles.current;
		
		
		var rad0 = [style.cornerRadiusTopLeft, style.cornerRadiusTopRight, style.cornerRadiusBottomRight, style.cornerRadiusBottomLeft];
		var radM1 = [style.cornerRadiusTopLeft - 1, style.cornerRadiusTopRight - 1, style.cornerRadiusBottomRight - 1, style.cornerRadiusBottomLeft - 1];
    
		this.layers.glyph.draw(style.glyph);
		this.glyphBounds = this.layers.glyph.measure();
		this.layers.glyph.fill.apply(this.layers.glyph, $splat(style.glyphColor));
		this.layers.glyph.translate(style.glyphLeft, style.glyphTop);
    
		//make the border
		this.layers.border.draw(style.width, style.height, rad0);
		this.layers.border.fill.apply(this.layers.border, $splat(style.borderColor));

		//reflection
		this.layers.fill.draw(style.width - 2, style.height - 2, radM1);
		this.layers.fill.fill.apply(this.layers.fill, $splat(style.reflectionColor));
		this.layers.fill.translate(1, 1);
		
		//background
		this.layers.background.draw(style.width - 2, style.height - 3, radM1);
		this.layers.background.fill.apply(this.layers.background, $splat(style.backgroundColor));
		this.layers.background.translate(1, 2);

		return this;
	},

	makeText: function(text, size){
		if (!this.layers.text) return;
		this.layers.text.draw(text, size);
		this.fontBounds = this.textLayer.measure();
	}

});
