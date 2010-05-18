// Localizing - should keep objects in array to avoid overwriting if many objects uses same translation key.
function localize(e){
	t = e.t;
    for(var key in tKeys){
        tKeys[key].title = e.t[key];
		tKeys[key].text = e.t[key]; //Hmm
    }
}

Ti.App.addEventListener('localize', localize);
localize({
    t: t
});