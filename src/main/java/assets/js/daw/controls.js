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

// First, let's shim the requestAnimationFrame API, with a setTimeout fallback
  window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function( callback ){
          window.setTimeout(callback, 1000 / 60);
      };
  })();

//The GUI Controls For the Multitrack
function Controls (multitrack) {

  var multitrack = multitrack;
  var guiTracks = new GuiTracks(multitrack);

  /*function draw() {
        var currentNote = multitrack.last16thNoteDrawn;
        var currentTime = multitrack.audioCtx.currentTime;

        while (multitrack.notesInQueue.length && multitrack.notesInQueue[0].time < currentTime) {
            currentNote = multitrack.notesInQueue[0].note;
            multitrack.notesInQueue.splice(0,1);   // remove note from queue
        }

        // We only need to draw if the note has moved.
        if (multitrack.last16thNoteDrawn != currentNote) {
            var x = Math.floor( canvas.width / 18 );
            canvasContext.clearRect(0,0,canvas.width, canvas.height);
            for (var i=0; i<16; i++) {
                canvasContext.fillStyle = ( currentNote == i ) ?
                    ((currentNote%4 === 0)?"red":"blue") : "black";
                canvasContext.fillRect( x * (i+1), x, x/2, x/2 );
            }
            multitrack.last16thNoteDrawn = currentNote;
        }

        // set up to draw again
        requestAnimFrame(draw);
    }*/


  //Init Method When Ready To Activate Controls
  this.init = function(defaultTempo) {
      var btnStop = $('#stop');

      //Add Click Command To Play
      $('#play').click(function() {
        console.log('Start Playback')
        multitrack.play();
        //btnPlay.setAttribute('disabled', 'disabled');
      });

      $("#tempo").slider({
        value: defaultTempo,
        orientation: "horizontal",
        range: "min",
        min: 10,
        max: 300,
        animate: true,
        slide: function( event, ui ) {
          // must reset the multitrack after changing the tempo
          multitrack.tempo = ui.value;
          multitrack.reset();

          $( "#amount" ).html( "Tempo: " +ui.value );
          $(this).find('.ui-slider-handle').text(ui.value);
        },
        create: function(event, ui) {

          // must reset the multitrack after changing the tempo
          multitrack.tempo = ui.value;
          multitrack.reset();

          var v=$(this).slider('value');
          $(this).find('.ui-slider-handle').text(v);
        }
      });

      $("#tracks").resizeCanvas($(window).width()-4, $(window).height()-103);
      $(window).resize(function() {
          $("#tracks").resizeCanvas($(window).width()-4, $(window).height()-103);
          guiTracks.drawTracks();
      });
      /*$("#canvas-scroll-bar-x").width($("#canvas-scroll-bar-x").width()-166);
      $("#canvas-scroll-bar-y-holder").height($(window).height()-188);
      $("#canvas-scroll-bar-y").height($(window).height()-188);
      $("#tracks").width($(window).width()-5-45).height($(window).height()-188);
      $("#canvas-scroll-bar-x").slider({
          value: 0,
          orientation: "horizontal",
          range: "max",
          min: 0,
          max: 100,
          animate: true,
          slide: function( event, ui ) {
            // must reset the multitrack after changing the tempo
            $("#track-canvases").scrollTo(Math.ceil((canvas_width-original_width)*(ui.value/100)));
          },
          create: function(event, ui) {
          }
      });
      $("#canvas-scroll-bar-y").slider({
                value: 0,
                orientation: "vertical",
                range: "max",
                min: 0,
                max: 100,
                animate: true,
                slide: function( event, ui ) {
                  // must reset the multitrack after changing the tempo
                  $("#track-canvases").scrollTo(Math.ceil((canvas_width-original_width)*(ui.value/100)));
                },
                create: function(event, ui) {
                }
            });*/
      $( "#amount" ).html( "Tempo: " + $('#tempo').slider('value') );

      $("#zoomIn").mousedown(function(event){
            if (zoom_level !== 0){
                if (zoom_level === 1){
                    zoom_level = 0;
                    //this.disabled();
                    canvas_width*=2
                } else {
                    zoom_level--;
                    canvas_width*=2
                }
                for ( id in guiTracks) {
                    guiTracks[id].resetCanvas(canvas_width, zoom_level)
                }
            }
      });

      $("#zoomOut").mousedown(function(event){
            zoom_level++
            canvas_width/=2
            for ( id in guiTracks) {
                guiTracks[id].resetCanvas(canvas_width, zoom_level)
            }
      });

      $("#track-rm-btns").on("mousedown", "#next-sequencer-page", function(event) {
            canvas_width += original_width*(2^(start_zoom-zoom_level));
            for ( id in guiTracks) {
                guiTracks[id].resetCanvas(canvas_width, zoom_level)
            }
      });


      //Add Click Command To Stop
      /*btnStop.click(function() {
        console.log('Stop Playback')
        multitrack.stop();
        //btnPlay.removeAttribute('disabled');
      });*/

      //Add Click Command To StepBackward?


      //Autocomplete Creates New Tracks With New Controls
      $( "#autocomplete" ).autocomplete({
             source: function(request, response){
                 $.ajax({
                     type: "GET",
                     url:  "/api/audioTitles.json",
                     contentType: "application/json; charset=utf-8",
                     dataType: "json",
                     success: function(data) {
                          response($.map( data.suggestions, function( item ) {
                              return {
                                label: item.title,
                                value: item.duration,
                                  fullPath: item.fullPath,
                                  userNames: item.userNames,
                                  id: item.id,
                                  uploadedat: item.uploadedAt
                              }
                          }));
                     },
                     error: function (msg) {
                         alert(msg.status + ' ' + msg.statusText);
                     }
                 });
             },
             minLength: 0,
             scroll: true,
             /*touch: function (event, ui) {
                  $(this).autocomplete("search", "");
             }*/
             select: function( event, ui ) {
                event.preventDefault();
                $( "#autocomplete" ).val("");
                var id = ui.item.id;
                if (guiTracks.tracksById[id])
                {
                  console.log("Audio " + id + " Already Present");
                }
                else
                {
                  console.log("Adding Audio " + id);

                  guiTracks.addTrack(id, ui.item.label, ui.item.fullPath);
                }
                $(this).autocomplete("search", ".");
                return  ui.item;
             }
        }).focus(function(event) {
                      event.preventDefault();
                      $(this).autocomplete("search", "");
        });
    };
};