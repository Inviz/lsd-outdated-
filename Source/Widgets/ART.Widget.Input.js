ART.Sheet.define('input, textarea', {		
	'corner-radius': 3,
	'stroke-color': hsb(0, 0, 50),
	'stroke-width': 1,
	'fill-color': [hsb(0, 0, 90), hsb(0, 0, 95)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 70, 0)],
	'width': 200,
	'height': 26
});

ART.Sheet.define('input#search', {	
	'height': 20,
	'corner-radius': 10,
	'width': 150,
	'glyph': ART.Glyphs.search,
	'glyph-color': hsb(0, 0, 50),
	'glyph-top': 4,
	'glyph-left': 4,
	'glyph-right': 4
});


ART.Sheet.define('textarea', {		
  'height': 88
});

ART.Sheet.define('input:focused, textarea:focused', {		
  'shadow-color': hsb(212, 58, 93),
  'shadow-blur': 5,
  'shadow-offset-y': 0,
	'stroke-color': hsb(212, 58, 93, 0.3)
});


ART.Widget.Input = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint
  ),
  
  name: 'input',
  
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
	
	
	initialize: function() {
	  this.parent.apply(this, arguments);
	  this.getInput().addEvents({
	    blur: this.blur.bind(this),
	    focus: this.focus.bind(this)
	  });
	  this.addEvent('resize', this.setInputSize.bind(this))
	  return true;
	},
	
  build: function() {
    if (!this.parent.apply(this, arguments)) return;
    this.getInput().inject(this.element);
    return true;
  },
  
  getInput: function() {
    if (!this.input) this.input = new Element('input', {'type': 'text'});
    return this.input;
  },
  
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
    this.input.setStyle('width', width);
  }
})