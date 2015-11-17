var Subexpressions;
(function(){

	Subexpressions = {
		transform (node, root) {
			var expressions = getExpressions(root),
				parts = split(node.textContent),
				imax = parts.length,
				i = -1;

			while (++i < imax) {
				var str = parts[i];
				if (str === '') {
					continue;
				}
				if (i % 2 === 0) {
					var literal = new Node.Literal(str);
					dom_insertBefore(node, literal);
					continue;
				}
				var group = expressions && expressions[str];
				if (group == null) {
					throw new Error('Invalid subexpression name: ' + str);
				}
				group = dom_clone(group);
				group.name = null;
				dom_insertBefore(node, group);
			}

			dom_removeChild(node);
		},
		canHandle (txt) {
			return rgx.test(txt);
		}
	};

	var rgx = /\\g(<)(\w+)(>)/g;

	function split(txt_) {
		var txt = txt_,
			DELIMITER = '%--%';

		txt = txt.replace(rgx, (full, g1, name) => {
			return DELIMITER + name + DELIMITER;
		});
		return txt.split(DELIMITER);
	}
	function getExpressions(root) {
		var expressions = {};
		visitor_walkByType(root, Node.GROUP, group => {
			if (group.name == null) {
				return;
			}
			expressions[group.name] = group;
		});
		return expressions;
	}

}());