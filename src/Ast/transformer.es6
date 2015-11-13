var transformer_replaceNode;
(function(){
	transformer_replaceNode = function(old_, new_, shouldPreserveChildren = true){

		var parent = old_.parentNode;
		parent.insertBefore(new_, old_);
		parent.removeChild(old_);

		if (shouldPreserveChildren === true) {
			var el = old_.firstChild;
			while(el != null) {

				dom_removeChild(el);
				dom_appendChild(new_, el);
				el = old_.firstChild;
			}
		}
		return new_;
	};
}())