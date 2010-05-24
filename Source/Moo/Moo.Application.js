
Moo.Application = new Class({
	Extends: Class.inherit(
	  ART.Widget.Window//,
	  //ART.Widget.Traits.Draggable
	),
	
  expression: "window.fancy",
  
	layout: {
	  'section#header': {
	    '#buttons[shy]': {
        'button#close': {},
	      'button#minimize': {},
        'button#maximize': {}
	    },
	    '#title[container]': {}
	  },
	  'section#content[container]': {
      'label#for-whatever[for=minimize]': 'Whatever:',
	    'input#whatever[name=whatever][type=text]': {},
	    'textarea#soever[name=soever]': {},
	    'slider#count': {},
	  },
	  'section#footer': {
			'#status[container]': {}
	  }
	}
	
});

Moo.Application.Preferences = new Class({
	Extends: Class.inherit(
	  ART.Widget.Window,
	  ART.Widget.Traits.Draggable,
	  ART.Widget.Traits.Fitting,
	  Widget.Stateful({
	    'minified': ['minify', 'enlarge', 'mutate']
	  })
	),
  
  expression: "window.fancy#preferences",
  
	layout: {
	  'section#header': {
      'button#toggler[shy]': {},
	    '#buttons[hoverable][shy]': {
        'button#close': {},
	      'button#minimize': {},
        'button#maximize:disabled': {}
	    },
	    '#title[container]': {},
  	  '#toolbar': {
        'input-search[type=search]#search': {},
  	    'button#back.left': {},
  	    'button#forward.right:disabled': {},
  	    'button#index': 'Show All'
  	  }
	  },
	  'section#content[container][scrollable]': {
	    'form.two-column#appearance': {
  	    'section#first': [
  	      {'label[for=appearance]': 'Text input:'},
  	      'input#appearance',
  	      {'label[for=appearance]': 'Slider:'},
    	    'slider#count'
  	    ],
  	    'section#second': [
  	      {'label[for=appearance]': 'Text input:'},
  	      'input#appearance'
  	    ],
  	    'section#third': [
  	      {'label[for=selectbox]': 'Selectbox:'},
  	      'select#selectbox'
  	    ]
	    }
	  }
	},

	events: {
	  header: {
	    toggler: {
        click: 'mutate'
	    }
	  }
	}
});

Moo.Application.Preferences.Network = new Class({
	Extends: Class.inherit(
	  ART.Widget.Window,
	  ART.Widget.Traits.Draggable,
	  ART.Widget.Traits.Resizable,
	  ART.Widget.Traits.ResizableContainer,
	  ART.Widget.Traits.Fitting
	),
  
  expression: "window.fancy#network",
  
	layout: {
	  'section#header': {
      'button#toggler[shy]': {},
	    '#buttons[hoverable][shy]': {
        'button#close': {},
	      'button#minimize': {},
        'button#maximize:disabled': {}
	    },
	    '#title[container]': {},
  	  '#toolbar': {
        'input-search[type=search]#search': {},
  	    'button#back.left': {},
  	    'button#forward.right:disabled': {},
  	    'button#index': 'Show All'
  	  }
	  },
	  'section#content[container][scrollable]': {
  	  'glyph[name=drag-handle]#handle.corner[at=bottom right]': {},
	    'form.two-column#appearance': {
	      '#legend': [
  	      {'label[for=location]': 'Location:'},
  	      'select#location[menu-position=bottom]'
  	    ],
  	    'panel#left[width=160]': {
  	      'list-networks#networks[height="parent - hub"]': {},
	        'toolbar[at=bottom]#hub': {
      	    'button#remove:disabled': {},
      	    'button#add': {},
      	    'button#configure': {}
	        }
  	    },
  	    'panel#right[width=auto]': {
	      
  	    },
  	    '#actions': {
    	    'button#assist': 'Assist me...',
    	    'button#revert:disabled': 'Revert',
    	    'button#apply:disabled': 'Apply'
  	    }
  	  }
	  }
	}
});

ART.Widget.List.Networks = new Class({
  Extends: ART.Widget.List,
  
  options: {
    list: {
      item: 'list-item-network'
    }
  },
  
  items: [
    {
      online: true,
      name: 'Parallels adapter'
    },
    {
      online: false,
      name: 'Ethernet'
    }
  ],
  
	buildItem: function(item) {
	  var widget = this.buildLayout(this.options.list.item);
	  widget.value = item;
	  widget.listWidget = this;
	  widget.setContent(item);
	  this.getContainer().append(widget); 
	  return widget;
	},
})

ART.Widget.List.Item.Network = new Class({
  Extends: ART.Widget.List.Item,
  
  setContent: function(item) {
    this.parent('<h2>' + item.name + '</h2>' + '<p>' + (item.online ? 'Connected' : 'Not connected') + '</p>');
  }
})


Moo.Application.Browser = new Class({
	Extends: Class.inherit(
	  ART.Widget.Window,
	  ART.Widget.Traits.Draggable,
	  ART.Widget.Traits.Resizable,
	  ART.Widget.Traits.ResizableContainer,
	  ART.Widget.Traits.Fitting,
	  Widget.Stateful({
	    'minified': ['minify', 'enlarge', 'mutate']
	  })
	),
	
  expression: "window.fancy#browser",
  
	layout: {
	  'section#header': {
      'button#toggler[shy]': {},
	    '#buttons[hoverable][shy]': {
        'button#close': {},
	      'button#minimize': {},
        'button#maximize': {}
	    },
	    '#title[container]': {},
  	  '#toolbar': {
  	    'button#back': {},
  	    'button#forward:disabled': {},
  	    'button#search': {},
  	    'button#wrench': {},
  	    'button#reload': {}
  	  }
	  },
	  'section#content[container][scrollable]': {},
	  'section#footer.flexible': {
			'#status[container]': {},
	    'glyph[name=drag-handle]#handle': {}
	  }
	},
	
	events: {
	  header: {
	    toggler: {
        click: 'mutate'
	    }
	  }
	},

	getHandle: function() {
	  return $(this.footer.handle)
	}

});


Moo.Notification = new Class({
  Extends: Class.inherit(
    ART.Widget.Window
	),
  expression: "window.hud",
  
  layout: {
	  'section#header': {
	    '#buttons[shy]': {
        'button#close': {}
	    },
	    '#title[container]': {}
	  },
	  'section#content[container]': {}
	}
})