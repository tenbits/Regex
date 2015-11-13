var Literal = class_create(RegexOpts, {

	type: type_Literal,

	constructor (text) {
		this.textContent = text;
	},

	toString () {
		return this.textContent;
	}
});