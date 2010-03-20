/*
Script: ART.Widget.Window.js

License:
	MIT-style license.
*/

// Window Widget. Work in progress.


ART.Sheet.define('section', {
	'width': 'inherit'
});


ART.Sheet.define('window', {		
	'width': 300,
	'height': 'auto',
	'shadow-blur': 20,
	'shadow-offset-y': 5,
	'shadow-color': hsb(0, 0, 0, 1),
	'stroke-width': 1,
	'stroke-color': hsb(0, 0, 0, 1)
});


ART.Sheet.define('window.hud', {		
	'border-radius': 15,
	'border-color': hsb(0, 0, 0, 1)
});


ART.Sheet.define('window.hud #content', {
	'stroke-cap': 'square',
	'stroke-color-y': 0,
	'height': 70,
	'background-color': {0: hsb(0, 0, 0, 0.6), 1: hsb(0, 0, 20, 0.5)},
	'reflection-color': {0: hsb(0, 0, 100, 0.6), 1: hsb(0, 0, 10, 0)}
});



ART.Sheet.define('window.hud #header', {
	'border-radius-top-left': 'inherit',
	'border-radius-top-right': 'inherit',
	'height': 26,
	'background-color': {0: hsb(0, 0, 0, 0.55), 1: hsb(0, 0, 0, 0.5)},
	'reflection-color': {0: hsb(0, 0, 0, 0), 1: hsb(0, 0, 0, 0)}
});

ART.Sheet.define('window.hud #content', {
  'border-radius-bottom-left': 'inherit',
  'border-radius-bottom-right': 'inherit',
});


ART.Sheet.define('window.hud button', {
	'height': 16,
	'width': 16,
	'cursor': 'pointer',
	'background-color': {0: hsb(0, 0, 0, 0.4), 1: hsb(0, 0, 0, 0.5)},
	'reflection-color': {0: hsb(0, 0, 0, 0.3), 1: hsb(0, 0, 0, 0)},
	'shadow-color': hsb(0, 0, 100, 0.2),
	'border-color': hsb(82, 0, 100, 0.5),
	'glyph-color': hsb(82, 0, 100, 0.5),
	'border-radius': 7,
	'float': 'left',
	'margin-left': 5
});


ART.Sheet.define('window.hud #buttons #close', {
	'glyph': 'close-icon',
	'stroke-width': 1,
	'stroke-color': hsb(82, 0, 100, 0.3),
	'glyph-height': 8,
	'glyph-width': 8,
	'glyph-top': 4,
	'glyph-left': 4
});

ART.Sheet.define('window #footer, window #content, window #header', {	
	'stroke-width': 0,
	'stroke-color': hsb(0, 0, 72, 100)
});

ART.Sheet.define('window.fancy', {		
	'border-radius': 5
});


ART.Sheet.define('window.fancy #header', {
	'border-radius-top-left': 'inherit',
	'border-radius-top-right': 'inherit',
	'height': 'auto',
	'background-color': {0: hsb(0, 0, 80), 1: hsb(0, 0, 60)},
	'reflection-color': {0: hsb(0, 0, 100, 1), 1: hsb(0, 0, 0, 0)},
	'border-bottom-width': 1,
	'border-bottom-style': 'solid',
	'border-bottom-color': '#979797'
});

ART.Sheet.define('window.fancy #header #toolbar', {
	'height': 30,
	'clear': 'both',
	'background-color': {0: hsb(0, 0, 80), 1: hsb(0, 0, 60)},
	'reflection-color': {0: hsb(0, 0, 100, 1), 1: hsb(0, 0, 0, 0)},
	'border-bottom-width': 1,
	'border-bottom-style': 'solid',
	'border-bottom-color': '#979797'
});

ART.Sheet.define('window.fancy #content', {
	'stroke-cap': 'square',
	'stroke-color-y': 0,
	'height': 150,
	'background-color': {0: hsb(0, 0, 80, 0.3), 1: hsb(0, 0, 70, 0.4)},
	'reflection-color': {0: hsb(0, 0, 100, 0.3), 1: hsb(0, 0, 0, 0)}
});


ART.Sheet.define('window.fancy #footer', {	
	'border-radius-bottom-left': 'inherit',
	'border-radius-bottom-right': 'inherit',
	'background-color': {0: hsb(0, 0, 80), 1: hsb(0, 0, 70)},
	'reflection-color': {0: hsb(0, 0, 100, 1), 1: hsb(0, 0, 0, 0)},
	'height': 16,
	'border-top-width': 1,
	'border-top-style': 'solid',
	'border-top-color': '#979797'
});

ART.Sheet.define('window #header #buttons', {
	'float': 'left',
	'height': 24,
	'margin-left': 5,
	'margin-top': 5
});

ART.Sheet.define('window.fancy button', {
	'pill': true,
	'height': 14,
	'width': 14,
	'cursor': 'pointer',
	'background-color': {0: hsb(0, 0, 75), 1: hsb(0, 0, 55)},
	'reflection-color': {0: hsb(0, 0, 95), 1: hsb(0, 0, 0, 0)},
	'shadow-color': hsb(0, 0, 100, 0.4),
	'border-color': hsb(0, 0, 45),
	'glyph-color': hsb(0, 0, 0, 0.6),
	
	'float': 'left',
	'margin-left': 5
});

ART.Sheet.define('window.fancy button:active', {
	'reflection-color': {0: hsb(205, 25, 60), 1: hsb(0, 0, 0, 0)},
	'border-color': hsb(200, 35, 45),
	'glyph-color': hsb(0, 0, 100)
});

ART.Sheet.define('window #buttons button', {
	'glyph-height': 8,
	'glyph-width': 8,
	'glyph-top': 3,
	'glyph-left': 3
});

ART.Sheet.define('window.fancy #buttons #close', {
	'glyph': 'close-icon',
	'glyph-height': 6,
	'glyph-width': 6,
	'glyph-top': 4,
	'glyph-left': 4
});

ART.Sheet.define('window #minimize', {
	'glyph': 'minus-icon'
});

ART.Sheet.define('window #maximize', {
	'glyph': 'plus-icon'
});

ART.Sheet.define('window:collapsed #minimize', {
	'display': 'none'
});

ART.Sheet.define('window:collapsed #content', {
	'background-color': {0: hsb(0, 0, 80, 0.5), 1: hsb(0, 0, 70, 0.7)},
	'reflection-color': {0: hsb(0, 0, 100, 0.5), 1: hsb(0, 0, 0, 0)},
});

ART.Sheet.define('window:collapsed #maximize', {
	'display': 'block'
});

ART.Sheet.define('window #maximize', {
	'display': 'none'
});

ART.Sheet.define('window #handle', {
	'glyph': 'drag-handle',
	'glyph-color': hsb(0, 0, 100, 0.5),
	'glyph-width': 10,
	'glyph-height': 10,
	
	'width': 15,
	'height': 15,
	'shadow-color': hsb(0, 0, 0, 0.4),
	
	'touchable': true,
	
	'float': 'right',
	'margin-right': 2,
	'margin-top': 3,
	'cursor': 'se-resize'
})

ART.Sheet.define('window #handle:active', {
	'glyph-color': hsb(0, 0, 100, 0.7),
	'shadow-color': hsb(0, 0, 0, 0.6)
});

ART.Widget.Window = new Class({
	
	Extends: Class.inherit(
		ART.Widget.Paint,
		Widget.Animated,
		Widget.Stateful({
			'closed': ['close', 'open'],
			'collapsed': ['collapse', 'expand']
		})
	),
	
	name: 'window',
	
	layout: {},
	
	initialize: function() {
		this.parent.apply(this, arguments);
		this.inject(document.body);
		
		if (this.header.buttons.close) this.header.buttons.close.addEvent('click', this.close.bind(this));
		if (this.header.buttons.minimize) this.header.buttons.minimize.addEvent('click', this.collapse.bind(this));
		if (this.header.buttons.maximize) this.header.buttons.maximize.addEvent('click', this.expand.bind(this));
		return true;
	},
	
	close: function() {
		if (!this.parent.apply(this, arguments)) return;
		this.hide();
	},
	
	render: function() {
		if (!this.parent.apply(this, arguments)) return;
		
		var style = this.styles.current;
		var width = this.getStyle('width') + (this.styles.current.strokeWidth || 0);
		var height = this.getStyle('height') - (this.styles.current.strokeWidth || 0);
		
		
		if (style.reflectionColor) {
			this.paint.start(this.getPaintOffsetXY());
			this.paint.shape('rounded-rectangle', {x: width, y: height}, this.getPaintStyle('borderRadius'));
			this.paint.end({
				fill: !!style.reflectionColor, 
				fillColor: style.reflectionColor
			});
		}
		
		
		var opts = {
			fill: !!style.backgroundColor, 
			fillColor: style.backgroundColor
		};
		
		if (style.shadowBlur && style.shadowColor) {
			$extend(opts, {
				shadowBlur: style.shadowBlur,
				shadowColor: style.shadowColor,
				shadowOffsetX: style.shadowOffsetX || 0,
				shadowOffsetY: style.shadowOffsetY || 0, 
				
				stroke: (style.strokeWidth && style.strokeColor), 
				strokeColor: style.strokeColor, 
				strokeWidth: style.strokeWidth
			})
		}
		
		var offset = this.getPaintOffset();
		$(this.paint).setStyles({
		  'left': - offset.left,
		  'top': - offset.top
		})
		console.log('window offset', offset, opts)
		this.paint.start(this.getPaintOffsetXY(offset));
		this.paint.shape('rounded-rectangle', {x: width, y: height}, this.getPaintStyle('borderRadius'));
		this.paint.end(opts);
		
		this.paint.start(this.getPaintOffsetXY(offset));
		this.paint.shape('rounded-rectangle', {x: width, y: height}, this.getPaintStyle('borderRadius'));
		this.paint.end({clip: true});
		
		
		return true;
	}
	
});