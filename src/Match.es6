var Match,
	MatchGroup,
	MatchInternal,
	MatchInternalCollection;
(function(){

	Match = class_create({
		value: null,
		index: null,
		groups: null,
		groupNum: null,
		constructor () {
			this.groups = [];
		},
		toArray () {
			var groups = this.groups.map(x => x.value);
			var arr = [this.value, ...groups];
			arr.index = this.index;
			return arr;
		}
	});

	MatchGroup = class_create({
		value: null,
		index: null,
	});

	MatchInternal = class_create({
		constructor (matchIndex, matchValue, regexNode, nativeIndexerMatch) {
			this.index = matchIndex;
			this.value = matchValue;
			this.match = nativeIndexerMatch;
			this.regex = regexNode;
		}
	});

	MatchInternalCollection = class_create({
		constructor (matches, root) {
			this.namedGroups = null;
			this.matches = matches;
			this.index = matches[0].index;
			this.value = '';

			var imax = matches.length,
				i = -1;
			while(++i < imax) {
				this.value += matches[i].value;
			}
		},
		toMatch () {
			var match = new Match;
			match.index = this.index;
			match.value = this.value;
			match.groups = new Array(this.getGroupCount());
			var imax = this.matches.length,
				i = -1, cursor = 0;
			while(++i < imax) {
				var x = this.matches[i],
					groups, groupNum;
				if (x.regex != null) {
					groups = x.regex.getGroups(x.match, x.index);
					groupNum = x.regex.groupNum;
				}
				else if (x.toMatch) {
					var sub = x.toMatch();
					groups = sub.groups;
					var j = groups.length;
					while(--j > -1) {
						var x = groups[j];
						if (x != null)
							match.groups[j] = groups[j];
					}
					continue;
				} else {
					groups = x.groups;
					groupNum = x.groupNum;
				}
				if (groups == null || groups.length === 0) {
					continue;
				}
				if (groupNum == null) {
					match.groups.splice(cursor, groups.length, ...groups);
					cursor += groups.length;
					continue;
				}
				var index = groupNum - 1;
				if (match.groups.length < index) {
					match.groups.length = index;
				}
				match.groups.splice(index, groups.length, ...groups);
			}


			for (var key in this.namedGroups) {
				var num = this.namedGroups[key];
				var group = match.groups[num - 1];
				match.groups[key] = group && group.value;
			}
			return match;
		},
		getGroupCount () {
			var n = 0, i = this.matches.length, x;
			while (--i > -1) {
				x = this.matches[i];
				if (x.matches != null) {
					n += x.getGroupCount();
					continue;
				}
				if (x.regex != null) {
					n += x.regex.groupCount;
					continue;
				}
				if (x.groups != null) {
					n += x.groups.length;
				}
			}
			return n;
		}
	})

}());
