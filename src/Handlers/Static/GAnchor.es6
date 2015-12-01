var GAnchorStatic;
(function () {
	GAnchorStatic = {
		create (node) {
			var txt = node.firstChild.textContent;
			dom_removeChild(node.firstChild);
			return new Groups[txt]();
		},
		canHandle (txt) {
			return txt === G_NEXT || txt === G_ANY;
		}
	};

	var G_NEXT = '?!\\G',
		G_ANY = '?=\\G';

	var Groups = {
		[G_NEXT]: class_create(Node.Group, {
			isNative: false,
			exec (str, i, opts) {
				if (opts.fixed === true && i === opts.lastIndex) {
					return null;
				}
				var match = new Match;
				match.index = i + 1;
				match.value = '';
				return match;
			}
		}),
		[G_ANY]: class_create(Node.Group, {
			isNative: false,
			exec (str, i) {
				var match = new Match;
				match.index = i;
				match.value = '';
				return match;
			}
		})
	};
}());
