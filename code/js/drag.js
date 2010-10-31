(function(){
var touchstart = 'ontouchstart' in document.documentElement ? 'touchstart' : 'mousedown',
    touchmove = 'ontouchmove' in document.documentElement ? 'touchmove' : 'mousemove',
    touchend = 'ontouchend' in document.documentElement ? 'touchend' : 'mouseup';

var body = document.body;
var touches = {};
	
document.body.addEventListener(touchstart, function(e){
	var t = e.changedTouches ? e.changedTouches[0] : e;
	//var el = e.target && (e.target.nodeType == 3 ? e.target.parentNode : e.target);
	var el = e.target;
	while(!el.draggable && el != body && el = el.parentNode);
	
	console.log(el);
}, false);

document.body.addEventListener(touchmove, function(e){
	var t = e.changedTouches ? e.changedTouches[0] : e;
}, false);

document.body.addEventListener(touchend, function(){
	var t = e.changedTouches ? e.changedTouches[0] : e;
}

})();