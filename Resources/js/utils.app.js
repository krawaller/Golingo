_ = {
    ajaxOptions: {
        type: 'GET',
        dataType: 'json'
    },
    ajax: function(inOpts){
        var opts = _.extend(_.extend({}, this.ajaxOptions), inOpts);
        var xhr = Titanium.Network.createHTTPClient();
        xhr.onload = function(){
            switch(opts.dataType){
                case 'json':
                var resp = eval('(' + this.responseText + ')');
                opts.success(resp, resp.rows);
                break;
            }
        };
        xhr.onerror = function(e){
            if(opts.error){
                opts.error(e);
            } else if(opts.errorMessage){
                var a = Titanium.UI.createAlertDialog({
                    title: opts.errorMessage.title ||  t['connectionProblem'],
                    message: opts.errorMessage.message || ''
                });
                
                if(opts.tryAgain){
                    a.buttonNames = [t.ok, t.tryAgain];
                    a.addEventListener('click', function(e){
                        switch (e.index) {
                            case 1:
                                _.ajax(opts);
                                break;
                        }
                    });
                }
                
                a.show();
            }
            Ti.App.fireEvent('hideLoader');
        };
        xhr.open(opts.type, opts.url);
        xhr.send(opts.data ||  null);
    },
    bind: function(func, scope){
        return function(){
            return func.apply(scope, Array.prototype.slice.call(arguments));
        }
    },
    extend: function(destination, source) {
       for (var property in source) {
           destination[property] = source[property];
       }
       return destination;
    },
    wrapsplode: function(arr){
    var a = Array.prototype.slice.call(arr);
        return a.map(function(item){
            return "'" + item + "'";
        }).join(", ")    
    }
};

Date.prototype.format = function () {
    var y = this.getFullYear(), m = this.getMonth() + 1, d = this.getDate();
    return [y,(m < 10 ? '0' + m : m),(d < 10 ? '0' + d : d)].join("-")
};