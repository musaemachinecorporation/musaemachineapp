/**
 * Copyright (C) 2012 the original author or authors.
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

import models.ErrorResponse;
import ninja.Result;
import ninja.Results;
import ninja.appengine.AppEngineEnvironment;

import com.google.inject.Inject;
import com.google.inject.Singleton;

import conf.ObjectifyProvider;
import dao.AudioDao;
//import models.AudioTitle;
//import models.AudioTitlesDto;

@Singleton
// Just a test to make sure @AppEngineEnvironment works.
// Usually @FilterWith(AppEngineFilter.class is much better.
@AppEngineEnvironment
public class ApplicationController {

    @Inject
    AudioDao audioDao;
    
    /**
     * Method to put initial data in the db...
     * #return
     */
    public Result setup() {
        
    	try{
        ObjectifyProvider.setup();
        
        return Results.ok();
    }
	catch(Exception ex){
		ErrorResponse er=new ErrorResponse();
		er.setErrorCode("E001");
		er.setErrorMessage(ex.getMessage());
		 return Results.internalServerError().json().render(er);
	}
        
    }

//    public Result index() {
//
//        //AudiosDto audiosDto = audioDao.getAllAudios();
//
//        //List<Audio> audios = audiosDto.audios;
//
//        //return Results.html().render("audios", audios);
//
////        AudioTitlesDto audioTitlesDto = audioDao.getAllAudioTitles();
////
////        List<AudioTitle> audioTitles = audioTitlesDto.suggestions;
//
//        return Results.html().render("audioTitles", audioTitles);
//
//    }
//    public Result test() {
//
////        AudioTitlesDto audioTitlesDto = audioDao.getAllAudioTitles();
////
////        List<AudioTitle> audioTitles = audioTitlesDto.suggestions;
//
//        return Results.html().render("audioTitles", audioTitles);
//
//    }

}
