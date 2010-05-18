jQuery.fn.reverse = Array.prototype.reverse;

Array.prototype.unique = function(){
    var a = [], l = this.length;
    for (var i = 0; i < l; i++) {
        for (var j = i + 1; j < l; j++) 
            if (this[i] === this[j]) 
                j = ++i;        
        a.push(this[i]);        
    }    
    return a; 
};

Number.prototype.times = function(func, scope, count){
    if (count) {
		for (var i = 0; i < this; i++) {
			func.call(scope, i);
		}
	} else {
		for (var i = 0; i < this; i++) {
            func.call(scope);
        }
	}
};

Number.prototype.cmp = function(compareTo){
	return this > compareTo ? 1 : this == compareTo ? 0 : -1;
}

Number.prototype.dec = function(decimals){
	var multiplier = Math.pow(10, decimals);
    return Math.round(this * multiplier) / multiplier;
}

jQuery.fn.wPosition = function(sel){
    if (!this[0]) {
        return null;
    }
    
    var $elem = $(this[0]), curleft = curtop = 0, m, transform, go = true, transformRegexp = /(-?[\d.]+)px.*?(-?[\d.]+)px/;
    
    $elem.parents().add($elem).reverse().each(function(){ // yeak :S
        transform = this.style.webkitTransform;
        if (transform) {
            m = transform.match(transformRegexp);
            if (m) {
                curleft += parseInt(m[1], 10);
                curtop += parseInt(m[2], 10);
            }
        }
        if ($(this).is(sel)) {
            return false;
        }
    });
    
    return {
        x: curleft,
        y: curtop
    };
};


if (!Array.prototype.remove) {
    Array.prototype.remove = function(elem, max) {
		var index, i = 0;
		while((index = this.indexOf(elem)) != -1 && (!max || i < max)) {
	        this.splice(index, 1);
			i++;
		}
		return this;
    };
}

Array.prototype.sum = function(){
    for(var i = 0, sum = 0, len = this.length; i < len; sum += this[i++]);
    return sum;
}

Array.prototype.max = function(){
    return Math.max.apply({},this)
}
Array.prototype.min = function(){
    return Math.min.apply({},this)
}



