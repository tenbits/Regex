var Match,
	MatchGroup;
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

}());
