ART.Shape.implement({
  produce: function(delta, shape) {
    if (!shape) shape = new this.$constructor;
    if (this.style) shape.draw(this.change(delta))
    return shape;
  }
});