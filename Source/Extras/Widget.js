//Some code extracted from Orwik. 
Widget = {};

Widget.Animated = new Class({
	
	getAnimation: function() {
		if (!this.animation) this.animation = this.getAnimatedElement().get('fade');
		return this.animation;
	},
	
	show: function() {
		return this.getAnimation().hide().start('in');
	},
	
	hide: function() {
		return this.getAnimation().start('out')
	},
	
	remove: function() {
		return this.getAnimation().start('out').chain(this.dispose.bind(this));
	},
	
	dispose: function() {
		return this.getAnimatedElement().dispose()
	},
	
	getAnimatedElement: function() {
	  return this.element;
	}
	
});


Widget.Stateful = function(states, reflect) {
  var proto = reflect ? {
    setStatefulClassName: function(state, value) {
      this.element[value ? 'addClass' : 'removeClass'](state);
    },
    
    onStateChange: function(state, value, args) {
      return this.setStatefulClassName.apply(this, arguments);
    }
  } : {};

  Hash.each(states, function(methods, state) {
    var enabler = methods[0];
    var disabler = methods[1];
    var toggler = methods[2];
    
    proto[enabler] = function() {
      
      if (this[state]) return false;
      this[state] = true; 
      
    	if (Class.hasParent(arguments)) this.parent.apply(this, arguments);
  	  
      this.fireEvent(enabler, arguments);
      if (this.onStateChange) this.onStateChange(state, true, arguments);
      return true;
    }
    
    proto[disabler] = function() {
      
      if (!this[state]) return false;
      this[state] = false;
      
  	  if (Class.hasParent(arguments)) this.parent.apply(this, arguments);
  	  
      this.fireEvent(disabler, arguments);
      if (this.onStateChange) this.onStateChange(state, false, arguments);
      return true;
    }
    
    if (toggler) proto[toggler] = function() {
      return this[this[state] ? disabler : enabler].apply(this, arguments)
    }
  });
  
  return new Class(proto);
}