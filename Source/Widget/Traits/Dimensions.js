ART.Widget.Traits.Dimensions = new Class({
  attach: Macro.onion(function() {
    this.onDOMInject(function(widget) {
      var height = this.options.height;
      if (height && (height.toInt() != height.replace('%', ''))) this.getClientHeight = this.createDimensionFunction(height, 'height');
      var width = this.options.width;
      if (width && (width.toInt() != width.replace('%', '')))this.getClientWidth = this.createDimensionFunction(width, 'width');
    }.bind(this))
  }),
  
  createDimensionFunction: function(expression, dimension) {
    var environment = {};
    expression = expression.replace(/([a-z]+)/g, function(name) {
      environment[name] = this.getByExpression(name);
      return "this." + name + ".getLayout" + dimension.capitalize() + "()";
    }.bind(this));
    var fn = new Function("/*console.log('"+expression+"'," +expression+");*/return " + expression);
    //alert(fn.toSource())
    return fn.bind(environment)
  },
  
  setHeight: function(height ) {
    if (this.options.height && (this.size.height != height)) this.setElementStyle('height', height);
    return this.parent.apply(this, arguments);
  },
  
  setWidth: function(width) {
    if (this.options.width && (this.size.width != width))  this.setElementStyle('width', width);
    return this.parent.apply(this, arguments);
  },
  
  getByExpression: function(name) {
    switch(name) {
      case "parent":
        return this.parentWidget;
      case "next":
        var children = this.parentWidget.children;
        return children[children.indexOf(this) + 1];
      case "previous":
        var children = this.parentWidget.children;
        return children[children.indexOf(this) - 1];
      default: 
        var widget = this;
        while (widget && !widget[name]) widget = widget.parentWidget;
        if (widget && widget[name]) return widget[name];
        else console.error('Widget named ', name, ' was not found', [this, widget, this.parentWidget])
    }
  }
})