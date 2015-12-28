//Dynamicly Create and Add Track Html Code
function createTrackHTML(ui){
        var track_html = '';
        track_html += "<div class=\"row-fluid\" id=\"selectTrack"+ui.item.id+"\""
        track_html += "data-userNames='"
        for (user in ui.item.userNames) {
            track_html += user +" ";
        }
        track_html += "' ";
        track_html += "data-title='" + ui.item.label + "' ";
        track_html += "data-fullPath='" + ui.item.fullPath + "' ";
        track_html += "data-duration='" + ui.item.value+"' >";
        track_html += "<div class=\"span2 trackBox\" >";
        track_html += "<div class\"volume-slider \" id=\"volumeSlider"+ui.item.id+"\"></div>";
        track_html += "<p class=\"track-title \" id=\"track"+ui.item.id+"title\">";
        track_html += ui.item.label+"</p>";

        track_html += "<div class=\"btn-mini track-btns\" >";
        track_html += "<button type=\"button\" class=\"btn btn-mini \" id=\"solo"+ui.item.id+"\">";
        track_html += "<i class=\"fa fa-headphones\"></i></button>";

        track_html += "<button type=\"button\" class=\"btn btn-mini \" id=\"mute"+ui.item.id+"\">";
        track_html += "<i class=\"fa fa-volume-off\"></i></button>";

        track_html += "<button type=\"button\" class=\"btn btn-mini \" data-toggle=\"button\" id =\"record"+"\">";
        track_html += "<i class=\"fa fa-plus-circle\"></i></button></div></div>";

        track_html += "<div "+"\" class=\"span9 track\"></div>";
        track_html += "<div class=\"span1 remove-btn\"  "+"\">";
        track_html += "<p class=\"text-center\"><i class=\"fa fa-minus-circle\"></i></p></div></div>";
        return track_html;
}

//Code To Be Executed on Load
$(function() {

  'use strict';

  //vars for sequencer
  var
        sequencer = window.sequencer,
        console = window.console,
        createSlider = sequencer.util.createSlider,
        slice = Array.prototype.slice,

        snapValue,
        userInteraction = false,

        //btnStop = $('#stop'),
        btnPlay = $('#play'),
        btnLoop = $('#step-backward'),
        selectSnap = $('#stop'),
        sliderPlayhead,
        sliderLeftLocator,
        sliderRightLocator;

  //load sample pack, the sample pack contains a loop
  sequencer.ready(function (){
        sequencer.addSamplePack({
            mapping: {
                id: "http://localhost:8080/assets/src_js/data/samples/fhg_bassloop_125_jzzfunk_A.wav"
            },
            name: 'fhg_bassloop_125_jzzfunk_A'
        },init)
  });

  function init(){
        var track, part, song, event, events = [];

        track = sequencer.createTrack();
        part = sequencer.createPart();

        event = sequencer.createAudioEvent({
            ticks: 0,
            velocity: 70,
            sampleOffsetTicks: 0,
            sampleOffsetMillis: 0,
            path: 'src_js/data/samples/fhg_bassloop_125_jzzfunk_A.wav',
            /*
            with durationTicks you can easily trim the length of an audio event,
            in this case we set the length to the length of the sample which is
            the same as omitting this key altogether
            */
            durationTicks: 960*16//?
        });
        events.push(event);
        part.addEvents(events);
        track.addPart(part);
        song = sequencer.createSong({
            bmp: 120,
            useMetronome: true,
            tracks: track,
            loop: true,
            bars: 8
        });

        btnPlay.click(function() {
            if(song.playing){
                song.stop();
            }else{
                song.play();
            }
            //btnPlay.value = song.playing === true ? 'pause' : 'play';
        });

        /* btnLoop.addEventListener('click', function(){
        /*
            You can pass "true" and "false" to song.setLoop()

            If you don't pass a value it will toggle the loop state of the song.

            Note that turning the loop on doesn't mean that the song will actually loop; the left and right
            locators have to be set and the left locator should be placed before the right locator.

            song.setLoop();
            this.value = song.loop ? 'turn loop off' : 'turn loop on';
        }, false);*/
  }

  //AutoComplete
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

            $(".remove-btn").click(function(){
                $(this).parent().remove();
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
  }).focus(function() {
                event.preventDefault();
                $(this).autocomplete("search", "");
  });
});