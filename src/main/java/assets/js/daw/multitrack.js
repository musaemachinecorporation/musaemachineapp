//Multitrack Sequences Multiple Tracks By Playing Back Events
function MultiTrack(audioCtx) {
  //properties
  this.sources = {};
  this.audioCtx = audioCtx;
  var th = this;

  //methods
  this.createTrack = function(url, id) {
    //Using Unique Id For Array Index
    this.sources[id] = this.audioCtx.createBufferSource();

    //Requesting And Decoding the Audio Data
    var request = new XMLHttpRequest();
    request.open('GET',url, true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      var audioData = request.response;
      audioCtx.decodeAudioData(audioData, function(buffer) {
          console.log('Decode Audio Data');
          th.sources[id].buffer = buffer;
          th.sources[id].connect(audioCtx.destination);
          th.sources[id].loop = false;
      }, function(e){"Error with decoding audio data" + e.err});
    }
    request.send();
  }

  this.removeTrack = function(id) {
      //Using Unique Id For Array Index
      delete this.sources[id];
  }


  this.play = function() {
    for (var i in this.sources){
        console.log('Starting ' + i)
        this.sources[i].start();
    }
  }

  this.stop = function() {
    for (var i in this.sources){
        console.log('Stopping ' + i)
        this.sources[i].stop();
    }
  }
}