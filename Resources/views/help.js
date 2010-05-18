Ti.include('../js/go.view.pre.js');

Ti.App.Properties.setBool('seenGuide', true);



var views = [];
for(var i = 0; i < 7; i++){
    var step_view = Ti.UI.createView({
        height: 416,
        top: 0
    });
    var step_webview = Ti.UI.createWebView({
        backgroundColor: 'transparent',
        url: 'help_step_' + i + '.html',
        height: 416,
        top: 0
    });
    step_webview.addEventListener('load', function(e){
        Ti.App.fireEvent('localize', {t:t});
    })
    step_view.add(step_webview);
    views.push(step_view);    
}

var scrollView = Titanium.UI.createScrollableView({
    views: views,
    showPagingControl: true,
    clipViews: false,
    maxZoomScale: 1.0,
    height: 426, // A bit weird, but workses
    top: 0
});

currentWin.add(scrollView);

currentWin.backgroundImage = null;
currentWin.backgroundColor = '#111';

Ti.include('../js/go.view.post.js');