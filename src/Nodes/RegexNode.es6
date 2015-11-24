var RegexNode;
(function(){
	RegexNode = class_create(Literal, {
		type: type_Regex,

		rgxSearch: null,
		rgxFixed: null,
		rgxIndexer: null,
		domIndexer: null,

		groupNum: null,
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
			this.groupNum = node.groupNum;
			this.isBacktracked = hasRepetition(text);
		},

		exec (str_, i, opts) {
			var str = str_;
			if (this.cursor != null) {
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

		resolveMatches (nativeMatch, matchIndex, opts) {
			var match = new Match();
			match.value = nativeMatch[0];
			match.index = matchIndex;
			match.groupNum = this.groupNum;

			if (match.value === '') {
				return match;
			}

			var nativeIndexerMatch = this.rgxIndexer.exec(match.value);
			if (nativeIndexerMatch[0] !== match.value) {
				throw Error(`Indexer root missmatch ${nativeIndexerMatch[0]} ${match.value}`);
			}

			if (opts && opts.indexed === false) {
				resolveGroups(match, nativeMatch, matchIndex);
			} else if (nativeMatch.length > 1) {
				resolveIndexedGroups(match, nativeMatch, nativeIndexerMatch, this.domIndexer, matchIndex);
			}
			return match;
		},

		compileIndexer (flags) {
			var root = parser_parseGroups(this.textContent);
			visitor_walk(root, function(node){
				if (node.type !== Node.LITERAL) {
					return;
				}
				var txt = node.textContent;
				var c1 = txt.charCodeAt(0);
				if (c1 !== 63 /*?*/) {
					return;
				}
				var c2 = txt.charCodeAt(1);
				if (c2 === 61 || c2 === 33) {
					//=!
					var next = node.parentNode.nextSibling;
					dom_removeChild(node.parentNode);
					return next;
				}
			});

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

			var regex = root.toString();
			if (rgx_groupBacktrack.test(regex)) {
				regex = adjust_groupBacktracks(root, regex);
			}
			this.rgxIndexer = new RegExp(regex, flags);
		}
	});

	function adjust_groupBacktracks(root, str){
		var mappings = root.groupNumMapping;
		return str.replace(rgx_groupBacktrack, function(full, c, num){
			return c + '\\' + mappings[+num];
		});
	}

	function resolveGroups(match, nativeMatch, pos) {
		var imax = nativeMatch.length,
			i = 0;
		while ( ++ i < imax ) {
			var group = new MatchGroup();
			group.value = nativeMatch[i];
			match.groups[i - 1] = group;
		}
		return match;
	}
	function resolveIndexedGroups(match, nativeMatch, nativeIndexerMatch, node, pos) {
		if (node.groupNum != null && node.groupNum !== 0) {
			var shadowMatch = nativeIndexerMatch[node.shadowGroupNum];
			var actualMatch = nativeMatch[node.groupNum];
			if (actualMatch !== shadowMatch) {
				throw Error(`Indexer group missmatch: ${actualMatch} ~~ ${shadowMatch}`);
			}

			var group = new MatchGroup();
			group.value = actualMatch;
			group.index = pos;
			match.groups[node.groupNum - 1] = group;
		}

		var nextPos = pos;
		for (var el = node.firstChild; el != null; el = el.nextSibling) {
			nextPos = resolveIndexedGroups(match, nativeMatch, nativeIndexerMatch, el, nextPos);
		}

		if (node.shadowGroupNum != null && node.shadowGroupNum !== 0) {
			var value = nativeIndexerMatch[node.shadowGroupNum] || '';
			pos = pos + value.length;
		}
		return pos;
	}

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

	var rgx_groupBacktrack = /(^|[^\\])\\(\d+)/g;

}())