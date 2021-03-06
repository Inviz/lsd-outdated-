Widget.Trait.Focus = new Class({
  options: {
    tabindex: 0
  },
  
  getFocuser: Macro.setter('focuser', function() {
    return new QFocuser(this.getWrapper(), {
      onFocus: this.onFocus.bind(this),
      onBlur: this.onBlur.bind(this),
      tabIndex: this.options.tabindex
    })
  }),
  
  attach: Macro.onion(function() {
    this.getFocuser();
  }),
  
  focus: Macro.onion(function(element) {
    if (element !== false) this.getFocuser().focus(element || this.element)
  }),
  
  retain: function() {
    if (!this.focused) this.focus();
  },
  
  onFocus: Macro.defaults(function() {
    if (document.activeElement) {
      var element = $(document.activeElement).getParent()
      while (element) if (element == this.element) return this.focus(false); else element = element.getParent();
    }
    this.focus();
  }),
  
  onBlur: Macro.defaults(function() {
    this.blur();
    this.refresh();
  }),
  
  getKeyListener: function() {
    return this.getFocuser().getKeyListener()
  }
});
