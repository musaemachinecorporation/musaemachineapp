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

  this.multitrack = multitrack;
  var colorToggle = [];
  var removeBtns = {};
  var scroll_bar_height = 30;

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




  this.resetCanvas = function(e) {
      // resize the canvas - but remember - this clears the canvas too.
      var container = $("#track"+ui.item.id)
      canvas.width = container.width();
      canvas.height = container.height();

      //make sure we scroll to the top left.
      window.scrollTo(0,0);
  }

  function toggleColor(canvas_width, height, checkValue, j, id){
    var canvas = $('#canvas'+id).get(0);
    var canvasContext = canvas.getContext('2d');
    if (colorToggle[id][j] === 0){
        canvasContext.fillStyle = 'gray';
        colorToggle[id][j] = 1;
        multitrack.createSourceNode(id,j);
    }else {
        canvasContext.fillStyle = 'white';
        colorToggle[id][j] = 0;
        multitrack.removeSourceNode(id,j);
    }
    canvasContext.beginPath();
    canvasContext.rect(checkValue-canvas_width, 0,canvas_width, height);
    canvasContext.fill();
    canvasContext.stroke();
  }

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
      $( "#amount" ).html( "Tempo: " + $('#tempo').slider('value') );

      $("#zoomIn")mousedown(function(event){
            multitrack.zoomIn();
      });

      $("#zoomOut")mousedown(function(event){
            multitrack.zoomOut();
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
                if ($('#track-canvases').has("#track"+ui.item.id).length)
                {
                  console.log("Audio " + ui.item.id + " Already Present");
                }
                else
                {
                  console.log("Adding Audio " + ui.item.id);



                  //var canvas_width = track_canvases.width();
                  var height = 117;
                  var guiTrack = new GuiTrack(un.item.id, ui.item.label, 117, 30, 5);
                  guiTrack.init()
                  guiTrack.addTrack();


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

                  multitrack.createTrack(ui.item.fullPath, id);

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