var Literal = class_create(AstNode, {

	type: type_Literal,

	constructor (text) {
		this.textContent = text;
	},

	toString () {
		return this.textContent;
	},

	checkNative () {
		return true;
	}
});