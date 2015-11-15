var RegexNode = class_create(Literal, {
	type: type_Regex,

	rgxSearch: null,
	rgxFixed: null,

	constructor (text, node) {
		var flags = node.serializeFlags();
		this.rgxSearch = new RegExp(this.textContent, flags);
		this.rgxFixed = new RegExp('^' + this.textContent, flags.replace('g', ''));
		this.index = node.index;
	},

});