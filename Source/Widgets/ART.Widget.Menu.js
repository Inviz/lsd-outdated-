ART.Sheet.define('menu', {
  'background-color': hsb(0, 0, 100),
  'shadow-color': hsb(0, 0, 30, 0.6),
  'shadow-blur': 15,
  'shadow-offset-y': 3,
  'stroke-color': hsb(0, 0, 30, 0.4),
  'stroke-width': 1,
  'corner-radius': 3,
  'width': 150,
  'height': 150,
  'z-index': 250
})

ART.Widget.Menu = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint,
    Widget.Animated
  ),
  
  position: 'absolute',
  
  name: 'menu',
  
	layered: {
	  shadow:  ['shadow'],
	  stroke:  ['rectangle-stroke'],
	  background:  ['rectangle', ['backgroundColor', 'strokeWidth', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'], function(width, height, cornerRadius, color, stroke, shadow, x, y) {
      if (!color) return false;
	    this.draw(width, height, cornerRadius.map(function(r) { return r + stroke}));
  		if (color) this.fill.apply(this, $splat(color));
  		if (stroke || shadow) this.translate(stroke  + shadow - x, stroke + shadow - y)
	  }],
	  reflection:  ['rectangle', ['reflectionColor', 'strokeWidth', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'], function(width, height, cornerRadius, color, stroke, shadow, x, y) {
      if (!color) return false;
	    this.draw(width, height, cornerRadius.map(function(r) { return r + stroke}));
  		if (color) this.fill.apply(this, $splat(color));
  		if (stroke || shadow) this.translate(stroke + shadow - x, stroke + shadow - y)
	  }]
	}
});