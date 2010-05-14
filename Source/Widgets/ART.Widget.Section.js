ART.Sheet.define('section.row', {
  
});

ART.Sheet.define('section.row.odd', {
  
});

ART.Sheet.define('section.row.even', {
  
});


ART.Sheet.define('section', {
	'width': 'inherit'
});

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
	  fill:  ['rectangle-stroke'],
	  reflection:  ['rectangle', ['reflectionColor']],
	  background: ['rectangle', ['backgroundColor']]
	}
})