/*
Script: ART.Widget.Window.js

License:
	MIT-style license.
*/

// Window Widget. Work in progress.

ART.Sheet.define('*', {
  'shadow-blur': 0,
	'shadow-offset-x': 0,
	'shadow-offset-y': 0,
  'stroke-width': 0
})


ART.Sheet.define('window', {		
	'display': 'inline-block',
	'vertical-align': 'top',
	'width': 'auto',
	'height': 'auto',
	'shadow-blur': 20,
	'shadow-offset-y': 5,
	'shadow-color': hsb(0, 0, 0, 0.5)
});

ART.Sheet.define('window.hud', {		
	'corner-radius': 15
});


ART.Sheet.define('window.hud #content', {
	'height': 70,
	'background-color': [hsb(0, 0, 0, 0.6), hsb(0, 0, 20, 0.5)],
	'reflection-color': [hsb(0, 0, 100, 0.6), hsb(0, 0, 10, 0)]
});



ART.Sheet.define('window.hud #header', {
	'corner-radius-top-left': 'inherit',
	'corner-radius-top-right': 'inherit',
	'height': 28,
	'background-color': [hsb(0, 0, 0, 0.55), hsb(0, 0, 0, 0.5)],
	'reflection-color': [hsb(0, 0, 0, 0), hsb(0, 0, 0, 0)]
});

ART.Sheet.define('window.hud #content', {
  'corner-radius-bottom-left': 'inherit',
  'corner-radius-bottom-right': 'inherit',
});


ART.Sheet.define('window.hud button', {
	'height': 16,
	'width': 16,
	'cursor': 'pointer',
	'background-color': [hsb(0, 0, 0, 0.4), hsb(0, 0, 0, 0.5)],
	'reflection-color': [hsb(0, 0, 0, 0.3), hsb(0, 0, 0, 0)],
	'glyph-color': hsb(82, 0, 100, 0.5),
	'corner-radius': 7,
	'float': 'left',
	'margin-left': 5
});

ART.Sheet.define('window.fancy #buttons:hover button', {
  'glyph-color': hsb(0, 0, 20, 0.7)
});

ART.Sheet.define('window.fancy #buttons #close', {
  'fill-color': ['radial', {0: hsb(0, 95, 80), 0.9: hsb(0, 97, 73), 1: hsb(359, 65, 22)}, {cy: '55%', r: '42%', fy: '55%'}],
  'stroke-color': [hsb(359, 71, 60), hsb(359, 24, 75)]
});

ART.Sheet.define('window.fancy #buttons #close:active', {
  'fill-color': ['radial', {0: hsb(0, 95, 70), 0.8: hsb(0, 97, 63), 1: hsb(359, 65, 32)}, {cy: '55%', r: '42%', fy: '55%'}]
});

ART.Sheet.define('window.fancy #buttons #minimize', {
  'fill-color': ['radial', {0: hsb(58, 95, 80), 0.8: hsb(28, 66, 85), 1: hsb(2, 64, 58)}, {cy: '55%', r: '44%', fy: '55%'}],
  'stroke-color': [hsb(55, 71, 40), hsb(45, 24, 75)]
});

ART.Sheet.define('window.fancy #buttons #minimize:active', {
  'fill-color': ['radial', {0: hsb(58, 95, 70), 0.8: hsb(28, 66, 75), 1: hsb(2, 64, 48)}, {cy: '55%', r: '44%', fy: '55%'}]
});

ART.Sheet.define('window.fancy #buttons #maximize', {
  'fill-color': ['radial', {0: hsb(100, 76, 76), 0.8: hsb(95, 46, 73), 1: hsb(103, 53, 43)}, {cy: '55%', r: '44%', fy: '55%'}],
  'stroke-color': [hsb(55, 71, 40), hsb(45, 24, 75)]
});

ART.Sheet.define('window.fancy #buttons #maximize:active', {
  'fill-color': ['radial', {0: hsb(100, 76, 66), 0.8: hsb(95, 46, 63), 1: hsb(103, 53, 33)}, {cy: '55%', r: '44%', fy: '55%'}]
});

ART.Sheet.define('window.hud #buttons #close', {
	'stroke-color': hsb(82, 0, 100, 0.3),
	'glyph-top': 2,
	'glyph-left': 2
});

ART.Sheet.define('window #footer, window #header', {	
  'width': 'auto',
  'display': 'block'
});

ART.Sheet.define('window #content', {
  'width': 300,
  'min-height': 50
})

ART.Sheet.define('window.fancy', {		
  'corner-radius-bottom-left': 5,
  'corner-radius-bottom-right': 5,
  'corner-radius-top-left': 5,
  'corner-radius-top-right': 5,
	'stroke-width': 5,
	'stroke-cap': 'square',
	'stroke-color': hsb(0, 0, 10, 0.5),
  'stroke-dash': false
});


ART.Sheet.define('window#preferences, window#network', {
  'stroke-width': 1,
  'stroke-color': hsb(0, 0, 40, 0.5),
	'corner-radius-bottom-left': 0,
	'corner-radius-bottom-right': 0
});

ART.Sheet.define('window#preferences #content', {		
	'width': 400,
	'height': 'auto',
	'background-color': hsb(0, 0, 93),
	'border-top': '1px solid #666'
});

ART.Sheet.define('window#network #content', {		
	'width': 500,
	'height': 'auto',
	'display': 'block',
	'min-width': 500,
	'background-color': hsb(0, 0, 93),
	'border-top': '1px solid #666'
});


ART.Sheet.define('window#network #actions', {
  'float': 'right', 
  'margin-bottom': 10
});

ART.Sheet.define('window#network #actions button', {
  'corner-radius': 10,
  'margin-left': 5,
  'margin-right': 0,
	'shadow-color': hsb(0, 0, 10, 0.2),
	'shadow-blur': 3,
	'shadow-offset-y': 1,
});


ART.Sheet.define('window.fancy:dragged', {		
  'cursor': 'move',
	'stroke-color': hsb(0, 0, 10, 0.2),
	'shadow-blur': 25,
	'shadow-offset-y': 12,
});

ART.Sheet.define('window#browser:dragged', {	
  'stroke-dash': '10, 2, 2',
});


ART.Sheet.define('window.fancy #header', {
	'corner-radius-top-left': 'inherit',
	'corner-radius-top-right': 'inherit',
	'padding-right': 5,
	'padding-top': 3,
	'padding-left': 5,
	'padding-bottom': 3,
	'height': 'auto',
	'background-color': [hsb(0, 0, 80), hsb(0, 0, 60)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)],
	'border-bottom-width': 1,
	'border-bottom-style': 'solid',
	'border-bottom-color': '#979797'
});

ART.Sheet.define('window #header input#search', {
	'float': 'right'
})

ART.Sheet.define('window.fancy #toolbar', {
	'clear': 'both',
	'padding-top': 5,
	'background-color': [hsb(0, 0, 80), hsb(0, 0, 60)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)]
});

ART.Sheet.define('window.fancy #content', {
	'height': 150,
	'background-color': [hsb(0, 0, 80, 0.3), hsb(0, 0, 70, 0.4)],
	'reflection-color': [hsb(0, 0, 100, 0.3), hsb(0, 0, 0, 0)]
});


ART.Sheet.define('window.fancy #footer', {	
	'corner-radius-bottom-left': 'inherit',
	'corner-radius-bottom-right': 'inherit',
	'background-color': [hsb(0, 0, 80), hsb(0, 0, 70)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 0, 0)],
	'height': 'auto',
	'border-top-width': 1,
	'border-top-style': 'solid',
	'border-top-color': '#979797'
});

ART.Sheet.define('window #header #buttons', {
	'float': 'left',
	'height': 16
});

ART.Sheet.define('container#legend', {
  'text-align': 'center',
  'margin-top': 15
});

ART.Sheet.define('container#legend label, container#legend input, container#legend select', {
	'display': 'inline-block',
	'float': 'none',
	'vertical-align': 'top'
});

ART.Sheet.define('container#legend label', {
	'width': 'auto',
	'float': 'none'
});

ART.Sheet.define('window #header #toggler', {
	'float': 'right',
	'margin-left': -20,
	'margin-right': 0,
	'height': 8,
	'width': 18,
	'corner-radius': 4,
	'reflection-color': [hsb(0, 0, 100, 0.5), hsb(0, 0, 40, 0.5), hsb(0, 0, 100, 0.5)],
	'background-color': [hsb(0, 0, 90, 0.3), hsb(0, 0, 100, 0.9)]
});

ART.Sheet.define('window #header #toggler:active', {
  'fill-color': [hsb(210, 61, 90), hsb(202, 95, 100)]
})


ART.Sheet.define('window #header #buttons button, window #header #toggler, window #toolbar button, input', {
  'shadow-blur': 0,
	'shadow-offset-y': 1,
	'shadow-color': hsb(0, 0, 77)
});

ART.Sheet.define('window #header #buttons button, window #header #toggler', {
	'shadow-color': hsb(0, 0, 85)
})

ART.Sheet.define('window #header #buttons button:active', {
	'shadow-blur': 3,
	'shadow-color': hsb(0, 0, 0)
})

ART.Sheet.define('window button', {
	'height': 13,
	'cursor': 'pointer',
	'fill-color': [hsb(0, 0, 75), hsb(0, 0, 100, 0.3)],
	'background-color': [hsb(0, 0, 95), hsb(0, 0, 0, 0)],
	'shadow-color': hsb(0, 0, 100, 0.4),
	'stroke-color': hsb(0, 0, 45),
	'glyph-color': hsb(0, 0, 30),
	
	'float': 'left',
	'margin-right': 5
});

ART.Sheet.define('window.fancy button:active', {
	'fill-color': [hsb(205, 25, 60), hsb(0, 0, 0, 0)],
	'glyph-color': hsb(0, 0, 100)
});

ART.Sheet.define('window #buttons button', {
	'glyph-left': 0.5,
	'glyph-top': 0,
  'glyph-color': hsb(0, 0, 0, 0),
	'width': 13,
	'height': 13,
	'corner-radius': 6,
  'reflection-color': ['radial', {0.4: hsb(0, 0, 100, 0.6), 0.9: hsb(0, 0, 100, 0)}, {cy: '10%', r: '17%', fy: '50%'}],//['radial', {0.3: hsb(0, 0, 100, 0.396875), 1: hsb(0, 0, 100, 0)}, {cy: '90%', r: '45%', fy: '90%'}],
  'fill-color': hsb(0,0,0,0),
  'background-color': ['radial', {0: hsb(0, 0, 100, 0.7), 0.35: hsb(0, 0, 100, 0.6), 1: hsb(0,0,100,0.2)}, {cy: '90%', r: '60%', fy: '80%'}],
});

ART.Sheet.define('window #close', {
	'glyph': ART.Glyphs.smallCross
});

ART.Sheet.define('window #minimize', {
	'glyph': ART.Glyphs.smallMinus
});

ART.Sheet.define('window #maximize', {
	'glyph': ART.Glyphs.smallPlus
});

ART.Sheet.define('window.fancy:minified #content', {
	'background-color': [hsb(0, 0, 80, 0.5), hsb(0, 0, 70, 0.7)],
	'reflection-color': [hsb(0, 0, 100, 0.5), hsb(0, 0, 0, 0)],
});

ART.Sheet.define('window#preferences:minified #toolbar', {
	'display': 'none'
});

ART.Sheet.define('window #handle', {
	'glyph': ART.Glyphs.resize,
	'glyph-color': hsb(0, 0, 50, 0.5),
	'glyph-top': 2,
  'glyph-left': 0,
  
	
	'width': 13,
	'height': 15,
	'shadow-color': hsb(0, 0, 0, 0.4),
	
	'touchable': true,
	
	'float': 'right',
	'cursor': 'se-resize'
})

ART.Sheet.define('window #handle:active', {
	'glyph-color': hsb(0, 0, 100, 0.7),
	'shadow-color': hsb(0, 0, 0, 0.6)
});


ART.Sheet.define('window.fancy #toolbar button', {
	'height': 20,
	'width': 20,
  'glyph-top': 5,
  'glyph-left': 5,
});

ART.Sheet.define('window.fancy button:text', {
  'width': 'auto',
  'height': 20,
  'padding-left': 5,
  'padding-right': 5,
  'display': 'block'
});

ART.Sheet.define('window.fancy #toolbar button:text', {
  'width': 'auto'
});

ART.Sheet.define('window.fancy #toolbar button:text', {
  'display': 'block'
});

ART.Sheet.define('window.fancy #toolbar button.left', {
	'corner-radius': [3, 0, 0, 3],
	'width': 25,
	'glyph-left': 8,
	'glyph-top': 6,
	'margin-right': 0,
});

ART.Sheet.define('window.fancy #toolbar button.right', {
	'corner-radius': [0, 3, 3, 0],
	'margin-left': -1,
	'glyph-left': 8,
	'glyph-top': 6,
	'width': 25
});

ART.Sheet.define('window.fancy button', {
	'background-color': [hsb(0, 0, 99), hsb(0, 0, 74)],
	'reflection-color': [hsb(0, 0, 30, 0), hsb(0, 0, 40, 0.3)]
});

ART.Sheet.define('window.fancy button:active', {
  'background-color': [hsb(0, 0, 40), hsb(0, 0, 74)]
});

ART.Sheet.define('window.fancy button:disabled', {
	'glyph-color': hsb(0, 0, 50),
	'color': '#777',
	'cursor': 'default'
});

ART.Sheet.define('window#browser #toolbar button', {
  'glyph-scale': 2,
  'glyph-top': 6,
  'glyph-left': 6,
	'height': 36,
	'width': 36
});

ART.Sheet.define('window#browser:minified #toolbar button', {
	'height': 16,
	'width': 16,
	'glyph-top': 2,
	'glyph-left': 2,
	'glyph-scale': 1
});

ART.Sheet.define('window.fancy #toolbar button#search', {
	'glyph': ART.Glyphs.search
});
ART.Sheet.define('window.fancy #toolbar button#reload', {
	'glyph': ART.Glyphs.refresh
});
ART.Sheet.define('window.fancy #toolbar button#wrench', {
	'glyph': ART.Glyphs.wrench
});


ART.Sheet.define('window.fancy #toolbar button#back', {
	'glyph': ART.Glyphs.triangleLeft
});

ART.Sheet.define('window#browser #toolbar button#back', {
	'glyph-top': 11,
	'glyph-left': 10,
	'corner-radius': 18,
	'glyph-scale': 1.5,
	'z-index': 10
});

ART.Sheet.define('window.fancy #toolbar button#forward', {
	'glyph': ART.Glyphs.triangleRight
});

ART.Sheet.define('window#browser #toolbar button#forward', {
	'height': 25,
	'corner-radius': [0, 13, 13, 0],
	'glyph-scale': 1.2,
	'glyph-left': 15,
	'glyph-top': 7,
	'margin-top': 5,
	'margin-left': -15,
	'z-index': 5
});

ART.Sheet.define('window.fancy:minified #toolbar button', {
	'glyph-scale': 1,
	'glyph-top': 2,
	'glyph-left': 2
});

ART.Sheet.define('window#browser:minified #toolbar button#forward, window#browser:minified #toolbar button#back', {
	'corner-radius': 5,
	'glyph-scale': 1,
	'glyph-top': 4,
	'glyph-left': 4
});

ART.Sheet.define('window#browser:minified #toolbar button#forward', {
  'margin-right': 5,
  'margin-left': 0,
	'margin-top': 0,
	'height': 16
});

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