

ART.Widget.Modules.Positionable = new Class({
  
  attach: Macro.onion(function() {
    var position = this.options.at;
    if (!position) return;
    position.split(/\s+/).each(function(property) {
      this.element.setStyle(property, 0)
    }, this);
    this.position = 'absolute';
  })
  
})