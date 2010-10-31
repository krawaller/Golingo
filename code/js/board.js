var Board = (function(){
	var defaultOpts = {
		
	};
	function Board(opts){
		this.init(_.extend({}, defaultOpts, opts));
	};
	Board.prototype = {
		generateMarkup: _.template($('#board-template').html()),
		init: function (opts){
			this.el = this.generateMarkup(opts);
		}
	};
	return Board;
})();