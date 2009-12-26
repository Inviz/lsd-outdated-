ART.Widget.Glyph = new Class({
  Extends: Class.inherit(
		ART.Widget.Paint,
  	ART.Widget.Touchable
	),
	
  name: 'glyph',
	
	options: {
		name: null
	},
	
	initialize: function() {
		this.parent.apply(this, arguments);
		if (this.options.name) this.styles.current.glyphName = this.options.name;
	},
	
	render: function() {
		if (!this.parent.apply(this, arguments)) return;
		if (!this.paint) return;
		if (!this.styles.current.touchable && !this.properties.contains('active')) this.properties.push('active')
		
		this.paint.start({x: this.styles.current.width, y: 0});
		this.paint.shape(this.styles.current.glyphName, this.styles.current.glyphWidth || this.styles.current.width)
		this.paint.end({'stroke': true, 'strokeColor': this.styles.current.glyphColor});

		this.paint.start({x: this.styles.current.width - 1, y: 0});
		this.paint.shape(this.styles.current.glyphName, this.styles.current.glyphHeight || this.styles.current.height)
		this.paint.end({'stroke': true, 'strokeColor': this.styles.current.shadowColor});
		
		return true;
	}
})