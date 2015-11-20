var ast_defineFlags;
(function(){
	ast_defineFlags = function(root, str){

		if (str != null) {
			root.flags = flags_extend(root.flags, flags_parse(str));
		}

		visitor_walk(root, (node) => {
			if (node.type !== Node.LITERAL) {
				return;
			}
			var txt = node.textContent,
				flags, visitor;

			if (rgx_FlagsGroup.test(txt)) {
				flags = flags_parse(txt);
				visitor = visitByGroup;
			}
			if (flags == null && rgx_FlagsInline.test(txt)) {
				flags = flags_parse(txt);
				visitor = visitByInline;
			}
			if (flags == null) {
				return;
			}

			var group = node.parentNode;
			if (flags.x === true) {
				handle_freeSpacing(group, visitor);
			}
			if (flags.i != null || flags.m != null) {

				var current = flags_clone(group.getFlags());
				flags = flags_extend(current, flags);

				var parent = group.parentNode;
				if (parent.type === Node.ROOT && parent.firstChild === group) {
					parent.flags = flags;
				} else {
					group.getRoot().isNative = false;
					handle_nativeFlags(group, flags, visitor);
				}
			}
			if (visitor === visitByGroup) {
				return removeGroup(group);
			}
			if (visitor === visitByInline) {
				node.textContent = '?' + txt.substring(txt.indexOf(':'));
				return null;
			}
		});
	};

	function removeGroup(group) {
		var next = group.nextSibling;
		dom_removeChild(group);
		return next;
	}

	function handle_byGroup(group, flags, visitor) {
		var flags = flags_parse(txt);
		if (flags.x === true) {
			handle_freeSpacing(group, visitor);
		}
		if (flags.i != null || flags.m != null) {

			var current = flags_clone(group.getFlags());
			flags = flags_extend(current, flags);

			var parent = group.parentNode;
			if (parent.type === Node.ROOT && parent.firstChild === group) {
				parent.flags = flags;
			} else {
				group.getRoot().isNative = false;
				handle_nativeFlags(group, flags, visitor);
			}
		}
		var next = group.nextSibling;
		dom_removeChild(group);
		return next;
	}

	function handle_freeSpacing(node, visitor) {
		visitor (node, x => {
			if (x.type !== Node.LITERAL) {
				return;
			}
			x.textContent = format(x.textContent);
			if (x.textContent === '') {
				var next = x.nextSibling;
				dom_removeChild(x);
				return next;
			}
		});
	}

	function handle_nativeFlags(node, flags, visitor) {
		visitor(node, x => {
			x.flags = flags_extend(flags_clone(x.flags), flags);
		});
	}

	function visitByGroup(node, fn) {
		var el = node.nextSibling;
		while(el != null) {
			var next = fn(el);
			if (next != null) {
				el = next;
				continue;
			}
			visitor_walk(el, fn);
			el = el.nextSibling;
		}
	}
	function visitByInline(node, fn) {
		fn(node);
		visitor_walk(node, fn);
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
			if (str_isEscaped(str, i) || isInCharClass(str, i)) {
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
	var rgx_Whitespace = /[\s\n\r]+/g,
		rgx_FlagsGroup = /^\?(\-?[imx]+){1,2}$/,
		rgx_FlagsInline = /^\?(\-?[imx]+){1,2}:/;

	function isInCharClass(str, i) {
		while(--i > -1) {
			var c = str.charCodeAt(i);
			if (c === 93 || c === 91) {
				//[]
				if (str_isEscaped(str, i)) {
					continue;
				}
				if (c === 93) {
					//]
					return false;
				}
				// [
				return true;
			}
		}
		return false;
	}
}());