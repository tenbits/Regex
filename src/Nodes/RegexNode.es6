var RegexNode;
(function(){
	RegexNode = class_create(Literal, {
		type: type_Regex,

		rgxIndexer: null,
		domIndexer: null,

		rgxIndexerSearch: null,
		rgxIndexerSticky: null,

		groupNum: null,
		groupCount: null,

		hasInvisible: false,
		isLazy: false,
		isBacktracked: false,

		constructor (text, node) {
			var flags = node.serializeFlags();
			if (flags.indexOf('g') === -1) {
				flags += 'g';
			}
			this.createIndexed_(flags);
			this.groupNum = node.groupNum;
			this.isLazy = hasRepetition(text);
			this.isBacktracked = this.isLazy;
		},
		exec (str_, i, opts) {
			var str = str_;
			if (this.cursor != null) {
				if (--this.cursor.end < this.cursor.start) {
					this.cursor = null;
					return null;
				}
				str = str.substring(this.cursor.start, this.cursor.end);
			}
			var regex, match, matchIndex;
			if (opts.fixed) {
				var sub = str.substring(i);
				match = this.rgxIndexerSticky.exec(sub);
				if (match == null) {
					this.cursor = null;
					return null;
				}
				matchIndex = i;
			} else {
				this.rgxIndexerSearch.lastIndex = i;
				match = this.rgxIndexerSearch.exec(str);
				if (match == null) {
					this.cursor = null;
					return null;
				}
				matchIndex = match.index;
			}
			if (this.isBacktracked === true && this.cursor == null) {
				this.cursor = {
					start: matchIndex,
					end: matchIndex + match[0].length
				};
			}
			var value = resolveIndexedMatchValue(this, this.domIndexer, match);
			return new MatchInternal(
				matchIndex,
				value,
				this,
				match
			);
		},

		getGroups (match, matchIndex) {
			return resolveIndexedMatchGroups(this, match, matchIndex);
		},

		getMatch (indexedMatch) {
			var match = new Match();
			match.value = '';
			match.index = indexedMatch.index;
			match.groups = new Array(this.groupCount);
			match.groupNum = this.groupNum;

			if (this.groupCount === 0) {
				match.value = indexedMatch[0];
				return match;
			}
			match.groups = resolveIndexedMatchGroups(
				this,
				indexedMatch.match
			);
			return match;
		},

		createIndexed_ (flags) {
			this.createIndexerDom_();
			this.wrapGroups_();

			ast_indexShadowedGroups(this.domIndexer);

			this.adjustBacktracks_();

			var regex = this.domIndexer.toString();
			this.rgxIndexerSearch = new RegExp(regex, flags);
			this.rgxIndexerSticky = new RegExp('^' + regex, flags.replace(/[gm]/g, ''));
		},

		createIndexerDom_ () {
			this.domIndexer = parser_parseGroups(this.textContent);
			visitor_walkByType(this.domIndexer, Node.LITERAL, (node) => {
				var parent = node.parentNode;
				if (parent.firstChild !== node || parent.type !== Node.GROUP) {
					return;
				}
				var str = node.textContent;
				var c = str.charCodeAt(0);
				if (c !== 63) {
					// ?
					return;
				}
				c = str.charCodeAt(1);
				if (c === 61 || c === 33) {
					// =:
					//node.textContent = '?:' + str.substring(2);
					parent.isIncluded = false;
					parent.isCaptured = false;
					//this.hasInvisible = true;
				}
				if (c === 58) {
					// :
					parent.isCaptured = false;
				}
			});
		},

		wrapGroups_ () {
			visitor_walkUp(this.domIndexer, node => {
				if (node.type === Node.OR) {
					return;
				}
				var parent = node.parentNode;
				if (parent.firstChild === parent.lastChild) {
					return;
				}
				if (node.type === Node.GROUP) {
					if (node.repetition === '' && node.isCaptured === true) {
						return;
					}
				}
				if (node.type === Node.LITERAL) {
					var txt = node.textContent;
					if (txt === '\\b' || txt === '^' || txt === '$') {
						return;
					}
					var c = txt.charCodeAt(0);
					if (c === 63 /* ? */) {
						c = txt.charCodeAt(1);
						if (c === 58 || c === 61 || c === 33) {
							//:=!
							if (txt.length > 2) {
								var literal = new Node.Literal(txt.substring(2));
								dom_insertAfter(node, literal);
							}
							node.textContent = txt.substring(0, 2);
							return;
						}
					}
				}

				var group = new Node.Group();
				group.isShadowGroup = true;

				dom_insertBefore(node, group);
				dom_removeChild(node);
				dom_appendChild(group, node);
				return group;
			});
		},

		adjustBacktracks_ () {
			var mappings = this.domIndexer.groupNumMapping;
			visitor_walkByType(this.domIndexer, Node.LITERAL, node => {
				node.textContent = node.textContent.replace(rgx_groupBacktrack, (full, c, num) => {
					return c + '\\' + mappings[+num];
				});
			});
		}
	});

	var resolveIndexedMatchValue;
	(function(){
		resolveIndexedMatchValue = function(regexNode, domIndexer, match) {
			if (regexNode.hasInvisible === false) {
				return match[0];
			};
			return resolve(domIndexer, match);
		};
		function resolve(node, nativeMatch) {
			var str = '';
			for(var el = node.firstChild; el != null; el = el.nextSibling) {
				if (el.isIncluded === false) {
					continue;
				}
				if (isPartialIncluded(el)) {
					str += resolve(el, nativeMatch);
					continue;
				}
				if (el.shadowGroupNum == null) {
					str += resolve(el, nativeMatch);
					continue;
				}
				str += nativeMatch[el.shadowGroupNum];
			}
			return str;
		}
		function isPartialIncluded(node) {
			for (var el = node.firstChild; el != null; el = el.nextSibling) {
				if (el.isIncluded === false || isPartialIncluded(el) === true) {
					return true;
				}
			}
			return false;
		}
	}());

	var resolveIndexedMatchGroups;
	(function(){
		resolveIndexedMatchGroups = function(regexNode, match, matchIndex) {
			var groups = [];
			resolve(regexNode.domIndexer, match, matchIndex, groups);
			return groups;
		};
		function resolve(node, nativeMatch, pos, groups, parentGroup) {
			var group;
			if (node.groupNum != null && node.groupNum !== 0) {
				var value = nativeMatch[node.shadowGroupNum];
				group = new MatchGroup();
				group.value = value;
				group.index = pos;
				groups[node.groupNum - 1] = group;

				if (value != null && node.repetition !== '' && parentGroup != null) {
					group.index += parentGroup.value.length - value.length - 1;
				}
			}

			var nextPos = pos;
			for (var el = node.firstChild; el != null; el = el.nextSibling) {
				var next = resolve(el, nativeMatch, nextPos, groups, group || parentGroup);
				if (el.isIncluded !== false) {
					nextPos = next;
				}
			}

			if (node.shadowGroupNum != null && node.shadowGroupNum !== 0) {
				var value = nativeMatch[node.shadowGroupNum] || '';
				pos = pos + value.length;
			}
			return pos;
		}
	}());

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
}());
