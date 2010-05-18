Ti.include('../js/go.view.pre.js');
Go.winTitle('players');

var game = currentWin.game;

var numPlayers = currentWin.numPlayers || 1,
    seed = game ? game.seed : Math.round(Math.random()*1000000000),
    rows = [], playerNameFields = [],
    colors = ['#FF5E50', '#8695FF'];


//rows.push(t.nameThePlayers);    
for(var i = 0 ; i < numPlayers; i++){
    var label = Ti.UI.createLabel({
        text: game ? t['challenger'] : t['player'] + ' ' + (i+1),
        color: colors[i],
        shadowColor: '#333',
        shadowOffset: {x:0,y:1},
        textAlign: 'left',
        width: 'auto',
        height: 'auto',
        left: 20
    });
    
    var field = Titanium.UI.createTextField({
        textAlign: 'center',
        value: Ti.App.Properties.getString('player' + i) || t['noname'],
        height: 35,
        right: 20,
        width: 190,
        borderStyle: Titanium.UI.INPUT_BORDERSTYLE_NONE,
        color: colors[i],
        clearOnEdit: true,
        appearance: Titanium.UI.KEYBOARD_APPEARANCE_ALERT,
    });    
    rows.push({
        items: [label, field]
    });
    playerNameFields.push(field);
}

rows.push(game ? t.faceTheChallenge : t.createNewGame);

// Seed
var numLabel = Ti.UI.createLabel({
    text: t['game'] + ' #',
    color: '#eee',
    shadowColor:'#333',
    shadowOffset:{x:0,y:1},
    textAlign:'left',
    width: 'auto',
    height:'auto',
    left: 20
});
var numField = Titanium.UI.createTextField({
    textAlign: 'center',
    value: seed,
    height:35,
    right:20,
    width:190,
    borderStyle:Titanium.UI.INPUT_BORDERSTYLE_NONE,
    color:'#eee',
    clearOnEdit:true,
    keyboardType: Titanium.UI.KEYBOARD_NUMBERS_PUNCTUATION,
    appearance: Titanium.UI.KEYBOARD_APPEARANCE_ALERT,
    returnKeyType: Titanium.UI.RETURNKEY_GO,
    enableReturnKey: false
});

if(game){
    numField.enabled = false;
}
 
rows.push({
   items: [numLabel, numField]
})

rows.push({
    titlePlain: t.startGame,
    func: function(e){
        var players = [];
        for(var i = 0; i < playerNameFields.length; i++){
            var name = playerNameFields[i].value;
            players.push(name);
            Ti.App.Properties.setString('player' + i, name)
        }
        
        var data = {
            numPlayers: players.length,
            players: players,
            seed: numField.value
        };
        
        if(game){
            data.challenge = game;
        }
        
        Ti.App.fireEvent('app', {
            func: 'initGameStart',
            data: data
        });
        
    }
});

Ti.App.addEventListener('startingGame', function(){
    // Try closing window here
    setTimeout(function(){
        currentWin.close();
    }, 1000);
});


var title, subtitle;
if(game){
    title = t['challenge'] + ' ' + game.name;
    subtitle = game.name + ' ' + t['got'] + ' ' + game.totalScore.dec(1) + ' ' + t['pointsInThisGame'];
} else {
    title = t['players'];
    //subtitle = t['nameThePlayers'];
}

if (!game && numPlayers == 1) {
    rows.push(t.challengeEarlierGame);
    
    rows.push({
        titleKey: 'challengeHighscore',
        url: 'highscore.js'
    });
}

currentWin.add(
    Go.table(
        rows, 
        {
            headerTitle: title,
            headerSubtitle: subtitle
        }
    )
);



Ti.include('../js/go.view.post.js');