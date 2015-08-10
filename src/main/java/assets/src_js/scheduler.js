'use strict';

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


function scheduleNote( beatNumber, noteTime) {
}

function scheduler() {
}

function schedPlay(time) {
}

function schedStop(){
}

function schedStepBack(time) {

}
function draw() {
}

function drawTimeline(){
    canvasContext.clearRect(0,0,canvas.width, canvas.height);
    canvasContext.fillStyle = "black";
    canvasContext.lineWidth = 1;
    for(var i=0;i<timelineWidth;i+=pixelsPer4){	
        canvasContext.moveTo(i,0);
        canvasContext.lineTo(i,10); 	
        canvasContext.stroke();
    }
    canvasContext.fillText("Bar",4,20);
    
    var bar = 2;
    for(var i=31;i<timelineWidth;i+=(2*pixelsPer4)){
        canvasContext.fillText(bar*zoom, i, 20);
        bar+=2;
    }
}

function timelineZoomIn() {
    canvasContext.clearRect(0,0,canvas.width, canvas.height);
    zoom /= 2;
    resetCanvas();
    console.log("in");
}

function timelineZoomOut() {
    canvasContext.clearRect(0,0,canvas.width, canvas.height);
    zoom *= 2;
    resetCanvas();
    console.log("out");
}

function drawCursor(bar) {
    canvasContext.fillStyle = "FF9900";
    canvasContext.fillRect(bar*pixelsPer16/zoom, 0, pixelsPer4/zoom, 10 );
}

function cursorJump(bar) {
    if (isStopped) {
	isStopped = false;
	isPaused = true;
    }
    drawTimeline();
    drawCursor(bar*4);
    
   if (isPlaying) {
    activeSources.forEach(function(element){
	     element.sourceNode.stop(0);
	 });	
   }
    
    k=bar*4;
    nextK=k;
    current16thNote = k;
    if (isPaused) {
	pauseBeat = k;
    }
    clockOutput(k);
    //console.log(current16thNote);
}

function loadActiveSources() {
    
}

function clockOutput(t){
    clockTime = t*secondsPer16;
    if (isPlaying) {
	 clockTime = ac.currentTime - playTime;
    }
    
    clockTime = formatTime(clockTime);
    $("#clock").html(clockTime);

}

function formatTime(t) {
    
    var msec = Math.floor((t % 1)*100);
    var seconds = Math.floor(t % 60)
    var minutes =  Math.floor((t / 60) % 60);

    if (msec < 10){msec = "0"+msec;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    
    t = minutes+':'+seconds+':'+msec;
    return t;
}
    

function resetCanvas (e) {
    // resize the canvas - but remember - this clears the canvas too.
    
    timelineWidth = (.7446808510638297 * window.innerWidth - 20) * .829787234042553 - 20; 
    
    if (zoom <=1) {
	timelineWidth /= zoom;
    }
    
    canvas.width = timelineWidth;
    

    //make sure we scroll to the top left.
    //window.scrollTo(0,0);
    drawTimeline();
    drawCursor(k);
     //requestAnimFrame(draw);	// start the drawing loop.
}

function initSched(params){
    canvas = document.getElementById( "timeline" );
    canvas.addEventListener("click" , function(e){
						    var relX = e.offsetX;
						    var bar =Math.floor(relX/pixelsPer4);
						    cursorJump(bar);
						}, false);
			    
    canvasContext = canvas.getContext( '2d' );
    canvasContext.font = '8pt Calibri';
    canvasContext.textAlign = 'center';
    
    //0.744... is hardcoded for bootstrap span9 and 0.829 is for span 10. -20s are for left margins on each
    timelineWidth = (.7446808510638297 * window.innerWidth - 20) * .829787234042553 - 20; 
    canvas.width = timelineWidth;
    
    requestAnimFrame(draw);	// start the drawing loop.
    
    window.onorientationchange = resetCanvas;
    window.onresize = resetCanvas
    
   clockOutput(0);

}

window.addEventListener("load", initSched);