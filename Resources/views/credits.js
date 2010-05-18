Ti.include('../js/go.view.pre.js');

var webview = Ti.UI.createWebView({
    backgroundColor: 'transparent',
    url: 'credits.html',
});

webview.addEventListener('load', function(e){
    Ti.App.fireEvent('localize', {t:t});
});

currentWin.add(webview);
