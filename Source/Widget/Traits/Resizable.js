
ART.Widget.Traits.Resizable = new Class({
  Extends: Widget.Stateful({
    'resized': ['transform', 'finalize']
  }),

  options: {
    resizer: {
      modifiers: {
        x: 'width',
        y: 'height'
      },
      snap: false,
      style: false,
      container: true,
      limit: {
        x: [0, 3000],
        y: [0, 3000]
      }
    }
  },
  
  events: {
    resizer: {}
  },
  
  getResizer: Macro.setter('resizer', function() {
    var resized = this.getResized();
    var element = $(resized)//.setStyle('overflow', 'hidden');
    resized.addEvent('resize', function(size) {
      $extend(element, size);
    });
    element.width  = resized.getStyle('width');
    element.height = resized.getStyle('height');
    var resizer = new Drag(element, $extend({
      handle: this.getHandle()
    }, this.options.resizer));
    resizer.addEvents(this.events.resizer);
    resizer.addEvents({
      'start': this.onResizeStart.bind(this),
      'complete': this.onResizeComplete.bind(this),
      'cancel': this.onResizeComplete.bind(this),
      'drag': this.onResize.bind(this)
    }, true);
    return resizer;
  }),
  
	build: Macro.onion(function() {
		this.use('#handle', '#content', function() {
  		this.addAction({
  		  enable: function() {
        	this.getResizer().attach();
    	  },

    	  disable: function() {
      	  if (this.resizer) this.resizer.detach();
    		}
    	});
    	
    	if (this.options.resizer.container) {
    	  $(this.getResized()).setStyle('overflow', 'hidden')
    	  this.content.addEvent('resize', this.checkOverflow.bind(this));
      }
		})
	}),
	
	checkOverflow: function(size) {
	  if (!this.resizer) return;
    if (!this.resizer.container) this.resizer.container = this.element;
    var resized = this.getResized();
    if (!size) size = {width: $(resized).width}
    var width = this.resizer.container.offsetWidth - this.offset.total.left - this.offset.total.right;
    var self = arguments.callee;  
    if (size.width < width) {
      if (!$chk(self.limit)) self.limit = this.resizer.options.limit.x[0];
      this.resizer.setMinX(width);
      resized.setWidth(width);
      if (resized.horizontal) resized.horizontal.adaptToSize()
      return true;
      $clear(self.delay);
      self.delay = (function() { //reset limit options in one second
        this.resizer.setMinX(self.limit);
      }).delay(1000, this);
    }
	},
	
	onResizeStart: function() {
	  this.transform.apply(this, arguments);
	  
	  if (!this.cache.dependent) this.cache.dependent = this.collect(function(child) {
	    return child.styles.current.width == 'inherit' || child.styles.current.width == 'auto'
	  }).concat(this.getResized())
    
	},
	
	onResizeComplete: function() {
	  this.finalize.apply(this, arguments);
	  delete this.cache.dependent
	},
	
	onResize: function() {
	  if (this.resizer.value.now.y) this.content.setStyle('height', this.resizer.value.now.y);
	  if (this.resizer.value.now.x) this.content.setStyle('width', this.resizer.value.now.x);
	  this.checkOverflow();
	  //this.refresh(true);
	  //optimization: refresh only widgets that are liquid
    if (this.cache.dependent) this.cache.dependent.each(function(child) {
      child.update();
    })
	  
	  //console.infox(this.content.appearance.right.dirty,this.content.appearance.right.outdated)
	  this.render();
	  
	  //console.log(this.content.appearance.right.dirty,this.content.appearance.right.outdated)
	},
	
	getHandle: Macro.defaults(function() {
	  return this.handle;
	}),

	getResized: Macro.defaults(function() {
	  return this;
	})
});

ART.Widget.ignoredEvents.push('resizer')