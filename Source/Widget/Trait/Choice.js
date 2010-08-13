//Trait that completes HasList. Adds a capability to first choose something and then select (think dropdown)
Widget.Trait.Choice = new Class({
  
	select: function(item, temp) {
	  var chosen = this.chosen;
    if (item && !item.render) item = this.findItemByValue(item);
    if (!item && this.options.force) return false;
    var selected = this.selected;
    this.setSelectedItem.apply(this, arguments);
    if (temp !== true) {
      this.setValue(item);
    } else {
  	  if (item.choose() && chosen) chosen.forget();
    }
	  return item;
	},
	
	forgetChosenItem: function() {
	  if (this.chosen) this.chosen.forget();
	  (function() {
  	  delete this.chosen;
	  }).delay(30, this);
	},
	
	setSelectedItem: function(item, temp) {
	  if (!temp) return this.parent.apply(this, arguments);
    this.chosen = item;
    this.fireEvent('choose', [item, this.getItemIndex()]);
    return item;
	},
	
	selectChosenItem: function() {
	  return this.select(this.chosen)
	},
	
	getSelectedOptionPosition: function() {
	  var height = 0;
	  if (!this.selected) return height;
	  for (var i = 0, j = this.list.length; i < j; i++) {
	    if (this.list[i] == this.selected) break;
	    height += this.list[i].getLayoutHeight();
	  }
	  return height
	}
})