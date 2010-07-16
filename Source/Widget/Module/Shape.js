ART.Widget.Module.Shape = new Class({
  options: {
    shape: 'rectangle'
  },
  
  getShape: function(name) {
    if (!this.shape) {
      this.shape = new ART.Shape[(name || this.options.shape).camelCase().capitalize()];
      this.addEvent('redraw', function() {
        var styles = this.getStyles.apply(this, this.shape.properties);
        this.shape.styles = styles;
      }.bind(this))
    }
    return this.shape;
  }  
  
});