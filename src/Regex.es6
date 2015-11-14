class Regex {
	constructor (str, flags) {
		this.root = Regex.parse(str, flags);
		this.lastIndex = 0;
	}

	exec(input) {
		var match = this.root.exec(input, this.lastIndex);
		this.lastIndex = match == null ? 0 : match.index;
		return match;
	}

	static parseGroups (str) {
		return parser_parseGroups(str);
	}

	static parse (str, flags) {
		var root = parser_parseGroups(str);

		ast_defineFlags(root, flags);
		ast_defineHandlers(root);
		ast_indexGroups(root);

		Handlers.afterIndexed(root);

		ast_combineNatives(root);
		ast_createBlocks(root);

		ast_compileNatives(root);
		ast_resolveBacktracks(root);
		return root;
	}
}