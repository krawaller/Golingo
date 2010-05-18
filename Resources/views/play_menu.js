Ti.include('../js/go.view.pre.js');
Go.winTitle('play');

function play(e){
    var win = Titanium.UI.createWindow({  
        url: 'player_menu.js',
        tabBarHidden:true,
        title: t['players'],
        backgroundImage: '../pics/wood.jpg',
        barColor: '#222'
    });
    win.numPlayers = e.rowData.numPlayers;
    Ti.UI.currentTab.open(win, {animation:true});
}

currentWin.add(Go.table([{
    titleKey: 'singlePlayer',
    numPlayers: 1
},
{
    titleKey: 'splitScreen',
    numPlayers: 2
}], 
{
    headerTitle: t['pickPlayingMode'],
    func: play
}
));

Ti.include('../js/go.view.post.js');
