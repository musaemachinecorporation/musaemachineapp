package controllers;

import com.google.inject.Inject;
import com.google.inject.Singleton;

import dao.AudioDao;
import etc.CloudStorage;
import etc.LoggedInUser;
import etc.Mp3;
import models.Audio;
import models.AudioDto;
import models.ErrorResponse;
import ninja.*;
import ninja.appengine.AppEngineEnvironment;
import ninja.appengine.AppEngineFilter;
import ninja.params.PathParam;

@Singleton
//#FilterWith(AppEngineFilter.class)
@AppEngineEnvironment
public class AudioController {
    
    @Inject
    AudioDao audioDao;
    CloudStorage cloudStorage = new CloudStorage();


    ///////////////////////////////////////////////////////////////////////////
    // Show audio
    ///////////////////////////////////////////////////////////////////////////
    public Result audioShow(@PathParam("id") Long id) {

    	try{
        Audio audio = null;

        if (id != null) {

            audio = audioDao.getAudio(id);

        }

        return Results.html().render("audio", audio);
        
    }
	catch(Exception ex){
		ErrorResponse er=new ErrorResponse();
		er.setErrorCode("E001");
		er.setErrorMessage(ex.getMessage());
		 return Results.internalServerError().json().render(er);
	}

    }
    
    ///////////////////////////////////////////////////////////////////////////
    // Create new audio
    ///////////////////////////////////////////////////////////////////////////
    @FilterWith(SecureFilter.class)
    public Result audioNew() {

        return Results.html();
        

    }

    @FilterWith(SecureFilter.class)
    public Result audioNewUpload(@LoggedInUser String username,
                                 Context context) throws Exception{
        String baseUrl = "http://storage.googleapis.com/";
        String bucketName = "musaemachine.com/";
        try {
            if (username != null){
                Mp3 mp3 = cloudStorage.uploadMp3(context);
                String filename = baseUrl + bucketName + mp3.title;
                AudioDto audioDto = new AudioDto();
                audioDto.title = mp3.title;
                audioDto.fullPath = filename;
                audioDto.duration = mp3.duration;
                audioDao.uploadAudio(username, audioDto);
            }
        }
        catch (Exception e) {
            e.printStackTrace();
        }
        return Results.redirect("/").html();
    }


}