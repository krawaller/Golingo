// This is the Golingo Low Pro class
Golingo = $.klass({
    
    // Initiate Golingo
    initialize: function(arg){
        this.callbacks = {};
        this.callbackCounter = 0;
        
        this.maxTurnTime = 20;
       
        this.fireFrom = 'web';
        this.fireTo = 'app';
       
        this.initEvents();
    },
    
    // Initiate the timing part with its interval timer
    initTiming: function(){
        this.timer = setInterval($.proxy(this.timing, this), 1000);
        this.startedAt = new Date().getTime();
        this.timing();
    },
    
    // Called upon time tick
    timing: function(){
        var current = new Date().getTime();
        for(var i = 0; i < this.boards.length; i++){
            this.boards[i].tick(current);
        }
    },
    
    // Handle game menu events
    handleMenu: function(e){
        var el = $(e.target);
        switch(el.attr('rel')){
            case 'restart':
            this.restartGame();
            break;
            
            case 'resume':
            el.closest('.menuMainCon').removeClass('show');
            break;
            
            case 'exit':
            this.exitGame();
            break;
            
            case 'new':
            this.newGame();
            break;
        }
        
    },
    
    // Remove animation classes
    animationEnd: function(e){
        var el = $(e.target);
        el.removeClass('go wrong');
    },
    
    // #### Event handling
    
    // Event delegator
    handleEvents: function(e, fakee){
        if(fakee){
            var e = fakee;
        }
        if(this[e.func]){
            if(e.callback){
                var c = e.callback, self = this, from = e.from;
                e.callback = function(data){
                    self.fire({
                        data: data,
                        to: from,
                        callback: c
                    });
                };
            }
            if(!e.data){
                e.data = {};
            }
            //this[e.func].err(this, e); //just tryin
            this[e.func](e);
        } else if(e.callback && this.callbacks[e.callback]){
           this.callbacks[e.callback](e);
           delete this.callbacks[e.callback];
        }
    },
    
    // Event cannon with callback fix
    fire: function(opts){
        if(opts.func && opts.callback){
            var c = ++this.callbackCounter;
            this.callbacks[c] = opts.callback;
            opts.callback = c;
        }
        opts.from = this.fireFrom;
        opts.to = opts.to ||  this.fireTo;
        Ti.App.fireEvent(opts.to, opts);
    },
    
    modes: {
        16: 'normal',
        24: 'medium',
        32: 'large'
    },
    
    // Congrats!
    win: function(winner){

        clearInterval(this.timer);
        this.winner = winner;
        
        for(var i = 0; i < this.boards.length; i++){
            var board = this.boards[i];
            // Prepare result menus
            this.boards[i].prepareEnd(board == winner, this.challenge);
        }

        var totalScore = board.getScore();
        var score = {
            name: winner.player,
            seed: this.seed.toString(),
            timePoints: winner.score.timePoints.dec(1),
            totalScore: totalScore,
            numWords: winner.score.numWords,
            numUnique: winner.score.numUnique,
            avgWordLength: winner.score.avgWordLength.dec(1),
            longestWordLength: winner.score.longestWordLength,
            shortestWordLength: winner.score.shortestWordLength,
            wordPoints: winner.score.wordPoints.dec(1),
            badWords: winner.laidIncorrect,
            goodWords: winner.laidCorrect,
            words: winner.plain,
            maxLetters: this.maxLetters,
            gameMode: this.modes[this.maxLetters]
        }; 

        // Save them highscores
        this.fire({
            to: 'app',
            func: 'saveHighscore',
            data: { score: score }
        });

        // Slightly ugly winner code        
        var self = this;
        setTimeout(function(){
            winner.element.addClass('winner');
            setTimeout(function(){ // FIXME
                winner.element.removeClass('winner');
                for(var i = 0; i < self.boards.length; i++){
                    var board = self.boards[i]; 
                    self.boards[i].end();
                }
            }, 2000);    
        }, 20);    
    },
    
    // Initiate game wide events
    initEvents: function(){
       this.proxiedHandleEvents = $.proxy(this.handleEvents, this);
       Ti.App.addEventListener('web', this.proxiedHandleEvents);
       $(document).bind('webkitAnimationEnd', $.proxy(this.animationEnd, this));
       $('.menuButton').live(touchend, $.proxy(this.handleMenu, this));
    },
    
    // Game data needed to start game received
    gameDataReceived: function(e){

        var data = e.data;
        this.alpha = data.alpha;
        t = this.t = data.t;
        this.initAlphabet();
        this.players = data.players;
        this.maxLetters = data.tiles;
        
        $('body')[0].className = this.players.length > 1 ? 'multi' : 'single';
        
        this.startGame(data.seed, data.challenge);     
    },
    
    // Kick it off
    startGame: function(seed, challenge){
        this.seed = seed;
        this.challenge = challenge;
        
        // Clear as much as possible. Uhm.. is this good practice?
        for(var i = 0, len = Board.instances ? Board.instances.length : 0; i < len; i++){
            delete Board.instances[i];
        }
        Board.instances = [];
        for(var i = 0, len = Letter.instances ? Letter.instances.length : 0; i < len; i++){
            delete Letter.instances[i];
        }
        Letter.instances = [];
        this.element.empty(); // Dirty!
        clearInterval(this.timer);

        // Make all things neeew
        this.boards = [];
        this.letters = [];
        this.purityString = "";
        this.passes = [];
        this.winner = false;
        this.time = 0;

        // Seed the awesome seedrandom
        Math.seedrandom(this.seed);
        
        // Create players
        for(var i = this.players.length - 1; i >= 0; i--){
            var upsideDown = this.players.length == 2 && i == 1;
            this.createBoard(i, this.players[i], upsideDown, challenge);
        }
        
        // Create first vowel
        this.addLetter(null, null, 1);
         
        // Create consonant after that
        this.addLetter(null, null, null, 1);
         
        // And then four random letters 
        (4).times(this.addLetter, this, false);
        
        
        this.fire({
            to: 'app',
            func: 'webviewReady',
            data: {}
        });
        // Initiate timing        
        this.initTiming();
    },
    
    // Restarting game as easy as this
    restartGame: function(){
        this.startGame(this.seed, this.challenge);
    },
    
    // Starting a new game also easy pie
    newGame: function(){
        this.startGame(Math.round(Math._random()*1000000000));
    },
    
    // Exit game window
    exitGame: function(){
        Ti.App.removeEventListener('web', this.proxiedHandleEvents);
        Ti.App.fireEvent('app', {
            func: 'exitGame'
        })
    },
    
    // Check them words, pirate!
    checkWords: function(board, words){
        var wordArr = [], self = this;
        for(var dir in words){
            for(var word in words[dir]){
                wordArr.push(word);
            }
        }
        
        this.fire({
            to: 'app',
            func: 'checkWords',
            data: {
                words: wordArr
            },
            
            // This is a true mess
            callback: function(e){
                // Our word containers
                var cWords = e.data.words,
                    correct = Array.prototype.slice.call(wordArr),
                    incorrect = Array.prototype.slice.call(wordArr);
                
                // Slice and dice    
                for(var i = 0; i < cWords.length; i++){
                    incorrect.remove(cWords[i]);
                }
                for(var i = 0; i < incorrect.length; i++){
                    correct.remove(incorrect[i]);
                }
                
                var correctObjs = [], incorrectObjs = [];
                
                // This messy code loops through all tiles in the checked words
                // and sets them to right/wrong accordingly. It also binds a word
                // object to them so we can keep track of what words are bound
                // to wich tiles.
                for(var dir in words){
                    for(var i = 0; i < incorrect.length; i++){
                        var incorrectWords = words[dir][incorrect[i]];
                        if(incorrectWords){
                            for(var j = 0; j < incorrectWords.length; j++){
                                var incorrectWord = incorrectWords[j];
                                for(var k = 0; k < incorrectWord.length; k++){
                                    incorrectWord[k].element.removeClass(dir + '_on').addClass(dir +'_off');
                                    board.badLetters[dir].push(incorrectWord[k]);
                                    incorrectObjs.push(incorrectWord[k].inWords[dir]);
                                }
                                
                            }
                        }
                    }
                    
                    for(var i = 0; i < correct.length; i++){
                        var correctWords = words[dir][correct[i]];
                        if(correctWords){
                            for(var j = 0; j < correctWords.length; j++){
                                var correctWord = correctWords[j], w = {word:correct[i], first: correctWord[0] };
                                for(var k = 0; k < correctWord.length; k++){
                                    correctWord[k].element.removeClass(dir + '_off').addClass(dir + '_on');
                                    correctWord[k].inWords[dir] = w;
                                    board.badLetters[dir].remove(correctWord[k]);
                                }
                                correctObjs.push(w);                                
                            }
                        }
                    }
                }

                // Tell the board about the words
                board.laid(correctObjs, incorrectObjs, correct, incorrect);
                
                // Did we win? Do we get a new letter?
                if(board.letters.length == board.numRooted && board.badLetters.h.length == 0 && board.badLetters.v.length == 0){
                    if(!self.winner && board.letters.length == self.maxLetters){
                        var highestScore = 0, winner;
                        for(var i = 0; i < self.boards.length; i++){
                            var boardScore = self.boards[i].getScore();
                            if(boardScore > highestScore){
                                highestScore = boardScore;
                                winner = self.boards[i];
                            }
                        }
                        self.win(winner);
                    }
                    self.addLetter();
                }
                // Update the status bar
                board.updateStats(board.numRooted - [].concat(board.badLetters.v).concat(board.badLetters.h).unique().length);
            }
        });
    },
    
    // Add a letter tile to each board. We can force it 
    // to be a certain letter, a vowel or a consonant.
    addLetter: function(boards, letter, forceVowel, forceConsonant){
        var boards = boards || this.boards;
        
        // Has the other board got a tile that I don't
        if(boards.length == 1 && boards[0].letters.length != this.letters.length){
            
            var board = boards[0];
            
            board.createLetter(this.letters[board.letters.length], boards[0].letters.length == 0);
            return;
        }
        
        // Say no more
        if(this.letters.length == this.maxLetters) return;

        var specialLetter = this.letters.length == 0,
            letter = letter || this.getRandomFrequencyLetter(0, specialLetter || forceVowel, forceConsonant);
           
        this.letters.push(letter);
        this.purityString += letter;
        for(var i = 0; i < boards.length; i++){
            boards[i].createLetter(letter, specialLetter);
        }
    },
    
    // Initiate the alphabet object and create distribution array
    initAlphabet: function(){
        var alpha = this.alpha,
            distribution = [],
            alphabet = [],
            i = 0, 
            len,
            vowels = [],
            force = {};
        
        for(var letter in alpha){
            alphabet.push(letter);
            if(alpha[letter].vowel){
                vowels.push(letter);
            }
            len = Math.floor(alpha[letter].freq * 10);
            for(var j = 0; j < len; j++){
                distribution.push(i);
            }
            
            if(alpha[letter].force){
                force[letter] = alpha[letter].force.split("");
            }
            i++;
        }
        this.isVowel = new RegExp("[" + vowels.join("") +"]");
        this.notVowel = new RegExp("[^" + vowels.join("") +"]");
        
        this.alphabet = alphabet;
        this.alphabet.distribution = distribution;
        this.alphabet.force = force;
    },
    
    // Get a *random* letter with constraints. Heavily inspired by John Resig's DeepLeap
    getRandomFrequencyLetter: function(tries, forceVowel, forceConsonant){
        var candidate = this.alphabet[this.alphabet.distribution[Math.floor(Math.random() * this.alphabet.distribution.length)]];
        var purity = this.purityString;
        
        var tries = tries ||  0;        
        if(
            forceVowel ? this.isVowel.test(candidate) : true &&
            forceConsonant ? this.notVowel.test(candidate) : true &&
            ((   
                purity.length < 2 || 
                (
                    (!this.isVowel.test(purity) && this.isVowel.test(candidate)) || 
                    (!this.notVowel.test(purity) && this.notVowel.test(candidate)) ||
                    (this.isVowel.test(purity) && this.notVowel.test(purity))
                )
            ) &&
            (purity.length == 0 || purity[purity.length - 1] !== candidate)) ||  
            tries > 10
        ){
            if ( purity.length > 2 ) {
                this.purityString = purity = purity.slice(1);
            }
            
             // Do we need to use the force (to force a *u* after *q*)?
            if(purity.length){
                last = purity[purity.length - 1];
                var forceTo;
                if((forceTo = this.alphabet.force[last])){
                    candidate = forceTo[Math.floor(Math.random() * forceTo.length)];
                }
            }
            
            // The candidate passed - return it
            return candidate;
        } else {
            
            // Nah... try again
            return this.getRandomFrequencyLetter(++tries, forceVowel, forceConsonant);
        }
    },
    
    // Create the low pro-y board
    createBoard: function(bid, player, upsideDown, challenge){
        var color = bid == 0 ? '#FF5E50' : '#8695FF';
            board = $('<div/>').attr('id', 'board' + bid).appendTo(this.element).attachAndReturn(Board, this, bid, player, upsideDown, color, challenge)[0];
        this.boards.push(board);
    }
});