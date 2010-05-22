


ART.Widget.Traits.HasList = new Class({	
  options: {
    list: {
      endless: true,
      force: false
    }
  },
  
  shortcuts: {
	  previous: 'previous',
	  next: 'next'
  },
  
  list: [],
  
  attach: Macro.onion(function() {  
    var items = this.items || this.options.list.items;
    if (items) {
      this.setItems(items);
      if (this.options.force) this.select(items[0])
    }
  }),
  
  select: function(item) {
    if (item && !(item instanceof ART.Widget)) item = this.findItemByValue(item);
    if (!item && this.options.force) return false;
    var selected = this.selected;
    this.setSelectedItem.apply(this, arguments);
    if (selected && selected.unselect) selected.unselect();
    return item;
  },
  
  setSelectedItem: function(item) {
    this.selected = item;
    this.fireEvent('select', [item, this.getItemIndex()]);
  },
  
  buildItem: function(value) {
    return new Element('div', {
      'class': 'art option', 
      'html': value.toString(), 
      'events': {
        click: function() {
          this.select(value);
        }.bind(this)
      }
    });
  },
  
  setItems: function(items) {
    this.items = items;
    if (this.items) this.items.map(this.makeItem.bind(this))
    return this;
  },
  
  makeItem: function(item) {
    var option = this.buildItem.apply(this, arguments);
    this.list.push(option); 
    return option;
  },
  
  getItems: function() {
    return this.items;
  },
  
  hasItems: function() {
    return this.getItems() && (this.getItems().length > 0)
  },
  
  getSelectedItem: function() {
    return this.selected;
  },
  
  getItemIndex: function(item) {
    return this.getItems().indexOf(item || this.selected);
  },
  
  findItemByValue: function(value) {
    for (var i = 0, j = this.list.length; i < j; i++) {
      if (this.list[i].value == value) return this.list[i];
    }
    return null;
  },
  
  getActiveItem: function() {
    var active = (this.chosen || this.selected);
    return active ? active.value : null;
  },

	next: function() {
	  var next = this.getItems()[this.getItemIndex(this.getActiveItem()) + 1];
	  if (!next && this.options.list.endless) next = this.getItems()[0];
	  if (this.select(next, true)) return !!this.fireEvent('next', next);
	  return false;
	},

	previous: function() {
	  var previous = this.getItems()[this.getItemIndex(this.getActiveItem()) - 1];
	  if (!previous && this.options.list.endless) previous = this.getItems().getLast();
	  if (this.select(previous, true)) return !!this.fireEvent('previous', [previous]);
	  return false;
	}
  
});