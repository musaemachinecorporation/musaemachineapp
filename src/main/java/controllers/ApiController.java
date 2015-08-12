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

import dao.AudioDao;
import models.Audio;
import models.AudioDto;
//import models.AudioTitlesDto;
import models.AudiosDto;
import models.ErrorResponse;
import ninja.*;
import ninja.appengine.AppEngineFilter;

import com.google.inject.Inject;
import com.google.inject.Singleton;

import etc.LoggedInUser;
import ninja.params.PathParam;

@Singleton
@FilterWith(AppEngineFilter.class)
public class ApiController {

	@Inject
	AudioDao audioDao;

	public Result getAudioTitlesJson() {

		// AudioTitlesDto audioTitlesDto = audioDao.getAllAudioTitles();
		try {
			AudiosDto audiosDto = audioDao.getAllAudios();

			return Results.json().render(audiosDto);
		} catch (Exception ex) {
			ErrorResponse er = new ErrorResponse();
			er.setErrorCode("E001");
			er.setErrorMessage(ex.getMessage());
			return Results.internalServerError().json().render(er);
		}

	}

	// /////////////////////////////////////////////////////////////////////////
	// Show audio
	// /////////////////////////////////////////////////////////////////////////
	public Result getAudioByIdJson(@PathParam("id") Long id) {

		try {
			Audio audio = null;
			AudioDto audioDto = null;

			if (id != null) {

				audio = audioDao.getAudio(id);
				audioDto = new AudioDto();
				audioDto.duration = audio.duration;
				audioDto.fullPath = audio.fullPath;
				audioDto.title = audio.title;
				audioDto.userNames = audio.userNames;

			}

			return Results.json().render(audioDto);

		} catch (Exception ex) {
			ErrorResponse er = new ErrorResponse();
			er.setErrorCode("E001");
			er.setErrorMessage(ex.getMessage());
			return Results.internalServerError().json().render(er);
		}

	}

	public Result getAudiosJson() {

		try {
			AudiosDto audiosDto = audioDao.getAllAudios();

			return Results.json().render(audiosDto);

		} catch (Exception ex) {
			ErrorResponse er = new ErrorResponse();
			er.setErrorCode("E001");
			er.setErrorMessage(ex.getMessage());
			return Results.internalServerError().json().render(er);
		}

	}

	public Result getAudiosXml() {

		try {

			AudiosDto audiosDto = audioDao.getAllAudios();

			return Results.xml().render(audiosDto);

		} catch (Exception ex) {
			ErrorResponse er = new ErrorResponse();
			er.setErrorCode("E001");
			er.setErrorMessage(ex.getMessage());
			return Results.internalServerError().json().render(er);
		}

	}

	public Result getAudiosJsonFromUser(@LoggedInUser String username) {

		try {

			AudiosDto audiosDto = audioDao.getAllAudiosFromUser(username);

			return Results.json().render(audiosDto);
		} catch (Exception ex) {
			ErrorResponse er = new ErrorResponse();
			er.setErrorCode("E001");
			er.setErrorMessage(ex.getMessage());
			return Results.internalServerError().json().render(er);
		}

	}

	public Result getAudiosXmlFromUser(@LoggedInUser String username) {

		try {
			AudiosDto audiosDto = audioDao.getAllAudiosFromUser(username);

			return Results.xml().render(audiosDto);
		} catch (Exception ex) {
			ErrorResponse er = new ErrorResponse();
			er.setErrorCode("E001");
			er.setErrorMessage(ex.getMessage());
			return Results.internalServerError().json().render(er);
		}

	}

	@FilterWith(SecureFilter.class)
	public Result uploadAudioJson(@LoggedInUser String username, AudioDto audioDto) {
		try {

			boolean succeeded = audioDao.uploadAudio(username, audioDto);

			if (!succeeded) {
				return Results.notFound();
			} else {
				return Results.json();
			}

		} catch (Exception ex) {
			ErrorResponse er = new ErrorResponse();
			er.setErrorCode("E001");
			er.setErrorMessage(ex.getMessage());
			return Results.internalServerError().json().render(er);
		}

	}

	@FilterWith(SecureFilter.class)
	public Result uploadAudioXml(@LoggedInUser String username,

	AudioDto audioDto) {
		try {

			boolean succeeded = audioDao.uploadAudio(username, audioDto);

			if (!succeeded) {
				return Results.notFound();
			} else {
				return Results.xml();
			}

		} catch (Exception ex) {
			ErrorResponse er = new ErrorResponse();
			er.setErrorCode("E001");
			er.setErrorMessage(ex.getMessage());
			return Results.internalServerError().json().render(er);
		}

	}
}
