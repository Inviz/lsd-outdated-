ART.Widget.Module.DOM = new Class({
  initialize: function() {
    this.childNodes = [];
    this.parentNode = this.nextSibling = this.previousSibling = null;
    return this.parent.apply(this, arguments);
  },
  
  getElementsByTagName: function(tagName) {
    return this.collect(tagName == '*' ? null : function(child){
      return child.name == tagName;
    })
  },
  
  getAttributeNode: function(attribute) {
    return {
      nodeName: attribute,
      nodeValue: this.getAttribute(attribute)
    }
  },
	
	adopt: function(widget) {
		if (widget.options.id) {
			if (this[widget.options.id]) this[widget.options.id].dispose();
			this[widget.options.id] = widget;
		}
		this.childNodes.push(widget);
	  if (!(widget instanceof ART.Document)) widget.setParent(this);
	  $(this).adopt(widget);
		this.fireEvent('adopt', [widget, widget.options.id])
		
	  var parent = widget;
	  while (parent = parent.parentNode) parent.fireEvent('hello', widget)
	},
  
	getChildren: function() {
	  return this.childNodes;
	},

  getRoot: function() {
    var widget = this;
    while (widget.parentNode) widget = widget.parentNode;
    return widget;
  },
  
	setParent: function(widget){
	  this.parentNode = widget;
	},
	
	inject: function(widget, quiet) {
		widget.adopt(this);
		var element = $(widget);
		//this.parentNode = element;
		this.fireEvent('inject', arguments);
		this.fireEvent('afterInject', arguments);
		var isDocument = (widget instanceof ART.Document);
		if (((element == widget) || isDocument) && (quiet !== true)) {
		  var postponed = false
    	this.render();
		  this.walk(function(child) {
		    if (child.postponed) {
		      postponed = true;
		      child.update();
		    }
		    if (isDocument) child.document = document;
		    child.fireEvent('dominject', element);
		    child.dominjected = true;
		  });
		  if (postponed && !this.dirty) this.dirty = true;
    	this.render();
		}
	},
	
	walk: function(callback) {
	  callback(this);
	  this.childNodes.each(function(child) {
	    child.walk(callback)
	  });
	},
	
	collect: function(callback) {
	  var result = [];
	  this.walk(function(child) {
	    if (!callback || callback(child)) result.push(child);
	  });
	  return result;
	}
})