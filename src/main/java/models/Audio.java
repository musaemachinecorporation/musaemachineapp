package models;

import com.google.common.collect.Lists;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;
import com.googlecode.objectify.annotation.Unindex;

import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedList;
import java.util.List;

@Entity
@Index
public class Audio {

    @Id
    public Long id;

    public String title;

    public Date uploadedAt;

    public String fullPath;
    public Double duration;

    public List<String> userNames;

    public Audio() {}

    public Audio(User user, String title, String fullPath, double duration) {
        this.userNames = new LinkedList<>();
        this.userNames.add(user.username);
        this.title = title;
        this.fullPath = fullPath;
        this.uploadedAt = new Date();
        this.duration = duration;
    }
}
