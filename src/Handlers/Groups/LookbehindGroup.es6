var LookbehindGroup;
(function(){

	LookbehindGroup = {

		create (node) {
			var lookbehind = new Lookbehind(node);
			if (node.firstChild === node.lastChild && node.firstChild.type === Node.LITERAL) {
				var txt = node.firstChild.textContent.replace(rgx_LBGroup, '');
				if (txt.length === 2 && txt[0] === '\\') {
					lookbehind.simpleChar = txt[1];
				}
				node.firstChild.textContent = '(' + txt + ')$';
				return lookbehind;
			}
			visitor_walkByType(node, Node.LITERAL, x => {
				var txt = x.textContent;
				x.textContent = '(' + txt.replace(rgx_LBGroup, '') + ')$';
			});
			return lookbehind;
		},

		canHandle (txt) {
			return rgx_LBGroup.test(txt);
		}

	}

	var rgx_LBGroup = /^\?<(!|=)/;


	var Lookbehind = class_create(Node.Group, {

		isCaptured: false,
		isNative: false,
		isPositive: true,

		simpleChar: null,
		constructor (node) {
			node.isNative = false;
			node.isCaptured = false;

			this.isPositive = node.firstChild.textContent.charCodeAt(2) === 61 /*=*/;
		},

		exec (str, i, opts) {
			if (opts.fixed || this.nextSibling == null) {
				return this.execAnchored(str, i, opts);
			}
			return this.execSearch(str, i, opts)
		},

		execSearch (str, i_, opts_) {
			var next = this.nextSibling,
				imax = str.length,
				opts = new exec_Opts(opts_),
				i = i_;

			opts.indexed = false;
			while( i < imax ) {
				var match = exec_children(
					this,
					str,
					i,
					opts,
					next,
					next.nextSibling
				);
				if (match == null) {
					return null;
				}

				exec_clearCursors(next);
				i = match.index;
				var isMatched;
				if (this.simpleChar != null) {
					isMatched = (str[i - 1] === this.simpleChar);

				} else {
					var start = i - 20;
					if (start < 0) start = 0;
					var beforeString = str.substring(start, i);
					var beforeMatch = exec_children(this, beforeString, 0, opts);
					isMatched = beforeMatch != null;
				}

				if ((isMatched === false && this.isPositive === true) ||
					(isMatched === true && this.isPositive === false)) {
					i++;
					continue;
				}

				var result = new Match();
				result.index = i;
				result.value = '';
				return result;
			}
		},

		execAnchored (str, i, opts) {
			var beforeString = str.substring(0, i),
				beforeMatch = exec_children(this, beforeString, 0);

			if (this.isPositive === true && beforeMatch == null) {
				return null;
			}
			else if (this.isPositive === false && beforeMatch != null) {
				return null;
			}
			var match = new Match();
			match.index = i;
			match.value = '';
			return match;
		}
	});

}());
