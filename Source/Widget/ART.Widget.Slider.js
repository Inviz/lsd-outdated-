ART.Widget.Slider = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint,
    ART.Widget.Traits.HasSlider,
    ART.Widget.Traits.Focusable,
    ART.Widget.Traits.Accessible
  ),
  
  name: 'slider',
	
	layered: {
	  shadow: ['shadow'],
    border: ['rectangle-stroke'],
	  background: ['rectangle', ['backgroundColor'], function(width, height, cornerRadius, color) {
	    this.draw(width - 2, height - 3, cornerRadius.map(function(r) { return r - 1}));
  		if (color) this.fill.apply(this, $splat(color));
  		this.translate(1, 2);
	  }],
	  reflection:  ['rectangle', ['reflectionColor'], function(width, height, cornerRadius, color) {
	    this.draw(width - 2, height - 2, cornerRadius.map(function(r) { return r - 1}));
  		if (color) this.fill.apply(this, $splat(color));
  		this.translate(1, 1);
	  }]
	},
	
	initialize: function() {
	  this.parent.apply(this, arguments);
	  this.addPseudo(this.options.mode);
	  this.getSlider();
	},

	onSet: function() {
	  this.focus();
	},
	
	layout: {
    'slider-thumb#thumb': {}
	},
	
	shortcuts: {
	  next: 'increment',
	  previous: 'decrement'
	},
	
	increment: function() {
	  this.slider.set(this.slider.step + 10)
	},
	
	decrement: function() {
	  this.slider.set(this.slider.step - 10)
	}
})

ART.Widget.Slider.Thumb = new Class({
  Extends: Class.inherit(
    ART.Widget.Button
  ),
  
  name: 'thumb'
});