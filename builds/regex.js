(function(root, factory){
	"use strict";

	var isNode = (typeof window === 'undefined' || window.navigator == null);
	var global_ = isNode ? global : window;

	function construct(){
		var Regex = factory(global_);
		if (isNode) {
			module.exports = Regex;
			return;
		}
		return window.Regex = Regex;
	}

	if (typeof define === 'function' && define.amd) {
		return define(construct);
	}

	return construct();
}(this, function(global){
	"use strict";

	// import ../utils/lib/utils.embed.js

	// import ../src/utils/exports.es6
	// import ../src/Ast/exports.es6
	// import ../src/Nodes/exports.es6
	// import ../src/utils/exec.es6
	// import ../src/Handlers/exports.es6

	// import ../src/Match.es6
	// import ../src/Regex.es6

	return Regex;
}));