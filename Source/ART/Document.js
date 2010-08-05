ART.Document = new Class({
  Includes: [
    new Class({initialize: function() {
      
    }}),
    ART.Widget.Module.DOM
  ],
  
  Implements: [Events, Options],
  
  nodeType: 9,
  
  //masks as XML document to use simplified traversal methodics
  documentElement: {
    nodeName: 'ART'
  },
  
  //masks as window to have .document accessor
  navigator: {},
  
  options: {},
  
  initialize: function(element) {
    this.element = (element || document.body);
    this.document = this;
    this.parent.apply(this, arguments);
  },
  
  toElement: function() {
    return this.element;
  },

	setParent: function(widget){
	}
});