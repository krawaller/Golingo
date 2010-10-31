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
		el = t.target.nodeType != 3 ? t.target : t.target.parentNode;
		console.log('el', el);
		while(el.className.indexOf('draggable') == -1 && (el != body) && (el = el.parentNode));
		if(el && el != body){
			var offset = _.findPos(el);
			touches[t.identifier] = { el: el, hover: null, parentOffset: offset, tapOffset: { x: t.pageX - offset.x - (el.x || 0), y: t.pageY - offset.y - (el.y || 0) } };
			$(el).addClass('dragging');
		}
	}
}, false);

var j = 0;
document.body.addEventListener(touchmove, function(e){
	//j++;
	e.preventDefault();
	var ts = e.changedTouches ? e.changedTouches : [e], i = ts.length, el, o;
	while((t = ts[--i]) && (o = touches[t.identifier])){
		//console.log(t, el);
		el = o.el;
		//console.log(o, el.x, el.y);
		el.style.webkitTransform = 'translate3d(' + (el.x = (t.pageX - o.parentOffset.x - o.tapOffset.x)) + 'px, ' + (el.y = (t.pageY - o.parentOffset.y - o.tapOffset.y)) + 'px, 0px)';
		//var hover = document.elementFromPoint(t.pageX, t.pageY - 44);
		//console.log(hover);
		/*if(hover.nodeName == 'TD' && o.hover != hover){
			//$(o.hover).removeClass('helper');
			//$(hover).addClass('helper');
			if(o.hover) { o.hover.style.opacity = '0'; }
			hover.style.opacity = '1';
			o.hover = hover;
		}*/
	}
}, false);

document.body.addEventListener(touchend, function(e){
	e.preventDefault();
	var ts = e.changedTouches ? e.changedTouches : [e], i = ts.length, el;
	while((t = ts[--i]) && (o = touches[t.identifier])){
		el = o.el;
		$(el).removeClass('dragging');
		//$(o.hover).removeClass('helper');
		//if(o.hover) { o.hover.style.opacity = '0'; }
		delete touches[t.identifier];
	}
});

})();