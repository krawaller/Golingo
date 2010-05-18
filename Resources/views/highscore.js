Ti.include('../js/go.view.pre.js');
Go.winTitle('highscore');

var highscore = {
	name: 'highscore',
    init: function(){
		var self = this;
		Go.register(this);
		
		this.lang = Ti.App.Properties.getString('lang');
		this.initHighscoreTable();
        this.win = currentWin;

		this.showHighscores = _.bind(this.showHighscores, this); // Force bind
		this.getLocalHighscores(this.showHighscores);
		Ti.App.addEventListener('updateHighscore', function(e){
            if (self.viewing == e.highscoreType) {
                switch (self.viewing) {
                    case 'local':
                        self.getLocalHighscores(self.showHighscores, true);
                        break;
                        
                    case 'global':
                        self.getGlobalHighscores(self.showHighscores, true);
                        break;
                }
            }
		});
	},
	initHighscoreTable: function(){
		var self = this;
		this.whatHighscore = Titanium.UI.createTabbedBar({
            labels:[
                {image:'../pics/icons/local.png'},
                {image:'../pics/icons/global.png'},
            ],
            backgroundColor:'#333',
            style:Titanium.UI.iPhone.SystemButtonStyle.BAR,
            index:0
        });
        currentWin.setRightNavButton(this.whatHighscore);
        
        this.highscores = ['local', 'global'];
        this.whatHighscore.addEventListener('click', function(e){
            switch(self.highscores[e.index]){
                case 'local':
                self.getLocalHighscores(self.showHighscores);
                break;
                
                case 'global':
                self.getGlobalHighscores(self.showHighscores);
                break;
            }
        });
        
        this.headerView = Ti.UI.createView({
            height:90
        });
        this.headerLabel = Ti.UI.createLabel({
            text: t['localHighscore'],
            color: '#111',
            shadowColor:'#de9f7b',
            shadowOffset:{x:0,y:1},
            textAlign:'left',
            width: 'auto',
            height:'auto',
            font:{fontWeight:'bold', fontSize:20},
			top: 20
        })
        this.headerView.add(this.headerLabel);
		
		this.headerInfo = Ti.UI.createLabel({
            text: t['challengeByTapping'],
            color: '#111',
            shadowColor:'#de9f7b',
            shadowOffset:{x:0,y:1},
            textAlign:'left',
            width: 'auto',
            height:'auto',
            font:{fontSize:16},
			top: 60
        })
        this.headerView.add(this.headerInfo);
        
        
	},
	getLocalHighscores: function(callback, noLoader){
		if (!noLoader) {
            Ti.App.fireEvent('showLoader');
        }
		this.viewing = 'local';
		this.fire({
			func: 'getLocalHighscores',
            to: 'app',
            callback: function(e){
				callback(e.data.rows, 'local');
				if (!noLoader) {
                    Ti.App.fireEvent('hideLoader');
                }
			}
        });
	},
	getGlobalHighscores: function(callback, noLoader){
		if (!noLoader) {
            Ti.App.fireEvent('showLoader');
        }
		this.viewing = 'global';
	    this.fire({
            func: 'getGlobalHighscores',
            to: 'app',
            callback: function(e){
                callback(e.data.rows, 'global');
				if (!noLoader) {
                    Ti.App.fireEvent('hideLoader');
                }
            }
        });
	},
	openHighscoreGame: function (game){
		var win = Titanium.UI.createWindow({  
            url: 'player_menu.js',
            tabBarHidden:true,
            title: t['players'],
            backgroundImage: '../pics/wood.jpg',
            barColor: '#222'
        });
        win.numPlayers = 1; // Should be eligible
		win.game = game;
		
        Ti.UI.currentTab.open(win, {animation:true});
	},
	showHighscores: function(arr, type){
        if(this.highscoreTableView){
            currentWin.remove(this.highscoreTableView);
        }
        
        
		this.headerLabel.text = t[type + 'Highscore'];
		var arr = arr || [], rows = [], row, rowType, label;
		
		arr.unshift({
            name: t['name'],
            totalScore: t['score'],
            at: t['date'],
			nogo: true
        });
		
		var len = arr.length;
		arr.forEach(function(item, i){
		    rowType = len == 1 ? 'single' : (i == 0 ? 'top' : (i == len - 1 ? 'bottom' : 'middle'));
		    row = Ti.UI.createTableViewRow({
		        backgroundImage: '../pics/tableview_basic/' + rowType + '.png',
		        selectedBackgroundImage: '../pics/tableview_selected/' + rowType + '.png',
		        type: type,
				gameData: item
		    });
		    
		    row.add(Ti.UI.createLabel({
		        text: item.name,
		        color: '#eee',
		        shadowColor: '#333',
		        shadowOffset: {
		            x: 0,
		            y: 1
		        },
		        textAlign: 'left',
		        width: 85,
		        height: 16,
		        left: 20,
		        font: {
		            fontWeight: 'bold',
		            fontSize: 16
		        }
		    }));
		    
		    row.add(Ti.UI.createLabel({
		        text: i != 0 ? item.totalScore.dec(1) : item.totalScore,
		        color: '#eee',
		        shadowColor: '#333',
		        shadowOffset: {
		            x: 0,
		            y: 1
		        },
		        textAlign: 'left',
		        width: 'auto',
		        height: 'auto',
		        left: 120,
		        font: {
		            fontSize: 16
		        }
		    }));
		    
		    row.add(Ti.UI.createLabel({
		        text: item.at,
		        color: '#eee',
		        shadowColor: '#333',
		        shadowOffset: {
		            x: 0,
		            y: 1
		        },
		        textAlign: 'left',
		        width: 'auto',
		        height: 'auto',
		        right: 20,
		        font: {
		            fontSize: 16
		        }
		    }));
		    if (item.titleKey) {
		        tKeys[item.titleKey] = label;
		    }
		    rows.push(row);
		});
        
        this.highscoreTableView = Titanium.UI.createTableView({
            width: 291,
            headerView: this.headerView,
            backgroundColor: 'transparent',
            data: rows,
            separatorStyle: Ti.UI.iPhone.TableViewSeparatorStyle.NONE,
        });
        
        var self = this;
        this.highscoreTableView.addEventListener('click', function(e){
            if (!e.rowData.gameData.nogo) {
                self.openHighscoreGame(e.rowData.gameData);
            }
        });
        
        currentWin.add(this.highscoreTableView);
        
		//this.highscoreTableView.setData(rows); //{animationStyle:Titanium.UI.iPhone.RowAnimationStyle.RIGHT}); 
	}
};
highscore.init();

Ti.include('../js/go.view.post.js');
