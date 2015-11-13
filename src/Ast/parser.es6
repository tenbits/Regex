var parser_parseGroups;
(function(){

	parser_parseGroups = function (str) {
		var root = new Node.Root(),
			imax = str.length,
			i = -1,
			lastI = 0,
			current = root,
			c;

		while( ++i < imax ) {
			c = str.charCodeAt(i);

			if (c === 92) {
				// \ Escape next character
				++i;
				continue;
			}

			if (c !== 40 && c !== 41 && c !== 124) {
				// ()|
				continue;
			}

			if (lastI < i) {
				// read the literal
				var literal = new Node.Literal(str.substring(lastI, i));
				current.appendChild(literal);
			}
			lastI = i + 1;

			if (c === 40) {
				// ( Group starting
				var group = new Node.Group();
				current.appendChild(group);
				current = group;
				continue;
			}
			if (c === 41) {
				// ) Group ending
				current = current.parentNode;
				continue;
			}
			if (c === 124) {
				// |
				var or = new Node.Or();
				current.appendChild(or);
				continue;
			}
		}

		if (current !== root) {
			throw new Error('Group was not closed');
		}

		if (lastI < i) {
			// read the literal
			var literal = new Node.Literal(str.substring(lastI, i));
			current.appendChild(literal);
		}

		return root;
	};
}());