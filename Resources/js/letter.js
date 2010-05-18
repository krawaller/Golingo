// This is the Letter Low Pro class
Letter = $.klass({
    
    // Initialize a letter instance
    initialize: function(board, letter, specialLetter){
		this.board = board;
		this.el = this.element[0];
		this.el.inst = this;
		this.lid = board.letters.length;
        this.letter = letter;
		this.createDom();
		this.element.wDraggable({
			dropClass: 'droptarget' + this.board.bid
		});
		this.letterElement = $('div', this.element);
		this.initOrientation();
		if(specialLetter){
			this.element.addClass('special rooted');
		}
		this.inWords = {
			h: null,
			v: null
		};
    },
	
    // You're wrong!
	wrong: function(){
		this.letterElement.addClass('wrong');
	},
	
    // Fetch neighbouring key
	neighbourKey: (function(){
            var dirOffsets = {
                top: {x: 0, y: -1},
                right: {x: 1, y: 0},
                bottom: {x: 0, y: 1},
                left: {x: -1, y: 0}
            };
		return function(dir){
		    return (this.x + dirOffsets[dir].x) + '-' + (this.y + dirOffsets[dir].y);
		}
	})(),
	
    // Initiate orientation since this reverses dragging
	initOrientation: function(){
		this.element.get(0).swap = this.board.swap;
	},
	
    // Create the DOM nodes needed
	createDom: function(letter){
		var el = this.el;
		el.id = 'board' + this.board.bid + '_letter' + this.lid;
		el.className = 'letter';
		el.innerHTML = '<div>' + this.letter + '</div>';
    }

});