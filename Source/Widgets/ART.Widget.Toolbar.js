ART.Sheet.define('toolbar', {		
	'width': 'inherit'
});

ART.Sheet.define('panel toolbar', {		
	'height': 20,
	'line-height': 30,
	'vertical-align': 'middle',
	'border-top': '1px solid #d4d4d4',
	'fill-color': hsb(0, 0, 92),
	'reflection-color': [hsb(0, 0, 100, 0.5), hsb(0, 0, 100, 0)]
});

ART.Sheet.define('panel toolbar button', {
  'height': 20,
  'width': 24,
  'vertical-align': 'middle',
  'corner-radius': 0,
  'margin-right': 0,
  'border-right': '1px solid #d4d4d4',
	'shadow-blur': 0,
	'shadow-offset-y': 0,
	'stroke-width': 0,
	'fill-color': false,
	'reflection-color': false,
	'background-color': [],
  'glyph-scale': 1,
  'glyph-top': 4,
  'glyph-left': 6,
  'glyph-color': hsb(0, 0, 0, 0.7)
});	

ART.Sheet.define('panel toolbar button#add', {
  'glyph': ART.Glyphs.smallPlus
});

ART.Sheet.define('panel toolbar button#remove', {
  'glyph': ART.Glyphs.smallMinus
});

ART.Sheet.define('panel toolbar button#configure', {
  'glyph': ART.Glyphs.wrench
});


ART.Widget.Toolbar = new Class({
	
	Extends: ART.Widget.Paint,
	
	name: 'toolbar',
	
	layout: {},
	
	layered: {
	  stroke:  ['rectangle-stroke'],
	  reflection: ['rectangle', ['reflectionColor'], function(width, height, cornerRadius, color) {
      if (!color) return false;
  	  this.draw(width, height, cornerRadius);
  		if (color) this.fill.apply(this, $splat(color));
  	}],
  	background: ['rectangle', ['backgroundColor'], function(width, height, cornerRadius, color) {
      if (!color) return false;
  	  this.draw(width, height, cornerRadius);
  		if (color) this.fill.apply(this, $splat(color));
  	}],
	},
	
	position: 'absolute',
	
	attach: Macro.onion(function() {
	  switch (this.options.position) {
	    case "bottom":
	      this.element.setStyles({bottom: 0, left: 0});
	      break;
	    case "top":
	      this.element.setStyles({top: 0, left: 0});
	      break;
	  }
	})
	
});