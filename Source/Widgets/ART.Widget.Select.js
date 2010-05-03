ART.Sheet.define('select', {		
	'corner-radius': 3,
	'stroke-color': hsb(0, 0, 50),
	'stroke-width': 1,
	'fill-color': [hsb(0, 0, 90), hsb(0, 0, 95)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 70, 0)],
	'width': 200,
	'height': 20
});

ART.Sheet.define('window.fancy select button', {		
	'width': 20,
	'height': 20,
	'margin-right': -1,
	'margin-top': -1,
	'float': 'right',
	'glyph-top': 7,
	'glyph-scale': 0.8,
	'glyph-left': 7,
	'glyph': ART.Glyphs.triangleDown
});
ART.Sheet.define('select:focused', {		
  'shadow-color': hsb(212, 58, 93),
  'shadow-blur': 5,
  'shadow-offset-y': 0,
	'stroke-color': hsb(212, 58, 93, 0.3)
});


ART.Widget.Select = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint,
    Widget.Stateful({
    	'expanded': ['expand', 'collapse']
    }),
    ART.Widget.Traits.HasMenu
  ),
  
  name: 'select',
  
  layered: {
    shadow:  ['shadow'],
    stroke: ['rectangle-stroke'],
	  background:  ['rectangle', ['backgroundColor', 'strokeWidth', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'], function(width, height, cornerRadius, color, stroke, shadow, x, y) {
	    this.draw(width, height, cornerRadius.map(function(r) { return r + stroke}));
  		if (color) this.fill.apply(this, $splat(color));
  		if (stroke || shadow) this.translate(stroke  + shadow - x, stroke + shadow - y)
	  }],
	  reflection:  ['rectangle', ['reflectionColor', 'strokeWidth', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'], function(width, height, cornerRadius, color, stroke, shadow, x, y) {
	    this.draw(width, height, cornerRadius.map(function(r) { return r + stroke}));
  		if (color) this.fill.apply(this, $splat(color));
  		if (stroke || shadow) this.translate(stroke + shadow - x, stroke + shadow - y)
	  }],
    glyph: ['shape', ['glyphLeft', 'glyphTop', 'glyphScale', 'strokeWidth', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'], function(glyph, color, left, top, scale, stroke, shadow, x, y) {
	    if (!glyph) return;
	    this.draw(glyph);
  		if (color) this.fill.apply(this, $splat(color));
  		this.translate(left + stroke + shadow - x, top + stroke + shadow - y);
  		if (scale) this.scale(scale, scale)
	  }]
	},
	
	layout: {
	  'select-button#button': {}
	},
	
	events: {
	  element: {
  	  click: 'expand'
	  }
	}
});

ART.Widget.Select.Button = new Class({
  Extends: ART.Widget.Button
})