ART.Widget.Traits.Hoverable = new Class({
  Extends: Widget.Stateful({
    'hover': ['mouseenter', 'mouseleave']
  }),
  
  events: {
    hover: {
      element: {
        mouseenter: 'mouseenter',
        mouseleave: 'mouseleave'
      }
    }
  },
  
  
	attach: Macro.onion(function(){
		this.addAction({
		  enable: function() {
      	this.addEvents(this.events.hover);
  	  },
  	  
  	  disable: function() {
    	  this.removeEvents(this.events.hover);
  		}
  	})
	}),
});

ART.Widget.ignoredEvents.push('hover')