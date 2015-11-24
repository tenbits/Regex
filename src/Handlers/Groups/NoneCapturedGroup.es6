var NoneCapturedGroup;

(function(){

	NoneCapturedGroup = {

		create (node) {
			var literal = node.firstChild,
				txt = literal.textContent;

			literal.textContent = txt.substring(2);
			var group = new NoneCapturedGroupNode();
			group.repetition = node.repetition;
			group.lazy = node.lazy;
			group.possessive = node.possessive;

			return group;
		},

		canHandle (txt) {
			var c = txt.charCodeAt(1);
			return c === 58 /*:*/ || c === 62;
		}
	};


	var NoneCapturedGroupNode = class_create(Node.Group, {
		isCaptured: false,

		toString () {
			var str = Node.Group.prototype.toString.call(this);
			return '(?:' + str.substring(1);
		}
	})
}());
