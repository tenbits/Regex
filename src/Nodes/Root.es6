var Root = class_create(Block, {

	type: type_Root,

	constructor () {
		this.flags = {
			i: false,
			m: true,
			g: true,
		};
	},

	exec (str, i) {
		var opts = new exec_Opts;
		opts.indexed = false;
		return exec_root(this, str, i, opts);
	},

	match (str, i) {
		var opts = new exec_Opts;
		opts.indexed = true;
		return exec_root(this, str, i, opts);
	},

	groups: null,
	expressions: null,
	transformers: null,
	filters: null,

	addTransformer (fn) {
		if (this.transformers == null)
			this.transformers = [];

		this.transformers.push(fn);
	}
});
