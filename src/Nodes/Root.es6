var Root = class_create(Block, {

	type: type_Root,

	exec (str, i) {
		return exec_root(this, str, i);
	},

	groups: null
});
