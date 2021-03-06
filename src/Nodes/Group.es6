var Group = class_create(AstNode, {

	index: 0,
	groupNum: null,

	type: type_Group,

	name: null,

	repetition: '',
	lazy: false,
	possessive: false,

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
		if (this.lazy === true) {
			str += '?';
		}
		if (this.possessive === true) {
			str += '+';
		}
		return str;
	}
});