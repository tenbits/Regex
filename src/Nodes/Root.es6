var Root = class_create(Block, {

	type: type_Root,

	constructor () {
		this.flags = {
			i: false,
			y: false,
			m: true,
			g: true,
		};
	},

	exec (str, i) {
		var opts = new exec_Opts;
		var internal = exec_root(this, str, i, opts);
		if (internal == null) {
			return null;
		}
		var match = internal.toMatch();
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
		return arr;
	},

	match (str, i) {
		var opts = new exec_Opts;
		opts.indexed = true;
		var match = exec_root(this, str, i, opts);
		if (match == null) {
			return null;
		}
		return match.toMatch();
	},

	groups: null,
	expressions: null,
	transformers: null,
	filters: null,

	addTransformer (fn) {
		if (this.transformers == null)
			this.transformers = [];
		this.transformers.push(fn);
	},
	addFilter (fn) {
		if (this.filters == null)
			this.filters = [];
		this.filters.push(fn);
	}
});
