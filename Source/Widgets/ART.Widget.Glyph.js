ART.Widget.Glyph = new Class({
  Extends: Class.inherit(
		ART.Widget.Paint,
  	ART.Widget.Traits.Touchable
	),
	
  name: 'glyph',
	
	options: {
		name: null
	},

	layered: {
    glyph: ['shape', ['glyphLeft', 'glyphTop', 'glyphScale'], function(glyph, color, left, top, scale) {
      if (glyph) this.draw(glyph);
  		if (color) this.fill.apply(this, $splat(color));
  		this.translate(left, top);
  		if (scale) this.scale(scale, scale)
	  }]
	},
	
	initialize: function() {
		this.parent.apply(this, arguments);
		if (this.options.name) this.styles.current.glyphName = this.options.name;
	},
	
	build: function() {
	  if (!this.parent.apply(this, arguments)) return
		this.layers = {
		  glyph: new ART.Shape
		}
		return true;
	}
})