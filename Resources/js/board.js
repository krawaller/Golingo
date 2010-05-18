// This is the Board Low Pro class
Board = $.klass({
	boardRows: 17,
	boardCols: 17,
	//letterboxRows: 2,
    letterboxCols: 8,
    cellSize: 40, //FIXME: should be generated?
    
    // Inititate board instance
    initialize: function(game, bid, player, upsideDown, color, challenge){
        this.game = game;
        this.bid = bid;
        this.player = player;
        this.upsideDown = upsideDown;
        this.maxLetters = this.game.maxLetters;
        this.letterboxRows = Math.ceil(this.maxLetters / this.letterboxCols);
        this.color = color;
        this.challenge = challenge;
        
        // He make all things neeew
        this.letters = [];
        this.boardLetters = [];
        this.boardState = {};
        this.boardCells = {};
        this.letterboxCells = [];
        
        this.words = [];
        this.laidCorrect = [];
        this.laidIncorrect = [];
        this.score = {};
        
        this.badLetters = {
            h: [],
            v: []
        }
        this.score = {
            numUnique: 0,
            avgWordLength: 0,
            longestWordLength: 0,
            shortestWordLength: 0,
            wordPoints: 0,
            totalScore: 0,
        };
        
        this.penalty = 0;
        
        this.swap = 1;
        this.element.addClass('board').addClass('container');
        
        this.boardWidth = this.boardCols * this.cellSize;
        this.boardHeight = this.boardRows * this.cellSize;
        
        this.width = this.element.width();
        this.height = this.element.height();
        
        // Create markup
        this.createBoard();
        
        // Make it alive
        this.mainBoard = this.element.find('.mainboard')
            .css('webkitTransform', 'translate3d(' + (-(this.boardWidth - this.width) / 2) + 'px, ' + (-(this.boardHeight - this.height) / 2) + 'px, 0px)')
            .wDraggable({
                framed: true,
                droppable: false
            });
        this.mainBoard[0].scale = 1;
            
        this.circle = this.element.find('.circle');
        this.circleCtx = this.circle[0].getContext("2d");
            
        this.menu = this.element.find('.menuMainCon');
            
        this.letterbox = this.element.find('.letterboxWrapper');
        this.letterbox.etds = $('td:gt(' + (this.letterboxCols - 3) + ')', this.letterbox);
        this.letterbox.rows = [];
        var self = this;
        $('tr', this.letterbox).each(function(){
             self.letterbox.rows.push($(this).find('td'));
        });
          
        this.resultsWrapper = this.element.find('.resultsMainCon');  
        this.results = this.element.find('.results');
        
        this.initOrientation();
        this.initEvents();
        this.initStats();
        
        this.updateScore();
    },
    
    // Initiate events - lean and mean, no?
    initEvents: function(){
        $('.mainboard', this.element[0]).live('leave drop', $.proxy(this.letterMove, this));
        $('.letterbox', this.element[0]).live('leave drop', $.proxy(this.letterMove, this));
        //$('td', this.letterbox[0]).live('drop leave letterCreate', $.proxy(this.positionLetterbox, this));
        this.circle.bind(touchstart, $.proxy(this.pass, this));      
    },
    
    // Initiate everything in the statmenu
    initStats: function(){
        var el = this.element.find('.stats');
        this.stats = {
            letters: 0,
            together: 0,
            el: el,
            barContainer: el.find('.barContainer'),
            letterBar: el.find('.letterBar'),
            togetherBar: el.find('.togetherBar'),
            golingo: el.find('.golingo'),
            time: el.find('.time'),
            
            myScoreNode: el.find('.myScore').contents()[0],
            
            scoreToBeatContainer: el.find('.scoreToBeat'),
            scoreToBeatTotalContainer: el.find('.scoreToBeatTotal'),
            scoreToBeatAmountContainer: el.find('.scoreToBeatAmount'),
            scoreToBeatHeight: 13,
            width: 140
        };
        
        this.stats.el.find('.showMenuButton').bind(touchend, $.proxy(this.showMenu, this));
    },
    
    // I can't take it anymore
    pass: function(){
        if(this.letters.length == this.game.maxLetters) return;
        var current = new Date().getTime();
        this.penalty += this.game.maxTurnTime - (current - this.turnStart) / 1000;
        this.tick(current);
        this.game.addLetter([this]);
    },

    // Time flies by
    tick: function(current){
        var amount = (current - this.turnStart) / (1000 * this.game.maxTurnTime);
        if(amount >= 0.975){
            this.game.addLetter([this]);
        }

        var c = this.circleCtx;
            
        c.clearRect(0, 0, 20, 20);
        c.fillStyle = "rgb(210,200,180)";
        c.beginPath();
        c.arc(10, 10, 9, 0, Math.PI * 2, true);
        c.closePath();
        c.fill();
        
        c.strokeWidth = 0;
        c.fillStyle = this.color;
        c.beginPath();
        c.moveTo(10, 10);
        c.arc(10, 10, 9, -0.5 * Math.PI, (amount * (Math.PI * 2)) - (0.5 * Math.PI), false);
        c.moveTo(10, 10);
        c.closePath();
        c.fill();
        
        // Update score
        this.updateScore(current);
    },

    // Moving a letter tile - keep track of board state
    letterMove: function(e, el, from){
        
        var parent = el.parentNode,
            x = parent.x,
            y = parent.y,
            key = x+'-'+y;

        switch(e.target.type){
            case 'board':
            if(e.type == 'drop'){
                this.boardState[key] = el.inst;
                el.inst.x = x;
                el.inst.y = y;
                el.inst.key = key;
                this.boardLetters.push(el.inst);
            } else if (e.type == 'leave'){
                this.boardLetters.remove(el.inst);
                delete this.boardState[key];
            }
            break;
            
            case 'letterbox':
            
            if(e.type == 'drop'){
                this.letterboxCells[y][x].hasLetter = 1;
            } else if (e.type == 'leave'){
                this.letterboxCells[y][x].hasLetter = 0;
            }
            this.positionLetterbox();
            break;
        }

        return true;
    },

    // A letter was repositioned
    rePosLetter: (function(){
        var dirs = ['top', 'right', 'bottom', 'left'], dirslen = dirs.length, 
        checkDirs = {
            top: [['top', 'bottom']],
            right: [['left', 'right']],
            bottom: [['top', 'bottom']],
            left: [['left', 'right']],
            all: [['left', 'right'], ['top', 'bottom']]
        }
        return function($el, el, $to){
            
            var candidate,
                inst = el.inst, 
                h = [],
                v = [];
            
            // unrolled
            (candidate = this.boardState[inst.neighbourKey('top')]) ? v.push(candidate) : null;
            (candidate = this.boardState[inst.neighbourKey('right')]) ? h.push(candidate) : null;
            (candidate = this.boardState[inst.neighbourKey('bottom')]) ? v.push(candidate) : null;
            (candidate = this.boardState[inst.neighbourKey('left')]) ? h.push(candidate) : null;     
            
            // Trigger events
            $el.parent().trigger('leave', [el]);
            $el.appendTo($to);
            $to.trigger('drop', [el]);
            
            // Only if from AND to! //FIXME
            /*if($to && $to[0].type == 'letterbox'){
                return;
            }*/
            
            // unrolled
            (candidate = this.boardState[inst.neighbourKey('top')]) ? v.push(candidate) : null;
            (candidate = this.boardState[inst.neighbourKey('right')]) ? h.push(candidate) : null;
            (candidate = this.boardState[inst.neighbourKey('bottom')]) ? v.push(candidate) : null;
            (candidate = this.boardState[inst.neighbourKey('left')]) ? h.push(candidate) : null; 
            
            
            
            
            // Get tile states
            var rootedLetters = this.getRootedLetters(this.boardLetters);
            for(var i = 0, len = rootedLetters.free.length; i < len; i++){
                rootedLetters.free[i].element.removeClass('rooted');
                rootedLetters.free[i].rooted = false;
            }
            for(var i = 0, len = rootedLetters.rooted.length; i < len; i++){
                rootedLetters.rooted[i].element.addClass('rooted');
                rootedLetters.rooted[i].rooted = true;
            }
            this.numRooted = rootedLetters.rooted.length;
            
            var dirs = { h: h, v: v };

            // Get words from affected tiles
            var words = this.getWords(dirs);
            var oneLetters = words.oneLetters;
            
            inst.element.removeClass(['h_off', 'v_off'].join(" "));
            this.badLetters.h.remove(inst);
            this.badLetters.v.remove(inst);
            
            for(var dir in oneLetters){
                for(var i = 0; i < oneLetters[dir].length; i++){
                    oneLetters[dir][i].element.removeClass(dir + '_off ' + dir + '_on'); // Sanitize
                    this.badLetters[dir].remove(oneLetters[dir][i]);
                }
            }

            // Clean up words we break; This isn't pretty, but probably works
            for(var dir in dirs){
                for(var i = 0; i < dirs[dir].length; i++){
                    this.words.remove(dirs[dir][i].inWords[dir], 1);
                    dirs[dir][i].inWords[dir] = null;
                }
            }

            // Check them words!
            this.game.checkWords(this, words.words);
        }
    })(),
    
    // Show menu
    showMenu: function(){
        this.menu.addClass('show');
        var self = this;
        setTimeout(function(){
            self.menu.addClass('doFade');
        }, 0);
    },
    
    // Update the stat bars
    updateStats: function(lettersTogether){
        if(this.stats.together != lettersTogether){
            this.stats.together = lettersTogether;
            this.stats.togetherBar.css('width', Math.floor(this.stats.together/this.maxLetters * this.stats.width));
        }
        if(this.stats.letters != this.letters.length){
            this.stats.letters = this.letters.length;
            this.stats.letterBar.css('width', Math.floor(this.stats.letters/this.maxLetters * this.stats.width - 2));
        }
    },
    
    // Go go go
    go: function(newWords){
        this.stats.time.addClass('go');
    },
    
    // What words were laid and what are their status?
    laid: function(newWords, badWords, correct, incorrect){
        for(var i = 0; i < badWords.length; i++){
            if(badWords[i]){
                this.words.remove(badWords[i]);
            }
        }
        this.words = this.words.concat(newWords);
        this.laidCorrect = this.laidCorrect.concat(correct);
        this.laidIncorrect = this.laidIncorrect.concat(incorrect);
        
        this.updateScore();
    },
    
    // Update the score counter
    updateScore: function(current){
        this.stats.myScoreNode.textContent = Math.round(this.getScore(current)) ||  0;
        
        // How is the challenge going?
        if(this.challenge && this.score.totalScore){
            var diff = this.challenge.totalScore - this.score.totalScore;
           
            var part = diff / this.challenge.totalScore;
            var val = (part < 0 ? 1 : part) * this.stats.scoreToBeatHeight + 5;
            this.stats.scoreToBeatAmountContainer.css('height', val);
            
            if(diff < 0){
                this.stats.scoreToBeatContainer.addClass('beaten');
            } else {
                this.stats.scoreToBeatContainer.removeClass('beaten');
            }
        }
    },
    
    // Calculate the score
    getScore: function(current){
        
        // If it's just time ticking, no need to recalculate this    
        if (!current) {
            this.score.numWords = this.words.length, plain = [];
            for (var i = 0; i < this.words.length; i++) {
                if (this.words[i].first.rooted) {
                    plain.push(this.words[i].word);
                }
            }
            this.plain = Array.prototype.slice.call(plain);
            this.score.numUnique = plain.unique().length;
            
            var lengthMap = plain.map(function(item){
                return item.length;
            });
            this.score.avgWordLength = (lengthMap.sum() / this.score.numWords) || 0;
            this.score.longestWordLength = lengthMap.length ? lengthMap.max() : 0;
            this.score.shortestWordLength = lengthMap.length ? lengthMap.min() : 0;
            this.score.wordPoints = this.score.numUnique;
        };
        var current = current || new Date().getTime();
        var total = (((current - this.game.startedAt) / 1000 ||  0) + this.penalty);
        this.score.timePoints = (8 / (0.02 * total + 1));
        return this.score.totalScore = (this.score.timePoints * this.score.wordPoints * (this.score.longestWordLength * this.score.shortestWordLength) * this.score.avgWordLength).dec(0);
    },

    // Create result score table
    createScoreTable: function(myScore, otherScore){
        var parts = ['timePoints', 'wordPoints', 'shortestWordLength', 'longestWordLength', 'avgWordLength'];
        var statusClasses = {'-1': 'lost', '0': 'even', '1': 'won'}; 
        var labels = [];
        var vals = [];
        for(var i = 0; i < parts.length; i++){
            var v = myScore[parts[i]].dec(1);
            labels.push('<td><span>' + t[parts[i]] + '<div class="tooltip">' + t[parts[i] + 'Exp'] + '</div></span></td>');
            vals.push('<td class="' + (otherScore ? statusClasses[myScore[parts[i]].cmp(otherScore[parts[i]])] : '') + '"><span>' + v + '<div class="tooltip">' + t[parts[i] + 'Exp'] + '</div></span></td>');
        }
        
        var template = [
          '<h2>', myScore.name || t['you'], ' ', t['got'], ' ', myScore.totalScore.dec(1), ' ', t['points'], '</h2>',
          '<table class="score">',
              '<thead>',
                  '<tr>', labels.join("<td>*</td>"), '<td>=</td>', '<td><span>' + t['totalScore'] + '<div class="tooltip">' + t['totalScoreExp'] + '</div></span></td>', '</tr>',
              '</thead>',
              '<tbody>',
                  '<tr>', vals.join("<td>*</td>"), '<td>=</td>', '<td><span>' + myScore.totalScore.dec(1) + '<div class="tooltip">' + t['totalScoreExp'] + '</div></span></td>', '</tr>',
              '</tbody>',
          '</table>',
        ];
        
        return template.join("");
    },
    
    // Prepare result menus
    prepareEnd: function(won, challenge){
        var beatChallenge = challenge ? this.score.totalScore.cmp(challenge.totalScore) == 1 : true;
        var status = won && (challenge ? beatChallenge : true) ? 'winner' : 'loser';
        this.results.removeClass('winner loser').addClass(status);

        var template = ['<h1>', this.player, ' ', t[status], '</h1>', this.createScoreTable(this.score, challenge), (challenge ? this.createScoreTable(challenge, this.score) : ''), '<ul class="resultsMenu">', '<li class="menuButton" rel="new">' + t['newGame'] + '</li>', '<li class="menuButton" rel="restart">', t['tryAgain'], '</li>', '<li class="menuButton" rel="exit">' + t['exitGame'] + '</li>', '</ul>'];
        this.results.html(template.join(''));
    },
    
    // Show results
    end: function(){
        this.resultsWrapper.addClass('show');
    },

    // Get all tiles rooted to the base tile
    getRootedLetters: (function(){
        var dirs = ['top', 'right', 'bottom', 'left'], 
            dirslen = dirs.length,
            boardState,
            checkedCache,
            letters,
            num;
            
        function getNeighbours(letterInstance, together){
            
            var together = together || [], 
                key, 
                neighbourInstance;
                
            checkedCache[letterInstance.key] = true;
            letters.remove(letterInstance);
            
            together.push(letterInstance);
 
            for(var i = 0; i < dirslen; i++){
                key = letterInstance.neighbourKey(dirs[i]);
                if (!checkedCache[key]) {
                    neighbourInstance = boardState[key];
                    if (neighbourInstance) {
                        getNeighbours(neighbourInstance, together);
                    }
                }
            }
            return together;
        }
        
        return function(lettersIn){
            boardState = this.boardState;
            checkedCache = {};
            letters = Array.prototype.slice.call(lettersIn || this.letters);
            var rooted = [];
            getNeighbours(this.letters[0], rooted);
            return {
                rooted: rooted,
                free: letters
            };
        };
    })(),
    
    // Get words from inputted tiles
    getWords: (function(){
        var letters,
            words,
            whereTo = {
                top: 'unshift',
                right: 'push',
                bottom: 'push',
                left: 'unshift'
            },
            boardState,
            checkedCache,
            num;
        
        function getWordInDir(dirs, letterInstance, word){
            var word = word || [letterInstance],
                key, neighbourInstance;
                
            checkedCache[letterInstance.key] = true;
            letters.remove(letterInstance);
            for(var i = 0, dirslen = dirs.length; i < dirslen; i++){
                key = letterInstance.neighbourKey(dirs[i]);
                if (!checkedCache[key]) {
                    neighbourInstance = boardState[key];
                    if (neighbourInstance) {
                        word[whereTo[dirs[i]]](neighbourInstance);
                        getWordInDir([dirs[i]], neighbourInstance, word);
                    }
                }
            }
            return word;
        }
        
        var dirs = {h: ['left', 'right'], v: ['top', 'bottom']};
        return function(lettersInDirs){
            words = {};
            oneLetters = {};
            boardState = this.boardState;
            var s;
            for(dir in lettersInDirs){
                var dirWords = {};
                checkedCache = {};
                letters = Array.prototype.slice.call(lettersInDirs[dir] || this.letters);
                while(letters.length){
                    var word = getWordInDir(dirs[dir], letters[0]);
                    s = "";
                    if(word.length > 1){
                        for(var i = 0; i < word.length; i++){
                            s += word[i].letter;
                        }
                        dirWords[s] = words[s] ||  [];
                        dirWords[s].push(word);
                    } else {
                        oneLetters[dir] = oneLetters[dir] || [];
                        oneLetters[dir].push(word[0]);
                    }
                }
                words[dir] = dirWords;
            }
            return { words: words, oneLetters: oneLetters };
        };
    })(),
    
    // Is the world upside down?
    initOrientation: function(){
        if(this.upsideDown){
            this.mainBoard.get(0).swap = this.swap = -1;
            this.element.css('webkitTransform', 'rotate(180deg)');
        }
    },
    
    // Create a letter tile, maybe it's the base tile?
    createLetter: function(letter, specialLetter){
        this.go();
        var l = $('<div/>').attachAndReturn(Letter, this, letter, specialLetter)[0];
        this.letters.push(l);
        this.appendLetter(l, specialLetter);
        this.updateStats();
        this.turnStart = new Date().getTime();
    },
    
    // Append letter tile to the game board and bind helpers to it.
    appendLetter: function(letterInstance, specialLetter){
        var $el = letterInstance.element;
        if(specialLetter){
            var x = (Math.floor(this.boardCols / 2)),
                y = (Math.floor(this.boardRows / 2));
                
            var boardCenter = $('#board' + this.bid + '_x' + x + 'y' + y);
            letterInstance.x = x;
            letterInstance.y = y;

            boardCenter.append($el).trigger('drop', [$el[0]]);
        } else {
            var letterboxCells = this.letterboxCells;
            y:for(var y = 0; y < this.letterboxRows; y++){
                x:for(var x = 0; x < this.letterboxCols; x++){
                    if(!letterboxCells[y][x].hasLetter){
                        break y;
                        break x;
                    }
                }
            }
            $(letterboxCells[y][x]).append($el).trigger('drop', [$el[0]]);
        }
        
        $el
            .css('webkitTransform', 'translate3d(400px, 0px, 0px)')
            .addClass('anim')
            .one('webkitTransitionEnd', function(e){
                e.stopPropagation();
                $el.removeClass('anim');
            });
            
        setTimeout(function(){
            $el.css('webkitTransform', 'translate3d(0px, 0px, 0px)');
        }, 0)
    },
    
    // Position the letter box as far away as possible
    positionLetterbox: function(){
        var maxX = 0, maxY = 0, tailX = this.letterboxCols - 3, extraRow = 0;
        for(var y = this.letterboxRows - 1; y >= 0; y--){
            for(var x = 0, len = this.letterboxCols; x < len; x++){
                if(this.letterboxCells[y][x].hasLetter){
                    maxY = y > maxY ? y : maxY;
                    if(x > tailX && y == maxY){
                        maxY++;
                    }
                    maxX = x > maxX ? x : maxX;
                }
            }
        }
        
        /*
        console.log(e);
        var rows = this.letterbox.rows;
        var indexes = [];
        for(var y = 0; y < rows.length; y++){
            var row = rows[y],
                children = row.children();
            if(children.length){
                var last = children.filter(':last'),
                    parent = last.parent();
                    indexes.push(row.index(parent));
            }
        }
        var maxIndex = Math.max.apply(null, indexes);
        */
        var yTranslate = Math.max(0, this.letterboxRows - maxY - 1) * this.cellSize,
            xTranslate = Math.max(0, this.letterboxCols - maxX - 2) * this.cellSize;
        this.letterbox.css('webkitTransform', 'translate3d('+ xTranslate +'px, ' + yTranslate + 'px, 0px)');
        
    },
    
    // Create board markup
    createBoard: function(){ // Could be prettier
        var el = this.element[0],
            bid = this.bid;

        // create board
        var board = ['<table class="mainboard"><tbody>'],
            boardRows = this.boardRows, 
            boardCols = this.boardCols;
            
        for (var y = 0; y < boardRows; y++) {
            board.push('<tr>');
            for (var x = 0; x < boardCols; x++) {
                board.push('<td id="board' + bid + '_x' + x + 'y' + y + '" class="droptarget' + bid + ' container"></td>');
            }
            board.push('</tr>');
        }
        board.push('</tbody></table>');
        
        // Create letterbox
        var letterbox = ['<div class="letterboxWrapper slide"><table class="letterbox"><tbody>'], 
            letterboxRows = this.letterboxRows, 
            letterboxCols = this.letterboxCols;
            
        for (var y = 0; y < letterboxRows; y++) {
            letterbox.push('<tr>');
            for (var x = 0; x < letterboxCols; x++) {
                letterbox.push('<td id="letterbox' + bid + '_x' + x + 'y' + y + '" class="droptarget' + bid + ' container"></td>');
            }
            letterbox.push('</tr>');
        }
        letterbox.push('</tbody></table></div>');
        
        el.innerHTML = [
            '<div id="stats', bid, '" class="stats">',
                '<ul>',
                '<li class="name"><div class="golingo">',this.player,'</div></li>',
                '<li class="time"><canvas height="20" width="20" id="circle', bid, '" class="circle"></canvas></li>',
                '<li class="center">',
                    '<div id="menu', bid, '" class="menuMainCon slide">',
                        '<div class="showMenuButtonWrapper"><div class="showMenuButton">m</div></div>',
                        '<div class="menuSubCon"><div class="menu"><ul>',
                            '<li class="menuButton" rel="resume">'+t['resume']+'</li>',
                            '<li class="menuButton" rel="restart">'+t['restart']+'</li>',
                            '<li class="menuButton" rel="new">'+t['newGame']+'</li>',
                            '<li class="menuButton" rel="exit">'+t['exitGame']+'</li>',
                        '</ul></div></div>',
                        
                    '</div>',
                    
                    '<div class="barContainer bar">',
                        '<div class="barWrapper"><div class="letterBar bar"></div></div>',
                        '<div class="barWrapper"><div class="togetherBar bar"></div></div>',
                    '</div>',
                '</li>',
                '<li class="right scoreToBeat"><div class="scoreToBeatTotal">', (this.challenge ? this.challenge.totalScore.dec(0) : '') ,'</div><div class="scoreToBeatAmount">', (this.challenge ? this.challenge.totalScore.dec(0) : ''),'</div></li>',
                '<li class="right myScore">0</li>',
                '</ul>',
            '</div>',
            board.join(""),
            letterbox.join(""),
            '<div id="result', bid, '" class="resultsMainCon slide"><div class="resultsSubCon"><div class="results"></div></div></div>'
        ].join("");
        
        var tds = el.querySelectorAll('.mainboard td'), td, boardCells = this.boardCells;
        for (var y = 0; y < boardRows; y++) {
            for (var x = 0; x < boardCols; x++) {
                td = tds[y*boardCols+x];
                td.x = x;
                td.y = y;
                td.type = 'board';
                boardCells[x+'-'+y] = td;
            }
        }
        
               
        var tds = el.querySelectorAll('.letterbox td'), td, letterboxCells = this.letterboxCells;
        for (var y = 0; y < this.letterboxRows; y++) {
            var row = [];
            for (var x = 0; x < this.letterboxCols; x++) {
                td = tds[y*this.letterboxCols+x];
                row.push(td);
                td.x = x;
                td.y = y;
                td.type = 'letterbox';
            }
            letterboxCells.push(row);
        }
       
    }
});