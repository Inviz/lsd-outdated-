ART.Widget.Element = new Class({
  Includes: [
    ART.Widget,
    ART.Widget.Module.Value,
    //ART.Widget.Module.Selectability,
    ART.Widget.Module.Position,
    ART.Widget.Module.Events,
    ART.Widget.Module.LayoutEvents,
    ART.Widget.Module.Container    
  ],
  
  style: {
    current: {
    }
  },
  events: {},
  
  setStyle: function(property, value) {
		if (!this.parent.apply(this, arguments)) return;
		if (!this.element) return true;
		return !this.setElementStyle(property, value);
  },
  
  getStyle: function(property) {
    switch(property) { 
      case "height":
        return this.element.offsetHeight;
      case "width":
        return this.element.offsetWidth
      default:
        return this.element.getStyle(property)
    }
  },
  
  getLayoutHeight: function() {
    return this.element.offsetHeight
  },
  
  setStyles: function(properties) {
    for (var property in properties) this.setStyle(property, properties[property]);
    return true;
  },
  
  findStyles: $lambda,
  renderStyles: $lambda,
  renderStyles: $lambda
})