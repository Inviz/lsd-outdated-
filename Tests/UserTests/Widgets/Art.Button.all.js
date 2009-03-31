{
	tests: [
		{
			title: "Art.Button",
			description: "Creates a simple button.",
			verify: "Do you see a slick button?",
			before: function(){
				try {
					var button = new ART.Button().setContent('foo');
					$(button).inject('test');
				} catch(e) {
					dbug.log(e)
				}
			}
		}
	]
}