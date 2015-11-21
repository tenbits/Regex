var RegexNode;
(function(){
	RegexNode = class_create(Literal, {
		type: type_Regex,

		rgxSearch: null,
		rgxFixed: null,
		rgxIndexer: null,
		domIndexer: null,

		groupIndex: null,
		root: null,

		constructor (text, node) {
			var flags = node.serializeFlags();

			if (flags.indexOf('g') === -1) {
				flags += 'g';
			}
			this.rgxSearch = new RegExp(this.textContent, flags);

			flags = flags.replace('g', '');
			this.rgxFixed = new RegExp('^' + this.textContent, flags);
			this.compileIndexer(flags);
			this.groupIndex = node.index;
			this.isBacktracked = hasRepetition(text);
		},

		exec (str_, i, opts) {
			var str = str_;
			if (this.cursor) {
				str = str.substring(0, this.cursor.index + this.cursor.value.length - 1);
			}

			var regex, match, matchIndex;
			if (opts.fixed) {
				var sub = str.substring(i);
				match = this.rgxFixed.exec(sub);
				if (match == null) {
					this.cursor = null;
					return null;
				}
				matchIndex = i;
			} else {
				this.rgxSearch.lastIndex = i;
				match = this.rgxSearch.exec(str);
				if (match == null) {
					this.cursor = null;
					return null;
				}
				matchIndex = match.index;
			}
			if (this.isBacktracked) {
				this.cursor = {
					value: match[0],
					index: matchIndex
				};
			}
			return this.resolveMatches(match, matchIndex, opts);
		},

		resolveMatches (nativeMatch, matchIndex) {
			var match = new Match();
			match.value = nativeMatch[0];
			match.index = matchIndex;
			match.groupIndex = this.groupIndex;


			var nativeIndexerMatch = this.rgxIndexer.exec(match.value);
			if (nativeIndexerMatch[0] !== match.value) {
				logger.log(this.rgxIndexer, this.rgxSearch);
				throw Error(`Indexer root missmatch ${nativeIndexerMatch[0]} ${match.value}`);
			}

			this.domIndexer.pos = matchIndex;
			this.domIndexer.match = match.value;

			visitor_walk(this.domIndexer, node => {
				if (node.type === Node.OR) {
					node.pos = node.parentNode.pos;
				}
				if (node.shadowIndex == null) {
					return;
				}
				node.value = nativeIndexerMatch[node.shadowIndex];
				var prev = node.previousSibling;
				if (prev != null) {
					var length = prev.value == null ? 0 : prev.value.length;
					node.pos = prev.pos + length;
					return;
				}
				node.pos = node.parentNode.pos;
			});

			visitor_walk(this.domIndexer, node => {
				if (node.index == null || node.index === 0) {
					return;
				}
				var shadowMatch = nativeIndexerMatch[node.shadowIndex];
				var actualMatch = nativeMatch[node.index];
				if (actualMatch !== shadowMatch) {
					throw Error(`Indexer group missmatch: ${actualMatch} ~~ ${shadowMatch}`);
				}

				var group = new MatchGroup();
				group.value = actualMatch;
				group.index = node.pos;
				match.groups[node.index - 1] = group;
			});
			return match;
		},
		resolveMatch (str, group, groupIndex) {
			var match = this.rgxIndexer.exec(str);
		},

		compileIndexer (flags) {
			var root = parser_parseGroups(this.textContent);
			Handlers.define(root);

			visitor_walkUp(root, node => {
				if (node.type === Node.OR) {
					return;
				}
				var parent = node.parentNode;
				if (parent.firstChild === parent.lastChild) {
					return;
				}

				if (node.type === Node.GROUP) {
					if (node.repetition == null && node.isCaptured !== false) {
						return;
					}
				}

				var group = new Node.Group();
				group.isShadowGroup = true;

				dom_insertBefore(node, group);
				dom_removeChild(node);
				group.appendChild(node);
				return group;
			});

			ast_indexShadowedGroups(root);

			this.domIndexer = root;
			this.rgxIndexer = new RegExp(root.toString(), flags);
		}
	});

	function hasRepetition(str) {
		var imax = str.length,
			i = -1, esc = false;
		while(++i < imax) {
			var c = str.charCodeAt(i);
			if (c === 92 && esc === false) {
				// \\
				i++;
				esc = true;
			}
			esc = false;
			if (c === 42 || c === 63 || c === 43) {
				// *?+
				return true;
			}
		}
		return false;
	}

}())