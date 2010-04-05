ART.Sheet.define('scrollbar', {
	'height': 16,
	'width': '16',
	'cursor': 'pointer',
	'background-color': [hsb(0, 0, 0, 0.4), hsb(0, 0, 0, 0.5)],
	'reflection-color': [hsb(0, 0, 0, 0.3), hsb(0, 0, 0, 0)],
	'cornerRadius': 0,
	'glyph-color': hsb(82, 0, 100, 0.5)
});


ART.Widget.Scrollbar = new Class({
  Extends: ART.Widget.Paint,
  
  name: 'scrollbar',
	
	layered: {
    border: ['rectangle', ['borderColor']],
	  background: ['rectangle', ['backgroundColor'], function(width, height, cornerRadius, color) {
	    console.info([width, height, cornerRadius, color])
	    this.draw(width - 2, height - 3, cornerRadius.map(function(r) { return r - 1}));
  		if (color) this.fill.apply(this, $splat(color));
  		this.translate(1, 2);
	  }],
	  reflection:  ['rectangle', ['reflectionColor'], function(width, height, cornerRadius, color) {
	    this.draw(width - 2, height - 2, cornerRadius.map(function(r) { return r - 1}));
  		if (color) this.fill.apply(this, $splat(color));
  		this.translate(1, 1);
	  }]
	}
})



Class.refactor(ART.Widget, {
  
  initialize: function() {
    this.previous.apply(this, arguments)
    if (this.options.scrollable) this.addEvent('render', function() {
      console.log('scrollable', this.getStyle('height'), this.getStyle('width'))
      this.vertical.setStyle('height', this.getStyle('height'));
      this.vertical.render();
      this.horizontal.setStyle('width', this.getStyle('width'));
      this.horizontal.render();
      $q = this
    }.create({bind: this, delay: 5}))
  }
  
});