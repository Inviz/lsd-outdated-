ART.Sheet.define('panel', {		
	'float': 'left',
	'fill-color': hsb(0, 0, 100),
	'margin-bottom': 10
});

ART.Sheet.define('panel#left', {		
	'width': 158,
	'height': 198,
	'border': '1px solid #b8b8b8'
});

ART.Sheet.define('panel#right', {		
  'float': 'right',
  'width': 290,
	'height': 200,
	'corner-radius': 5,
  'margin-left': 10,
	'shadow-blur': 3,
	'shadow-offset-y': 0,
	'shadow-color': hsb(0, 0, 0, 0.2)
});




ART.Widget.Panel = new Class({
	
	Extends: Class.inherit(
		ART.Widget.Paint,
		Widget.Stateful({
			'collapsed': ['collapse', 'expand']
		})
	),
	
	name: 'panel',
	
	layout: {},
	
	layered: {
	  shadow:  ['shadow'],
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
	}
	
});