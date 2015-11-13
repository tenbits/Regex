var Block = class_create(AstNode, {
	type: type_Block,

	toString () {
		var str = '',
			el = this.firstChild;

		while(el != null) {
			str += el.toString();
			el = el.nextSibling;
		}
		return str;
	},

	foo () {
		return 'baz'
	}
});