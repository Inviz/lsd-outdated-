ART.Widget.Input = new Class({
  Extends: ART.Widget.Paint,
  
  name: 'input',
  
  layered: {
    stroke: ['rectangle', ['strokeColor']],
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
	  this.getInput().addEvents({
	    blur: this.blur.bind(this),
	    focus: this.focus.bind(this)
	  })
	  return true;
	},
	
  build: function() {
    if (!this.parent.apply(this, arguments)) return;
    this.getInput().inject(this.element);
    return true;
  },
  
  getInput: function() {
    if (!this.input) this.input = new Element('input', {'type': 'text'});
    return this.input;
  },
  
  setHeight: function() {
    if (!this.parent.apply(this, arguments)) return;
    this.input.setStyle('height', this.size.height - this.input.getStyle('padding-top').toInt() - this.input.getStyle('padding-bottom').toInt());
    return true;
  },
  
  setWidth: function() {
    if (!this.parent.apply(this, arguments)) return;
    this.input.setStyle('width', this.size.width - this.input.getStyle('padding-left').toInt() - this.input.getStyle('padding-right').toInt());
    return true;
  },
  
  render: function() {
    this.setStyles({
      width: this.input.offsetWidth,
      height: this.input.offsetHeight
    })
    if (!this.parent.apply(this, arguments)) return;
    
    
    return true;
  }
})