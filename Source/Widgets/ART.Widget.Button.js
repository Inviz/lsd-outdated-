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
	'glyph-top': 2,
	'glyph-left': 2,

	'pill': false,

	'border-radius': 3,
	'background-color': {0: hsb(0, 0, 80), 1: hsb(0, 0, 60)},
	'border-color': hsb(0, 0, 0, 0.7),
	'reflection-color': {0: hsb(0, 0, 100, 1), 1: hsb(0, 0, 0, 0)},
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
	
	render: function(){
		this.parent.apply(this, arguments);
		if (!this.paint) return this;
		
		var style = this.styles.current;
		
		
		if (this.options.label) {
			var font = ART.Paint.lookupFont(style.font);
			var fontBounds = font.measure(style.fontSize, this.options.label);

			if (!style.width) style.width = (fontBounds.x + style.padding[1] + style.padding[3] + 2).round();
			if (!style.height) style.height = (fontBounds.y + style.padding[0] + style.padding[2] + 2).round();
		}
		
		
		this.paint.resize({x: style.width, y: style.height + 1});
		this.element.setStyles({width: style.width, height: style.height + 1});

		var shape = (style.pill) ? (style.width > style.height) ? 'horizontal-pill' : 'vertical-pill' : 'rounded-rectangle';

		this.paint.start({x: 0, y: 0});
		this.paint.shape(shape, {x: style.width, y: style.height + 1}, style.borderRadius + 1);
		this.paint.end({'fill': true, 'fillColor': style.shadowColor});

		this.paint.start({x: 0, y: 0});
		this.paint.shape(shape, {x: style.width, y: style.height}, style.borderRadius + 1);
		this.paint.end({'fill': true, 'fillColor': style.borderColor});

		this.paint.start({x: 1, y: 1});
		this.paint.shape(shape, {x: style.width - 2, y: style.height - 2}, style.borderRadius);
		this.paint.end({'fill': true, 'fillColor': style.reflectionColor});

		this.paint.start({x: 1, y: 2});
		this.paint.shape(shape, {x: style.width - 2, y: style.height - 3}, style.borderRadius);
		this.paint.end({'fill': true, 'fillColor': style.backgroundColor});

		if (style.glyph){
			this.paint.start({x: style.glyphLeft, y: style.glyphTop});
			this.paint.shape(style.glyph, {x: style.glyphWidth, y: style.glyphHeight});
			this.paint.end({'stroke': true, 'strokeWidth': style.glyphStroke, 'strokeColor': style.glyphColor});
		}

		this.paint.start({x: style.padding[3] + 1, y: style.padding[0] + 1});
		this.paint.text(font, style.fontSize, this.options.label);
		this.paint.end({'fill': true, 'fillColor': style.fontColor});

		return this;
	}

});
