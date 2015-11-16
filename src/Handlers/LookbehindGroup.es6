var LookbehindGroup;
(function(){

	LookbehindGroup = {

		process (node) {
			var el = node.nextSibling;
			var lookbehind = new Lookbehind(node);

			for (; el != null;) {
				var next = el.nextSibling;
				dom_removeChild(el);
				lookbehind.appendChild(el);
				el = next;
			}


			dom_insertBefore(node, lookbehind);
			dom_removeChild(node);
			dom_prependChild(lookbehind, node);

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

			var lbEl = this.firstChild;
			while( true ) {
				var match = exec_children(
					this,
					str,
					i,
					opts,
					lbEl.nextSibling
				);

				if (match == null) {
					return null;
				}

				i = match.index;
				var beforeString = str.substring(0, i);
				var beforeMatch = exec_children(lbEl, beforeString, 0, opts);
				if ((beforeMatch == null && this.isPositive === true) ||
					(beforeMatch != null && this.isPositive === false)) {
					i++;
					continue;
				}

				return match;
			}
		}
	});

}());
