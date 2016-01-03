(function($) {
  $.fn.extend({
      //Let the user resize the canvas to the size he/she wants
      resizeCanvas:  function(w, h) {
          var c = $(this)[0]
          c.width = w;
          c.height = h
      }
  })
})(jQuery)
function GuiTrack(multitrack, id, label, fullPath, TRACK_HEIGHT, SCROLL_BAR_HEIGHT, OFFSET, canvas_width, zoom_level) {
    var NUM_DISPLAY_BTNS = 8;
    this.tick_width = $("#track-canvases").width()/NUM_DISPLAY_BTNS;
    //var tick_width = this.tick_width;
    this.multitrack = multitrack;
    this.id = id;
    this.label = label;
    this.fullPath = fullPath;
    this.TRACK_HEIGHT = TRACK_HEIGHT;
    this.SCROLL_BAR_HEIGHT = SCROLL_BAR_HEIGHT;
    this.OFFSET = OFFSET;
    this.canvas_width = canvas_width;
    this.zoom_level = zoom_level;



    this.canvas = null
    this.canvasContext = null
    this.colorToggle = [];

    this._createHtml();

    this._addEventHandlers();

    this._increaseHeightOfContainers();

    this._updateMultiTrack();

    this.resetCanvas(this.canvas_width, this.zoom_level);

}

GuiTrack.prototype.resetCanvas = function(canvas_width, zoom_level) {
    this.canvas_width = canvas_width;
    this.zoom_level = zoom_level;
    var TRACK_HEIGHT = this.TRACK_HEIGHT;
    var canvas = this.canvas;

    canvas.resizeCanvas(canvas_width,TRACK_HEIGHT);
    this._drawTrackBtns();
}


GuiTrack.prototype._updateMultiTrack = function() {
    var multitrack = this.multitrack;
    var id = this.id;
    var fullPath = this.fullPath;
    // NOTE: THIS RELIES ON THE MONKEYPATCH LIBRARY BEING LOADED FROM
    // Http://cwilso.github.io/AudioContext-MonkeyPatch/AudioContextMonkeyPatch.js
    // TO WORK ON CURRENT CHROME!!  But this means our code can be properly
    // spec-compliant, and work on Chrome, Safari and Firefox.

    //audioContext = multitrack.audioCtx;

    // if we wanted to load audio files, etc., this is where we should do it.

    //window.onorientationchange = this.resetCanvas;
    //window.onresize = this.resetCanvas;

    //requestAnimFrame(draw);    // start the drawing loop.

    multitrack.timerWorker = new Worker("assets/js/daw/metronomeworker.js");

    multitrack.timerWorker.onmessage = function(e) {
      if (e.data == "tick") {
          // console.log("tick!");
          multitrack.scheduler();
      }
      else
          console.log("message: " + e.data);
    };
    multitrack.timerWorker.postMessage({"interval": multitrack.lookahead});

    multitrack.createTrack(fullPath, id);
}

GuiTrack.prototype._drawTrackBtns = function (){
    var canvasContext = this.canvasContext;
    var canvas = this.canvas;
    var tick_width = this.tick_width/(1 << this.zoom_level);
    var th = this;
    var TRACK_HEIGHT = this.TRACK_HEIGHT;
    var OFFSET = this.OFFSET;
    var SCROLL_BAR_HEIGHT = this.SCROLL_BAR_HEIGHT;
    var colorToggle = this.colorToggle;

    for (var j = 0; j*tick_width < th.canvas_width; j++) {
       if (colorToggle[j]){
          canvasContext.fillStyle = 'gray';
      }else {
          canvasContext.fillStyle = 'white';
      }
      canvasContext.beginPath();
      canvasContext.rect(j*tick_width, 0, tick_width, TRACK_HEIGHT);
      canvasContext.fill();
    }
}

GuiTrack.prototype._increaseHeightOfContainers = function() {
    var canvasContext = this.canvasContext;
    var canvas = this.canvas;
    var tick_width = this.tick_width;
    var canvas_width = this.canvas_width;
    var TRACK_HEIGHT = this.TRACK_HEIGHT;
    var OFFSET = this.OFFSET;
    var SCROLL_BAR_HEIGHT = this.SCROLL_BAR_HEIGHT;

    var track_canvases = $("#track-canvases");
    var canvas_width = track_canvases.width();
    var rm_btns = $('#track-rm-btns');
    var track_controls = $('#track-controls');
    var next_height = $('#track-controls').height()+TRACK_HEIGHT+OFFSET;

    track_canvases.height(next_height+SCROLL_BAR_HEIGHT);
    track_controls.height(next_height);
    rm_btns.height(next_height+SCROLL_BAR_HEIGHT);
}

GuiTrack.prototype._toggleColor = function (checkValue, j){
    var id = this.id;
    var canvas = this.canvas;
    var canvasContext = this.canvasContext;
    var colorToggle = this.colorToggle;
    var tick_width = this.tick_width;
    var TRACK_HEIGHT = this.TRACK_HEIGHT;
    var multitrack = this.multitrack;
    var zm_lvl = (1 << this.zoom_level)
    var index;

    //if completely clicked gray then turn white else turn gray
    var empty_count = 0;
    for (var i = 0; i < zm_lvl; i++){
        index = j*zm_lvl+i
        if (!colorToggle[index]){
            empty_count++
            break;
        }
    }
    if (empty_count !== 0){
        canvasContext.fillStyle = 'gray';
        for (var i = 0; i < zm_lvl; i++){
            index = j*zm_lvl+i;
            colorToggle[index] = 1;
            multitrack.createSourceNode(id,index);
        }
    }else {
        canvasContext.fillStyle = 'white';
        for (var i = 0; i < zm_lvl; i++){
            index = j*zm_lvl+i;
            delete colorToggle[index];
            multitrack.removeSourceNode(id,index);
        }
    }
    canvasContext.beginPath();
    canvasContext.rect(checkValue-tick_width, 0,tick_width, TRACK_HEIGHT);
    canvasContext.fill();
}

///Create html for track in three seperate divs,
            //track-canvases, track-controls, rm-btns
GuiTrack.prototype._createHtml = function () {
    var id = this.id;
    var label = this.label;
    var TRACK_HEIGHT = this.TRACK_HEIGHT;

    //////////////Make Track Canvas//////////////////////////////////////
    //Storing variables while making canvas based on screen size
    this.canvas = $('<canvas/>', { id: 'canvas'+id});
    var canvas = this.canvas;

    this.canvasContext = canvas.get(0).getContext('2d');

    var track_canvases = $('#track-canvases');
    var trackDiv = $('<div/>', {id:'track'+id,class:"track"});
    trackDiv.append(canvas);
    track_canvases.append(trackDiv);
    ////////////////////////////////////////////////////////////////////


    //////////////Make Track Controls////////////////////////////////////
    var track_controls = $("#track-controls");
    var track_control = $("<div/>",{id:'tcontrol'+id,class:'trackBox'});
    var volume_slider = $("<div/>", {class:"volume-slider", id:"volumeSlider"+id});
    var track_title= $("<p/>", {class: "track-title",
                                id:"track"+id+"title", html:label });
    var track_c_btns = $("<div/>", {class:"btn track-btns"});
    var solo = $("<button\>",{type:"button",class:"btn",id:"solo"+id});
    var headphone = $("<i\>",{class:"icon icon-headphones"});
    var mute = $("<button/>",{type:"button",class:"btn",id:"mute"+id});
    var volume_off = $("<i\>",{class:"icon icon-volume-off"});
    var record = $("<button\>",{type:"button",class:"btn ",id:"record"});
    var plus_circle = $("<i/>",{class:"icon icon-plus-sign"});
    solo.append(headphone);
    mute.append(volume_off);
    record.append(plus_circle);
    track_c_btns.append(solo);
    track_c_btns.append(mute);
    track_c_btns.append(record);

    track_control.append(volume_slider);
    track_control.append(track_title);
    track_control.append(track_c_btns);

    track_controls.append(track_control);
    /////////////////////////////////////////////////////////////////

    /////////////Make Remove Button//////////////////////////////////
    var rm_btns = $("#track-rm-btns")
    var rm_btn = $("<div\>",{class:"remove-btn",id:"rm-btn"+id});
    var rm_text = $("<p\>",{class:"text-center"});
    var rm_minus = $("<i\>",{class:"icon icon-remove-sign"});
    rm_text.append(rm_minus);
    rm_btn.append(rm_text);
    rm_btns.append(rm_btn);
    var next_seq_pg_btn = $("#next-sequencer-page");
    next_seq_pg_btn.remove();
    rm_btns.append(next_seq_pg_btn);
    next_seq_pg_btn.show(0);
    //////////////////////////////////////////////////////////////////
}

GuiTrack.prototype._addEventHandlers = function() {
    var id = this.id;
    var TRACK_HEIGHT = this.TRACK_HEIGHT;
    var SCROLL_BAR_HEIGHT = this.SCROLL_BAR_HEIGHT;
    var OFFSET = this.OFFSET;
    var tick_width = this.tick_width;

    //objects
    var multitrack = this.multitrack;
    var th = this;


    $("#track"+id).mousedown(function(eventObject) {
        var mouseX = eventObject.offsetX;
        var mouseY = eventObject.offsetY;

        // if on canvas and greater than a check value
        var j = 0;
        for (var checkValue = tick_width; checkValue <= th.canvas_width; checkValue += tick_width){
            if (mouseX < checkValue) {
              th._toggleColor(checkValue, j);
              break;
            }
            j++;
        }
    });

    $("#volumeSlider"+id).slider({
        value: 80,
        orientation: "vertical",
        range: "min",
        min: 0,
        max: 100,
        height: 100,
        animate: true,
        slide: function( event, ui ) {
            var muteTrackNumber = 0;//$(this).attr('id').split('volumeSlider')[1];
            setTrackVolume(muteTrackNumber, ui.value );
            $( "#amount" ).val( ui.value );
              $(this).find('.ui-slider-handle').text(ui.value);
        },
        create: function(event, ui) {
            var v=$(this).slider('value');
              $(this).find('.ui-slider-handle').text(v);
          }
    });

    $("#mute"+id).click(function(){
        $(this).button('toggle');
        var muteTrackNumber = 1;//$(this).attr('id').split('mute')[1];
        $('body').trigger('mute-event', muteTrackNumber);
    });
    $("#solo"+id).click(function(){
        $(this).button('toggle');
        var soloTrackNumber = 1;//$(this).attr('id').split('solo')[1];
        $('body').trigger('solo-event', soloTrackNumber);
    });
    $("#track"+id+"title").storage({
        storageKey : 'track'+id
    });

    $('#rm-btn'+id).mousedown(function(event){
        event.preventDefault();
        var track_controls = $('#track-controls');
        var track_canvases= $('#track-canvases');
        var track_rm_btns = $('#track-rm-btns');

        var current_height = track_controls.height();
      if (current_height <= TRACK_HEIGHT+OFFSET){
        track_canvases.height(0);
        track_controls.height(0);
        track_rm_btns.height(0);
        $("#next-sequencer-page").hide();
      }else{
        var prev_height = current_height - (TRACK_HEIGHT+OFFSET);
        track_canvases.height(prev_height+SCROLL_BAR_HEIGHT);
        track_controls.height(prev_height);
        track_rm_btns.height(prev_height);
      }

      multitrack.removeTrack(id);
      $('#tcontrol'+id).remove();
      $('#track'+id).remove();
      $('#rm-btn'+id).remove();
      track_canvases.hide().show(0);
      track_controls.hide().show(0);
      track_rm_btns.hide().show(0);
    });
}