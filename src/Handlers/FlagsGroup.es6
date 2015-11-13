var FlagsGroup;
(function(){

	FlagsGroup = {
		transform (node) {
			var txt = visitor_firstLiteral(node);
			if (txt.indexOf('x') !== -1) {
				handle_freeSpacing(node);
			}
			if (/[im]+/.test(txt)) {
				handle_nativeFlags(node, txt);
			}
			var next = node.nextSibling;
			dom_removeChild(node);
			return node.nextSibling;
		},
		canHandle (node) {
			if (node.type !== Node.GROUP)
				return false;

			var txt = visitor_firstLiteral(node);
			if (txt == null) {
				return false;
			}
			return /\?[xim]+/g.exec(txt) != null;
		}
	};

	function handle_freeSpacing(node) {
		visit (node, x => {
			if (x.type !== Node.LITERAL) {
				return;
			}
			x.textContent = format(x.textContent);
		});
	}

	function handle_nativeFlags(node, flagsStr) {
		var flags = node.getFlags() || {};
		if (flagsStr.indexOf('i') !== -1) {
			flags.i = true;
		}
		if (flagsStr.indexOf('m') !== -1) {
			flags.m = true;
		}

		visit(node, x => x.flags = flags);
	}

	function visit(node, fn) {
		var el = node;
		while((el = el.nextSibling) != null) {
			visitor_walk(el, fn);
			fn(el);
		}
	}


	function format(str_) {
		var str = removeComments(str_);
		return str.replace(rgx_Whitespace, '');
	}

	function removeComments(str_) {
		var str = str_,
			imax = str.length,
			i = -1;

		while(i < imax && (i = str.indexOf('#', i)) > -1) {
			if (str_isEscaped(str, i)) {
				i++;
				continue;
			}
			var n = str_indexOfNewLine(str, i),
				end = n === -1 ? imax : n;

			str = str_remove(str, i, end);
			i = end++;
		}
		return str;
	}
	var rgx_Whitespace = /[\s\n\r]+/g

}());
