ART.Sheet.define('input, textarea', {		
	'corner-radius': 3,
	'stroke-color': hsb(0, 0, 50),
	'stroke-width': 1,
	'fill-color': [hsb(0, 0, 90), hsb(0, 0, 95)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 70, 0)],
	'width': 200,
	'height': 20
});

ART.Sheet.define('input#search', {	
	'height': 20,
	'corner-radius': 10,
	'width': 150,
	'fill-color': hsb(0, 0, 100, 1)
});

ART.Sheet.define('input#search glyph', {	
  'height': 20,
  'width': 22,
  'float': 'left'
});


ART.Sheet.define('input#search button', {
  'fill-color': false,
  'shadow-color': false,
  'reflection-color': false,
  'background-color': false,
  'stroke-width': 0,
  'shadow-blur': 0
})


ART.Sheet.define('input#search button#glyph', {	
  'corner-radius': 7,
  'glyph': ART.Glyphs.search,
  'glyph-left': 2,
  'glyph-top': 2,
  'glyph-color': hsb(0, 0, 40),
  'height': 20,
  'width': 20,
  'margin-top': 2,
  'margin-left': 2,
  'margin-right': 0
});

ART.Sheet.define('input#search:detailed button#glyph', {	
  'icon': ART.Glyphs.triangleDown,
  'icon-left': 14,
  'icon-top': 7,
  'icon-scale': 0.7,
  'margin-right': 5
});

ART.Sheet.define('input#search button#glyph:active', {
  'background-color': false,
  'glyph-color': hsb(0, 0, 30)
});	

ART.Sheet.define('input#search button#canceller', {	
  'corner-radius': 7,
  'glyph': ART.Glyphs.smallCross,
  'glyph-left': 1,
  'glyph-top': 2,
  'glyph-scale': 1.15,
  'height': 14,
  'width': 14,
  'glyph-color': hsb(0, 0, 100),
  'background-color': hsb(0, 0, 60),
  'margin-top': 1,
  'margin-right': 4,
  'margin-left': 0,
  'display': 'none'
});

ART.Sheet.define('input#search:filled button#canceller', {	
  'display': 'block'
});

ART.Sheet.define('textarea', {		
  'height': 88
});

ART.Sheet.define('input:focused, textarea:focused', {		
  'shadow-color': hsb(212, 58, 93),
  'shadow-blur': 5,
  'shadow-offset-y': 0,
	'stroke-color': hsb(212, 58, 93)
});


ART.Widget.Input = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint,
    ART.Widget.Traits.HasInput
  ),
  
  name: 'input',
  
  layered: {
    shadow:  ['shadow'],
    stroke: ['rectangle-stroke'],
	  background:  ['rectangle', ['backgroundColor', 'strokeWidth', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'], function(width, height, cornerRadius, color, stroke, shadow, x, y) {
	    this.draw(width, height, cornerRadius.map(function(r) { return r + stroke}));
  		if (color) this.fill.apply(this, $splat(color));
  		if (stroke || shadow) this.translate(stroke  + Math.max(shadow - x, 0), stroke + Math.max(shadow - y, 0))
	  }],
	  reflection:  ['rectangle', ['reflectionColor', 'strokeWidth', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'], function(width, height, cornerRadius, color, stroke, shadow, x, y) {
	    this.draw(width, height, cornerRadius.map(function(r) { return r + stroke}));
  		if (color) this.fill.apply(this, $splat(color));
  		if (stroke || shadow) this.translate(stroke + Math.max(shadow - x, 0), stroke + Math.max(shadow - y, 0))
	  }],
    glyph: ['shape', ['glyphLeft', 'glyphTop', 'glyphScale', 'strokeWidth', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'], function(glyph, color, left, top, scale, stroke, shadow, x, y) {
	    if (!glyph) return;
	    this.draw(glyph);
  		if (color) this.fill.apply(this, $splat(color));
  		this.translate(left + stroke + Math.max(shadow - x, 0), top + stroke + Math.max(shadow - y, 0));
  		if (scale) this.scale(scale, scale)
	  }]
	},
	
	focus: Macro.onion(function() {
	  this.input.focus();
	})
});

ART.Widget.Input.Search = new Class({
  Extends: Class.inherit(
    ART.Widget.Input,
    Widget.Stateful({
    	'expanded': ['expand', 'collapse'],
    	'detailed': ['enrich', 'clean']
    }),
    ART.Widget.Traits.Observer,
    ART.Widget.Traits.HasMenu,
    ART.Widget.Traits.Aware,
    ART.Widget.Traits.Accessible
  ),
  
  items: [1,2],
  
  layout: {
    'input-icon#glyph': {},
    'button#canceller': {}
  },
  
  options: {
    menu: {
      position: 'bottom'
    }
  },
  
  
  attach: Macro.onion(function() {
    if (this.hasItems()) {
      this.enrich();
    } else {
      this.clean();
    }
  }),
  
  setInputSize: Macro.onion(function() {
    if (!this.resorted && this.glyph.element.parentNode) {
      this.resorted = true;
      $(this.input).inject(this.glyph, 'after')
    }
    if (this.canceller) this.canceller.refresh();
  }),
  
  events: {
    glyph: {
      click: 'expand'
    },
    canceller: {
      click: 'empty'
    }
  },
  
  empty: Macro.onion(function() {
    this.input.set('value', '');
  })
});



ART.Widget.Input.Icon = new Class({
  name: 'button', 
  
  Extends: Class.inherit(
    ART.Widget.Button,
    ART.Widget.Traits.Icon
  )
})
