
ART.Widget.Traits.Focusable = new Class({
  options: {
    tabindex: 0
  },
  
  getFocuser: Macro.setter('focuser', function() {
    return new QFocuser(this.getWrapper(), {
      onWidgetFocus: this.onFocus.bind(this),
      onWidgetBlur: this.onBlur.bind(this),
      tabIndex: this.options.tabindex
    })
  }),
  
  attach: Macro.onion(function() {
    this.getFocuser();
  }),
  
  focus: Macro.onion(function(element) {
    if (element !== false) this.getFocuser().focus(element || this.element)
  }),
  
  refocus: function() {
    if (!this.focused) return this.focus();
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
    this.refresh(true)
  }),
  
  getKeyListener: function() {
    return this.getFocuser().getKeyListener()
  }
});
