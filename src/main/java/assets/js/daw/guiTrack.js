function GuiTrack(id, label, height, scroll_bar_height, offset){
    var th = this;
    this.addTrack = function(){
        if (th.height===null){
            console.log("Please init before you call addTrack");
        }
        var track_canvases = $("#track-canvases");
        var canvas_width = track_canvases.width();
        var rm_btns = $('#track-rm-btns');
        var track_controls = $('#track-controls');
        var next_height = $('#track-controls').height()+th.height+th.offset;

        track_canvases.height(next_height+scroll_bar_height);
        track_controls.height(next_height);
        rm_btns.height(next_height);


        var canvasContext = this.trackCanvas.canvasContext;
        var canvas = this.trackCanvas.canvas;
        var tickWidth = canvas_width/multitrack.ticksPerLoop;
        for (var j = 0; j < multitrack.ticksPerLoop*2; j++) {
          //console.log("Generating Canvas Button " + j);
          canvasContext.rect(0+j*tickWidth, 0, tickWidth, height);
        }
        canvasContext.fill();
        canvasContext.stroke();

        $(document).ready(function() {
            canvas.resizeCanvas(canvas_width*2,height);
        });
   }

   this.init(){
      this.trackCanvas = new TrackCanvas(id);
      this.trackCanvas.init()
      this.trackControl = new TrackControl(id, label);
      this.trackControl.init()
      this.removeBtn = new RemoveBtn(id, height, scroll_bar_height, offset);
      this.removeBtn.init()
      this.offset = offset;
      this.colorToggle[id]= ([ 0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
                              0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
                              0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,
                              0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0]);

   }
}
