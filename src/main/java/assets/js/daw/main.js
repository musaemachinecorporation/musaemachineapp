//This file is uses all the other scripts to load the multitrack

//Code To Be Executed on Load
$(function() {

  'use strict';

  //load an audio context
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  //construct a multitrack
  var multitrack = new MultiTrack(audioCtx);

  //contruct contols
  var controls = new Controls(multitrack);

  //make the controls active
  controls.init();

});