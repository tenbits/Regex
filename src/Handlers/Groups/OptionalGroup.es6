var OptionalGroup;
(function(){
	OptionalGroup = {
		create (node) {
			return new OptionalGroupNode(node);
		},
		canHandle (node) {
			if (node.type !== Node.GROUP) {
				return false;
			}
			var repetition = node.repetition;
			return repetition === '?' || repetition === '*';
		}
	};

	var OptionalGroupNode = class_create(Node.Group, {

		exec (str, i, opts) {
			if (opts.fixed) {
				return this.execAnchored(str, i, opts);
			}
			return this.execSearch(str, i, opts);
		},

		execSearch(str, i, opts) {
			var next = this.nextSibling;
			var selfMatch = exec_children(
				this,
				str,
				i,
				opts
			);
			if (next == null) {
				return selfMatch;
			}
			var nextMatch = exec_children(
				this,
				str,
				i,
				opts,
				next,
				next.nextSibling
			);
			exec_clearCursors(next);

			if (nextMatch == null) {
				return selfMatch;
			}
			if (selfMatch == null) {
				var match = new Match;
				match.index = nextMatch.index;
				match.value = '';
				return match;
			}

			if (selfMatch.index + selfMatch.value.length === nextMatch.index) {
				return selfMatch;
			}
			var match = new Match;
			match.index = nextMatch.index;
			match.value = '';
			return match;
		},

		execAnchored (str, i, opts) {
			var match = exec_children(this, str, i, opts);
			if (match == null || match.index !== i) {
				match = new Match;
				match.index = i;
				match.value = '';
				return match;
			}
			return match;
		},
	})
}());