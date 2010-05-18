Ti.include('../js/go.view.pre.js');

currentWin.add(Go.table([{
    titleKey: 'play',
    url: 'play_menu.js'
},
{
    titleKey: 'options',
    url: 'options.js'
},
{
    titleKey: 'highscore',
    url: 'highscore.js'
},
{
    titleKey: 'help',
    url: 'help.js'
},
{
    titleKey: 'credits',
    url: 'credits.js'
}], {
    headerSubtitleKey: 'tagline',
    footerTitleKey: 'createdByKrawaller'
}));

Ti.include('../js/go.view.post.js');
