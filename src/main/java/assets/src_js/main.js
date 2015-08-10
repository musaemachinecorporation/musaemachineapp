navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia

var micStream;
var activeRecorder;
var recordingCount = 1000;

//array of track master gain nodes
var trackMasterGains = [];
var trackVolumeGains = [];
var trackInputNodes = [];
var trackCompressors = [];
var trackReverbs = [];
var trackFilters = [];
var trackDelays = [];
var trackTremolos = [];

//the currently selected track (for editing effects etc.)
var activeTrack;

//json of effect data
var effects;

var buffers = []; //contains AudioBuffer and id# of samples in workspace
var times = []; //contains start times of samples and their id#
var reverbIRs = []
var pixelsPer16 = 6; 			//pixels per 16th note. used for grid snapping
var pixelsPer4 = 4*pixelsPer16;		//pixels per 1/4 note	used for sample canvas size
var bpm = 120;//tempo;
var secondsPer16 = 0.25 * 60 / bpm;

jQuery.removeFromArray = function(value, arr) {
    return jQuery.grep(arr, function(elem, index) {
        return elem.id !== value;
    });
};

var globalNumberOfTracks = 0;
var globalWavesurfers = [];

/*$('body').bind('playPause-event', function(e){
    schedPlay(ac.currentTime);
});
$('body').bind('stop-event', function(e){
    schedStop();
});
$('body').bind('stepBackward-event', function(e){
    schedStepBack(ac.currentTime);
});
$('body').bind('mute-event', function(e, trackNumber){
    muteTrack(trackNumber);
});
$('body').bind('solo-event', function(e, trackNumber){
    solo(trackNumber);
});*/

$('body').bind('zoomIn-event', function(e){
    timelineZoomIn();
});

$('body').bind('zoomOut-event', function(e){
    timelineZoomOut();
});

$(document).ready(function(){
    $("#playPause").click(function(){
        $('body').trigger('playPause-event');
    });
    $("#stop").click(function(){
        $('body').trigger('stop-event');
    });
    $("#step-backward").click(function(){
        $('body').trigger('stepBackward-event');
    });
    $("#zoomIn").click(function(){
        $('body').trigger('zoomIn-event');
    });
    $("#zoomOut").click(function(){
        $('body').trigger('zoomOut-event');
    });
    $("#trackEffectsClose").click(function(){
	$("#trackEffects").css("display","none");
	$("#masterControl").css("display","none");
    });


    $( "#masterVolume" ).slider({
      orientation: "vertical",
      range: "min",
      min: 0,
      max: 100,
      value: 80,
      slide: function( event, ui ) {
	setMasterVolume(ui.value );
      }
    });

    $("#addTrackButton").click(function(){
	var newTrackNumber = globalNumberOfTracks+1;
	globalNumberOfTracks++;
	createTrack(newTrackNumber);
    });

   //drawTimeline();

});

function createTrack(trackNumber){
    $("#tracks").append("<div class=\"row-fluid\" id=\"selectTrack"+trackNumber+"\">"
                                +"<div class=\"span2 trackBox\" >"
                                    +"<div class\"volume-slider \" id=\"volumeSlider"+trackNumber+"\"></div>"
                                    +"<p class=\"track-title \" id=\"track"+trackNumber+"title\">"
                                    +"Track"+trackNumber+"</p>"

                                    +"<div class=\"btn-mini track-btns\" >"
                                        +"<button type=\"button\" class=\"btn btn-mini \" id = \"solo"+trackNumber+"\">"
                                        +"<i class=\"fa fa-headphones\"></i></button>"

                                        +"<button type=\"button\" class=\"btn btn-mini \" id = \"mute"+trackNumber+"\">"
                                        +"<i class=\"fa fa-volume-off\"></i></button>"

                                        +"<button type=\"button\" class=\"btn btn-mini \" data-toggle=\"button\" id = \"record"+trackNumber+"\">"
                                        +"<i class=\"fa fa-plus-circle\"></i></button></div></div>"

                                +"<div id=\"track"+trackNumber+"\" class=\"span9 track\"></div>"
                                +"<div class=\"span1 remove-btn\"  id = \"remove"+trackNumber+"\">"
                                    +"<p class=\"text-center\"><i class=\"fa fa-minus-circle\"></i></p></div></div>");

    $(".remove-btn").click(function(){
        $(this).parent().remove();
    })

    $("#volumeSlider"+trackNumber).slider({
	value: 80,
	orientation: "vertical",
	range: "min",
	min: 0,
	max: 100,
	animate: true,
	slide: function( event, ui ) {
	    var muteTrackNumber = $(this).attr('id').split('volumeSlider')[1];
	    setTrackVolume(muteTrackNumber, ui.value );
	    $( "#amount" ).val( ui.value );
        $(this).find('.ui-slider-handle').text(ui.value);
	},
    create: function(event, ui) {
        var v=$(this).slider('value');
        $(this).find('.ui-slider-handle').text(v);
    }
    });

    $("#mute"+trackNumber).click(function(){
	$(this).button('toggle');
	var muteTrackNumber = $(this).attr('id').split('mute')[1];
	$('body').trigger('mute-event', muteTrackNumber);
    });
    $("#solo"+trackNumber).click(function(){
	$(this).button('toggle');
	var soloTrackNumber = $(this).attr('id').split('solo')[1];
	$('body').trigger('solo-event', soloTrackNumber);
    });

    $("#track"+trackNumber+"title").storage({
	storageKey : 'track'+trackNumber
    });


    $( "#track"+trackNumber ).droppable({
        	accept: ".librarySample",
        	drop: function( event, ui ) {
        	    var startBar = Math.floor((ui.offset.left-$(this).offset().left)/6);
        	    var sampleStartTime = startBar;
        	    var rand = parseInt(Math.random() * 10000);
        	    var span = document.createElement('span');
        	    var sampleID = ui.helper.attr("data-id");
        	    var sampleDuration = ui.helper.attr("data-duration");
        	    var sampleURL = ui.helper.attr("data-url");
        	    span.id = "sample" + sampleID + "Span" + rand;
        	    var canvas = document.createElement('canvas');
        	    canvas.className = "sample";
        	    canvas.id = "sample" + sampleID + "Canvas" + rand;
        	    $(this).append(span);
        	    $("#sample" + sampleID + "Span" + rand).append(canvas);
        	    $("#sample" + sampleID + "Span" + rand).width(parseFloat(sampleDuration) * ((pixelsPer4*bpm)/60));
        	    canvas.width = parseFloat(sampleDuration) * ((pixelsPer4*bpm)/60);
        	    canvas.height = 100;
        	    $( "#sample" + sampleID + "Span" + rand).attr('data-startTime',startBar);
        	    $( "#sample" + sampleID + "Span" + rand).css('left',"" + startBar*pixelsPer16 + "px");
        	    $( "#sample" + sampleID + "Span" + rand).css('position','absolute');
        	    $( "#sample" + sampleID + "Span" + rand).draggable({
        		axis: "x",
        		containment: "parent",
        		grid: [pixelsPer16, 0],		//grid snaps to 16th notes
        		stop: function() {
        		    var currentStartBar = $(this).attr('data-startTime');
        		    times[currentStartBar] = jQuery.removeFromArray(sampleID, times[currentStartBar]);
        		    $(this).attr('data-startTime',parseInt($(this).css('left'))/pixelsPer16);
        		    var newStartTime = $(this).attr('data-startTime');
        		    if(times[newStartTime] == null){
        			times[newStartTime] = [{id: sampleID, track: trackNumber}];
        		    } else {
        			times[newStartTime].push({id: sampleID, track: trackNumber});
        		    }
        		}
        	    });
        	}
            });
}

function startUserMedia(stream) {
    micStream = stream;
}

window.onload = function init() {
    try {
      // webkit shim
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
      window.URL = window.URL || window.webkitURL;

    } catch (e) {
      alert('No web audio support in this browser!');
    }

    navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
    });
};

