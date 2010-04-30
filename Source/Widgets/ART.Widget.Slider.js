ART.Sheet.define('slider', {
	'height': 3,
	'margin-top': 10,
	'margin-bottom': 6,
	'width': 100,
	'fillColor': hsb(0, 0, 0, 0.3),
	'cursor': 'pointer',
	'stroke-color': hsb(0, 0, 0, 0.3),
	'stroke-width': 1,
	'cornerRadius': 1
});

ART.Sheet.define('slider thumb', {
	'height': 14,
	'width': 14,
	'margin-top': -6,
	'corner-radius': 7,
	'reflection-color': ['radial', {0.3: hsb(0, 0, 100, 0.396875), 1: hsb(0, 0, 100, 0)}, {cy: '90%', r: '45%', fy: '90%'}],
	'fill-color': ['radial', {0.5: hsb(0, 0, 100, 0.496875), 0.9: hsb(0, 0, 100, 0)}, {cy: '5%', r: '20%', fy: '5%'}],
	'background-color': ['radial', {0.3: hsb(0, 0, 35, 0.6), 0.5: hsb(0, 0, 60, 0.5)}],
	'strokeColor': hsb(0, 0, 30, 0.7),
	'strokeWidth': 1
});


ART.Widget.Slider = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint,
    ART.Widget.Traits.HasSlider
  ),
  
  name: 'slider',
	
	layered: {
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
	
	layout: {
    'slider-thumb#thumb': {}
	}
})

ART.Widget.Slider.Thumb = new Class({
  Extends: Class.inherit(
    ART.Widget.Button
  ),
  
  name: 'thumb'
});