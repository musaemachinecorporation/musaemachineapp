function GuiTrack(guiTracks, multitrack, index, id, label, fullPath, zoom_level, current_position, images, canvas, canvasContext, current_height, TRACK_HEIGHT) {
    //var NUM_DISPLAY_BTNS = 8;
    this.TRACK_HEIGHT = TRACK_HEIGHT;
    this.REMOVE_BTN_WIDTH = 60;
    this.TRACK_CONTROL_BTNS_WIDTH = 60;
    //this.track_position = track_position;
    this.tick_width = 60;
    //var tick_width = this.tick_width;
    this.guiTracks = guiTracks;
    this.multitrack = multitrack;
    this.index = index;
    this.id = id;
    this.label = label;
    this.fullPath = fullPath;
    this.canvas_width = $("#tracks").width();
    this.zoom_level = zoom_level;
    this.current_position = current_position;


    this.images = images;
    this.canvas = canvas;
    this.canvasContext = canvasContext;
    this.colorToggle = [];

    this._updateMultiTrack();

    this.drawTrack(current_height, zoom_level, current_position);
    //this.resetCanvas(this.canvas_width, this.zoom_level);
}


GuiTrack.prototype.drawTrack = function (current_height, zoom_level, current_position) {
    this.current_height = current_height
    this.zoom_level = zoom_level;
    this.current_position = current_position;
    this._createCanvasButtons();
    this._drawTrackWaveform();
}
/*GuiTrack.prototype.resetCanvas = function(canvas_width, zoom_level) {
    this.canvas_width = canvas_width;
    this.zoom_level = zoom_level;

    this._createCanvasButton();
    this._drawTrackWaveform();
}*/

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

GuiTrack.prototype._drawTrackWaveform = function (){
    var canvasContext = this.canvasContext;
    var canvas = this.canvas;
    var zm_lvl = (1 << this.zoom_level)
    var tick_width = this.tick_width/zm_lvl;
    var current_height = this.current_height;
    var TRACK_HEIGHT = this.TRACK_HEIGHT;
    var colorToggle = this.colorToggle;
    var canvas_width = $("#tracks").width() - this.REMOVE_BTN_WIDTH - this.TRACK_CONTROL_BTNS_WIDTH;
    var current_position = this.current_position;

    var j = 0
    for (; j*tick_width < canvas_width-tick_width; j++) {
       if (colorToggle[j+current_position*zm_lvl]){
          canvasContext.fillStyle = 'gray';
      }else {
          canvasContext.fillStyle = 'white';
      }
      canvasContext.beginPath();
      canvasContext.rect(this.TRACK_CONTROL_BTNS_WIDTH+j*tick_width, current_height, tick_width, TRACK_HEIGHT);
      canvasContext.fill();
    }

    var tw = canvas_width - (j*tick_width);
    if (tw > 0){
        if (colorToggle[j+current_position*zm_lvl]){
          canvasContext.fillStyle = 'gray';
        }else {
          canvasContext.fillStyle = 'white';
        }
        canvasContext.beginPath();
        canvasContext.rect(this.TRACK_CONTROL_BTNS_WIDTH+j*tick_width, current_height, tw, TRACK_HEIGHT);
        canvasContext.fill();
    }
}

GuiTrack.prototype._toggleColor = function (toggle_location_x, j){
    var id = this.id;
    var canvas = this.canvas;
    var canvasContext = this.canvasContext;
    var canvas_width = $("#tracks").width()-this.TRACK_CONTROL_BTNS_WIDTH - this.REMOVE_BTN_WIDTH;
    var colorToggle = this.colorToggle;
    var current_height = this.current_height;
    var tick_width = this.tick_width;
    var TRACK_HEIGHT = this.TRACK_HEIGHT;
    var TRACK_CONTROL_BTNS_WIDTH = this.TRACK_CONTROL_BTNS_WIDTH;
    var multitrack = this.multitrack;
    j += this.current_position;

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
    if (toggle_location_x + tick_width > canvas_width){
            var tw = canvas_width-toggle_location_x;
            canvasContext.beginPath();
            canvasContext.rect(TRACK_CONTROL_BTNS_WIDTH+toggle_location_x, current_height, tw, TRACK_HEIGHT);
            canvasContext.fill();
    }else{
        canvasContext.beginPath();
        canvasContext.rect(TRACK_CONTROL_BTNS_WIDTH+toggle_location_x, current_height, tick_width, TRACK_HEIGHT);
        canvasContext.fill();
    }
}

GuiTrack.prototype._createCanvasButtons = function() {
    this.canvasContext.drawImage(this.images['audio_icons_set'], 270, 0, 90, 90, 0, this.current_height + 0, 60, 60);
    this.canvasContext.drawImage(this.images['audio_icons_set'], 360, 0, 90, 90, 0, this.current_height + 60, 60, 60);
    this.canvasContext.drawImage(this.images['audio_icons_set'], 90, 180,90, 90, 0, this.current_height + 120, 60, 60);
    this.canvasContext.drawImage(this.images['audio_icons_set'], 450,270,90, 90, $("#tracks").width()-this.REMOVE_BTN_WIDTH, this.current_height + 60, 60, 60);
}

GuiTrack.prototype.removeSelf = function() {
    this.multitrack.removeTrack(this.id);
    this.guiTracks.removeTrack(this.index)
}

GuiTrack.prototype.clickedOnTrack = function (mouseX, mouseY){
    if (mouseX < this.TRACK_CONTROL_BTNS_WIDTH){
        //Do nothing for right now
    }else if (mouseX > $("#tracks").width()-this.REMOVE_BTN_WIDTH && mouseY > 60 && mouseY < 120){
        this.removeSelf();
    }else{
        var j = Math.floor((mouseX - this.TRACK_CONTROL_BTNS_WIDTH)/this.tick_width);
        var toggle_location_x = j*this.tick_width;
        this._toggleColor(toggle_location_x, j);
    }
}