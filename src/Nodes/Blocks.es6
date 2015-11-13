var Blocks = class_create(AstNode, {

	type: type_Blocks,
	cursor: null,

	toString () {
		var parts = [],
			el = this.firstChild;

		while(el != null) {
			parts.push(el.toString());
			el = el.nextSibling;
		}
		return parts.join('|');
	}
});