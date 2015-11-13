var RegexOpts = class_create({
	isNative: true,
	isCaptured: true,
	isIncluded: true,
	isBacktracked: false,
	isAtomic: false,

	flags: null,
	cursor: null,

	serializeFlags () {
		return flags_serialize(this.getFlags());
	},
	getFlags () {
		var el = this;
		while(el != null && el.flags == null) {
			el = el.parentNode;
		}

		return el && el.flags;
	},
	setFlags (on, off) {
		this.flags = el_set(this.getFlags(), on, off);
	}
});