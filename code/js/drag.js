(function(){
var touchstart = 'ontouchstart' in document.documentElement ? 'touchstart' : 'mousedown',
    touchmove = 'ontouchmove' in document.documentElement ? 'touchmove' : 'mousemove',
    touchend = 'ontouchend' in document.documentElement ? 'touchend' : 'mouseup';

var body = document.body;
var touches = {};
	
document.body.addEventListener(touchstart, function(e){
	e.preventDefault();
	var ts = e.changedTouches ? e.changedTouches : [e], t, i = ts.length, el;
	
	while(t = ts[--i]){
		el = t.target;
		while(el.className.indexOf('draggable') == -1 && (el = (el != body)) && (el = el.parentNode));
		if(el){
			touches[t.identifier] = { el: el, hover: null };
			$(el).addClass('dragging');
			//console.log('touchme', el)
		}
	}
}, false);

document.body.addEventListener(touchmove, function(e){
	e.preventDefault();
	var ts = e.changedTouches ? e.changedTouches : [e], i = ts.length, el, o;
	while((t = ts[--i]) && (o = touches[t.identifier])){
		//console.log(t, el);
		el = o.el;
		el.style.webkitTransform = 'translate3d(' + t.pageX + 'px, ' + t.pageY + 'px, 0px)';
		var hover = document.elementFromPoint(t.pageX, t.pageY);
		if(o.hover != hover){
			$(o.hover).removeClass('hover');
			$(hover).addClass('hover');
			o.hover = hover;
		}
	}
}, false);

document.body.addEventListener(touchend, function(e){
	e.preventDefault();
	var ts = e.changedTouches ? e.changedTouches : [e], i = ts.length, el;
	while((t = ts[--i]) && (o = touches[t.identifier])){
	el = o.el;
		$(el).removeClass('dragging');
		delete touches[i];
	}
});

})();