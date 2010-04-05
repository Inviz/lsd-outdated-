/*
Script: ART.Sheet.js

License:
	MIT-style license.
*/

ART.Sheet = {};

(function(){
	// http://www.w3.org/TR/CSS21/cascade.html#specificity
	var rules = [];

	var parseSelector = function(selector){
		return selector.map(function(chunk){
			var result = [];
			if (chunk.tag && chunk.tag != '*'){
				result.push(chunk.tag);
			}
			if (chunk.id)	result.push('#' + chunk.id);
			if (chunk.pseudos) chunk.pseudos.each(function(pseudo){
				result.push(':' + pseudo.name);
			});
			if (chunk.classes) chunk.classes.each(function(klass){
				result.push('.' + klass);
			});
			return result;
		});
	};

	var getSpecificity = function(selector){
		specificity = 0;
		selector.each(function(chunk){
			if (chunk.tag && chunk.tag != '*') specificity++;
			if (chunk.id) specificity += 100;
			specificity += (chunk.pseudos || []).length;
			specificity += (chunk.classes || []).length * 10;
		});
		return specificity;
	};

	ART.Sheet.define = function(selectors, style){
		SubtleSlickParse(selectors).each(function(selector){
			var rule = {
				'specificity': getSpecificity(selector),
				'selector': parseSelector(selector),
				'style': {}
			};
			for (p in style) rule.style[p.camelCase()] = style[p];
			rules.push(rule);

			rules.sort(function(a, b){
				return a.specificity - b.specificity;
			});
		});
	};

	var containsAll = function(self, other){
		return other.every(function(x){
			return self.contains(x);
		}, this);
	};

	var cache = {};
	
	ART.Sheet.lookup = function(selector){
		if (cache[selector]) return cache[selector];
		
		var result = {styles: {}, rules: []}
		
		var parsed = parseSelector(SubtleSlickParse(selector)[0]);
		rules.each(function(rule){
			var i = rule.selector.length - 1, j = parsed.length - 1;
			if (!containsAll(parsed[j], rule.selector[i])) return;
			while (i-- > 0){
				while (true){
					if (j-- <= 0) return;
					if (containsAll(parsed[j], rule.selector[i])) break;
				}
			}
			result.rules.push(rule.selector.map(function(b) { return b.join("") }).join(" "));
			
			
			$mixin(result.styles, rule.style);
		});
		
		cache[selector] = result;
		
		return result;
	};
})();

