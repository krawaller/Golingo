// Hacky multitouch Golingo drag and drop
(function($){
    touchstart = 'ontouchstart' in document.documentElement ? 'touchstart' : 'mousedown';
    touchmove = 'ontouchmove' in document.documentElement ? 'touchmove' : 'mousemove';
    touchend = 'ontouchend' in document.documentElement ? 'touchend' : 'mouseup';
    
    var touches = {};
    document.addEventListener(touchmove, function(e){
        e.preventDefault();

        // For desktop debugging
        if (!e.changedTouches) {
            e.changedTouches = [{
                pageX: e.pageX,
                pageY: e.pageY
            }];
        }
        
        // Move 'em
        i = e.changedTouches.length;
        while (i--) {
            var t = e.changedTouches[i], el = touches[t.identifier];
            if (el && !el.animating && !el.resizing) {
                var off = el.off, x = t.pageX - off.x, y = t.pageY - off.y;
                el.transform[0] = ['translate3d(', el.swap * x, 'px,', el.swap * y, 'px, 0px)'].join('');
                el.style.webkitTransform = el.transform.join(' ');
            }
        }
    }, false);
    
    // Stop there!
    document.addEventListener(touchend, function(e){
        if (!e.changedTouches) {
            e.changedTouches = [{
                pageX: e.pageX,
                pageY: e.pageY
            }];
        }
        var t = e.changedTouches[0], el = touches[t.identifier];
        if(el){
            dragend.call(el, e);
        }
    }, false);
    
    
    var dragend = function(e){
        e.preventDefault();
        e.stopPropagation();
        var el = this, $el = el.$;

        if (!e.changedTouches) {
            e.changedTouches = [{
                pageX: e.pageX,
                pageY: e.pageY
            }];
        }
        
        $el.removeClass('dragging');
        
        var anim = false;   
        if (el.opts.droppable) {
            
            $el.hide();
            var t = e.changedTouches[0], to = document.elementFromPoint(t.pageX, t.pageY), $to = $(to), $td;
            
            // Finding closest neighbour if droptarget busy - not pretty, but working
            if(el.opts.dropClass && !$to.hasClass(el.opts.dropClass) && ($td = $to.parent().parent()) && $td.hasClass(el.opts.dropClass)){
                var letter = $to.parent()[0];
                var p = $td.position(), w = $td.wPosition(), pos = {
                    x: t.pageX - (p.left + w.x),
                    y: t.pageY - (p.top + w.y)
                },
                cellWidth = 40, // Shouldn't be here
                cellHeight = 40;
                
                var dirs = [
                    {dir: 'top', val: pos.y},
                    {dir: 'right', val: cellWidth - pos.x},
                    {dir: 'bottom', val: cellHeight - pos.y},
                    {dir: 'left', val: pos.x}
                ];
                dirs.sort(function(a,b){
                    return a.val == b.val ? 0 : (a.val < b.val ? -1 : 1)
                })
                for(var i = 0; i < dirs.length; i++){
                    var key = letter.inst.neighbourKey(dirs[i].dir);
                    if(!letter.inst.board.boardState[key]){
                        $to = $(letter.inst.board.boardCells[key]); // Changing $to to this cell instead
                        break;
                    }
                }
            }
            
            
            if (el.opts.dropClass && $to.hasClass(el.opts.dropClass)) {
                el.transform[0] = ['translate3d(', 0, 'px,', 0, 'px, 0px)'].join('');
                el.style.webkitTransform = el.transform.join(' ');
                el.inst.board.rePosLetter($el, el, $to);
            }
            else {
                anim = true;
                var cx = 0, cy = 0;
            }
            
            $el.show();
        }
        
        // Argh
        if (el.opts.framed) {
            el.translate = $el.wPosition('.container');
            var width = el.framed.width,
                height = el.framed.height,
                parentPos = el.framed.parentPos;
                
            var x = el.translate.x, 
                y = el.translate.y, 
                sx = x + width * (1 - el.scale) / 2, 
                sy = y + height * (1 - el.scale) / 2, 
                ex = sx + width * el.scale, 
                ey = sy + height * el.scale, 
                cx = x, 
                cy = y;
            
            if (sx > parentPos.xs) {
                anim = true;
                cx = -width * (1 - el.scale) / 2;
            }
            else 
                if (ex < parentPos.xe) {
                    anim = true;
                    cx = (parentPos.xe - width * el.scale) - width * (1 - el.scale) / 2; //FIXME
                }
            
            if (sy > parentPos.ys) {
                anim = true;
                cy = -height * (1 - el.scale) / 2;
            }
            else 
                if (ey < parentPos.ye) {
                    anim = true;
                    cy = (parentPos.ye - height * el.scale) - height * (1 - el.scale) / 2; //FIXME
                }
        }
        
        // Animate movement
        if (anim) {
            el.transform[0] = ['translate3d(', cx, 'px,', cy, 'px, 0px)'].join('');
            el.animating = true;
            $el.addClass('anim').one('webkitTransitionEnd', function(e){
                e.stopPropagation();
                el.animating = false;
                $el.removeClass('anim'); 
            })
            setTimeout(function(){
                el.style.webkitTransform = el.transform.join(' ');
            }, 0);
        }
        delete touches[e.changedTouches[0].identifier];
    };
    
    var dragstart = function(e){
        var el = this, $el = el.$;
        //FIXME
        if (!e.changedTouches) {
            e.changedTouches = [{
                pageX: e.pageX,
                pageY: e.pageY
            }];
        }
        e.preventDefault();
        
        $el.addClass('dragging');
        el.animating = false;
        el.style.webkitTransition = "";
        var t = e.changedTouches[0], 
            pos = el.droppable ? {x:0, y:0} : $el.wPosition('.container');
            
        touches[t.identifier] = el;
        el.off = {
            x: t.pageX - pos.x * el.swap,
            y: t.pageY - pos.y * el.swap
        };
        e.stopPropagation();
        return false;
    };
    
    
    $.fn.wDraggable = function(options){
        // Set the options.
        options = $.extend({}, $.fn.wDraggable.defaults, options);
        
        // Go through the matched elements and return the jQuery object.
        return this.each(function(){
            var $el = $(this), 
                el = this;
                
            el.opts = {
                droppable: options.droppable, 
                framed: options.framed, 
                dropClass: options.dropClass
            }
            
            if (el.opts.framed) {
                var parent = $el.closest('.container');
                el.framed = {
                    width: el.offsetWidth, 
                    height: el.offsetHeight, 
                    parent: parent, 
                    parentPos: {
                        xs: 0,
                        xe: parent.width(),
                        ys: 0,
                        ye: parent.height()
                    }
                }
            }
             
            el.transform = el.transform || [];
            el.swap = 1;
            $el.addClass('draggable');
            el.$ = $el;
            
            el.addEventListener(touchstart, dragstart, false);
        });
    };
    
    // Public defaults.
    $.fn.wDraggable.defaults = {
        droppable: true,
        framed: false,
        dropClass: false
    };
    
})(jQuery);