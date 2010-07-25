
Widget.Trait.Touchable = new Class({
  options: {
    touch: {}
  },
  
	attach: Macro.onion(function(){
		this.addAction({
		  enable: function() {
      	this.getTouch().attach();
  	  },
  	  
  	  disable: function() {
    	  if (this.touch) this.touch.detach();
  		}
  	})
	}),
	
	getTouch: Macro.setter('touch', function() {
	  var touch = new Touch(this.element, this.options.touch);
	  touch.addEvents({
			start: this.activate.bind(this),
			end: this.deactivate.bind(this),
			cancel: this.deactivate.bind(this)//this.fireEvent('press', e);
		});
		return touch;
	})
});
