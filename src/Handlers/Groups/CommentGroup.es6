var CommentGroup;
(function(){

	CommentGroup = {
		
		transform (node) {
			var next = node.nextSibling;

			dom_removeChild(node);
			return next;
		},

		canHandle (txt) {
			return txt[0] === '?' && txt[1] === '#';
		}
	};

}());
