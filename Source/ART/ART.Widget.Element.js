

ART.Widget.Element = new Class({
  Extends: ART.Widget.Base,
  
  offset: {
    padding: {},
    paint: {},
    total: {}
  },
    
  setStyle: function(property, value) {
		if (!this.parent.apply(this, arguments)) return;
		if (!this.element) return true;
		return !this.setElementStyle(property, value);
  },
  
  render: Macro.onion(function() {
    this.fireEvent('redraw');
  })
})