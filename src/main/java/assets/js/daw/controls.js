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

//The GUI Controls For the Multitrack
function Controls (multitrack) {

  this.multitrack = multitrack;
  var colorToggle = [];

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

  function toggleColor(width, height, checkValue, j, id){
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
    canvasContext.rect(checkValue-width, 0, width, height);
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

                  //var track_html = createTrackHTML(ui);
                  //$("#tracks").append(track_html);

                  //get track-canvases and vars needed to create rect buttons
                  var track_canvases = $('#track-canvases');
                  var trackDiv = $('<div/>', { id: 'track'+ui.item.id});

                  var rm_btns = $("#track-rm-btns")
                  var rm_btn = $("<div\>",{class:"remove-btn",id:"rm-btn"+ui.item.id});
                    var rm_text = $("<p\>",{class:"text-center"});
                        var rm_minus = $("<i\>",{class:"icon icon-remove-sign"});
                  rm_text.append(rm_minus);
                  rm_btn.append(rm_text);
                  rm_btns.append(rm_btn);

                  var track_controls = $("#track-controls");
                  var track_control = $("<div/>",{id:'tcontrol'+ui.item.id,class:'trackBox'});
                  var volume_slider = $("<div/>", {class:"volume-slider", id:"volumeSlider"+ui.item.id});
                  var track_title= $("<p/>", {class: "track-title",
                                                id:"track"+ui.item.id+"title", html:ui.item.label });
                  var track_c_btns = $("<div/>", {class:"btn track-btns"});
                    var solo = $("<button\>",{type:"button",class:"btn",id:"solo"+ui.item.id});
                        var headphone = $("<i\>",{class:"icon icon-headphones"});
                    var mute = $("<button/>",{type:"button",class:"btn",id:"mute"+ui.item.id});
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

                  canvas = $('<canvas/>', { id: 'canvas'+ui.item.id});
                  canvasContext = canvas.get(0).getContext( '2d' );
                  trackDiv.append(canvas);
                  track_canvases.append(trackDiv);


                  var width = track_canvases.width();
                  var height = 117;
                  var scrollBarHeight = 30;
                  /*if (track_control.height() > 0)
                    scrollBarHeight = 0;*/
                  var next_height = track_controls.height()+height+5;
                  track_canvases.height(next_height+scrollBarHeight);
                  track_controls.height(next_height);
                  rm_btns.height(next_height);


                  $(document).ready(function() {
                    canvas.resizeCanvas(width*2,height);
                  });

                  canvasContext.beginPath();
                  canvasContext.lineWidth = 2;
                  canvasContext.strokeStyle = 'black';
                  canvasContext.fillStyle = 'white';

                  var tickWidth = width/multitrack.ticksPerLoop;
                  for (var j = 0; j < multitrack.ticksPerLoop*2; j++) {
                    //console.log("Generating Canvas Button " + j);
                    canvasContext.rect(0+j*tickWidth, 0, tickWidth, height);
                  }
                  canvasContext.fill();
                  canvasContext.stroke();

                  colorToggle[ui.item.id]= ([0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0]);




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

                  multitrack.createTrack(ui.item.fullPath, ui.item.id);

                  $("#track"+ui.item.id).mousedown(function(eventObject) {
                      var mouseX = eventObject.offsetX;
                      var mouseY = eventObject.offsetY;

                      // if on canvas and greater than a check value
                      j = 0;
                      var w = canvas.width();
                      for (var checkValue = tickWidth; checkValue <= w; checkValue += tickWidth){
                          if (mouseX < checkValue) {
                            toggleColor(tickWidth, height, checkValue, j, ui.item.id);
                            break;
                          }
                          j++;
                      }
                  });

                  $('#rm-btn'+ui.item.id).mousedown(function(event){
                        event.preventDefault();
                        var current_height = track_controls.height();
                      if (current_height <= height+5){
                        track_canvases.height(0);
                        track_controls.height(0);
                        rm_btns.height(0);
                      }else{
                        var prev_height = current_height - (height+5);
                        track_canvases.height(prev_height+scrollBarHeight);
                        track_controls.height(prev_height);
                        rm_btns.height(prev_height);
                      }

                      multitrack.removeTrack(ui.item.id);
                      $('#tcontrol'+ui.item.id).remove();
                      $('#track'+ui.item.id).remove();
                      $('#rm-btn'+ui.item.id).remove();
                      track_controls.hide().show(0);
                      track_canvases.hide().show(0);
                      rm_btns.hide().show(0);
                  });

                  $("#volumeSlider"+ui.item.id).slider({
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

                  $("#mute"+ui.item.id).click(function(){
                    $(this).button('toggle');
                    var muteTrackNumber = 1;//$(this).attr('id').split('mute')[1];
                    $('body').trigger('mute-event', muteTrackNumber);
                  });
                  $("#solo"+ui.item.id).click(function(){
                    $(this).button('toggle');
                    var soloTrackNumber = 1;//$(this).attr('id').split('solo')[1];
                    $('body').trigger('solo-event', soloTrackNumber);
                  });
                  $("#track"+ui.item.id+"title").storage({
                    storageKey : 'track'+ui.item.id
                  });
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