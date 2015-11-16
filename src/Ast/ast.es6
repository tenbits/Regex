var ast_combineNatives,
	ast_compileNatives,
	ast_indexGroups,
	ast_indexShadowedGroups,
	ast_createBlocks,
	ast_defineHandlers,
	ast_resolveBacktracks;

(function() {
	ast_createBlocks = function(root){
		visitor_walkByType(root, Node.OR, node => {
			var blocks = new Node.Blocks,
				block = new Node.Block(),
				parent = node.parentNode;

			var el = parent.firstChild;
			while (el != null) {
				parent.removeChild(el);
				if (el.type === Node.OR) {
					blocks.appendChild(block);
					block = new Node.Block();
				} else {
					block.appendChild(el);
				}
				el = parent.firstChild;
			}
			blocks.appendChild(block);
			parent.appendChild(blocks);
			return blocks;
		});
	};

	ast_resolveBacktracks = function(root) {
		visitor_walkUp(root, node => {
			if (node.type === Node.BLOCKS) {
				if (node.parentNode.isAtomic !== true) {
					node.isBacktracked = node.getLength() > 1;
				}
			}
			if (node.isBacktracked === true) {
				node.parentNode.isBacktracked = true;
			}
		});
	};

	ast_combineNatives = function (root) {
		resolveNatives(root);
		combineNatives(root);
	};
	ast_compileNatives = function(root) {
		return compileNatives(root);
	};
	ast_indexGroups = function(root) {
		var index = 0;
		visitor_walkByType(root, Node.GROUP, node => {
			if (node.isCaptured === false) {
				return;
			}
			node.index = ++index;
			if (node.name != null) {

				if (root.groups == null)
					root.groups = {};

				root.groups[node.name] = node.index;
			}
		});
	};

	ast_indexShadowedGroups = function(root) {
		var index = 0, shadowIndex = 0;
		visitor_walkByType(root, Node.GROUP, node => {
			if (node.isCaptured === false) {
				return;
			}
			if (node.isShadowGroup !== true) {
				node.index = ++index;
			}
			node.shadowIndex = ++shadowIndex;

			if (node.name != null) {

				if (root.groups == null)
					root.groups = {};

				root.groups[node.name] = node.index;
			}
		});
	};

	ast_defineHandlers = function(root) {
		visitor_walk(root, function(node) {
			var Handler = Handlers.get(node);
			if (Handler == null) {
				return;
			}
			if (Handler.transform) {
				return Handler.transform(node, root);
			}
			if (Handler.create) {
				var el = Handler.create(node, root);
				return transformer_replaceNode(node, el, false);
			}
			if (Handler.process) {
				return Handler.process(node, root);
			}
		});
	};

	function resolveNatives(root) {

		visitor_walkUp(root, visit);
		visit(root);

		function visit(node) {
			if (node.isNative === false) {
				return;
			}
			var el = node.firstChild;
			while(el != null) {
				if (el.isNative === false) {
					node.isNative = false;
					break;
				}
				el = el.nextSibling;
			}
		}
	}

	function combineNativesOld(root) {
		if (root.isNative) {
			var literal = new Node.Literal(root.toString());
			root.empty();
			root.appendChild(literal);
			return;
		}
		visitor_walk(root, function(node){
			if (node.isNative === false) {
				return;
			}
			if (combine_flagsAreEqual(node) === false) {
				return;
			}
			var literal = new Node.Literal(node.toString());
			return transformer_replaceNode(node, literal, false);
		});
	}

	function combineNatives(root) {
		if (root.isNative) {
			var literal = new Node.Literal(root.toString());
			root.empty();
			root.appendChild(literal);
			return;
		}
		combineNodes(root, root);
	}
	function combineNodes(node, root) {

		var hasBlocks, start, el;
		if (node !== root) {
			for (el = node.firstChild; el != null; el = el.nextSibling) {
				if (el.type === Node.OR) {
					hasBlocks = true;
					break;
				}
			}
		}

		for (var el = node.firstChild; el != null; el = el.nextSibling) {
			if (el.type === Node.OR) {
				continue;
			}
			//debugger;
			//if (el.firstChild && el.firstChild.textContent && el.firstChild.textContent.indexOf('b') > -1) {
			//	debugger;
			//}
			//if (el.textContent && el.textContent.indexOf('b') > -1) {
			//	debugger;
			//}
			combineNodes(el);
			if (hasBlocks === true) {
				continue;
			}

			if (el.isNative === false) {
				start = null;
				continue;
			}

			if (el.firstChild !== el.lastChild) {
				start = null;
				continue;
			}
			if (el.firstChild && flags_equals(el.firstChild.flags, el.flags) === false) {
				start = null;
				continue;
			}
			if (start == null) {
				start = el;
				continue;
			}
			if (flags_equals(start.flags, el.flags)) {
				continue;
			}
			if (el.previousSibling.type === Node.OR) {
				start = el;
				continue;
			}
			join(start, el);
			start = el;
		}
		if (start != null) {
			join(start, null);
		}

		// [start, end)
		function join(startEl, endEl) {
			var literal = new Node.Literal();
			dom_insertBefore(startEl, literal);

			var str = '', cursor = startEl;
			while(cursor !== endEl) {
				str += cursor.toString();
				if (cursor.type === Node.GROUP && literal.index == null) {
					literal.index = cursor.index;
				}

				dom_removeChild(cursor);
				cursor = literal.nextSibling;
			}


			literal.textContent = str;
			literal.flags = startEl.flags;
			return literal;
		}
	}

	function combine_flagsAreEqual (node) {
		var el = node.parentNode.firstChild;
		var flags = el.flags;
		while((el = el.nextSibling) != null) {
			if (el.flags != flags) {
				return false;
			}
			flags = el.flags;
		}
		return true;
	};
	function compileNatives(root) {

		visitor_walk(root, function(node) {
			if (node.type !== Node.LITERAL) {
				return;
			}
			var rgx = new Node.RegexNode(node.textContent, node);
			return transformer_replaceNode(node, rgx, false);
		});
	}

}());