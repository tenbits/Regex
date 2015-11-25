var LookaheadGroup;
(function(){
	LookaheadGroup = {

		transform (group) {
			group.isCaptured = false;
			group.isIncluded = false;
		},

		canHandle (txt) {
			var c = txt.charCodeAt(1);
			return c === 61 /*=*/ || c === 33 /*!*/;
		}
	};
}());
