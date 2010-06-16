
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
	  },
	  self: {
	    dominject: 'makeItems'
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
      if (!isFinite(width) || !isFinite(height) || (!color && !stroke)) return false;
	    this.draw(width, height, cornerRadius.map(function(r) { return r + stroke}));
  		if (color) this.fill.apply(this, $splat(color));
  		this.translate(stroke + Math.max(shadow - x, 0), stroke + Math.max(shadow - y, 0))
	  }],
  	innerShadow:  ['inner-shadow']
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