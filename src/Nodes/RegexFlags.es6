var RegexFlags = class_create({
	g: true,
	m: true,
	i: false,
	y: false,
	x: false
});

RegexFlags.DEFAULT = new RegexFlags;

RegexFlags.equals = function(a, b) {
	if (a == null) {
		return b == null;
	};
	var a_ = a || RegexFlags.DEFAULT,
		b_ = b || RegexFlags.DEFAULT;

	if (a_.g !== b_.g ||
		a_.m !== b_.m ||
		a_.i !== b_.i ||
		a_.y !== b_.y ||
		a_.x !== b_.x) {

		return false;
	}
	return true;
};
