(function() {
  // you can specify ART.Widget.modules as an array of classes to disable autoloading
  if (!ART.Widget.modules) {
    ART.Widget.modules = [ART.Widget.Base];
    for (var name in ART.Widget.Module) ART.Widget.modules.push(ART.Widget.Module[name]);
  }

  ART.Widget.Base = new Class({
    Extends: Class.inherit.apply(Class, ART.Widget.modules),

    initialize: function() {
      this.parent.apply(this, arguments);
  		if (this.expression) this.applyExpression(this.expression);
  		if (this.layout) this.setLayout(this.layout);
    }
  });

})();