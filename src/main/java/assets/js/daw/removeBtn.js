function RemoveBtn(id, height, scrollBarHeight, offset){
    this.id = id;
    this.height = height;
    this.scrollBarHeight = scrollBarHeight;

    this.init() = function(){
        var rm_btns = $("#track-rm-btns")
        var rm_btn = $("<div\>",{class:"remove-btn",id:"rm-btn"+ui.item.id});
        var rm_text = $("<p\>",{class:"text-center"});
        var rm_minus = $("<i\>",{class:"icon icon-remove-sign"});
        rm_text.append(rm_minus);
        rm_btn.append(rm_text);
        rm_btns.append(rm_btn);

        $('#rm-btn'+id).mousedown(function(event){
            event.preventDefault();
            var track_controls = $('#track-controls');
            var track_canvases= $('#track-canvases');
            var track_rm_btns = $('#track-rm-btns');

            var current_height = track_controls.height();
          if (current_height <= height+5){
            track_canvases.height(0);
            track_controls.height(0);
            track_rm_btns.height(0);
          }else{
            var prev_height = current_height - (height+5);
            track_canvases.height(prev_height+scrollBarHeight);
            track_controls.height(prev_height);
            track_rm_btns.height(prev_height);
          }

          multitrack.removeTrack(ui.item.id);
          $('#tcontrol'+ui.item.id).remove();
          $('#track'+ui.item.id).remove();
          $('#rm-btn'+ui.item.id).remove();
          track_canvases.hide().show(0);
          track_controls.hide().show(0);
          rm_btns.hide().show(0);
        });
    }
}