ART.Widget.Traits.ResizableContainer = new Class({
  getResized: function() {
    return this.content;
  },
  
  getScrolled: function() {
    return this.content.wrapper || this.content
  }
});