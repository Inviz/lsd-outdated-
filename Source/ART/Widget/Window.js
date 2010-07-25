/*
Script: ART.Widget.Window.js

License:
	MIT-style license.
*/

// Window Widget. Work in progress.
ART.Widget.Window = new Class({
	
	Includes: [
		ART.Widget.Paint,
		ART.Widget.Trait.Aware,
		Widget.Trait.Animated,
		Macro.stateful({
			'closed': ['close', 'open'],
			'collapsed': ['collapse', 'expand']
		})
	],
	
	name: 'window',
	
	layout: {},
	
	events: {
	  buttons: {
	    close: {
	      click: 'close'
	    },
	    collapse: {
	      click: 'collapse'
	    },
	    expand: {
	      click: 'expand'
	    }
	  }
	},
	
	layered: {
	  shadow:  ['shadow'],
	  stroke:  ['stroke'],
	  reflection: ['fill', ['reflectionColor']],
  	background: ['fill', ['backgroundColor']],
	},
	
	initialize: function() {
		this.parent.apply(this, arguments);
		this.inject(document.body);
		
	
		return true;
	},
	
	close: Macro.onion(function() {
		this.hide();
	}),
	
	getResized: function() {
	  return this.content;
	}
	
});

ART.Widget.Ignore.states.push('dirty');