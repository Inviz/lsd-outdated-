ART.Sheet.define('list', {
  'width': 'auto',
  'height': 'auto',
  'background-color': false,
  'shadow-color': false,
  'shadow-blur': false
});

ART.Sheet.define('list:focused', {		
  'shadow-color': hsb(212, 58, 93),
  'shadow-blur': 10,
  'shadow-offset-y': 0,
	'stroke-color': hsb(212, 58, 93),
  'background-color': hsb(0, 0, 100)
});

ART.Sheet.define('list item', {
  'fill-color': false,
  'reflection-color': false,
  'width': 'auto',
  'height': 'auto'
});

ART.Sheet.define('list#networks item', {
  'width': 'auto',
  'display': 'block',
  'padding-top': 5,
  'padding-left': 5,
  'padding-right': 5,
  'padding-bottom': 5
});

ART.Sheet.define('list item:selected', {
  'reflection-color': [hsb(0, 0, 74, 0.3), hsb(0, 0, 58, 0.3)],
  'fill-color': [hsb(223, 19, 80), hsb(222, 28, 72)]
});

ART.Sheet.define('list:focused item:selected', {
  'fill-color': [hsb(223, 49, 80), hsb(222, 58, 72)]
});

ART.Widget.List = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint,
    ART.Widget.Traits.HasList,
    ART.Widget.Traits.Focusable,
    ART.Widget.Traits.Accessible
  ),
  
  name: 'list',
	
	events: {
	  element: {
  	  mousedown: 'refocus'
	  }
	},
	
	options: {
	  list: {
	    item: 'list-item'
	  }
	},

	layered: {
	  shadow:  ['shadow'],
	  background:  ['rectangle', ['backgroundColor', 'strokeWidth', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'], function(width, height, cornerRadius, color, stroke, shadow, x, y) {
      if (!color) return false;
	    this.draw(width, height, cornerRadius.map(function(r) { return r + stroke}));
  		if (color) this.fill.apply(this, $splat(color));
  		this.translate(stroke + Math.max(shadow - x, 0), stroke + Math.max(shadow - y, 0))
	  }]
	},
	
	items: ["1","2","3"],
	
	buildItem: function(item) {
	  var widget = this.buildLayout(this.options.list.item, item.toString(), this, false);
	  widget.value = item;
	  widget.listWidget = this;
	  this.getContainer().append(widget); 
	  return widget;
	},
	
	processValue: function(item) {
	  return item.value;
	}
	
});

ART.Widget.List.Item = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint,
    Widget.Stateful({
      selected: ['select', 'unselect']
    })
  ),
  
  events: {
    element: {
      click: 'select'
    }
  },
  
  name: 'item',
  
	layered: {
	  fill:  ['rectangle-stroke'],
	  reflection:  ['rectangle', ['reflectionColor']],
	  background: ['rectangle', ['backgroundColor']]
	},
	
  select: Macro.onion(function() {
    this.listWidget.select(this)
  })
})