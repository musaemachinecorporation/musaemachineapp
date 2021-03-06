package dao;

import com.google.inject.Inject;
import com.google.inject.Provider;
import com.googlecode.objectify.Objectify;
import models.*;

//import java.util.List;

public class AudioDao {
    
    @Inject
    Provider<Objectify> objectify;

    public AudiosDto getAllAudios() {

        AudiosDto audiosDto = new AudiosDto();
        audiosDto.audios = objectify.get().load().type(Audio.class).list();

        return audiosDto;

    }
    
    public AudioTitlesDto getAllAudioTitles() {

        AudioTitlesDto audioTitlesDto = new AudioTitlesDto();
        audioTitlesDto.suggestions = objectify.get().load().type(Audio.class).list();

        return audioTitlesDto;

    }

    public AudiosDto getAllAudiosFromUser(String username) {

        AudiosDto audiosDto = new AudiosDto();
        audiosDto.audios = objectify.get().load().type(Audio.class).filter("userNames",  username).list();

        return audiosDto;

    }
    
    public Audio getAudio(Long id) {
        
        Audio audio = objectify.get().load().type(Audio.class).filter("id", id).first().now();
        
        return audio;
        
    }

    public Audio getAudio(String fullPath) {

        Audio audio = objectify.get().load().type(Audio.class).filter("fullPath", fullPath).first().now();

        return audio;

    }
    
    /**
     * Returns false if user cannot be found in database.
     */
    public boolean uploadAudio(String username, AudioDto audioDto) {
        
        User user = objectify.get().load().type(User.class).filter("username", username).first().now();
        
        if (user == null) {
            return false;
        }
        
        Audio audio = new Audio(user, audioDto.title, audioDto.fullPath, audioDto.duration);
        objectify.get().save().entity(audio);

        //Get the Id generated by objectify database
        audio = objectify.get().load().type(Audio.class).filter("fullPath", audioDto.fullPath).first().now();

//        AudioTitle audioTitle = new AudioTitle(audioDto.title, audio.id);
//        objectify.get().save().entity(audioTitle);
        
        return true;
    }

}
