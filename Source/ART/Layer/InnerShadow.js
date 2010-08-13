ART.Layer.InnerShadow = new Class({
  Extends: ART.Layer.Shadow,
  
  properties: ['strokeWidth', 'innerShadowBlur', 'innerShadowColor', 'innerShadowOffsetX', 'innerShadowOffsetY'],

  paint: function(stroke, shadow, color, x, y) {
    if (!stroke) stroke = 0;
    if (!shadow) shadow = 0;
    if (!x) x = 0;
    if (!y) y = 0;
    if (shadow > 0 || y > 0 || x > 0) {
      var fill = new Color(color);
      fill.base = fill.alpha;
      var transition = Fx.Transitions.Sine;
      shadow += Math.max(x, y);
      //if (!shadow) shadow = 1;;
      for (var i = 0; i < shadow; i++) {
        if (shadow == 0) {
          fill.alpha = Math.min(fill.base * 2, 1)
        } else {
          fill.alpha = fill.base * transition((shadow - i) / shadow)
        }
        //if (fill.alpha < 0.02) continue;
        var rectangle = this.layers[i];
        if (!rectangle) rectangle = this.layers[i] = ART.Layer.InnerShadow.Layer.getInstance(this);
        rectangle.shadow = this;
        rectangle.base = this.base;
        rectangle.produce(- i + Math.max(0, y - x), - i * 2 + Math.max(0, y - x));
        rectangle.stroke(fill, 1);
      }
      for (var i = shadow, j = this.layers.length; i < j; i++) {
        if (this.layers[i]) ART.Layer.InnerShadow.Layer.release(this.layers[i]);
        this.layers.splice(i, 1);
        i--;
        j--;
      }
    } else {
      this.layers.each(ART.Layer.InnerShadow.Layer.release);
      this.layers = [];
    }
  },
  
  translate: function(x, y) {
    this.parent.apply(this, arguments);
    for (var i = 0, j = this.layers.length; i < j; i++) 
      if (this.layers[i]) 
        this.layers[i].translate(i - Math.max(0, y - x) / 2, i + Math.max(0, x - y) / 2)
  } 
})
ART.Layer.InnerShadow.Layer = new Class({
  Extends: ART.Layer,
	
	inject: function(container){
		this.eject();
		if (container instanceof ART.SVG.Group) container.children.push(this);
		this.container = container;
		this.container.element.appendChild(this.shape.element);
		return this;
	}
});
ART.Layer.InnerShadow.Layer.stack = [];
ART.Layer.InnerShadow.Layer.getInstance = function() {
  return ART.Layer.InnerShadow.Layer.stack.pop() || (new ART.Layer.InnerShadow.Layer);
}
ART.Layer.InnerShadow.Layer.release = function(layer) {
  layer.element.parentNode.removeChild(layer.element);
  ART.Layer.InnerShadow.Layer.stack.push(layer);
};