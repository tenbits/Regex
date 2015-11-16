var Group = class_create(AstNode, {

	index: 0,
	type: type_Group,

	name: null,

	repetition: '',
	greedy: null,

	pos: null,
	value: null,

	toString () {
		var str = '(',
			el = this.firstChild;

		while(el != null) {
			str += el.toString();
			el = el.nextSibling;
		}
		str += ')';
		if (this.repetition != null) {
			str += this.repetition;
		}
		if (this.greedy === false) {
			str += '?';
		}
		return str;
	}
});