
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
    var resizer = new Drag(element, $merge({
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
      resized.refresh();
      $clear(self.delay);
      self.delay = (function() { //reset limit options in one second
        this.resizer.setMinX(self.limit);
      }).delay(1000, this);
    }
	},
	
	onResizeStart: function() {
	  this.transform.apply(this, arguments);
	},
	
	onResizeComplete: function() {
	  this.finalize.apply(this, arguments);
	},
	
	onResize: function() {
	  this.content.setHeight(this.resizer.value.now.y);
	  this.content.setWidth(this.resizer.value.now.x);
	  if (this.options.resizer.container) this.checkOverflow();
	  this.update(true);
	  this.render();
	},
	
	getHandle: Macro.defaults(function() {
	  return this.handle;
	}),

	getResized: Macro.defaults(function() {
	  return this;
	})
});

ART.Widget.ignoredEvents.push('resizer')