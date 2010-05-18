Ti.include('../js/go.view.pre.js');
Go.winTitle('pickLanguage');

var tableOpts = {
    headerSubtitleKey: 'changingLangEffects',
    func: function(e){
        Ti.App.Properties.setString('lang', e.rowData.lang);
        if(currentWin.noLang){
            Ti.App.addEventListener('localize', function(){ // Should we close?
                currentWin.close({ transition:Ti.UI.iPhone.AnimationStyle.FLIP_FROM_RIGHT });
            }); 
        }
        
        Ti.App.fireEvent('changeLocalization', {lang: e.rowData.lang});
    }
};

if(currentWin.noLang){
	tableOpts.headerTitleKey = 'pickLanguage';
	t = {
		pickLanguage: 'Pick language',
		changingLangEffects: 'This affects both menus and gameplay'
	}
} else {
    Ti.API.debug('preparing fulhack');
    Ti.App.addEventListener('localize', function(e){ // A so called *fulhack*
       currentWin.backButtonTitle = e.t.options
    }); 
}

currentWin.add(Go.table([{
    titlePlain: 'English',
	leftImage: '../pics/lang/uk_small.png',
    lang: 'eng'
}, {
    titlePlain: 'Svenska',
    leftImage: '../pics/lang/se_small.png',
    lang: 'swe'
}], 

tableOpts));

Ti.include('../js/go.view.post.js');
