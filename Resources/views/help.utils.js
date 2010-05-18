(function() { 
    Ti.App.addEventListener('localize', doTmpl);
	
    var cache = {};

    this.tmpl = function tmpl(str, data) {
        // Figure out if we're getting a template, or if we need to
        // load the template - and be sure to cache the result.
        var fn = !/\W/.test(str) ?
      cache[str] = cache[str] ||
        tmpl(document.getElementById(str).innerHTML) :

        // Generate a reusable function that will serve as a template
        // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

        // Convert the template into pure JavaScript
str.replace(/[\r\t\n]/g, " ")
   .replace(/'(?=[^%]*%>)/g,"\t")
   .split("'").join("\\'")
   .split("\t").join("'")
   .replace(/<%=(.+?)%>/g, "',$1,'")
   .split("<%").join("');")
   .split("%>").join("p.push('")
   + "');}return p.join('');");

        // Provide some basic currying to the user
        return data ? fn(data) : fn;
    };
})();

// Kill movement
document.addEventListener('touchmove', function(e){
	e.preventDefault();
}, false);

var c = 0;
function b(o){
    return '<div id="b' + c++ + '" class="bubble" style="max-width: ' + (o.maxWidth + 'px' || 'auto') + '; ' + (o.tipPos == 'right' ? 'right' : 'left') + ': ' + (o.x ||  0) + 'px; ' + (o.tipPos == 'bottom' ? 'bottom' : 'top') + ': ' + (o.y ||  0) + 'px;"><div>' + t[o.t].replace(/\n/g, "<br/>") + '</div><div class="tip ' + o.tipPos + '" style="' + (o.tipX ? 'left: ' + o.tipX + 'px; ' : '') + ';' + (o.tipY ? 'top: ' + o.tipY + 'px;' : '') + '"></div></div>';     
}

function doTmpl(e){
	setTimeout(function(){
		var body = document.getElementsByTagName('body')[0];
        body.innerHTML = tmpl(document.getElementById('template').innerHTML, {t: t, b: b});
        body.className = 'loaded';
	}, 40);
	t = e.t;
}