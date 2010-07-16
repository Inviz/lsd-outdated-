ART.Layer.Glyph = new Class({
  Extends: ART.Layer.Shaped,
  
  properties: ['glyph', 'glyphColor', 'glyphLeft', 'glyphTop', 'glyphScale'],
  
  paint: function(glyph, color, x, y, scale) {
    if (!glyph || !color) return false
    this.shape.draw(glyph);
		this.shape.fill.apply(this.shape, $splat(color));
	  if (scale) this.shape.scale(scale);
	  return {translate: {x: x, y: y}}
  }
});