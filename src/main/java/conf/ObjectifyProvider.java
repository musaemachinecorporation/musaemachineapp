package conf;

import com.google.inject.Provider;
import com.googlecode.objectify.Objectify;
import com.googlecode.objectify.ObjectifyService;
import models.Audio;
//import models.AudioTitle;
import models.User;

public class ObjectifyProvider implements Provider<Objectify> {
    
    @Override
    public Objectify get() {
        return ObjectifyService.ofy();
    }

    public static String upload1Title = "fhg_bassloop_125_jzzfunk_A.wav";
    public static String upload1Fullpath= "/assets/src_js/data/samples/fhg_bassloop_125_jzzfunk_A.wav";
    public static Double upload1Duration= 3.8399999141693115;

    public static String upload2Title = "fhg_bassloop_125_jzzfunk_D.wav";
    public static String upload2Fullpath= "/assets/src_js/data/samples/fhg_bassloop_125_jzzfunk_D.wav";
    public static Double upload2Duration= 3.8399999141693115;

    public static String upload3Title = "fhg_bassloop_125_jzzfunk_F.wav";
    public static String upload3Fullpath= "/assets/src_js/data/samples/fhg_bassloop_125_jzzfunk_F.wav";
    public static Double upload3Duration= 3.8399999141693115;


    static {

        ObjectifyService.register(User.class);
        ObjectifyService.register(Audio.class);
        //ObjectifyService.register(AudioTitle.class);

        setup();
    }


    public static void setup() {

        Objectify ofy = ObjectifyService.ofy();
        User user = ofy.load().type(User.class).first().now();

        if (user == null) {

            // Create a new user and save it
            User bob = new User("bob@gmail.com", "secret", "Bob");
            ofy.save().entity(bob).now();

            // Create a new upload
            Audio bobUpload3 = new Audio(bob, upload3Title, upload3Fullpath, upload3Duration);
            ofy.save().entity(bobUpload3).now();
//            AudioTitle bobTitle3 = new AudioTitle(upload3Title, bobUpload3.id);
//            ofy.save().entity(bobTitle3).now();

            // Create a new upload
            Audio bobUpload2 = new Audio(bob, upload2Title, upload2Fullpath, upload2Duration);
            ofy.save().entity(bobUpload2).now();
//            AudioTitle bobTitle2 = new AudioTitle(upload2Title, bobUpload2.id);
//            ofy.save().entity(bobTitle2).now();

            // Create a new upload
            Audio bobUpload1 = new Audio(bob, upload1Title, upload1Fullpath, upload1Duration);
            ofy.save().entity(bobUpload1).now();
//            AudioTitle bobTitle1 = new AudioTitle(upload1Title, bobUpload1.id);
//            ofy.save().entity(bobTitle1).now();
        }

    }

}