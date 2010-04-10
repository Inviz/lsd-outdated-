ART.Widget.Glyph = new Class({
  Extends: Class.inherit(
		ART.Widget.Paint,
  	ART.Widget.Traits.Touchable
	),
	
  name: 'glyph',
	
	options: {
		name: null
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
	},
	
	render: function() {
		if (!this.parent.apply(this, arguments)) return;
		if (!this.styles.current.touchable && !this.properties.contains('active')) this.properties.push('active')
		var style = this.styles.current;
		this.layers.glyph.draw(this.styles.current.glyph);
		this.glyphBounds = this.layers.glyph.measure();
		this.layers.glyph.fill.apply(this.layers.glyph, $splat(style.glyphColor));
		this.layers.glyph.translate(style.glyphLeft, style.glyphTop);
		
		return true;
	}
})