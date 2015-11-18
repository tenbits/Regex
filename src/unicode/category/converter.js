// $ atma custom converter

io
	.Directory
	.readFiles('/')
	.files
	.forEach(x => {
		var path = x.uri.toString();
		if (path.indexOf('converter') > -1 || path.indexOf('export') > -1)
			return;

		var rgx = eval(x.read());
		var str = rgx.source;

		var name = x.uri.file.replace('.' + x.uri.extension, '');
		
		str = 'Category.' + name + ' = "' + str + '"';

		io.File.write(name + '-export.js', str);
	})