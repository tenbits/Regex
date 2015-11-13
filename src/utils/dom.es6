var dom_appendChild,
	dom_prependChild,
	dom_insertBefore,
	dom_insertAfter,
	dom_removeChild;

(function(){
	dom_appendChild = function(parent, child){
		child.parentNode = parent;

		if (parent.lastChild == null) {
			parent.lastChild = child;
			parent.firstChild = child;
			child.nextSibling = null;
			child.previousSibling = null;
			return;
		}

		var last = parent.lastChild;

		parent.lastChild = child;
		last.nextSibling = child;
		child.previousSibling = last;
		child.nextSibling = null;
	};
	dom_prependChild = function(node, child){
		child.parentNode = node;

		var first = node.firstChild;
		if (first == null) {
			node.firstChild = child;
			node.lastChild = child;
			return;
		}

		node.firstChild = child;
		child.nextSibling = first;
		first.previousSibling = child;
	};

	dom_insertBefore = function(node, prevEl) {

		prevEl.previousSibling = node.previousSibling;
		prevEl.nextSibling = node;
		node.previousSibling = prevEl;

		if (prevEl.previousSibling != null) {
			prevEl.previousSibling.nextSibling = prevEl;
		}

		var parent = prevEl.parentNode = node.parentNode;
		if (parent != null) {
			if (parent.firstChild === node) {
				parent.firstChild = prevEl;
			}
		}
	};

	dom_insertAfter = function(node, nextEl) {
		nextEl.nextSibling = node.nextSibling;
		nextEl.previousSibling = node;
		node.nextSibling = nextEl;
		if (nextEl.nextSibling != null) {
			nextEl.nextSibling.previousSibling = nextEl;
		}

		var parent = nextEl.parentNode = node.parentNode;
		if (parent != null) {
			if (parent.lastChild === node) {
				parent.lastChild = nextEl;
			}
		}
	};

	dom_removeChild = function(el) {
		if (el.nextSibling) {
			el.nextSibling.previousSibling = el.previousSibling
		}
		if (el.previousSibling) {
			el.previousSibling.nextSibling = el.nextSibling;
		}
		var parent = el.parentNode;
		if (parent.firstChild === el) {
			parent.firstChild = el.nextSibling;
		}
		if (parent.lastChild === el) {
			parent.lastChild = el.previousSibling;
		}
		el.parentNode = null;
		el.nextSibling = null;
		el.previousSibling = null;
	};
}());