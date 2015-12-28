//The GUI Controls For the Multitrack
function Controls (multitrack) {

  this.multitrack = multitrack;

  //Init Method When Ready To Activate Controls
  this.init = function() {
      var btnPlay = $('#play');
      var btnStop = $('#stop');

      //Add Click Command To Play
      btnPlay.click(function() {
        console.log('Start Playback')
        multitrack.play();
        //btnPlay.setAttribute('disabled', 'disabled');
      });

      //Add Click Command To Stop
      btnStop.click(function() {
        console.log('Stop Playback')
        multitrack.stop();
        //btnPlay.removeAttribute('disabled');
      });

      //Add Click Command To StepBackward


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
                if ($('#tracks').has("#selectTrack"+ui.item.id).length)
                {
                  console.log("Audio " + ui.item.id + " Already Present");
                }
                else
                {
                  console.log("Adding Audio " + ui.item.id);

                  var track_html = createTrackHTML(ui);
                  $("#tracks").append(track_html);

                  multitrack.createTrack(ui.item.fullPath, ui.item.id);

                  $(".remove-btn").click(function(){
                      $(this).parent().remove();
                      multitrack.removeTrack(ui.item.id);
                  })

                  $("#volumeSlider"+ui.item.id).slider({
                    value: 80,
                    orientation: "vertical",
                    range: "min",
                    min: 0,
                    max: 100,
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
                //$(this).autocomplete("search", "");
                return  ui.item;
             }
        }).focus(function(event) {
                      event.preventDefault();
                      $(this).autocomplete("search", "");
        });
    };
};