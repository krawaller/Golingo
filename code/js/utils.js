(function(global){
var _ = {};

function extend(destination, source){
    for (var property in source) {
        destination[property] = source[property];
    }
    return destination;
};

_.extend = function(obj1, obj2, obj3){
	if(!obj3){
		return extend(obj1, obj2);
	} else {
		var args = Array.prototype.slice.call(arguments),
			obj = args.shift();
		while(args.length){
			obj = extend.apply(null, [obj, args.shift()]);
		}
		return obj;
	}
};


// By default, Underscore uses ERB-style template delimiters, change the
// following template settings to use alternative delimiters.
 _.templateSettings = {
   evaluate    : /<%([\s\S]+?)%>/g,
   interpolate : /<%=([\s\S]+?)%>/g
 };

 // JavaScript micro-templating, similar to John Resig's implementation.
 // Underscore templating handles arbitrary delimiters, preserves whitespace,
 // and correctly escapes quotes within interpolated code.
 _.template = function(str, data) {
   var c  = _.templateSettings;
   var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
     'with(obj||{}){__p.push(\'' +
     str.replace(/'/g, "\\'")
        .replace(c.interpolate, function(match, code) {
          return "'," + code.replace(/\\'/g, "'") + ",'";
        })
        .replace(c.evaluate || null, function(match, code) {
          return "');" + code.replace(/\\'/g, "'")
                             .replace(/[\r\n\t]/g, ' ') + "__p.push('";
        })
        .replace(/\r/g, '\\r')
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t')
        + "');}return __p.join('');";
   var func = new Function('obj', tmpl);
   return data ? func(data) : func;
 };


_.findPos = function(obj) {
	var curleft = curtop = 0;
	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}
	return { x: curleft, y: curtop };
}




global._ = _;
})(window);