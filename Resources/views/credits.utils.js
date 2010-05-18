Ti.App.addEventListener('localize', function(e){
	var wrapper = document.getElementById('wrapper');
	wrapper.innerHTML = e.t.credits_text;
	
	var sendEmail = document.getElementById('sendEmail');
	sendEmail.addEventListener('click', function(e){
	    e.stopPropagation();
	    Ti.App.fireEvent('app', {
	        func: 'sendEmail'
	    });
	}, false);
	
	document.addEventListener('click', function(e){
	    var url;
	    if(e.target.nodeName == 'A' && (url = e.target.getAttribute('rel'))){
	        Ti.App.fireEvent('app', {
	            func: 'openUrl',
	            data: {
	                url: url
	            }
	        });
	    }
		e.preventDefault();
		return false;
	}, false);
});

