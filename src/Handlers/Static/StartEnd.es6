var StartEndStatic = {
	transform (node, root) {
		root.addFilter((input, match) => {
			if (match.index === input.length) {
				return null;
			}
			return match;
		});
	},
	canHandle (txt) {
		return txt === '^$' || txt === '^';
	}
};
