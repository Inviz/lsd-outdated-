Widget.Trait.Observer = new Class({
  States: {
  	'filled': ['fill', 'empty']
  },
  
  options: {
    observer: {
      periodical: true,
      delay: 200
    }
  },
  
  events: {
    observer: {
      self: {
        focus: 'attachObserver',
        blur: 'detachObserver'
      }
    }
  },
  
  attach: Macro.onion(function() {
    this.addEvents(this.events.observer);
  }),
  
  detach: Macro.onion(function() {
    this.removeEvents(this.events.observer);
  }),
  
  attachObserver: function() {
    if (!this.observer) this.observer = new Observer(this.getObservedElement(), this.onChange.bind(this), this.options.observer)
    this.observer.resume();
  },
  
  detachObserver: function() {
    this.observer.pause();
  },
  
  getObservedElement: Macro.defaults(function() {
    return this.element;
  }),
  
  onChange: function(value) {
    if (value.match(/^\s*$/)) {
      this.empty();
    } else {
      this.fill.apply(this, arguments);
    }
  },
  
  addWidgetEvents: function() {
    var events = this.parent.apply(this, arguments)
    this.getInput().addEvents(events.input);
    return events;
  }
});

Widget.Ignore.events.push('observer');
