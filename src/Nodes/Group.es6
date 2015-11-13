var Group = class_create(AstNode, {

	index: 0,
	type: type_Group,

	name: null,

	constructor (parent) {
		this.nodes = [];
	},
	append (node) {
		this.nodes.push(node);
	},

	toString () {
		var str = '',
			el = this.firstChild;

		while(el != null) {
			str += el.toString();
			el = el.nextSibling;
		}
		return '(' + str + ')';
	}
});