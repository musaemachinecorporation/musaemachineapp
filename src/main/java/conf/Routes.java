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

package conf;

import com.google.inject.Inject;

import ninja.AssetsController;
import ninja.Router;
import ninja.application.ApplicationRoutes;
import ninja.utils.NinjaProperties;
import controllers.ApiController;
import controllers.ApplicationController;
import controllers.AudioController;
import controllers.LoginLogoutController;

public class Routes implements ApplicationRoutes {
    
    @Inject
    NinjaProperties ninjaProperties;

    /**
     * Using a (almost) nice DSL we can configure the router.
     * 
     * The second argument NinjaModuleDemoRouter contains all routes of a
     * submodule. By simply injecting it we activate the routes.
     * 
     * @param router
     *            The default router of this application
     */
    @Override
    public void init(Router router) {  
        
        // puts test data into db:
        if (!ninjaProperties.isProd()) {
            router.GET().route("/setup").with(ApplicationController.class, "setup");
        }
        
        ///////////////////////////////////////////////////////////////////////
        // Login / Logout
        ///////////////////////////////////////////////////////////////////////
        router.GET().route("/login").with(LoginLogoutController.class, "login");
        router.POST().route("/login").with(LoginLogoutController.class, "loginPost");
        router.GET().route("/logout").with(LoginLogoutController.class, "logout");

        ///////////////////////////////////////////////////////////////////////
        // Sequencer /
        ///////////////////////////////////////////////////////////////////////
        router.GET().route("/sequencer").with(ApplicationController.class, "sequencer");



        ///////////////////////////////////////////////////////////////////////
        // Create new audio
        ///////////////////////////////////////////////////////////////////////
        router.GET().route("/audio/new").with(AudioController.class, "audioNew");
        router.POST().route("/audio/new").with(AudioController.class, "audioNewUpload");

        router.GET().route("/audio/{id}").with(AudioController.class, "audioShow");


        ///////////////////////////////////////////////////////////////////////
        // Api for management of software
        ///////////////////////////////////////////////////////////////////////
        router.GET().route("/api/{username}/audios.json").with(ApiController.class, "getAudiosJsonFromUser");
        router.GET().route("/api/{username}/audios.xml").with(ApiController.class, "getAudiosXmlFromUser");
        router.POST().route("/api/{username}/audio.json").with(ApiController.class, "uploadAudioJson");
        router.POST().route("/api/{username}/audio.xml").with(ApiController.class, "uploadAudioXml");
        router.GET().route("/api/audios.json").with(ApiController.class, "getAudiosJson");
        router.GET().route("/api/audios.xml").with(ApiController.class, "getAudiosXml");
        router.GET().route("/api/audioTitles.json").with(ApiController.class, "getAudioTitlesJson");
        router.GET().route("/api/{id}/audio.json").with(ApiController.class, "getAudioByIdJson");
 
        ///////////////////////////////////////////////////////////////////////
        // Assets (pictures / javascript)
        ///////////////////////////////////////////////////////////////////////    
        router.GET().route("/assets/{fileName: .*}").with(AssetsController.class, "serve"); //change me "serveStatic");
        router.GET().route("/webjars/{fileName: .*}").with(AssetsController.class, "serveWebJars");

        // /////////////////////////////////////////////////////////////////////
        // Upload showcase
        // /////////////////////////////////////////////////////////////////////
        //router.GET().route("/upload").with(CloudStorageDao.class, "upload");
        //router.POST().route("/audioNewUpload").with(AudioController.class, "audioNewUpload");

        ///////////////////////////////////////////////////////////////////////
        // Test Index
        ///////////////////////////////////////////////////////////////////////
        //router.GET().route("/test").with(ApplicationController.class, "test");

        ///////////////////////////////////////////////////////////////////////
        // Get Audios Files for Autocomplete
        ///////////////////////////////////////////////////////////////////////
        //router.GET().route("/audiocomplete/audios").with(ApplicationController.class, "getAudios");

        ///////////////////////////////////////////////////////////////////////
        // Index / Catchall shows index page
        ///////////////////////////////////////////////////////////////////////
        router.GET().route("/.*").with(LoginLogoutController.class, "login");

    }

}
