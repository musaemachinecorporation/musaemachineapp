package controllers;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.util.List;

import models.Audio;
import models.User;

import org.junit.Test;

import com.googlecode.objectify.Objectify;
import conf.ObjectifyProvider;

public class AudioTest extends NinjaAppengineBackendTest {


    
    @Test
    public void testCreateAudio() {

        ObjectifyProvider objectifyProvider = new ObjectifyProvider();
        Objectify ofy = objectifyProvider.get();

        // Create a new user and save it
        User anotherBob = new User("another_bob@gmail.com", "secret", "Bob");
        ofy.save().entity(anotherBob).now();

        // Create a new upload
        Audio upload = new Audio(anotherBob, "My first upload", "Hello world", 0.3);
        ofy.save().entity(upload).now();

        // Test that the upload has been created
        assertNotNull(ofy.load().type(Audio.class).first().now());

        // Retrieve all uploads created by Bob
        List<Audio> bobUploads = ofy.load().type(Audio.class).filter("userNames", anotherBob.username).list();


        // Tests
        assertEquals(1, bobUploads.size());
        Audio firstUpload = bobUploads.get(0);
        assertNotNull(firstUpload);
        assertEquals(anotherBob.username, firstUpload.userNames.get(0));
        assertEquals("My first upload", firstUpload.title);
        assertEquals("Hello world", firstUpload.fullPath);
        assertNotNull(firstUpload.uploadedAt);
    }
}