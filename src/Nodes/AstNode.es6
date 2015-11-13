var AstNode = class_create(RegexOpts, {

	lastChild: null,
	firstChild: null,
	nextSibling: null,
	previousSibling: null,

	parentNode: null,

	textContent: null,

	appendChild (node) {
		dom_appendChild(this, node);
	},
	prependChild (node) {
		dom_prependChild(this, node);
	},
	removeChild (el) {
		dom_removeChild(el)
	},
	insertBefore (node, anchor) {
		if (anchor == null) {
			this.prependChild(node);
			return;
		}
		dom_insertBefore(anchor, node);
	},
	insertAfter (node, anchor) {
		if (anchor == null) {
			this.appendChild(node);
			return;
		}
		dom_insertAfter(anchor, node);
	},

	empty () {
		var el;
		while((el = this.firstChild) != null) {
			dom_removeChild(el);
		}
	},

	getRoot () {
		var el = this;
		while (el != null) {
			if (el.type === type_Root) {
				return el;
			}
			el = el.parentNode;
		}
		return null;
	},

	getChildren () {
		var arr = [];
		var el = this.firstChild;
		while(el != null) {
			arr.push(el);
			el = el.nextSibling;
		}
		return arr;
	},

	getLength() {
		var l = 0;
		for(var el = this.firstChild; el != null; el = el.nextSibling) {
			l++;
		}
		return l;
	}
});