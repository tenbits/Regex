var NoneCapturedGroup;

(function(){

	NoneCapturedGroup = {

		create (node) {
			var literal = node.firstChild,
				txt = literal.textContent;

			literal.textContent = txt.substring(2);
			return new NoneCapturedGroupNode();
		},

		canHandle (txt) {
			return txt.charCodeAt(1) === 58 /*:*/;
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
