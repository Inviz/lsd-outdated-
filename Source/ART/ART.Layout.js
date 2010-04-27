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
		if (!parsed.id) throw new Exception.Misconfiguration(this, "You need to specify id for layout item for " + selector);
		var options = {id: parsed.id};
		var mixins = [parsed.tag];
		if (parsed.attributes) parsed.attributes.each(function(attribute) {
			options[attribute.name] = attribute.value || true;
			if (ART.Widget.Traits[attribute.name.capitalize()]) mixins.push(attribute.name);
		});
		var widget = ART.Widget.create(mixins, options);
		widget.build();
    
    if (parent) widget.inject(parent)
    if (parsed.classes) parsed.classes.each(widget.addClass.bind(widget));
		if (parsed.pseudos) {
		  parsed.pseudos.each(function(pseudo) {
		    widget.setStateTo(pseudo.name, true)
		  });
		}
		if ($type(layout) == 'string') widget.setContent(layout);
    else this.render(layout, widget);
  },
  
  render: function(layout, parent) {
    var widgets = [];
    for (var selector in layout) widgets.push(this.materialize(selector, layout[selector], parent));
    return widgets;
  },

	getName: function() {
		return 'Layout'
	}
})