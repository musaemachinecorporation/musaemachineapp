function TrackControl(id, label){
  this.label = label;
  this.id = id;

  this.init() {
        var track_controls = $("#track-controls");
        var track_control = $("<div/>",{id:'tcontrol'+id,class:'trackBox'});
        var volume_slider = $("<div/>", {class:"volume-slider", id:"volumeSlider"+id});
        var track_title= $("<p/>", {class: "track-title",
                                    id:"track"+id+"title", html:label });
        var track_c_btns = $("<div/>", {class:"btn track-btns"});
        var solo = $("<button\>",{type:"button",class:"btn",id:"solo"+id});
        var headphone = $("<i\>",{class:"icon icon-headphones"});
        var mute = $("<button/>",{type:"button",class:"btn",id:"mute"+id});
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


        $("#volumeSlider"+id).slider({
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

        $("#mute"+id).click(function(){
            $(this).button('toggle');
            var muteTrackNumber = 1;//$(this).attr('id').split('mute')[1];
            $('body').trigger('mute-event', muteTrackNumber);
        });
        $("#solo"+id).click(function(){
            $(this).button('toggle');
            var soloTrackNumber = 1;//$(this).attr('id').split('solo')[1];
            $('body').trigger('solo-event', soloTrackNumber);
        });
        $("#track"+id+"title").storage({
            storageKey : 'track'+id
        });
  }
}