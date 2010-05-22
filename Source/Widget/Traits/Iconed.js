
ART.Widget.Traits.Iconed = new Class({
  layered: {
    triangle: ['shape', ['icon', 'iconLeft', 'iconTop', 'iconScale', 'strokeWidth', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'], function(glyph, color, icon, left, top, scale, stroke, shadow, x, y) {
	    this.draw(icon)
  		if (color) this.fill.apply(this, $splat(color));
  		this.translate(left + stroke + shadow - x, top + stroke + shadow - y);
  		if (scale) this.scale(scale, scale)
	  }]
  }
});