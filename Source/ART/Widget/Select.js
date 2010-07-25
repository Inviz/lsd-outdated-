ART.Widget.Select = new Class({
  Includes: [
    ART.Widget.Paint,
    Macro.stateful({
    	'expanded': ['expand', 'collapse']
    }),
    ART.Widget.Trait.HasMenu,
    ART.Widget.Trait.HasList,
    ART.Widget.Trait.Chooser,
    ART.Widget.Trait.Focusable,
    Widget.Trait.Accessible
  ],
  
  name: 'select',
  
  layered: {
    shadow:  ['shadow'],
    stroke: ['stroke'],
	  background:  ['fill', ['backgroundColor']],
	  reflection:  ['fill', ['reflectionColor']],
    glyph: ['glyph']
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
  	  mousedown: 'retain',
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
  Includes: [
    ART.Widget.Container,
    Macro.stateful({
      chosen: ['choose', 'forget']
    })
  ],
  
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