//Multitrack Sequences Multiple Tracks By Playing Back Events
function MultiTrack(audioCtx) {
  ////////////////////////////////////////////properties///////////////////////////////////////////////
  this.ticksPerLoop = 8;
  this.audioCtx = audioCtx;
  this.isPlaying = false;      // Are we currently playing?
  this.startTime = null;              // The start time of the entire sequence.
  this.tempo = 120.0;          // tempo (in beats per minute)
  //tempo reset by slider, make sure to init
  var lookahead = 25.0;       // How frequently to call scheduling function
                              //(in milliseconds)
  var scheduleAheadTime = 0.1;    // How far ahead to schedule audio (sec)
                              // This is calculated from lookahead, and overlaps
                              // with next interval (in case the timer is late)
  var nextNoteTime = 0.0;     // when the next note is due.
  var noteResolution = 0;     // 0 == 16th, 1 == 8th, 2 == quarter note
  var noteLength = 0.05;      // length of "beep" (in seconds)

  var current16thNote;        // What note is currently last scheduled?
  //var last16thNoteDrawn = -1; // the last "box" we drew on the screen
  var notesInQueue = [];      // the notes that have been put into the web audio,
                              // and may or may not have played yet. {note, time}
  this.timerWorker = null;     // The Web Worker used to fire timer messages


  var sourceNodes = {};
  var th = this;
  var buffers = {};
  var stopNodes = {};
  var zoom_level = 0;


  /////////////////////////////////////methods//////////////////////////////////////////////////
  this.init = function (tempo){
    this.tempo = tempo;
  }

  //Is suppose to reset all the sourceNodes based on new tempo
  this.reset = function(){
    var oldNodes = sourceNodes;
    sourceNodes = {};
    for (var id in buffers) {
      for (var j in oldNodes[id]){
        this.createSourceNode(id,j);
        this.createSourceNode(id,j+1);
      }
    }
  }

  this.createSourceNode = function (id, j) {
      console.log('Adding '+"sn:"+id+'num:'+j);
      var secondsPerQuarterBeat = 15 / (this.tempo*2^zoom_level);
      var duration = secondsPerQuarterBeat;
      var when = j*duration;
      var offset = when;
      if(sourceNodes[id] == null)
        sourceNodes[id] = {};

      sourceNodes[id][j] = [when, offset, duration];
  }
  this.removeSourceNode = function (id, j) {
      console.log('Removing '+"sn:"+id+"num:"+j);
      delete sourceNodes[id][j];
  }

  this.zoomIn = function(){
      zoom_level++;
      console.log('Zoom In Level '+zoom_level);
  }
  this.zoomOut = function(){
        zoom_level--;
        console.log('Zoom Out Level '+zoom_level);
  }
  function nextNote() {
      // Advance current note and time by a 16th note...
      var secondsPerBeat = 60.0 / th.tempo;    // Notice this picks up the CURRENT
                                            // tempo value to calculate beat length.
      th.nextNoteTime += 0.25 * secondsPerBeat;    // Add beat length to last beat time

      th.current16thNote++;    // Advance the beat number, wrap to zero
      if (th.current16thNote == 16) {
          th.current16thNote = 0;
      }
  }

  function scheduleNote ( beatNumber, time ) {
      // push the note on the queue, even if we're not playing.
      th.notesInQueue.push( { note: beatNumber, time: time } );

      if ( (th.noteResolution==1) && (beatNumber%2))
          return; // we're not playing non-8th 16th notes
      if ( (th.noteResolution==2) && (beatNumber%4))
          return; // we're not playing non-quarter 8th notes

      // create an oscillator
      var osc = th.audioCtx.createOscillator();
      osc.connect( th.audioCtx.destination );
      if (beatNumber % 16 === 0)    // beat 0 == low pitch
          osc.frequency.value = 880.0;
      else if (beatNumber % 4 === 0 )    // quarter notes = medium pitch
          osc.frequency.value = 440.0;
      else                        // other 16th notes = high pitch
          osc.frequency.value = 220.0;

      //osc.start( time );
      //osc.stop( time + th.noteLength );
  }

  this.scheduler= function() {
      // while there are notes that will need to play before the next interval,
      // schedule them and advance the pointer.
      while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime ) {
          scheduleNote( this.current16thNote, this.nextNoteTime );
          nextNote();
      }
  }

  this.play = function() {
      this.isPlaying = !this.isPlaying;

      if (this.isPlaying) { // start playing
          this.current16thNote = 0;
          this.nextNoteTime = this.audioCtx.currentTime;
          this.timerWorker.postMessage("start");
          for (var id in buffers) {
            for (var j in sourceNodes[id]){
              var sourceNode = this.audioCtx.createBufferSource();
              console.log('Starting sn:' + id + "num:" + j);
              sourceNode.buffer = buffers[id];
              sourceNode.connect(audioCtx.destination);
              sourceNode.loop = false;
              sourceNode.start(audioCtx.currentTime+sourceNodes[id][j][0],
                                sourceNodes[id][j][1],
                                sourceNodes[id][j][2]);
              stopNodes["id:"+id+"j:"+j] = sourceNode;
              }
          }
          return "stop";
      } else {
          this.timerWorker.postMessage("stop");
          for (var i in stopNodes){
              console.log('Stopping ' + i)
              stopNodes[i].stop(0);
          }
          stopNodes = {};
          return "play";
      }
  }

  this.createTrack = function(url, id) {
    //Using Unique Id For Array Index

    //Requesting And Decoding the Audio Data
    var request = new XMLHttpRequest();
    request.open('GET',url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      var audioData = request.response;
      audioCtx.decodeAudioData(audioData, function(buffer) {
          console.log('Decode Audio Data');
          buffers[id] = buffer;
      }, function(e){"Error with decoding audio data" + e.err});
    }
    request.send();
  }

  this.removeTrack = function(id) {
      //Using Unique Id For Array Index
      delete buffers[id];
  }
}