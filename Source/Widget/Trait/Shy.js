//Widgets take no space
Widget.Trait.Shy = new Class({
  attach: Macro.onion(function() {
    this.onDOMInject(function(size) {
      this.element.setStyle('margin-' + (this.getStyle('float') == 'right' ? 'left' : 'right'), - this.element.scrollWidth)
      //this.element.setStyle('margin-top', - size.height)
    }.bind(this));
  })
});

Widget.Ignore.attributes.push('shy');