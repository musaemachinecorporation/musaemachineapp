package models;

import javax.validation.constraints.Size;
import java.util.List;

public class AudioDto {

    public List<String> userNames;
    public String title;
    public String fullPath;
    public Double duration;
    //public Long id;


    public AudioDto() {}
    /*public AudioDto(String username, String title, String fullPath) {
        this.username = username;
        this.title = title;
        this.fullPath = fullPath;
    }*/


}
