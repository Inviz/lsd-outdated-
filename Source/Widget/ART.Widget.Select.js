ART.Widget.Select = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint,
    Widget.Stateful({
    	'expanded': ['expand', 'collapse']
    }),
    ART.Widget.Traits.HasMenu,
    ART.Widget.Traits.HasList,
    ART.Widget.Traits.Chooser,
    ART.Widget.Traits.Focusable,
    ART.Widget.Traits.Accessible
  ),
  
  name: 'select',
  
  layered: {
    shadow:  ['shadow'],
    stroke: ['rectangle-stroke'],
	  background:  ['rectangle-shadow', ['backgroundColor']],
	  reflection:  ['rectangle-shadow', ['reflectionColor']],
    glyph: ['shape-shadow']
	},
	
	layout: {
	  'select-button#button': {}
	},
	
	options: {
	  menu: {
	    position: 'focus'
	  }
	},
	
	shortcuts: {
	  'ok': 'selectChosenItem'
	},
	
	events: {
	  element: {
  	  mousedown: 'refocus',
  	  click: 'expand'
	  },
	  self: {
  	  select: 'collapse',
  	  collapse: 'forgetChosenItem'
	  }
	},
	
	items: ["1","2","3"],
	
	buildItem: function(item) {
    if (!this.menu) this.buildMenu();
	  var widget = this.buildLayout('select-option', item.toString(), this.menu);
	  widget.value = item;
	  widget.selectWidget = this;
	  return widget;
	},
	
	processValue: function(item) {
	  return item.value;
	}
	
});


ART.Widget.Select.Button = new Class({
  Extends: ART.Widget.Button
})

ART.Widget.Select.Option = new Class({
  Extends: Class.inherit(
    ART.Widget.Container,
    Widget.Stateful({
      chosen: ['choose', 'forget']
    })
  ),
  
  events: {
    element: {
      click: 'select',
      mouseenter: 'chooseOnHover'
    }
  },
  
  name: 'option',
  
  select: function() {
    this.selectWidget.select.delay(20, this.selectWidget, [this]);
  },
  
  chooseOnHover: function() {
    this.selectWidget.select(this, true)
  }
})