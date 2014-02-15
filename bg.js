/*
    Yung GIF
    Check latest 25 /r/gifs and reminds you when there's something new, productivity tool.
*/

function Pingu(max_size, name){
    
    /*
        Pingu is a disk-persisted fixed-length fifo buffer. Schnoo schnoo.
    */

    var me = this;
    var name = "YUNG_GIF_"+name;

    // exists list already?
    if(localStorage[name] == undefined){
        this.lst = [];
    }else{
        this.lst = JSON.parse(localStorage[name]);
    }

    // Array(-like) methods
    this.push = function(e){
        if(me.lst.length >= max_size){
            me.lst.pop();
        }
        me.lst.push(e);
        me.length = me.lst.length;
        localStorage[name] = JSON.stringify(me.lst);
    };
    this.pop = function(){
        e = me.lst.pop();
        me.length = me.lst.length;
        localStorage[name] = JSON.stringify(me.lst);
        return e;
    };
    this.concat = function(e){
        return me.lst.concat(e.lst);
    };
}

window.YUNG_GIF = {}
window.YUNG_GIF.icons = {one: 'crapicon.png', omg: 'omgicon.png', sad: 'sadboy.png'};
window.YUNG_GIF.seen = new Pingu(100, 'seen')
window.YUNG_GIF.unseen = new Pingu(25, 'unseen')
window.YUNG_GIF.running = null

// If icon is clicked, check for new and show.
chrome.browserAction.onClicked.addListener(function(){window.YUNG_GIF.check_new(true)});

// bruk() shows unseen gifs.
window.YUNG_GIF.bruk = function(){
    while(window.YUNG_GIF.unseen.length > 0){
        gif_url = window.YUNG_GIF.unseen.pop()
        chrome.tabs.create({url: gif_url});
        window.YUNG_GIF.seen.push(gif_url);
    }
    chrome.browserAction.setIcon({path: window.YUNG_GIF.icons.one});
    chrome.browserAction.setTitle({title: "wait more..."});
    chrome.browserAction.setBadgeText({text: ""});
}

// Check Reddit for new content and notify if that's the case
window.YUNG_GIF.check_new = function(do_bruk){
    $.getJSON('http://api.reddit.com/r/gifs', function(yolo){

        // Iterate in reverse order so the last opened tab is always the hottest
        $.each(yolo.data.children.reverse(), function(i,e){
            if(window.YUNG_GIF.seen.concat(window.YUNG_GIF.unseen).indexOf(e.data.url) == -1) {
                window.YUNG_GIF.unseen.push(e.data.url)
            }
        });
                
        // is there something new?
        if(window.YUNG_GIF.unseen.length > 0){
            chrome.browserAction.setIcon({path: window.YUNG_GIF.icons.omg});
            chrome.browserAction.setTitle({title: "NEW GIFS FOR U"});
            chrome.browserAction.setBadgeText({text: "OMG"});
        }else{
            chrome.browserAction.setIcon({path: window.YUNG_GIF.icons.one});
            chrome.browserAction.setTitle({title: "wait more..."});
            chrome.browserAction.setBadgeText({text: ""});
        }
        
        // Show new GIFs if requested
        if(do_bruk){window.YUNG_GIF.bruk();}

    }).error(function(){
        chrome.browserAction.setIcon({path: window.YUNG_GIF.icons.sad});
        chrome.browserAction.setTitle({title: "Cannot connect to Reddit."});
    });
}

window.YUNG_GIF.go = function(){
    if(!window.YUNG_GIF.running){
        // Check one time for new GIFs
        window.YUNG_GIF.check_new(false)

        // Every five minutes, check for new GIFs
        window.YUNG_GIF.running = setInterval(function(){window.YUNG_GIF.check_new(false)}, 5*60*1000);
    }
}

// This sure gets loaded on Chrome startup
chrome.runtime.onStartup.addListener(function(){
    window.YUNG_GIF.go()
});

// This doesn't seem to get loaded on Chrome startup
window.YUNG_GIF.go()