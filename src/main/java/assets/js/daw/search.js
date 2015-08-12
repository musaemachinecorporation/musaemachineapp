  $(function() {
    $( "#autocomplete" ).autocomplete({
      source: function(request, response){
           $.ajax({
               type: "GET",
               url:  "/api/audioTitles.json",
               contentType: "application/json; charset=utf-8",
               dataType: "json",
               success: function(data) {
                    response($.map( data.suggestions, function( item ) {
                        //alert(data.suggestions+item.label);
                        return {
                            label: item.title,
                            value: item.duration
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
      select: function( event, ui ) {
          event.preventDefault();
          $( "#autocomplete" ).val("");
          
          html_string = "<li contenteditable='true' class='btn span2 audio-clip' data-userNames='";
          for (user in data.userNames) {
              html_string += user +" ";
          }
          html_string += "' ";
          html_string += "data-title='" + ui.item.title + "' ";
         // html_string += "data-fullPath='" + data.fullPath + "' ";
          html_string += "data-duration='" + ui.item.value + "' >";
          html_string += ui.item.title+"</li>";

          $("#audio-clip-container").prepend(html_string);
        //  return data;
//          audio_clip = $.ajax({
//                         type: "GET",
//                         url:  "/api/"+ui.item.value+"/audio.json",
//                         contentType: "application/json; charset=utf-8",
//                         dataType: "json",
//                         success: function(data) {
//                            html_string = "<li contenteditable='true' class='btn span2 audio-clip' data-userNames='";
//                            for (user in data.userNames) {
//                                html_string += user +" ";
//                            }
//                            html_string += "' ";
//                            html_string += "data-title='" + data.title + "' ";
//                            html_string += "data-fullPath='" + data.fullPath + "' ";
//                            html_string += "data-duration='" + data.duration + "' >";
//                            html_string += data.title+"</li>";
//
//                            $("#audio-clip-container").prepend(html_string);
//                            return data;
//                         },
//                         error: function (msg) {
//                             alert(msg.status + ' ' + msg.statusText);
//                         }
//                     });
      }
    }).focus(function() {
                event.preventDefault();
                $(this).autocomplete("search", "");
       });
    });