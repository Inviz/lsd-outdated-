
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
	    'input[type=range]#count': {},
	  },
	  'section#footer': {
			'#status[container]': {}
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
	    '#buttons[shy]': {
        'button#close': {}
	    },
	    '#title[container]': {}
	  },
	  'section#content[container]': {}
	}
})