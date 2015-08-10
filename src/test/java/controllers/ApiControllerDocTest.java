/**
 * Copyright (C) 2013 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package controllers;

import java.lang.reflect.Type;
import java.util.Date;
import java.util.Map;

import models.AudioDto;
import models.AudiosDto;
import ninja.NinjaApiDocTest;

import org.junit.Test;

import com.google.common.collect.Maps;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonParseException;

import de.devbliss.apitester.ApiResponse;

public class ApiControllerDocTest extends NinjaApiDocTest {
    
    String GET_AUDIOS_URL = "/api/audios.json";
    String UPLOAD_AUDIO_URL = "/api/{username}/audio.json";
    String LOGIN_URL = "/login";
    
    String USER = "bob@gmail.com";

    @Test
    public void testGetAndUploadAudioViaJson() throws Exception {

        // /////////////////////////////////////////////////////////////////////
        // Test initial data:
        // /////////////////////////////////////////////////////////////////////
        
        sayNextSection("Retrieving audios for a user (Json)");
        
        say("Retrieving all audios of a user is a GET request to " + GET_AUDIOS_URL);
        
        ApiResponse apiResponse = makeGetRequest(buildUri(GET_AUDIOS_URL));

        AudiosDto audiosDto = getGsonWithLongToDateParsing().fromJson(apiResponse.payload, AudiosDto.class);

        assertEqualsAndSay(3, audiosDto.audios.size(), "We get back all 3 audios of that user");

        // /////////////////////////////////////////////////////////////////////
        // Upload new audio:
        // /////////////////////////////////////////////////////////////////////
        sayNextSection("Uploading new audio (Json)");
        
        say("Uploading a new audio is a upload request to " + UPLOAD_AUDIO_URL);
        say("Please note that you have to be authenticated in order to be allowed to upload.");
        
        AudioDto audioDto = new AudioDto();
        audioDto.fullPath = "contentcontent";
        audioDto.title = "new title new title";
        audioDto.duration = 0.3;

        apiResponse = makePostRequest(buildUri(UPLOAD_AUDIO_URL.replace("{username}", USER)), audioDto);
        assertEqualsAndSay(403, apiResponse.httpStatus, "You have to be authenticated in order to upload audios");
        
        doLogin();

        say("Now we are authenticated and expect the upload to succeed...");
        apiResponse = makePostRequest(buildUri(UPLOAD_AUDIO_URL.replace("{username}", USER)), audioDto);
        assertEqualsAndSay(200, apiResponse.httpStatus, "After successful login we are able to upload audios");

        // /////////////////////////////////////////////////////////////////////
        // Fetch audios again => assert we got a new one ...
        // /////////////////////////////////////////////////////////////////////
        
        say("If we now fetch the audios again we are getting a new audio (the one we have uploaded successfully");
        apiResponse = makeGetRequest(buildUri(GET_AUDIOS_URL));

        audiosDto = getGsonWithLongToDateParsing().fromJson(apiResponse.payload, AudiosDto.class);
        // one new result:
        assertEqualsAndSay(4, audiosDto.audios.size(), "We are now getting 4 audios.");

    }



    private Gson getGsonWithLongToDateParsing() {
        // Creates the json object which will manage the information received
        GsonBuilder builder = new GsonBuilder();
        // Register an adapter to manage the date types as long values
        builder.registerTypeAdapter(Date.class, new JsonDeserializer<Date>() {
            public Date deserialize(JsonElement json,
                                    Type typeOfT,
                                    JsonDeserializationContext context)
                    throws JsonParseException {
                return new Date(json.getAsJsonPrimitive().getAsLong());
            }
        });
        Gson gson = builder.create();

        return gson;
    }

    private void doLogin() throws Exception {

        say("To authenticate we send our credentials to " + LOGIN_URL);
        say("We are then issued a cookie from the server that authenticates us in further requests");

        Map<String, String> formParameters = Maps.newHashMap();
        formParameters.put("username", "bob@gmail.com");
        formParameters.put("password", "secret");
        
        makePostRequest(buildUri(LOGIN_URL, formParameters));
    }

    @Override
    public String getFileName() {
        return this.getClass().getSimpleName();
    }

}
