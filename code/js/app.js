var Game = (function(){
	var defaultOpts = {
		
	};
	function Game(opts){
		this.init(_.extend({}, defaultOpts, opts));
	};
	Game.prototype = {
		init: function(opts){
			this.boards = opts.players.map(function(player){
				return new Board(player);
			});
		}
	};
	return Game;
})();

new Game({
	players: ['martin']
});
