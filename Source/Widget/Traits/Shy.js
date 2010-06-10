//Widgets take no space
ART.Widget.Traits.Shy = new Class({
  attach: Macro.onion(function() {
    this.onDOMInject(function(size) {
      this.element.setStyle('margin-' + (this.styles.current['float'] == 'right' ? 'left' : 'right'), - this.element.scrollWidth)
      //this.element.setStyle('margin-top', - size.height)
    }.bind(this));
  })
});