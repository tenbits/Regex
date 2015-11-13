var exec_root;
(function(){

	exec_root = function (root, str, i) {
		backtrack_clearCursors(root)
		var match = exec_children(root, str, i);
		if (match == null) {
			return null;
		}
		if (root.groups) {
			match.groups = {};
			for (var key in root.groups) {
				match.groups[key] = match[root.groups[key]];
			}
		}
		return match;
	};

	var exec_children = function(node, str, i, opts_) {
		var el, matches = [], backtracking = [], opts = new Opts(opts_);

		for(el = node.firstChild; el != null;) {
			var matcher = Matchers[el.type];
			var match = matcher(el, str, i, opts);
			if (match == null) {
				if (backtracking.length === 0) {
					return null;
				}
				var track = backtracking.pop();
				i = track.strI;
				el = track.el;
				matches.splice(track.matchI);
				opts = track.opts;
				continue;
			}
			if (el.isBacktracked) {
				backtracking.push(new Backtrack(
					i,
					matches.length,
					el,
					opts
				));
			}
			i = opts.fixed
				? i + match[0].length
				: i + match[0].length + match.index;
			matches.push(match);
			opts.fixed = true;
			el = el.nextSibling;
		}
		return matches_join(matches);
	};

	var Backtrack = function(strI, matchI, el, opts) {
		this.strI = strI;
		this.matchI = matchI;
		this.el = el;
		this.opts = new Opts(opts);
	};

	var Opts = function(current){
		this.fixed = false;
		if (current == null) {
			return;
		}
		this.fixed = current.fixed;
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
			if (rgx.index != null) {
				match.groupIndex = rgx.index;
			}
			return match;
		},
		[Node.GROUP] (group, str, i, opts) {
			var match = exec_children(group, str, i, opts);
			if (match == null) {
				return null;
			}

			match.unshift(match[0]);
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
		visitor_walkUp(node, x => x.cursor = null);
	};


	function matches_joinOld(matches) {
		var str = '';
		var out = [];

		var i = -1,
			imax = matches.length;

		while(++i < imax) {
			var match = matches[i],
				j = 0,
				jmax = match.length;

			str += match[0];

			while( ++j < jmax ) {
				var x = match[j];
				if (x != null) {
					out[j] = x;
				}
			}
		}
		out[0] = str;
		out.index = matches[0].index;
		return out;
	}
	function matches_join(matches) {
		var str = '';
		var out = [ str ];

		var i = -1,
			imax = matches.length;

		while(++i < imax) {
			var match = matches[i],
				j = 0,
				jmax = match.length;

			str += match[0];

			if (match.groupIndex != null) {
				var groups = match.splice(1);
				var length = match.groupIndex + groups.length - 1;
				if (out.length < length) {
					out.length = length;
				}
				out.splice(match.groupIndex, 0, ...groups);
				continue;
			}
			out = out.concat(match.slice(1));
		}

		out[0] = str;
		out.index = matches[0].index;
		return out;
	}
}());