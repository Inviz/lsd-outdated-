ART.Sheet.define('select', {		
	'corner-radius': 3,
	'stroke-color': hsb(0, 0, 50),
	'stroke-width': 1,
	'fill-color': [hsb(0, 0, 90), hsb(0, 0, 95)],
	'reflection-color': [hsb(0, 0, 100, 1), hsb(0, 0, 70, 0)],
	'width': 200,
	'height': 20
});
ART.Sheet.define('window.fancy select button', {		
	'width': 20,
	'height': 20,
	'margin-right': -1,
	'margin-top': -1,
	'float': 'right',
	'glyph-top': 7,
	'glyph-scale': 0.8,
	'glyph-left': 7,
	'glyph': ART.Glyphs.triangleDown
});
ART.Sheet.define('select:focused', {		
  'shadow-color': hsb(212, 58, 93),
  'shadow-blur': 5,
  'shadow-offset-y': 0,
	'stroke-color': hsb(212, 58, 93)
});

ART.Sheet.define('select:focused button', {		
	'stroke-color': hsb(212, 58, 93, 0.5),
	'margin-bottom': -1,
	'margin-left': 1
});


ART.Widget.Select = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint,
    Widget.Stateful({
    	'expanded': ['expand', 'collapse']
    }),
    ART.Widget.Traits.HasMenu,
    ART.Widget.Traits.HasList,
    ART.Widget.Traits.Chooser,
    ART.Widget.Traits.Focusable,
    ART.Widget.Traits.Accessible
  ),
  
  name: 'select',
  
  layered: {
    shadow:  ['shadow'],
    stroke: ['rectangle-stroke'],
	  background:  ['rectangle', ['backgroundColor', 'strokeWidth', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'], function(width, height, cornerRadius, color, stroke, shadow, x, y) {
	    this.draw(width, height, cornerRadius.map(function(r) { return r + stroke}));
  		if (color) this.fill.apply(this, $splat(color));
  		if (stroke || shadow) this.translate(stroke  + Math.max(shadow - x, 0), stroke + Math.max(shadow - y, 0))
	  }],
	  reflection:  ['rectangle', ['reflectionColor', 'strokeWidth', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'], function(width, height, cornerRadius, color, stroke, shadow, x, y) {
	    this.draw(width, height, cornerRadius.map(function(r) { return r + stroke}));
  		if (color) this.fill.apply(this, $splat(color));
  		if (stroke || shadow) this.translate(stroke + Math.max(shadow - x, 0), stroke + Math.max(shadow - y, 0))
	  }],
    glyph: ['shape', ['glyphLeft', 'glyphTop', 'glyphScale', 'strokeWidth', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'], function(glyph, color, left, top, scale, stroke, shadow, x, y) {
	    if (!glyph) return;
	    this.draw(glyph);
  		if (color) this.fill.apply(this, $splat(color));
  		this.translate(left + stroke + Math.max(shadow - x, 0), top + stroke + Math.max(shadow - y, 0));
  		if (scale) this.scale(scale, scale)
	  }]
	},
	
	layout: {
	  'select-button#button': {}
	},
	
	options: {
	  menu: {
	    position: 'focus'
	  }
	},
	
	shortcuts: {
	  'ok': 'selectChosenItem'
	},
	
	events: {
	  element: {
  	  mousedown: 'refocus',
  	  click: 'expand'
	  },
	  self: {
  	  select: 'collapse',
  	  collapse: 'forgetChosenItem'
	  }
	},
	
	items: ["1","2","3"],
	
	buildItem: function(item) {
    if (!this.menu) this.buildMenu();
	  var widget = this.buildLayout('select-option', item.toString(), this.menu, $(this.menu.getContainer()));
	  widget.value = item;
	  widget.selectWidget = this;
	  return widget;
	},
	
	processValue: function(item) {
	  return item.value;
	}
	
});


ART.Widget.Select.Button = new Class({
  Extends: ART.Widget.Button
})

ART.Widget.Select.Option = new Class({
  Extends: Class.inherit(
    ART.Widget.Container,
    Widget.Stateful({
      chosen: ['choose', 'forget']
    })
  ),
  
  events: {
    element: {
      click: 'select',
      mouseenter: 'chooseOnHover'
    }
  },
  
  name: 'option',
  
  select: function() {
    this.selectWidget.select.delay(20, this.selectWidget, [this]);
  },
  
  chooseOnHover: function() {
    this.selectWidget.select(this, true)
  }
})