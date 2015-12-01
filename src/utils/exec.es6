var exec_root,
	exec_children,
	exec_clearCursors,
	exec_Opts;
(function(){

	exec_root = function (root, str, i, opts_) {
		backtrack_clearCursors(root);

		var opts = new exec_Opts(opts_);
		opts.lastIndex = i;
debugger;
		var match = exec_children(root, str, i, opts);
		if (match == null) {
			return null;
		}
		if (root.flags.y && match.index !== i) {
			return null;
		}
		if (root.filters != null) {
			var fns = root.filters,
				imax = fns.length,
				i = -1;
			while( ++i < imax ) {
				match = fns[i](str, match, root);
				if (match == null) {
					return null;
				}
			}
		}
		if (root.transformers != null) {
			var fns = root.transformers,
				imax = fns.length,
				i = -1;
			while( ++i < imax ) {
				fns[i](root, match);
			}
		}

		var response = match;
		if (opts && opts.indexed === false) {
			var groups = match.groups,
				imax = groups.length + 1,
				i = 0,
				arr = new Array(imax),
				x;
			while(++i < imax) {
				x = groups[i - 1];
				arr[i] = x && x.value;
			}
			arr[0] = match.value;
			arr.index = match.index;
			arr.groups = {};
			response = arr;
		}
		if (root.groups) {
			for (var key in root.groups) {
				var num = root.groups[key];
				var group = match.groups[num - 1];
				response.groups[key] = group && group.value;
			}
		}
		return response;
	};

	exec_children = function(node, str, i_, opts_, start, end) {

		var matches = [],
			backtracking = [],
			opts = new Opts(opts_),
			el = start || node.firstChild,
			i = i_,
			imax = str.length,
			search = opts.fixed !== true
				? new Backtrack(i_, 0, el, opts)
				: null;

		while(el != end) {
			if (i >= imax) {
				return null;
			}
			var matcher = Matchers[el.type];
			var match = el.exec ? el.exec(str, i, opts) : matcher(el, str, i, opts);
			if (match == null) {
				if (backtracking.length !== 0) {
					var track = backtracking.pop();
					i = ++track.strI;
					el = track.el;
					matches.splice(track.matchI);
					opts = track.opts;
					continue;
				}

				if (search && matches.length !== 0) {
					i = ++search.strI;
					if (i >= imax) {
						return null;
					}
					el = search.el;
					matches.length = 0;
					opts = search.opts;
					backtrack_clearCursors(node);
					continue;
				}
				return null;
			}
			if (el.isBacktracked) {
				backtracking.push(new Backtrack(
					i,
					matches.length,
					el,
					opts
				));
			}
			if (search != null && matches.length === 0) {
				search.strI = match.index;
			}

			i = opts.fixed
				? i + match.value.length
				: match.index + match.value.length;
			matches.push(match);
			opts.fixed = true;
			el = el.nextSibling;
		}
		return matches_join(matches);
	};

	exec_clearCursors = backtrack_clearCursors;

	var Backtrack = function(strI, matchI, el, opts) {
		this.strI = strI;
		this.matchI = matchI;
		this.el = el;
		this.opts = new Opts(opts);
	};

	var Opts = exec_Opts = function(current){
		this.fixed = false;
		this.indexed = false;
		this.lastIndex = 0;
		if (current == null) {
			return;
		}
		this.fixed = current.fixed;
		this.indexed = current.indexed;
		this.lastIndex = current.lastIndex;
	};

	var Matchers = {
		[Node.REGEX] (rgx, str, i, opts) {
			var regex, match;
			if (opts.fixed) {
				var sub = str.substring(i);
				match = rgx.rgxFixed.exec(sub);
			} else {
				rgx.rgxSearch.lastIndex = i;
				match = rgx.rgxSearch.exec(str);
			}
			if (match == null) {
				return null;
			}
			if (rgx.groupNum != null) {
				match.groupNum = rgx.groupNum;
			}
			return match;
		},
		[Node.GROUP] (group, str, i, opts) {
			var match = exec_children(group, str, i, opts);
			if (match == null) {
				return null;
			}
			if (group.isCaptured !== false && group.isIncluded !== false) {
				var group = new MatchGroup();
				group.value = match.value;
				group.index = match.index;
				match.groups.unshift(group);
			}
			return match;

			//for(var el = group.parentNode; el != null ; el = el.parentNode) {
			//	if (el.type === Node.GROUP) {
			//		match.unshift(match[0]);
			//		return match;
			//	}
			//}
			//// Reposition matches
			//var groups = match.slice(0);
			//match.splice(1);
			//match.length = groups.length + group.index - 1;
			//match.splice(group.index, 0, ...groups);
			//return match;
		},
		[Node.BLOCKS]  (blocks, str, i, opts_) {

			var best, bestEl, match,
				block = blocks.cursor == null
					? blocks.firstChild
					: blocks.cursor.nextSibling;

			for(; block != null; block = block.nextSibling) {
				match = exec_children(block, str, i, opts_);
				if (match == null) {
					continue;
				}
				if (best == null) {
					best = match;
					bestEl = block;
					continue;
				}
				if (match.index < best.index) {
					best = match;
					bestEl = block;
				}
			}
			if (bestEl != null) {
				blocks.cursor = bestEl;
			}
			return best;
		}

	};

	function backtrack_clearCursors (node) {
		visitor_walk(node, x => x.cursor = null);
		node.cursor = null;
	};

	function matches_join(matches) {
		var str = '';
		var out = new Match();

		out.value = '';
		out.index = matches[0].index;

		var i = -1,
			imax = matches.length;

		while(++i < imax) {
			var match = matches[i],
				groups = match.groups,
				jmax = groups.length,
				j = 0;

			out.value += match.value;

			if (match.groupNum != null) {
				var pos = match.groupNum - 1;
				while (out.groups.length < pos) {
					out.groups[out.groups.length++] = null;
				}
				out.groups.splice(pos, 0, ...groups);
				continue;
			}

			out.groups = out.groups.concat(groups);
		}
		return out;
	}

	function matches_joinArray(matches) {
		var str = '';
		var out = [ str ];

		out.index = matches[0].index;

		var i = -1,
			imax = matches.length;

		while(++i < imax) {
			var match = matches[i],
				j = 0,
				jmax = match.groups.length;

			str += match.value;

			var groups = match.groups,
				jmax = groups.length,
				j = -1,
				arr = new Array(jmax);
			while(++j < jmax) {
				arr[j] = groups[j].value;
			}

			if (match.groupNum != null) {
				var pos = match.groupNum - 1,
					length = pos + jmax - 1;
				while (out.groups.length < length) {
					out[out.length++] = null;
				}
				out.splice(pos, 0, ...arr);
				continue;
			}
			out = out.concat(arr);
		}
		out.index = matches[0].index;
		return out;
	}
}());