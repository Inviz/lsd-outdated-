UnitTester.site  = 'Mooish Sample';
UnitTester.title = 'Interactive Tests';

window.addEvent('load', function(){
	new UnitTester({
		mootoolsCore : '../../core',
		Sample			 : '..'
	},{
		Sample : 'UserTests'
	});
});