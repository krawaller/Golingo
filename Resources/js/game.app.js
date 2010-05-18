// The *server-side* game logic.
// This singleton is the bridge between the webview 
// and the native part of the app. It contains all
// nativ-ey functions and makes them callable through
// an event API.
//
// We add an event listener to the app event, and if
// the incoming event object contains a `func` property which
// is also a function in this singleton, it is called.
//
// If the event object contains a callback id from the webview,
// we'll swap it for a callable function on our side.


var game = {
    name: 'app',
    
    // Lets initiate the game window, bind events and open local database.
    init: function(){
        this.gamesStarted = 0;
        Ti.App.addEventListener('app', _.bind(this.handleEvents, this));
        
        this.callbacks = {};
        this.callbackCounter = 0;
        this.opts = {};
        
        this.win = Titanium.UI.createWindow({
            backgroundColor: '#000',
            width: 320,
            height: 480,
            tabBarHidden: true
        });
        
        this.webview = Titanium.UI.createWebView({
            top: 0,
            left: 0,
            width: 320,
            height: 480,
            backgroundColor: '#000'
        });
        this.webview.url = 'index.html';
        this.win.add(this.webview);
        
        this.loadingImageView = Titanium.UI.createImageView({
            backgroundColor: '#000',
            top: 0,
            left: 0,
            url: 'Default.png',
            width: 320,
            height: 480,
            zIndex: 10
        });
        this.win.add(this.loadingImageView);
        
        this.webview.addEventListener('load', _.bind(this.gameLoaded, this));
        this.localdb = Titanium.Database.install('db/local.sqlite', 'local');
    },
    
    // #### Event handling
    
    // Event delegator
    handleEvents: function(e){
        // Are we calling a func?
        if (this[e.func]) {
            if (e.callback) {
                var c = e.callback, self = this, from = e.from;
                e.callback = function(data){
                    self.fire({
                        data: data,
                        to: from,
                        callback: c
                    });
                };
            }
            if (!e.data) {
                e.data = {};
            }
            this[e.func](e);
        }
        // Was it a callback?
        else 
            if (e.callback && this.callbacks[e.callback]) {
                this.callbacks[e.callback](e);
                delete this.callbacks[e.callback];
            }
    },
    // Event cannon with callback fix.
    fire: function(opts){
        if (opts.func && opts.callback) {
            var c = ++this.callbackCounter;
            this.callbacks[c] = opts.callback;
            opts.callback = c;
        }
        opts.from = this.name;
        Ti.App.fireEvent(opts.to, opts);
    },
    
    // #### Game commands
    
    // This is where we open the game window.
    // First we check if the user has seen the
    // guide. If not, we give them the alternative
    // before proceeding.
    initGameStart: function(e){
        if (!Ti.App.Properties.getBool('seenGuide')) {
            this.proposeGuidance(e);
            return;
        }
        
        this.langdb = app.langdb;
        this.opts = e.data;
        this.players = e.data.players;
        this.challenge = e.data.challenge;
        
        this.win.open({
            fullscreen: true,
            transition: Ti.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
        });    
        Ti.App.fireEvent('showLoader');
        
        if (this.loaded) {
            this.gameLoaded(); //Quick load
        }
    },
    
    // Show guide or proceed to game?
    proposeGuidance: function(gameEvent){
        var self = this;
        var a = Titanium.UI.createAlertDialog({
            title: t['guidance'],
            message: t['doYouWantGuidance'],
            buttonNames: [t['showIt'], t['letMePlay']],
            cancel: 1
        });
        a.show();
        
        a.addEventListener('click', function(e){
            switch (e.index) {
                case 1:
                    Ti.App.Properties.setBool('seenGuide', true);
                    self.initGameStart(gameEvent);
                    break;
                    
                case 0:
                    var win = Titanium.UI.createWindow({
                        url: 'views/help.js',
                        tabBarHidden: true,
                        title: t['help'],
                        backgroundImage: 'pics/wood.jpg',
                        barColor: '#222'
                    });
                    app.mainTab.open(win, {
                        animation: true
                    });
                    break;
            }
        });      
    },
    
    // When webview is done loading, show it and Go!
    gameLoaded: function(){
        this.fire({
            to: 'web',
            func: 'gameDataReceived',
            data: this.getGameData()
        });
        this.win.animate({
            view: this.webview,
            transition: Ti.UI.iPhone.AnimationStyle.CURL_UP
        });
        
        Ti.App.fireEvent('hideLoader');
        this.loaded = true;
        
        Ti.App.fireEvent('startingGame');
    },
    
    // Gather all data necessary to start a game
    getGameData: function(){
        var res = {}, rows = this.langdb.execute("SELECT letter, frequency, vowel, force FROM alpha");
        while (rows.isValidRow()) {
            res[rows.field(0)] = {
                freq: rows.field(1),
                vowel: rows.field(2),
                force: rows.field(3)
            };
            rows.next();
        }
        rows.close();
        
        return {
            alpha: res,
            t: t,
            players: this.players,
            seed: this.opts.seed,
            challenge: this.challenge
        };
    },
   
    // Exit game by closing game window
    exitGame: function(){
        this.win.close({
            transition: Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT
        });
    },
    
    // Get a random game number
    getSeed: function(){
        return Math.round(Math.random() * 1000000000);
    },
    
    // Fetch valid words
    checkWords: function(e){
        var words = e.data.words.map(function(el){
            return "'" + el + "'";
        });
        var rows = this.langdb.execute("SELECT word FROM words WHERE word IN (" + words.join(', ') + ")");
        
        var res = [];
        while (rows.isValidRow()) {
            res.push(rows.field(0));
            rows.next();
        }
        rows.close();
        e.callback({
            words: res
        });
    },
    
    // #### Handle global scores
    
    // Get global highscores by language
    getGlobalHighscores: function(e){
        _.ajax({
            url: "http://79.99.1.153:5984/golingo/_design/v1/_view/by-lang?startkey=[%22" + app.lang + "%22,99999]&endkey=[%22" + app.lang + "%22,0]&limit=40&descending=true",
            success: function(data, rows){
                var res = [];
                for (var i = 0; i < rows.length; i++) {
                    var vals = rows[i].value;
                    vals.at = new Date(vals.at * 1000).format();
                    res.push(vals);
                }
                e.callback({
                    rows: res
                });
            },
            errorMessage: {
                title: t['connectionProblem'],
                message: t['couldNotFetchGlobalHighscores']
            },
            tryAgain: true
        });
    },
    
    // Save global highscore
    saveGlobalHighscore: function(gameData, callback){
        _.ajax({
            url: "http://79.99.1.153:5984/golingo/_design/v1/_view/by-seed?key=[%22" + app.lang + "%22,%22" + gameData.seed + "%22]",
            success: function(data, rows){
                var url = "http://79.99.1.153:5984/golingo/", type = "POST", id = "";
                if(rows.length){
                    var rec = rows[0];
                    if(gameData.totalScore < rec.value.totalScore) return; // Not a highscore - not saving
                    
                    id = rec.id;
                    gameData._rev = rec.value._rev;
                    type = "PUT";
                }
                _.ajax({
                    url: url + id,
                    data: JSON.stringify(gameData),
                    type: type,
                    tryAgain: true,
                    success: callback
                });
                
            },
            tryAgain: true
        });
    },
    
    // Get global highscore by seed
    getSeedHighscore: function(e){
        _.ajax({
            url: "http://79.99.1.153:5984/golingo/_design/v1/_view/by-seed?startkey=[%22" + app.lang + "%22,%22" + e.data.seed + "%22,9999]&endkey=[%22" + app.lang + "%22,%22" + e.data.seed + "%22,0]&limit=40&descending=true",
            success: function(data, rows){
                var res = [];
                for (var i = 0; i < rows.length; i++) {
                    var vals = rows[i].value;
                    vals.at = new Date(vals.at * 1000).format();
                    res.push(vals);
                }
                e.callback({
                    rows: res
                });
            }
        });
    },
    
    getGlobalScorePosition: function(e){
        _.ajax({
            url: "http://79.99.1.153:5984/golingo/_design/v1/_view/pos?startkey=[%22" + app.lang + "%22," + e.data.score + "]&endkey=[%22" + app.lang + "%22,999999]",
            success: function(data, rows){
                var pos = rows.length ? rows[0].value : 1;
                e.callback({
                    pos: pos
                });
            }
        });
    },
    
    // #### Handle local scores
    
    // Get local highscore by language
    getLocalHighscores: function(e){
        
        
        var rows = this.localdb.execute("SELECT name, timePoints, at, seed, lang, totalScore, numWords, numUnique, avgWordLength, longestWordLength, shortestWordLength, wordPoints FROM highscores WHERE lang = '" + app.lang + "' GROUP BY seed ORDER BY totalScore DESC LIMIT " + (e.data.fromRow || 0) + ", 40");
        var res = [];
        while (rows.isValidRow()) {
            res.push({
                name: rows.field(0),
                timePoints: rows.field(1),
                at: new Date(rows.field(2) * 1000).format(),
                seed: rows.field(3),
                lang: rows.field(4),
                totalScore: rows.field(5),
                numWords: rows.field(6),
                numUnique: rows.field(7),
                avgWordLength: rows.field(8),
                longestWordLength: rows.field(9),
                shortestWordLength: rows.field(10),
                wordPoints: rows.field(11)
            });
            rows.next();
        }
        
        rows.close();
        e.callback({
            rows: res
        });
    },
    
    // Save local highscore
    saveLocalHighscore: function(data, callback){
        var row = this.localdb.execute("SELECT totalScore FROM highscores WHERE lang = '" + app.lang + "' AND seed = '"+ data.seed +"' ORDER BY totalScore DESC LIMIT 1"),
            totalScoreBefore = row.field(0);

        if(totalScoreBefore && totalScoreBefore < data.totalScore){
            this.localdb.execute("DELETE FROM highscores WHERE seed = '" + data.seed + "'");
        } 
        
        if (!totalScoreBefore || totalScoreBefore < data.totalScore) {
            var sql = ["INSERT INTO highscores VALUES(", _.wrapsplode([data.name, data.timePoints, data.at, data.seed, data.lang, data.totalScore, data.numWords, data.numUnique, data.avgWordLength, data.longestWordLength, data.shortestWordLength, data.wordPoints]), ");"].join(" ");
            this.localdb.execute(sql);
            callback();
        }
    },

    // Get local highscore position
    getLocalScorePosition: function(e){
        var sql = "SELECT count(*) as scoresBefore FROM highscores WHERE lang = '" + app.lang + "' AND totalScore > '" + e.data.totalScore + "'";
        
        var row = this.localdb.execute(sql), pos = row.field(0);
        
        e.callback({
            pos: pos
        });
    },    
    
    // Save scores
    saveHighscore: function(e){
        var score = e.data.score;
        
        score.at = Math.round(new Date().getTime() / 1000)
        score.lang = app.lang;
        
        this.saveLocalHighscore(score, function(){
            Ti.App.fireEvent('updateHighscore', { highscoreType: 'local' });
        });
        this.saveGlobalHighscore(score, function(){
            Ti.App.fireEvent('updateHighscore', { highscoreType: 'global' });
        });
    },
    
    // Bring up email dialog
    sendEmail: function(){
        var emailDialog = Titanium.UI.createEmailDialog()
        emailDialog.setSubject(t.feedbackSubject);
        emailDialog.setToRecipients(['feedback@golingoapp.com']);
        emailDialog.setMessageBody('<b>'+t.feedbackBody+'</b>');
        emailDialog.setHtml(true);
        emailDialog.setBarColor('#222');
        emailDialog.open();
    },
    
    // Open a url in a new webview on the current tab
    openUrl: function(e){
        var win = Titanium.UI.createWindow({
            title: e.data.url,
            barColor: '#222'
        });
        var webview = Ti.UI.createWebView({
            url: e.data.url,
        });
        win.add(webview);
        app.mainTab.open(win, {
            animation: true
        });
    }
}
game.init();