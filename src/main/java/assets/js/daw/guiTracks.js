function GuiTracks (multitrack) {
  this.multitrack = multitrack;
  this.playing = false;
  this.zoom_level = 5;
  this.TRACK_HEIGHT = 180;
  this.SEQUENCER_CONTROLS_HEIGHT = 90;
  this.images = [];
  this.tracksByIndex = [];
  this.tracksById = [];
  this.canvas = null;
  this.canvasContext = null;
  this.current_height = 90;
  this.current_index = 0;
  this.current_position = 0; //starting j value for the display position of the track
  this.current_track = 0; //track to start drawing from

  this.initializeCanvasContext();
  this.initializeImages();
  th = this;
  this.images['audio_icons_set'].onload = function (event) {
    th.drawButtons();
  }
  this.images['zoom_out'].onload = function (event) {
    th.drawButtons();
  }
  this.images['zoom_in'].onload = function (event) {
    th.drawButtons();
  }
  this.images['swipe'].onload = function (event) {
    th.drawButtons();
  }
  this.canvas_clicked = false;
  this.initializeEventHandlers();
}

GuiTracks.prototype.drawTracks = function(){
    this.canvasContext.clearRect(0, 0, this.canvas.width(), this.canvas.height());
    this.drawButtons();
    for (var i = this.current_track; i < this.current_index; i++)
        this.tracksByIndex[i].drawTrack(this.TRACK_HEIGHT*(i - this.current_track)+this.SEQUENCER_CONTROLS_HEIGHT,
                                            this.zoom_level,    this.current_position);
}

GuiTracks.prototype.addTrack = function (id, label, fullPath) {

    this.tracksByIndex[this.current_index] = new GuiTrack(this, this.multitrack, this.current_index,
                                        id, label, fullPath, this.zoom_level, this.current_position,
                                        this.images, this.canvas, this.canvasContext, this.current_height, this.TRACK_HEIGHT);

    this.tracksById[id] = this.tracksByIndex[this.current_index];
    this.current_height += this.TRACK_HEIGHT;
    this.current_index++;
}

GuiTracks.prototype.removeTrack = function(index){
    delete this.tracksById[this.tracksByIndex[index].id];
    delete this.tracksByIndex[index];
    this.current_height -= this.TRACK_HEIGHT;
    this.current_index--; //points to the track after the last index
    for (; index < this.current_index; index++)
        this.tracksByIndex[index] = this.tracksByIndex[index+1];
    this.drawTracks();
}

GuiTracks.prototype.initializeCanvasContext = function (){
    this.canvas = $('#tracks');
    this.canvasContext = this.canvas.get(0).getContext('2d');
}

GuiTracks.prototype.initializeImages = function () {
    this.images['audio_icons_set'] = new Image();
    this.images['audio_icons_set'].src = '/assets/images/audio_icons_set.png';
    this.images['zoom_in'] = new Image();
    this.images['zoom_in'].src = '/assets/images/zoom_in.png';
    this.images['zoom_out'] = new Image();
    this.images['zoom_out'].src = '/assets/images/zoom_out.png';
    this.images['swipe'] = new Image();
    this.images['swipe'].src = '/assets/images/swipe.png';
}

GuiTracks.prototype.initializeEventHandlers = function () {
    var th = this;
    $("#tracks").mousedown(function(event) {
        event.preventDefault()
        if (th.canvas_clicked === false) {
            th.canvas_clicked = true;
            var mouseX = event.offsetX;
            var mouseY = event.offsetY;
            if (mouseY < th.SEQUENCER_CONTROLS_HEIGHT){
                if (mouseX < 180 && mouseX > 90) { //play button
                    if (th.playing === false){
                        th.playing = true;
                        th.multitrack.play();
                        th.canvasContext.drawImage(th.images['audio_icons_set'], 270, 90, 90, 90, 90, 0, 90, 90);
                    }else{
                        th.playing = false;
                        th.multitrack.play();//need to add pause &stop
                        th.canvasContext.drawImage(th.images['audio_icons_set'], 180, 90, 90, 90, 90, 0, 90, 90);
                    }
                }else if (mouseX > th.canvas.width()-135 && mouseX < th.canvas.width()-90) {//zoom btns
                    if (mouseY < 45){   //zoom_in
                        (th.zoom_level < 1) ? th.zoom_level = 0 : th.zoom_level--;
                        th.drawTracks();
                    }else { //zoom_out
                        th.zoom_level++;
                        th.drawTracks();
                    }
                    console.log("zoom_level = " + th.zoom_level);
                }else if (mouseX > th.canvas.width()-90){ //swipe control
                    if (mouseY < 30 && mouseX > th.canvas.width()-60 && mouseX < th.canvas.width()-30){ //swipe up
                        (th.current_track < 1) ? th.current_track = 0 : th.current_track--;
                        th.drawTracks();
                    }else if (mouseY > 60 && mouseX > th.canvas.width()-60 && mouseX < th.canvas.width()-30){ //swipe down
                        (th.current_track > th.current_index-2) ? th.current_track = th.current_index-1: th.current_track++;
                        th.drawTracks();
                    }else if (mouseX < th.canvas.width()-60 &&  mouseX > th.canvas.width()-90
                                && mouseY < 90              &&  mouseY > 30){ //swipe left
                        (th.current_position < 1) ? th.current_position = 0 : th.current_position--;
                        th.drawTracks();
                    }else if (mouseX > th.canvas.width()-30
                             && mouseY < 90                 &&  mouseY > 30){ //swipe right
                        th.current_position++;
                        th.drawTracks();
                    }
                }
            }
            else {
                mouseY -= th.SEQUENCER_CONTROLS_HEIGHT;
                var clicked_index = Math.floor(mouseY/th.TRACK_HEIGHT);
                if (clicked_index < th.current_index)
                    th.tracksByIndex[clicked_index].clickedOnTrack(mouseX,mouseY%th.TRACK_HEIGHT);
            }
        }
    });
    $("#tracks").mouseup(function(event){
        event.preventDefault()
        th.canvas_clicked = false;
    });
    /*$("#tracks").bind('dblclick', function(event){
        event.preventDefault();
        return false;
    });*/
}

GuiTracks.prototype.drawButtons = function () {
    this.canvasContext.drawImage(this.images['audio_icons_set'], 90, 90, 90, 90, 0, 0, 90, 90);
    this.canvasContext.drawImage(this.images['audio_icons_set'], 180, 90, 90, 90, 90, 0, 90, 90);
    this.canvasContext.drawImage(this.images['audio_icons_set'], 360, 90, 90, 90, 180, 0, 90, 90);
    this.canvasContext.drawImage(this.images['audio_icons_set'], 450, 90, 90, 90, 270, 0, 90, 90);
    this.canvasContext.drawImage(this.images['zoom_in'], 0, 0, 128, 128, this.canvas.width()-135, 0, 45, 45);
    this.canvasContext.drawImage(this.images['zoom_out'], 0, 0, 128, 128, this.canvas.width()-135, 45, 45, 45);
    this.canvasContext.drawImage(this.images['swipe'], 0, 0, 128, 128, this.canvas.width()-90, 0, 90, 90);
}