var PossessiveGroup,
	PossessiveLiteral;

(function(){

	PossessiveGroup = {

		create (node) {
			return new PossessiveGroupNode(node);
		},

		canHandle (node, root) {
			if (node.type !== Node.GROUP) {
				return false;
			}
			return node.possessive === true;
		}
	};

	PossessiveLiteral = {
		canHandle (txt, root) {

		}
	};

	var PossessiveGroupNode = class_create(Node.Group, {
		isNative: false,
		compiled: false,
		constructor (group) {
			this.isCaptured = group.isCaptured;
			this.repetition = group.repetition;
		},

		compile () {
			for(var el = this.firstChild; el != null; el = el.nextSibling) {
				if (el.type !== Node.LITERAL) {
					this.compiled = false;
					continue;
				}
				el.textContent = `(?:${el.textContent})+`;
			}
			ast_compileNatives(this);
		}
	});


}());