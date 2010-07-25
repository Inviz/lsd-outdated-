Widget.Module.Selectability = new Class({
  
  attach: Macro.onion(function() {
    if (this.options.at) this.positionAt(this.options.at)
  }),
  
  render: Macro.onion(function() {
    switch (this.style.userSelect) {
      case "none":
        if (this.selectable !== false) this.disableSelection();
      default:
        if (this.selectable === false) this.enableSelection();
    }
  }),
  
  disableSelection: function() {
    this.element.disableSelection();
    this.selectable = false;
  },
  
  enableSelection: function() {
    this.element.enableSelection();
    this.selectable = true;    
  }
  
});

//ART.Widget.Ignore.attributes.push('selectable', 'unselectable');