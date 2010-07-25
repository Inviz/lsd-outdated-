Widget.Trait.OuterClick = new Class({
  
  attachOuterClick: function() {
    this.addEvents(this.events.outer);
  },
  
  detachOuterClick: function() {
    this.removeEvents(this.events.outer);
  }
});

Widget.Ignore.events.push('outer');