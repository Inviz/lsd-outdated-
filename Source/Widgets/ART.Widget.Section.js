ART.Widget.Section = new Class({
  Extends: ART.Widget.Paint,
  
  name: 'section',

	options: {
		element: {
			tag: ART.html5 ? 'section' : 'div'
		}
	},
	
	properties: ['cornerRadius', 'offset'],

  build: function() {
    if (!this.parent.apply(this, arguments)) return false;
    
    this.layers = {
      border: new ART.Rectangle,
		  fill: new ART.Rectangle,
		  background: new ART.Rectangle
		}
		return true;
  },
  
	render: function() {
		if (!this.parent.apply(this, arguments)) return;
		
		var style = this.styles.current;
		var width = this.getStyle('width');
		var height = this.getStyle('height');
		
		var strokeWidth = style.strokeWidth || 0;
		
    
		//make the border
		this.layers.border.draw(width, height, this.getPaintStyle('cornerRadius'));
		this.layers.border.fill.apply(this.layers.border, $splat(style.borderColor));

		//reflection
		this.layers.fill.draw(width, height, this.getPaintStyle('cornerRadius'));
		this.layers.fill.fill.apply(this.layers.fill, $splat(style.reflectionColor));
		
		//background
		this.layers.background.draw(width, height, this.getPaintStyle('cornerRadius'));
		this.layers.background.fill.apply(this.layers.background, $splat(style.backgroundColor));
		
		return true;
	}
})