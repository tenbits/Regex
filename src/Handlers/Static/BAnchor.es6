var BAnchorStatic;
(function () {
	BAnchorStatic = {
		transform (node) {
			if (node_shouldReposition(node)) {
				var next = node_attachToLiteral(node);
				if (next != null) {
					return next;
				}
				return null;
			}
			//return transformer_replaceNode(node, new Groups[B_ANY]());
		},
		canHandle (txt) {
			return txt === B_ANY;
		}
	};

	function node_shouldReposition(node) {
		if (node_isNativeAndIncluded(node.nextSibling)) {
			return false;
		}
		if (node_isNativeAndIncluded(node.previousSibling)) {
			return false;
		}
		return true;
	}
	function node_isNativeAndIncluded(node) {
		return node != null && node.checkNative() === true && node.isIncluded !== false;
	}
	function node_attachToLiteral(node) {
		var next = node.nextSibling;
		if (node_attach(node, node, 'firstChild', 'nextSibling', dom_insertBefore)) {
			dom_removeChild(node);
			return next;
		}
		if (node_attach(node, node, 'lastChild', 'previousSibling', dom_insertAfter)) {
			dom_removeChild(node);
			return next;
		}
		return null;
	}
	function node_attach(bNode, cursor, childKey, siblingKey, appenderFn) {
		if (cursor == null) {
			return false;
		}
		for (var el = cursor[siblingKey]; el != null; el = el[siblingKey]) {
			if (el.type === Node.GROUP) {
				if (el.isIncluded === false) {
					continue;
				}
				return node_attachToGroup(el, bNode, childKey, siblingKey, appenderFn);
			}
			if (el.type === Node.LITERAL) {
				dom_removeChild(bNode);
				appenderFn(el, bNode);
				return true;
			}
		}
		return false;
	}

	function node_attachToGroup(group, bNode, childKey, siblingKey, appenderFn) {
		if (group.checkNative() === false) {
			var cursor = group[childKey],
				insert = true;
			for (var cursor = group[childKey]; cursor != null; cursor = cursor[siblingKey]) {
				if (insert === false) {
					if (cursor.type === Node.OR) {
						insert = true;
						continue;
					}
				}
				if (cursor.type === Node.LITERAL) {
					appenderFn(cursor, dom_clone(bNode));
					cursor = cursor[siblingKey];
					if (cursor == null) {
						break;
					}
					insert = false;
					continue;
				}
				if (cursor.type === Node.GROUP && cursor.isIncluded !== false) {
					node_attachToGroup(cursor, bNode, childKey, siblingKey, appenderFn);
					insert = false;
					continue;
				}
			}
			return true;
		}
		var wrapper = new NoneCapturedGroupNode();
		var child = group.firstChild;
		while(child != null) {
			dom_removeChild(child);
			dom_appendChild(wrapper, child);
			child = el.firstChild;
		}
		dom_appendChild(wrapper, group);
		appenderFn(el, dom_clone(node));
		return true;
	}


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
