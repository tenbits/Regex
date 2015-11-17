var NoneCapturedGroup = {

	transform (node) {
		node.isCaptured = false;
	},

	canHandle (txt) {
		return txt.charCodeAt(1) === 58 /*:*/;
	}
};