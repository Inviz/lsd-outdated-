(function(addEvents, removeEvents) {

  Widget.Module.Events = new Class({

    events: {
      element: {},
      self: {
        'inject': function(widget) {
          if (widget instanceof ART.Widget) widget.addEvents(this.bindEvents(this.events.parent));
        },    
        'dispose': function(widget) {
          if (widget instanceof ART.Widget) widget.removeEvents(this.bindEvents(this.events.parent));
        }
      },
      parent: {}
    },
  	
  	addEvents: function(events) {
  	  if (events) {
  	    for (var i in events) { 
  	      if (events[i].call) { //stick to old behaviour when key: function object is passed
  	        addEvents.call(this, events);
  	      } else {
  	        this.addWidgetEvents(events);
  	      };  
  	      break;
  	    }
  	  }
  		return events;
  	},
  	
  	addWidgetEvents: function(events) {
  	  events = this.bindEvents($unlink(events));
      addEvents.call(this, events.self);
  		this.element.addEvents(events.element);
  		return events;
  	},
	
  	removeEvents: function(events) {
  	  events = this.bindEvents($unlink(events));
      removeEvents.call(this, events.self);
  		this.element.removeEvents(events.element);
  		return events;
  	},
  	
  	bindEvents: function(tree) {
      if (!tree || tree.call) return tree;
      if (!this.$bound) this.$bound = {}
      if (tree.indexOf) {
        if (!this.$bound[tree]) {
          if (!this[tree]) throw new Exception.Misconfiguration(this, "Cant find a method to bind " + tree + " on " + this.getSelector());
          this.$bound[tree] = this[tree].bind(this);
        }
        return this.$bound[tree];
      }
      for (var i in tree) tree[i] = this.bindEvents(tree[i]);
      return tree;
  	},

  	attach: Macro.onion(function() {
  		this.addEvents(this.events);
  	}),

  	detach: Macro.onion(function() {
  	  this.removeEvents(this.events);
  	})
  });

})(Events.prototype.addEvents, Events.prototype.removeEvents);