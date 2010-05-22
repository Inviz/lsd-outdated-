

ART.Widget.Traits.OuterClick = new Class({
  
  attachOuterClick: function() {
    this.addEvents(this.events.outer);
  },
  
  detachOuterClick: function() {
    this.removeEvents(this.events.outer);
  }
});

ART.Widget.ignoredEvents.push('outer');