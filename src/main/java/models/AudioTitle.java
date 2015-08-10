package models;

import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;

/**
 * Created by john on 5/26/15.
 */
@Index
@Entity
public class AudioTitle {

    @Id
    public Long id;

    public String label;
    public Long value;

    public AudioTitle(){}

    public AudioTitle(String title, Long id){
        this.value = id;
        this.label = title;
    }
}
