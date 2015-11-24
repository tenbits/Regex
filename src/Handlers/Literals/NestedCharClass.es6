var NestedCharClass;
(function () {
	/* \x{200D} */

	NestedCharClass = {
		transform (node) {
			node.textContent = interpolate(node.textContent);
		},
		canHandle (txt) {
			return rgx.test(txt);
		}
	};

	var rgx = /\[.*&&\[/g;

	var Ranges = {
		'ascii': '\\u00000-\\u00127'
	};

	function interpolate(str_) {
		var str = str_,
			imax = str.length,
			i = -1,
			isInCharClass = false,
			startOuter,
			startInner,
			c;
		while( ++i < imax ) {
			c = str[i];
			if (c === '\\') {
				i++;
				continue;
			}
			if (c !== '[') {
				continue;
			}
			startOuter = i;
			while ( ++i < imax ) {
				c = str[i];
				if (c === '\\') {
					i++;
					continue;
				}
				if (c === ']') {
					break;
				}
				if (c !== '&') {
					continue;
				}
				c = str[++i];
				if (c !== '&') {
					continue;
				}
				c = str[++i];
				if (c !== '[') {
					continue;
				}
				startInner = i;
				while( ++i < imax ) {
					c = str[i];
					if (c === '\\') {
						i++;
						continue;
					}
					if (c === ']') {
						i++;
						break;
					}
				}

				var content = str.substring(startInner + 1, i - 1);
				str = str_remove(str, startInner - 2, i);
				i = startInner - 2;
				var group;
				if (content[0] === '^') {
					group = '(?!' + content.substring(1) + ')';
				} else {
					group = '(?=' + content + ')';
				}

				str = str_replaceByIndex(str, startOuter - 1, startOuter - 1, group);
				i += group.length;
				imax = str.length;
				startInner = startInner + group.length - 1;
			}

			str = str.substring(0, startInner)
				+ '(?:' + str.substring(startInner, i - 1)
				+ ')'
				+ str.substring(i - 1);

			i += 3;
			imax += 3;
		}
		return str;
	}
}());