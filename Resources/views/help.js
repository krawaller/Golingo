Ti.include('../js/go.view.pre.js');

Ti.App.Properties.setBool('seenGuide', true);

var i = 0;
var navigationBar = Ti.UI.createButtonBar({
    labels: [{
        image: '../pics/left.png'
    }, {
        image: '../pics/right.png'
    }]
});
navigationBar.addEventListener('click', helpStep);

var dxs = {
    0: -1,
    1: 1
};
var max = 7;

var leftButton = Ti.UI.createButton({
    dx: -1,
    width: 32,
    height: 32,
    left: 0,
    backgroundImage: '../pics/left.png',
    style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
    enabled: false
});
var rightButton = Ti.UI.createButton({
    dx: 1,
    width: 32,
    height: 32,
    left: 72,
    backgroundImage: '../pics/right.png',
    style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN
});
leftButton.addEventListener('click', helpStep);
rightButton.addEventListener('click', helpStep);

var atLabel = Ti.UI.createLabel({
    text: '1 / ' + max,
    color: '#eee',
    textAlign: 'center',
    left: 36,
    width: 36,
    font: { fontWeight: 'bold' }
});

function helpStep(e){
    var candidate = i + e.source.dx;
    if(candidate >= 0 && candidate < max){
        i = candidate;
        atLabel.text = i + 1 + ' / ' + max;
        leftButton.enabled = i > 0;
        rightButton.enabled = i < max - 1;
        webview.url = 'help_step_' + i + '.html'    
    }
}
var view = Ti.UI.createView({
    width: 108,
    height: 32
});
view.add(leftButton);
view.add(atLabel);
view.add(rightButton);

currentWin.rightNavButton = view;

var webview = Ti.UI.createWebView({
    backgroundColor: 'transparent',
    url: 'help_step_' + i + '.html',
    height: 416,
    top: 0,
    touchEnabled: false
});

var tString = JSON.stringify(t);
webview.addEventListener('load', function(e){
    webview.evalJS('doTmpl({t:'+tString+'})');
})

currentWin.add(webview);

currentWin.backgroundImage = null;
currentWin.backgroundColor = '#111';

Ti.include('../js/go.view.post.js');