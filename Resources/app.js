var tmp = [Titanium.App, Titanium.API, Titanium.Database];
Titanium.include('js/utils.app.js');
//Ti.App.Properties.setString('lang', '');
//Ti.App.Properties.setBool('seenGuide', false);

// #### The app singleton handling app startup
var app = {
    // Version number - used in database handling
	version: '1.0.6',
    
    // Initiate app
	init: function(){
		Titanium.UI.setBackgroundColor('#000');
		this.initEvents();
		
		this.tabGroup = Titanium.UI.createTabGroup();
		this.mainMenu = Titanium.UI.createWindow({
	        url: 'views/main_menu.js',
			backgroundImage: 'pics/wood.jpg',
	        title: 'Golingo',
			barColor: '#222',
	        tabBarHidden: true,
			fullscreen: true
	    });
		
		this.mainTab = Titanium.UI.createTab({  
		    title:'Golingo',
		    window: this.mainMenu
		});
		this.tabGroup.addTab(this.mainTab);  
		this.tabGroup.open({ fullscreen:true });
		        
        
        var args = Ti.App.getArguments();
        // If we got a game challenge as input - open it
        if (args.url) {
			Titanium.include('js/parseuri.js');
			var game = parseUri(args.url).queryKey;
			this.localize(game.lang);
			var win = Titanium.UI.createWindow({
				url: 'views/player_menu.js',
				tabBarHidden: true,
				title: t.players,
				backgroundImage: 'pics/wood.jpg',
				barColor: '#222'
			});
			win.numPlayers = 1; // Should be eligible
			win.game = game;
			
			this.mainTab.open(win, {
				animation: true
			});
		}
        // Otherwise proceed as normal
		else {
			this.lang = Ti.App.Properties.getString('lang');
			if (this.lang) {
				this.localize(this.lang);
			}
			
			// We must have a language, otherwise force user to pick one!
			if (!this.lang) {
				var langWin = Titanium.UI.createWindow({
					url: 'views/lang.js',
					backgroundImage: 'pics/wood.jpg',
					title: 'Pick language',
					tabBarHidden: true,
					navBarHidden: true
				});
				langWin.noLang = true;
				langWin.open({
					fullscreen: true
				});
			}
		}	
		Titanium.include('js/game.app.js');
		
		// #### Loader
		// window container
		this.loaderWin = Titanium.UI.createWindow({
		    height: 50,
		    width: 50
		});
		
		// black view
		this.loaderView = Titanium.UI.createView({
		    height: 50,
		    width: 50,
		    backgroundColor:'#000',
		    borderRadius:10,
		    opacity:0.8
		});
		
		this.loaderWin.add(this.loaderView);
		
		// loading indicator
		this.loader = Titanium.UI.createActivityIndicator({
		    style:Titanium.UI.iPhone.ActivityIndicatorStyle.BIG,
		    height:30,
		    width:30
		});
		this.loaderWin.add(this.loader);
	},
	
    // Localization! Changes language of menus and gameplay just by switching database
	localize: function(lang){
		Ti.App.Properties.setString('lang', lang);
		this.lang = lang;
		this.langdb = Titanium.Database.install('db/'+this.lang+'.sqlite', this.lang + this.version);
        t = this.t = this.getTranslations();
		if(this.mainTab){
			this.mainTab.t = this.t;
		}
		this.mainMenu.showNavBar();
		Ti.App.fireEvent('localize', {t:t});
	},
	
    // Initiate app wide events
	initEvents: function(){
        Titanium.App.addEventListener('changeLocalization', function(e) {
            app.localize(e.lang);
        });
		
		Ti.App.addEventListener('showLoader', _.bind(this.showLoader, this));
		Ti.App.addEventListener('hideLoader', _.bind(this.hideLoader, this));
	},
	
    // Fetch translations from current language database
	getTranslations: function(){
		var t = {};
		var rows = this.langdb.execute("SELECT key, trans FROM translations");
        while (rows.isValidRow()){
            t[rows.field(0)] = rows.field(1);
            rows.next();
        }
        rows.close();
		return t;
	},
	
	showLoader: function() {
        this.loaderTimer = setTimeout(function(){
            Ti.App.fireEvent('hideLoader');
        }, 15000);
	    this.loaderWin.open();
	    this.loader.show();  
    },
	
	hideLoader: function(){
        clearTimeout(this.loaderTimer);
		this.loaderWin.close();
        this.loader.hide();  
	}
};

app.init();




