/*
    Yung GIF
    Check latest 25 /r/gifs and reminds you when there's something new, productivity tool.
*/

function Pingu(max_size, name){
    /*
        Pingu is a disk-persisted fixed-length fifo buffer. Schnoo schnoo.
    */
    this.space_name = "YUNG_GIF_"+name;
    this.max_size = max_size;
    this.lst = (localStorage[this.space_name] == undefined ? [] : JSON.parse(localStorage[this.space_name]));
    this.length = this.lst.length;
}

// Array(-like) methods
Pingu.prototype.unshift = function(e){
    if(this.lst.length >= this.max_size){
        this.lst.pop();
    }
    this.lst.unshift(e);
    this.length = this.lst.length;
    localStorage[this.space_name] = JSON.stringify(this.lst);
};

Pingu.prototype.pop = function(){
    e = this.lst.pop();
    this.length = this.lst.length;
    localStorage[this.space_name] = JSON.stringify(this.lst);
    return e;
};

Pingu.prototype.concat = function(e){
    return this.lst.concat(e.lst);
};

function Yung_GIF(){
    this.icons = {one: 'crapicon.png', omg: 'omgicon.png', sad: 'sadboy.png'};
    this.seen = new Pingu(100, 'seen')
    this.unseen = new Pingu(25, 'unseen')
    this.running = null
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
Yung_GIF.prototype.check_new = function(do_bruk){
    var me = this;
    $.getJSON('http://api.reddit.com/r/gifs', function(yolo){

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

        console.log("Checked for new gifs at "+Date())
        
        // Show new GIFs if requested
        if(do_bruk){me.bruk();}

    }).error(function(){
        chrome.browserAction.setIcon({path: me.icons.sad});
        chrome.browserAction.setTitle({title: "Cannot connect to Reddit."});
    });
}

window.YUNG_GIF = new Yung_GIF();

// If icon is clicked, check for new and show.
chrome.browserAction.onClicked.addListener(function(){window.YUNG_GIF.check_new(true)});

// Set alarm to check for new gifs every 5 minutes
chrome.alarms.create("just_checkin", {periodInMinutes: 5.0});
chrome.alarms.onAlarm.addListener(function(alarm){
    if(alarm.name == "just_checkin"){
        window.YUNG_GIF.check_new(false);
    }
});

console.log("Initialized Yung GIF.");

window.YUNG_GIF.check_new(false);
