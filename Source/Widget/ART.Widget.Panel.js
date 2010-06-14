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
  'min-width': 290,
  'width': 'auto',
	'height': 200,
	'corner-radius': 5,
  'margin-left': 10,
	'inner-shadow-blur': 2,
	'inner-shadow-offset-y': 2,
	'inner-shadow-color': hsb(0, 0, 0, 0.25),
	'inner-shadow-offset-x': 0,
	//'stroke-width': 1,
	//'stroke-color': [hsb(0, 0, 68), hsb(0, 0, 86)]
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
	  reflection: ['rectangle', ['reflectionColor']],
  	background: ['rectangle', ['backgroundColor']],
	  innerShadow:  ['inner-shadow']
	}
	
});