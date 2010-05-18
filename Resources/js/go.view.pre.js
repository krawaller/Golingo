Number.prototype.dec = function(decimals){
    var multiplier = Math.pow(10, decimals);
    return Math.round(this * multiplier) / multiplier;
}

_ = {
	bind: function(func, scope){
		return function(){
			return func.apply(scope, Array.prototype.slice.call(arguments));
		}
	},
	extend: function(destination, source){
		for (var property in source) {
			destination[property] = source[property];
		}
		return destination;
	}
}

var currentWin = Ti.UI.currentWindow;
t = Ti.UI.currentTab ? Ti.UI.currentTab.t || {} : {};
tKeys = {};

Go = {};
Go.table = function(arr, tableOpts){
    var rows = [], len = arr.length, row, rowType, label;
	arr.forEach(function(item, i){
        if(!item) return;
        rowType = len == 1 ||  (i == 0 && typeof arr[i+1] == 'string') || (i > 0 && typeof arr[i-1] == 'string' && (typeof arr[i+1] == 'string' ||  !arr[i+1])) ? 'single' : (i == 0 || typeof arr[i-1] == 'string' ? 'top' : (i == len-1 || typeof arr[i+1] == 'string' ? 'bottom' : 'middle'));
        
		if (typeof item == 'string') {
			row = Ti.UI.createTableViewRow({
				backgroundImage: null,
				selectedBackgroundImage: null,
				selectionStyle: Ti.UI.iPhone.TableViewCellSelectionStyle.NONE,
				height: 60,
			});
			
			var item = {
				items: [
	                Ti.UI.createLabel({
	                    text: item,
	                    color: '#111',
	                    shadowColor: '#de9f7b',
	                    shadowOffset: { x: 0, y: 1 },
	                    textAlign: 'left',
	                    width: 'auto',
	                    height: 'auto',
	                    font: { fontWeight: 'bold', fontSize: 20 },
	                    top: 28
	                })
	            ]
			};
		}
		else {
			row = Ti.UI.createTableViewRow(_.extend({
				backgroundImage: '../pics/tableview_basic/' + rowType + '.png',
				selectedBackgroundImage: '../pics/tableview_selected/' + rowType + '.png'
			}, item));
		}
		
		if(item.items){
			item.items.forEach(function(rowItem, j){
				row.add(rowItem);
			});
		} else {
			var text = item.titleKey ? t[item.titleKey] : item.titlePlain;
	        label = Ti.UI.createLabel({
	            text: text,
	            color: '#eee',
	            shadowColor:'#333',
	            shadowOffset:{x:0,y:1},
	            textAlign:'left',
	            //top:20,
	            //left:85,
	            width: 'auto',
	            height:'auto',
	            //font:{fontWeight:'bold',fontSize:18}
	        });
	        row.add(label);
	        if(item.titleKey){
	            tKeys[item.titleKey] = label;
	        }
		}
		
		
        if(item.func){
            row.addEventListener('click', item.func);
        } else if(item.url){
			row.addEventListener('click', function(e){
				var win = Titanium.UI.createWindow({  
                    url: item.url,
                    tabBarHidden:true,
                    title: t[item.titleKey],
                    backgroundImage: '../pics/wood.jpg',
                    barColor: '#222'
                });
                Ti.UI.currentTab.open(win, {animation:true});
            });
		} else if(item.htmlUrl){
			row.addEventListener('click', function(e){
				var win = Titanium.UI.createWindow({  
	                tabBarHidden:true,
	                title: t[item.titleKey],
	                backgroundImage: '../pics/wood.jpg',
	                barColor: '#222',
					width: 320,
					height: 480
	            });
				var webview = Ti.UI.createWebView({
					backgroundColor: 'transparent',
					url: item.htmlUrl,
					width: 320,
                    height: 480
				});
				win.add(webview);
				Ti.UI.currentTab.open(win);
			});
		}
		

        rows.push(row);
    });
	
	
	var headerView = Ti.UI.createView({
        height:96
    });
	
	if(tableOpts && (tableOpts.headerTitle || tableOpts.headerTitleKey)){
		var text = tableOpts.headerTitleKey ? t[tableOpts.headerTitleKey] : tableOpts.headerTitle;
		var headerLabel = Ti.UI.createLabel({
		    text: text,
		    color: '#111',
		    shadowColor:'#de9f7b',
		    shadowOffset:{x:0,y:1},
		    textAlign:'left',
		    width: 'auto',
		    height:'auto',
		    font:{fontWeight:'bold', fontSize:20},
		    top: (tableOpts.headerSubtitle || tableOpts.headerSubtitleKey) ? 24 : 64
		});
		if(tableOpts.headerTitleKey){
            tKeys[tableOpts.headerTitleKey] = headerLabel;
        }
		headerView.add(headerLabel);
	}
	if(tableOpts && (tableOpts.headerSubtitle ||  tableOpts.headerSubtitleKey)){
		var text = tableOpts.headerSubtitleKey ? t[tableOpts.headerSubtitleKey] : tableOpts.headerSubtitle;
		var headerInfo = Ti.UI.createLabel({
		    text: text,
		    color: '#111',
		    shadowColor:'#de9f7b',
		    shadowOffset:{x:0,y:1},
		    textAlign:'left',
		    width: 'auto',
		    height:'auto',
		    font:{fontSize:16},
		    top: 54
		});
		if(tableOpts.headerSubtitleKey){
			tKeys[tableOpts.headerSubtitleKey] = headerInfo;
		}
		headerView.add(headerInfo);
	}
	
	// Footer view
	var footerView = Ti.UI.createView({
        height: 50
    });
	if(tableOpts && (tableOpts.footerTitle ||  tableOpts.footerTitleKey)){
        var text = tableOpts.footerTitleKey ? t[tableOpts.footerTitleKey] : tableOpts.footerTitle;
        var footerLabel = Ti.UI.createLabel({
            text: text,
            color: '#111',
            shadowColor:'#de9f7b',
            shadowOffset:{x:0,y:1},
            textAlign:'left',
            width: 'auto',
            height:'auto',
            font:{fontWeight:'bold', fontSize:20},
            top: 20
        });
		if(tableOpts.footerTitleKey){
            tKeys[tableOpts.footerTitleKey] = footerLabel;
        }
        footerView.add(footerLabel);
    }
	
    var tableView = Titanium.UI.createTableView({
        width: 291,
		headerView: headerView,
		footerView: footerView,
        backgroundColor: 'transparent',
        data: rows,
        separatorStyle: Ti.UI.iPhone.TableViewSeparatorStyle.NONE
    });

	if(tableOpts && tableOpts.func){
		tableView.addEventListener('click', tableOpts.func);
	}
	
    
    return tableView;
}


Go.register = function(singleton){
	singleton.callbacks = {};
    singleton.callbackCounter = 0;
	singleton.handleEvents = function(e){
		if(this[e.func]){
            if(e.callback){
                var c = e.callback, self = this, from = e.from;
                e.callback = function(data){
                    self.fire({
                        data: data,
                        to: from,
                        callback: c
                    });
                };
            }
            e.callback(this[e.func](e));
        } else if(e.callback && this.callbacks[e.callback]){
           this.callbacks[e.callback](e);
           delete this.callbacks[e.callback];
        }
    };
    
	singleton.fire = function(opts){
        if(opts.callback){
            var c = ++this.callbackCounter;
            this.callbacks[c] = opts.callback;
            opts.callback = c;
        }
        opts.from = this.name;
        Ti.App.fireEvent(opts.to, opts);
    };
	Ti.App.addEventListener(singleton.name, _.bind(singleton.handleEvents, singleton));  
}

Go.winTitle = function(title){
	tKeys[title] = currentWin;
}
