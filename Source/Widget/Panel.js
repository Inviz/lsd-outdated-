
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