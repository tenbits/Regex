var BAnchorStatic;
(function () {
	BAnchorStatic = {
		create (node) {
			return new Groups[B_ANY]();
		},
		canHandle (txt) {
			return txt === B_ANY;
		}
	};

	var B_ANY = '\\b';

	var Groups = {
		[B_ANY]: class_create(Node.Group, {
			isNative: false,
			isCaptured: false,
			exec (str, i, opts) {
				rgx.lastIndex = i;
				if (opts.fixed === false) {
					var match = rgx.exec(str);
					if (match == null) {
						return null;
					}
					var m = new Match();
					m.value = '';
					m.index = match.index;
					return m;
				}

				var match = rgx.exec(str);
				if (match == null || match.index !== i) {
					return null;
				}

				var m = new Match;
				m.index = i;
				m.value = '';
				return m;
			}
		})
	};

	var rgx = /\b/g;
}());
