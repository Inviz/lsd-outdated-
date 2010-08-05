Widget.Module.Selectability = new Class({
  
  render: Macro.onion(function() {
    switch (this.style.current.userSelect) {
      case "none":
        if (this.selectable !== false) this.disableSelection();
      default:
        if (this.selectable === false) this.enableSelection();
    }
  }),
  
  disableSelection: function() {
    $$(this.element, this.element.getElements('*')).disableSelection();
    this.selectable = false;
  },
  
  enableSelection: function() {
    this.element.enableSelection();
    this.selectable = true;    
  }
  
});

//ART.Widget.Ignore.attributes.push('selectable', 'unselectable');