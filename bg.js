/*
Yung GIF
Check latest 25 /r/gifs and reminds you when there's something new, productivity tool.
*/

window.YUNG_GIF = {}
window.YUNG_GIF.icons = {one: 'crapicon.png', omg: 'omgicon.png', sad: 'sadboy.png'};
window.YUNG_GIF.seen = []
window.YUNG_GIF.unseen = []

// If icon is clicked, check for new and show.
chrome.browserAction.onClicked.addListener(function(){check_new(true)});

// bruk() shows unseen gifs.
function bruk(){
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
function check_new(do_bruk){
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
        if(do_bruk){bruk();}

    }).error(function(){
        chrome.browserAction.setIcon({path: window.YUNG_GIF.icons.sad});
        chrome.browserAction.setTitle({title: "Cannot connect to Reddit."});
    });
}

// Check one time for new GIFs
check_new(false)

// Every five minutes, check for new GIFs
setInterval(function(){check_new(false)}, 5*60*1000);
