
ART.Widget.Panel = new Class({
	
	Includes: [
		ART.Widget.Paint,
		Macro.stateful({
			'collapsed': ['collapse', 'expand']
		})
	],
	
	name: 'panel',
	
	layout: {},
	
	layered: {
	  shadow:  ['shadow'],
	  stroke:  ['stroke'],
	  reflection: ['fill', ['reflectionColor']],
  	background: ['fill', ['backgroundColor']],
	  innerShadow:  ['inner-shadow']
	}
	
});