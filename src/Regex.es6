var Regex = class_create({
	constructor (str, flags) {
		this.root = Regex.parse(str, flags);
		this.lastIndex = 0;
	},

	exec (input, start) {
		if (start != null) {
			this.lastIndex = start;
		}
		var match = this.root.exec(input, this.lastIndex);
		this.lastIndex = match == null ? 0 : match.index;
		return match;
	},

	match (input, start) {
		if (start != null) {
			this.lastIndex = start;
		}
		var match = this.root.match(input, this.lastIndex);
		this.lastIndex = match == null ? 0 : match.index + match.value.length;
		return match;
	},

	matches (input) {
		this.lastIndex = 0;
		return this.root.matches(input, 0);
	}
});

Regex.parseGroups = function (str) {
	return parser_parseGroups(str);
};

Regex.parse = function (str, flags) {
	var root = parser_parseGroups(str);

	ast_defineFlags(root, flags);
	Handlers.define(root);
	Handlers.beforeIndexed(root);

	ast_indexGroups(root);
	Handlers.afterIndexed(root);

	ast_combineNatives(root);
	Handlers.afterCombined(root);

	ast_createBlocks(root);
	ast_compileNatives(root);
	ast_resolveBacktracks(root);
	return root;
};