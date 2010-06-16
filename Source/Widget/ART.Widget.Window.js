/*
Script: ART.Widget.Window.js

License:
	MIT-style license.
*/

// Window Widget. Work in progress.





ART.Widget.Window = new Class({
	
	Extends: Class.inherit(
		ART.Widget.Paint,
		ART.Widget.Traits.Aware,
		Widget.Animated,
		Widget.Stateful({
			'closed': ['close', 'open'],
			'collapsed': ['collapse', 'expand']
		})
	),
	
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
	  stroke:  ['rectangle-stroke'],
	  reflection: ['rectangle', ['reflectionColor']],
  	background: ['rectangle', ['backgroundColor']],
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