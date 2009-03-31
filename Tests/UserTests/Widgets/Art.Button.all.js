{
	tests: [
		{
			title: "Art.Button",
			description: "Creates a simple button.",
			verify: "Do you see a slick button?",
			before: function(){
				try {
					$(new ART.Button()).setContent('foo').inject('test');
				} catch(e) {
					dbug.log(e)
				}
			}
		}
	]
}