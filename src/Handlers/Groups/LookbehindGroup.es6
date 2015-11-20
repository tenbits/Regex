var LookbehindGroup;
(function(){

	LookbehindGroup = {

		create (node) {
			var lookbehind = new Lookbehind(node);
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

		group: null,
		constructor (node) {
			this.group = node;
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

		execSearch (str, i, opts) {
			var next = this.nextSibling,
				imax = str.length;
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

				i = match.index;
				var beforeString = str.substring(0, i);
				var beforeMatch = exec_children(this, beforeString, 0, opts);
				if ((beforeMatch == null && this.isPositive === true) ||
					(beforeMatch != null && this.isPositive === false)) {
					i++;
					continue;
				}
				return {
					index: i,
					value: '',
					groups: []
				};
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
			return {
				value: '',
				index: i,
				groups: []
			};
		}
	});

}());
