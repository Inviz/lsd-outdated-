ART.Widget.Input = new Class({
  Extends: Class.inherit(
    ART.Widget.Paint,
    ART.Widget.Traits.HasInput
  ),
  
  name: 'input',
  
  events: {
    element: {
  	  mousedown: 'refocus'
    }
  },
  
  layered: {
    shadow:  ['shadow'],
    stroke: ['rectangle-stroke'],
	  background:  ['rectangle-shadow', ['backgroundColor']],
	  reflection:  ['rectangle-shadow', ['reflectionColor']],
    glyph: ['shape-shadow']
	},
	
	focus: Macro.onion(function() {
	  this.input.focus();
	}),
	
	refocus: function() {
	  this.focus();
	},
	
	applyValue: function(item) {
	  this.input.set('value', item);
	}
});

ART.Widget.Input.Search = new Class({
  Extends: Class.inherit(
    ART.Widget.Input,
    Widget.Stateful({
    	'expanded': ['expand', 'collapse'],
    	'detailed': ['enrich', 'clean'],
    	'uniconed': ['uniconize', 'iconize']
    }),
    ART.Widget.Traits.HasMenu,
    ART.Widget.Traits.HasList,
    ART.Widget.Traits.Chooser,
    ART.Widget.Traits.Observed,
    ART.Widget.Traits.Aware,
    ART.Widget.Traits.Accessible
  ),
  
  layout: {
    'input-icon#glyph': {},
    'button#canceller': {}
  },
  
  options: {
    menu: {
      position: 'bottom'
    }
  },
  
  items: [
    {
      title: 'Google', 
      icon: 'http://www.kew.org/ucm/resources/kew/images/css-images/content/google-icon.gif'
    },
    {
      title: 'Bing',
      icon: 'http://www.microsoft.com/canada/msn/bing/images/bing_icon.png'
    }
  ],
  
  attach: Macro.onion(function() {
    if (this.hasItems()) {
      this.enrich();
    } else {
      this.clean();
    }
  }),
  
  setInputSize: Macro.onion(function() {
    if (!this.resorted && this.glyph.element.parentNode) {
      this.resorted = true;
      $(this.input).inject(this.glyph, 'after')
    }
    if (this.canceller) this.canceller.refresh();
  }),
  
  events: {
    glyph: {
      click: 'expand'
    },
    canceller: {
      click: 'empty'
    },
    self: {
      select: 'setIcon'
    }
  },
  
  empty: Macro.onion(function() {
    this.input.set('value', '');
  }),

	buildItem: function(item) {
    if (!this.menu) this.buildMenu();
	  var widget = this.buildLayout('input-option', item.title.toString(), this.menu, $(this.menu.getContainer()));
	  widget.value = item;
	  widget.selectWidget = this;
	  return widget;
	},

	processValue: function(item) {
	  return item.value.title;
	},
	
	setIcon: function(item) {
	  if (item && item.value) item = item.value.icon;
	  this.collapse();
	  if (!item) {
	    this.iconize();
  	  this.glyph.element.setStyle('background-image', '');
	  } else {
	    this.uniconize();
  	  this.glyph.element.setStyle('background', 'url(' + item + ') no-repeat ' + this.glyph.offset.paint.top + ' ' + this.glyph.offset.paint.left);
	  }
	}
});

ART.Widget.Input.Option = new Class({
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
  
  render: Macro.onion(function() {
    var icon = this.value ? this.value.icon : false;
    if ((this.icon == icon) || !icon) return;
    this.icon = icon;
    this.element.setStyle('background-image', 'url(' + icon + ')');
    this.element.setStyle('background-repeat', 'no-repeat');
    this.element.setStyle('background-position', ((this.offset.paint.left || 0) + 4) + 'px  center');
    this.element.setStyle('padding-left', 15)
  }),
  
  select: function() {
    this.selectWidget.select.delay(50, this.selectWidget, [this]);
  },
  
  chooseOnHover: function() {
    this.selectWidget.select(this, true)
  }
})


ART.Widget.Input.Icon = new Class({
  name: 'button', 
  
  Extends: Class.inherit(
    ART.Widget.Button,
    ART.Widget.Traits.Iconed
  )
})
