ART.Layout = new Class({
  
  Implements: [Options, Logger],
  
	ns: 'art',
	name: 'layout',
		
  initialize: function(widget, layout, options) {
    this.widget = widget;
    this.layout = layout;
    this.setOptions(options);
		this.widget.log('Layout', this, 'for', widget)
    this.reset();
  }, 
  
  reset: function() {
    this.render(this.layout, this.widget);
  },
  
  materialize: function(selector, layout, parent) {
    var parsed = SubtleSlickParse(selector)[0][0]
    if (!parsed.tag) parsed.tag = 'container';
    var options = {};
		if (parsed.id) options.id = parsed.id
		var mixins = [parsed.tag];
		var styles;
		if (parsed.attributes) parsed.attributes.each(function(attribute) {
		  if (attribute.name == "style") {
		    styles = {};
		    attribute.value.split(';').each(function(definition) {
		      var bits = definition.split(':');
		      styles[bits[0]] = bits[1];
		    })
		  } else {
  			options[attribute.name] = attribute.value || true;
  			if (ART.Widget.Traits[attribute.name.capitalize()]) mixins.push(attribute.name);
		  }
		});
		var widget = ART.Widget.create(mixins, options);
		widget.build();
		
		if (!options.id) {
		  var property = parsed.tag + 's';
		  if (!parent[property]) parent[property] = [];
		  parent[property].push(widget)
		}
    
    if (parent) widget.inject(parent)
    if (parsed.classes) {
      widget.classes.push.apply(widget.classes, parsed.classes);
      parsed.classes.each(widget.addClass.bind(widget));
    }
		if (parsed.pseudos) {
		  parsed.pseudos.each(function(pseudo) {
		    widget.setStateTo(pseudo.name, true)
		  });
		}
		if (styles) widget.setStyles(styles);
		if ($type(layout) == 'string') widget.setContent(layout);
    else this.render(layout, widget);
  },
  
  render: function(layout, parent) {
    var widgets = [];
    switch ($type(layout)) {
      case "string": 
        widgets.push(this.materialize(layout, {}, parent));
        break;
      case "array": 
        layout.each(function(widget) {
          widgets.push.apply(widgets, this.render(widget, parent))
        }, this)
        break;
      case "object":
        for (var selector in layout) {
          widgets.push(this.materialize(selector, layout[selector], parent));
        }
        break;
    }
    return widgets;
  },

	getName: function() {
		return 'Layout'
	}
})