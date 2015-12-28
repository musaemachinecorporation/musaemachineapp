//This is file is for storing HTML that gets injected into app

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