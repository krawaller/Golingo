var win = Titanium.UI.currentWindow;

var loadingImageView = Titanium.UI.createImageView({
    url:'../pics/wood.jpg',
    width:320,
    height:480,
    zIndex: 10
});

win.add(loadingImageView);