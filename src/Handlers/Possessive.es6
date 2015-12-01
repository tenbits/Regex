var PossessiveGroup,
	PossessiveGroupNode,
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
		transform (node) {
			node.textContent = node.textContent.replace(rgx_possessiveCharClass, (full, g1, g2) => {
				return g1 + g2;
			});
		},
		canHandle (txt, root) {
			return rgx_possessiveCharClass.test(txt);
		}
	};

	var rgx_possessiveCharClass = /([^\\])([\*\+])\+/g;

	PossessiveGroupNode = class_create(Node.Group, {
		isNative: true,
		isBacktracked: false,
		compiled: false,
		isAtomic: true,
		constructor (group) {
			this.isCaptured = group.isCaptured;
			this.repetition = group.repetition;
		},
		toString () {
			var str = Node.Group.prototype.toString.call(this)
			if (this.isCaptured === true) {
				return str;
			}
			return '(?:' + str.substring(1);
		}
	});


}());