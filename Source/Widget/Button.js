/*
Script: ART.Widget.Button.js

License:
	MIT-style license.
*/

// Button Widget. Work in progress.

ART.Widget.Button = new Class({

	Extends: Class.inherit(
		ART.Widget.Paint,
		ART.Widget.Traits.Touchable
	),

	name: 'button',

	options: {
		label: ''
	},
	
	events: {
	  element: {
	    click: 'onClick'
	  }
	},
	
	layered: {
	  shadow:  ['shadow'],
    stroke: ['rectangle-stroke'],
	  background:  ['rectangle-shadow', ['backgroundColor']],
	  reflection:  ['rectangle-shadow', ['reflectionColor']],
    glyph: ['shape-shadow']
	},
	
	onClick: function() {
		this.fireEvent('click', arguments);
	},

  setContent: Macro.onion(function(content) {
    this.addPseudo('text')
  })

});
