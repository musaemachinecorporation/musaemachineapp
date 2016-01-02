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

function TrackCanvas(id) {
    this.id = id;
    th = this;

    this.init() = function (){
      //get track-canvases and vars needed to create rect buttons
      var track_canvases = $('#track-canvases');
      var trackDiv = $('<div/>', { id: 'track'+id});

      this.canvas = $('<canvas/>', { id: 'canvas'+id});

      this.canvasContext = canvas.get(0).getContext( '2d' );
      this.canvasContext.beginPath();
      this.canvasContext.lineWidth = 2;
      this.canvasContext.strokeStyle = 'black';
      this.canvasContext.fillStyle = 'white';

      trackDiv.append(canvas);
      track_canvases.append(trackDiv);

      $("#track"+id).mousedown(function(eventObject) {
        var mouseX = eventObject.offsetX;
        var mouseY = eventObject.offsetY;

        // if on canvas and greater than a check value
        var j = 0;
        var w = th.canvas.width();
        for (var checkValue = tickWidth; checkValue <= w; checkValue += tickWidth){
            if (mouseX < checkValue) {
              toggleColor(tickWidth, height, checkValue, j, th.id);
              break;
            }
            j++;
        }
      });
    }
}