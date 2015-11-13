var arr_flattern;
(function(){
	arr_flattern = function(arr) {
		var out = [],
			imax = arr.length,
			i = -1;
		while( ++i < imax ){
			out = out.concat(arr[i]);
		}
		return out;
	};
}());