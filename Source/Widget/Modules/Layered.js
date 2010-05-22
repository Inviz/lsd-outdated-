ART.Widget.Modules.Layered = new Class({

  layers: {},

  build: Macro.onion(function() {
    if (this.layered) {
      for (var name in this.layered) {
        this.layers[name] = this.getLayer.apply(this, this.layered[name]);
      }
    }
  }),

  getLayer: function() {
    var args = Array.link($splat(arguments), {name: String.type, options: Object.type, properties: Array.type, render: Function.type, klass: Class.type});
    var instance = new (args.klass || ART[args.name.camelCase().capitalize()]);
    var injected = false;
    this.addEvent('redraw', function() {
      var properties = (instance.properties || []).concat(args.properties)
      var style = this.getChangedStyles.apply(this, properties);
      if (style) {
        var value = (args.render || instance.paint).apply(instance, Hash.getValues(style));
        var stop = (value === false);
        if (!stop) {
          if (injected) return;
          this.paint.grab(instance);
          injected = true;
        } else{
          if (!injected) return;
          instance.eject();
          injected = false;
        }
      }
    });
    return instance;  
  }
});
