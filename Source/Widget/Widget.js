/*
Script: ART.Widget.js

License:
	MIT-style license.
*/

// Base widget class.
(function(Old) {

if (!Old.modules) {
  Old.modules = []
  for (var name in Old.Module) Old.modules.push(Old.Module[name]);
}

Widget = new Class({
    
  States: {
  /* name          enabler     disabler      fires state change? */
	  'hidden':   [ 'hide',     'show'               ],
	  'active':   [ 'activate', 'deactivate'         ],
	  'focused':  [ 'focus',    'blur'               ],
	  'disabled': [ 'disable',  'enable'             ],
	  'built':    [ 'build',    'destroy',     false ],
		'attached': [ 'attach',   'detach',      false ]
  },
  
  Includes: Old.modules,
  
	initialize: function(element, options){
		this.parent.apply(this, arguments);
		this.element = $(element);
		this.build();
		//this.log('Init', this)
	},
	
	build: Macro.onion(function() {
	  this.attach();
	})
});

['Ignore', 'Module', 'Trait', 'modules'].each(function(property) { 
  Widget[property] = Old[property]
});
Widget.Base = Old.Base;

})(Widget);