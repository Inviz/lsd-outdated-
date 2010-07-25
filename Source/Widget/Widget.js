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
  Includes: [
    Macro.stateful({
  	  'hidden': ['hide', 'show'],
  	  'active': ['activate', 'deactivate'],
  	  'focused': ['focus', 'blur'],
  	  'disabled': ['disable', 'enable'],
  	  'built': ['build', 'destroy'],
  		'attached': ['attach', 'detach']
    })
  ].concat(Old.modules),
  
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

Widget.Ignore.states.push('built', 'attached');