ART.Sheet.define('form.two-column', {
  'margin': [0, 20, 20, 20]
});

ART.Sheet.define('form.two-column label', {
  'float': 'left',
  'clear': 'both',
  'width': '30%',
  'text-align': 'right',
  'margin-right': 16,
  'line-height': 24,
  'margin-bottom': 16
});

ART.Sheet.define('form.two-column input, form.two-column slider, form.two-column select', {
  'float': 'left',
  'margin-bottom': 16
});

ART.Sheet.define('form.two-column slider', {
  'width': 200
})

ART.Sheet.define('form section', {
  'border-bottom': '1px solid #8a8a8a',
  'height': 'auto',
  'margin-top': 20
});

ART.Widget.Form = new Class({
  Extends: ART.Widget.Paint,
  
  name: 'form',

	options: {
		element: {
			tag: 'form'
		}
	},
	
	properties: ['cornerRadius', 'offset'],
	
	layered: {}
})