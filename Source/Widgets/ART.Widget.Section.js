ART.Widget.Section = new Class({
  Extends: ART.Widget.Paint,
  
  name: 'section',

	options: {
		element: {
			tag: ART.html5 ? 'section' : 'div'
		}
	},
	
	properties: ['cornerRadius', 'offset'],
	
	layered: {
	  border: ['rectangle', ['borderColor']],
	  fill:  ['rectangle', ['reflectionColor']],
	  background: ['rectangle', ['backgroundColor']],
	}
})