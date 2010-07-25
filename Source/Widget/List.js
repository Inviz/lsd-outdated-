
ART.Widget.List = new Class({
  Includes: [
    ART.Widget.Paint,
    ART.Widget.Trait.HasList,
    ART.Widget.Trait.Focusable,
    ART.Widget.Trait.Accessible
  ],
  
  name: 'list',
	
	events: {
	  element: {
  	  mousedown: 'retain'
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
	  background:  ['fill', ['backgroundColor']]
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
  Includes: [
    ART.Widget.Paint,
    Widget.Stateful({
      selected: ['select', 'unselect']
    })
  ],
  
  events: {
    element: {
      click: 'select'
    }
  },
  
  name: 'item',
  
	layered: {
	  fill:  ['stroke'],
	  reflection:  ['fill', ['reflectionColor']],
	  background: ['fill', ['backgroundColor']]
	},
	
  select: Macro.onion(function() {
    this.listWidget.select(this)
  })
})