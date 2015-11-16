var parser_parseGroups;
(function(){

	var state_LITERAL = 1,
		state_GROUP_START = 2,
		state_GROUP_END = 3;

	parser_parseGroups = function (str) {
		var root = new Node.Root(),
			imax = str.length,
			i = -1,
			lastI = 0,
			current = root,
			state,
			c;

		while( ++i < imax ) {
			c = str.charCodeAt(i);

			if (c === 92) {
				// \ Escape next character
				++i;
				continue;
			}

			if (state === state_GROUP_END && (c === 63 || c === 42 || c === 43 || c === 123)) {
				//?*+{
				var repetition, greedy = true;
				if (i === 123) {
					var end = str.indexOf('}', i);
					repetition = str.substring(i, end + 1);
					i = end;
				} else {
					repetition = str[i];
					if (i < imax - 1) {
						c = str.charCodeAt(i + 1);
						if (c === 63) {
							greedy = false;
							i++;
						}
					}
				}
				var group = current.lastChild;
				group.repetition = repetition;
				group.greedy = greedy;
				state = state_LITERAL;

				lastI = i + 1;
				continue;
			}

			if (c !== 40 && c !== 41 && c !== 124) {
				state = state_LITERAL;
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
				state = state_GROUP_START;
				continue;
			}
			if (c === 41) {
				// ) Group ending
				current = current.parentNode;
				state = state_GROUP_END;
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