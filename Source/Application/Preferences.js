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
	  'section#content[container]': {
	    'form.two-column#appearance': {
  	    'section#first': [
  	      {'label[for=appearance]': 'Text input:'},
  	      'input#appearance',
  	      {'label[for=appearance]': 'Slider:'},
    	    'input[type=range]#count'
  	    ],
  	    'section#second': [
  	      {'label[for=appearance]': 'Text input:'},
  	      'input#appearance'
  	    ],
  	    'section#third.last': [
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
