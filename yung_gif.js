/*
    Yung GIF
    Check latest 25 /r/gifs and reminds you when there's something new, productivity tool.
*/

function Yung_GIF(){
    this.icons = {one: 'crapicon.png', omg: 'omgicon.png', sad: 'sadboy.png'};
    this.seen = new Pingu(1000, 'seen')
    this.unseen = new Pingu(25, 'unseen')
    this.running = null

    // Initialize settings for a new install
    if(!localStorage['YUNG_GIF_sources']){
        localStorage['YUNG_GIF_sources'] = "{\"your_first_source\":{\"url\":\"/r/gifs\",\"limit\":25}}"
    }
}

// Initialize all the events
Yung_GIF.prototype.watch = function(){
    // If icon is clicked, check for new and show.
    chrome.browserAction.onClicked.addListener(function(){
        chrome.extension.sendMessage('checknow!');
        window.YUNG_GIF.bruk();
    });

    // Set alarm to check for new gifs every 5 minutes
    chrome.alarms.create("chckn", {periodInMinutes: 5.0});
    chrome.alarms.onAlarm.addListener(function(alarm){
        if(alarm.name == "chckn"){chrome.extension.sendMessage('checknow!')}
    });

    // A listener to check YUNG GIFwuuut
    chrome.extension.onMessage.addListener(function(message){
        if(message == "checknow!"){
            window.YUNG_GIF.check_new();
        }
    });
}

// bruk() shows unseen gifs.
Yung_GIF.prototype.bruk = function(){
    while(this.unseen.length > 0){
        gif_url = this.unseen.pop()
        chrome.tabs.create({url: gif_url});
        this.seen.unshift(gif_url);
    }
    chrome.browserAction.setIcon({path: this.icons.one});
    chrome.browserAction.setTitle({title: "wait more..."});
    chrome.browserAction.setBadgeText({text: ""});
}

// Check Reddit for new content and notify if that's the case
Yung_GIF.prototype.check_new = function(){
    var me = this;
    var sources = JSON.parse(localStorage['YUNG_GIF_sources']);
    
    // Update the sizes of our Pingu
    me.unseen.max_size = 0;

    $.each(sources,function(i, source){
        me.unseen.max_size += parseInt(source.limit);
    });

    me.unseen.resize();

    $.each(sources, function(i, source){
        var le_url = 'http://api.reddit.com'+source.url+"?limit="+source.limit
        $.getJSON(le_url, function(yolo){

            // keep the hottest at the beginning so if new GIFs are added, hottest ones stay
            $.each(yolo.data.children.reverse(), function(i,e){
                if(me.seen.concat(me.unseen).indexOf(e.data.url) == -1) {
                    me.unseen.unshift(e.data.url)
                }
            });
            
            // is there something new?
            if(me.unseen.length > 0){
                chrome.browserAction.setIcon({path: me.icons.omg});
                chrome.browserAction.setTitle({title: "NEW GIFS FOR U"});
                chrome.browserAction.setBadgeText({text: ""+me.unseen.length});
            }else{
                chrome.browserAction.setIcon({path: me.icons.one});
                chrome.browserAction.setTitle({title: "wait more..."});
                chrome.browserAction.setBadgeText({text: ""});
            }

            console.log("Checked for new stuff on "+le_url+" at "+Date())
            
        }).error(function(){
            chrome.browserAction.setIcon({path: me.icons.sad});
            chrome.browserAction.setTitle({title: "Cannot connect to "+le_url+"."});
        });
    });
}

window.YUNG_GIF = new Yung_GIF();
window.YUNG_GIF.watch()

console.log("Initialized Yung GIF.");

// Check one time at the start
chrome.extension.sendMessage('checknow!')
