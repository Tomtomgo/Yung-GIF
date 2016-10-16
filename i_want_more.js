/*
  This is for setting options. It's okay to cry.
*/

$(document).ready(function(){
  // first draw
  draw_sources();

  // listeners for creation
  $(document).on('click', "#new_source .add", function(data){
    source = {'url': $("#new_source .url")[0].value,
              'limit': $("#new_source .limit")[0].value}
    sid = "sources_" + (Math.random() / +new Date()).toString(36).replace(/[^a-z]+/g, '');

    set_source(source, sid);
    draw_sources(); // redraw
    $("#new_source .url").val("");
    $("#new_source .limit").val(25);
  });

  // listener for editing
  $(document).on('input', "#sources input", function(data){
    sid = $(data.currentTarget).parent().attr('id')
    source = {'url': $("#"+sid+" .url")[0].value,
              'limit': $("#"+sid+" .limit")[0].value}
    set_source(source, sid)
  });

  // destructs
  $(document).on('click', ".source .destroy", function(data){
    sid = $(data.currentTarget).parent().attr('id');
    remove_source(sid);
    draw_sources(); // redraw!
  });

  // Close the window and send a message to Yung GIF to check the reddits
  $(document).on('click', "#ok", function(e){
    window.close()
  })

  $(window).on('beforeunload', function(e){
    chrome.runtime.sendMessage('checknow!');
  })
});

function set_source(source, sid){
  sources = JSON.parse(localStorage['YUNG_GIF_sources'])
  sources[sid] = source;
  localStorage['YUNG_GIF_sources'] = JSON.stringify(sources)
}

function remove_source(sid){
  sources = JSON.parse(localStorage['YUNG_GIF_sources'])
  delete sources[sid]
  localStorage['YUNG_GIF_sources'] = JSON.stringify(sources)
}

// Just read the sources again and redraw everything
function draw_sources(){
  sources = JSON.parse(localStorage['YUNG_GIF_sources']);

  templ = $("#template_source");
  $("#sources").empty()

  $.each(sources, function(i,source){
    clone_templ = templ.clone()
    clone_templ.attr('id', i)
    clone_templ.children(".url").val(source.url)
    clone_templ.children(".limit").val(source.limit)
    clone_templ.css('display', "block")
    $("#sources").append(clone_templ)
  });
}