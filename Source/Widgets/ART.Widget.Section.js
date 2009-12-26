ART.Widget.Section = new Class({
  Extends: ART.Widget.Paint,
  
  name: 'section',

	options: {
		element: {
			tag: ART.html5 ? 'section' : 'div'
		}
	},
	
	properties: ['borderRadius', 'offset'],

	render: function() {
		if (!this.parent.apply(this, arguments)) return;
		
		var style = this.styles.current;
		
		var strokeWidth = style.strokeWidth || 0;
		var width = this.getStyle('width')
		var height = this.getStyle('height')
		
		this.paint.start({x: strokeWidth / 2, y: strokeWidth / 2});
		this.paint.shape('rounded-rectangle', {x: width, y: height}, this.getPaintStyle('borderRadius'));
		this.paint.end({
			'fill': true, 
			'fillColor': style.reflectionColor, 
			
			'stroke': !!style.strokeWidth, 
			'strokeColor': style.strokeColor, 
			'strokeWidth': style.strokeWidth
		});

		this.paint.start({x: strokeWidth, y: strokeWidth});
		this.paint.shape('rounded-rectangle', {x: width, y: height}, this.getPaintStyle('borderRadius'));
		this.paint.end({'fill': true, 'fillColor': style.backgroundColor});
		
		return true;
	}
})