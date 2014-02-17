/*
    Yung GIF
    Check latest 25 /r/gifs and reminds you when there's something new, productivity tool.
*/

function Pingu(max_size, name){
    /*
        Pingu is a disk-persisted fixed-length fifo buffer. Schnoo schnoo.
    */
    var name = "YUNG_GIF_"+name;

    // exists list already?
    if(localStorage[name] == undefined){
        this.lst = [];
    }else{
        this.lst = JSON.parse(localStorage[name]);
    }

    this.length = this.lst.length;
}

// Array(-like) methods
Pingu.prototype.push = function(e){
    if(this.lst.length >= max_size){
        this.lst.pop();
    }
    this.lst.push(e);
    this.length = this.lst.length;
    localStorage[name] = JSON.stringify(this.lst);
};

Pingu.prototype.pop = function(){
    e = this.lst.pop();
    this.length = this.lst.length;
    localStorage[name] = JSON.stringify(this.lst);
    return e;
};

Pingu.prototype.concat = function(e){
    return this.lst.concat(e.lst);
};

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
            chrome.browserAction.setBadgeText({text: window.YUNG_GIF.seen.length});
        }else{
            chrome.browserAction.setIcon({path: window.YUNG_GIF.icons.one});
            chrome.browserAction.setTitle({title: "wait more..."});
            chrome.browserAction.setBadgeText({text: ""});
        }

        console.log("Checked for new gifs at "+Date())
        
        // Show new GIFs if requested
        if(do_bruk){window.YUNG_GIF.bruk();}

    }).error(function(){
        chrome.browserAction.setIcon({path: window.YUNG_GIF.icons.sad});
        chrome.browserAction.setTitle({title: "Cannot connect to Reddit."});
    });
}

// Set alarm to check for new gifs every 5 minutes
chrome.alarms.create("just_checkin", {periodInMinutes: 5.0});
chrome.alarms.onAlarm.addListener(function(alarm){
    if(alarm.name == "just_checkin"){
        window.YUNG_GIF.check_new(false);
    }
});

console.log("Initialized Yung GIF.");

window.YUNG_GIF.check_new(false);
