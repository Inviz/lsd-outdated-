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
        'input[type=search]#search': {},
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
  	    'section#third': {}
	    }
	  }
	},

	events: {
	  header: {
	    toggler: {
	      element: {
	        click: 'mutate'
	      }
	    }
	  }
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
	      element: {
	        click: 'mutate'
	      }
	    }
	  }
	}
});


Moo.Notification = new Class({
  Extends: Class.inherit(
    ART.Widget.Window
	),
  expression: "window.hud",
  
  layout: {
	  'section#header': {
	    '#buttons': {
        'button#close': {}
	    },
	    '#title[container]': {}
	  },
	  'section#content[container]': {}
	}
})