/*
* The copyright in this software module is being made available under the BSD License, included
* below. This software module may be subject to other third party and/or contributor rights,
* including patent rights, and no such rights are granted under this license.
*
* Copyright (c) 2016, Orange
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without modification, are permitted
* provided that the following conditions are met:
* - Redistributions of source code must retain the above copyright notice, this list of conditions
*   and the following disclaimer.
* - Redistributions in binary form must reproduce the above copyright notice, this list of
*   conditions and the following disclaimer in the documentation and/or other materials provided
*   with the distribution.
* - Neither the name of Orange nor the names of its contributors may be used to endorse or promote
*   products derived from this software module without specific prior written permission.
*
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR
* IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
* FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER O
* CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
* DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
* WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
* WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
* AdsPlayerController is th main controller class for AdsPlayer module.
* It is in charge of downloading the MAST/VMAP/VAST files and orchestrates the
* detection of triggers and playing of ad(s).
*/

import Debug from './Debug';
import FileLoader from './FileLoader';
import ErrorHandler from './ErrorHandler';
import EventBus from './EventBus';
import Parser from './Parser';
import AdsManager from "./AdsManager";
import VastParser from './vast/VastParser';
import VastPlayerManager from './vast/VastPlayerManager';

class AdsPlayerController {


    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

    _loadVast (url) {
        var fileLoader = new FileLoader(),
            vast = null;

        return new Promise((resolve/*, reject*/) => {
            this._debug.log("Download VAST file: " + url);
            fileLoader.load(url).then(result => {
                    this._debug.log("Parse VAST file");
                    vast = this._vastParser.parse(result.response);
                    vast.baseUrl = result.baseUrl;
                    resolve(vast);
                }).catch(error => {
                    if (error) {
                        this._errorHandler.sendWarning(ErrorHandler.LOAD_VAST_FAILED, "Failed to load VAST file", error);
                    }
                    resolve(null);
                }
            );
            this._fileLoaders.push(fileLoader);
        });
    }

    _loadTriggerVasts (trigger) {
        var loadVastPromises = [],
            i,
            uri;

        for (i = 0; i < trigger.sources.length; i++) {
            uri = trigger.sources[i].uri;
            // Check for relative uri path
            if (uri.indexOf('http://') === -1) {
                uri = this._sequence.baseUrl + uri;
            }
            loadVastPromises.push(this._loadVast(uri));
        }

        return new Promise((resolve, reject) => {
            Promise.all(loadVastPromises).then(vasts => {
                // Push vast objects in the trigger in the original order
                // (this = promises returned objects)
                for (var i = 0; i < vasts.length; i++) {
                    if (vasts[i] && vasts[i].ads) {
                        trigger.vasts.push(vasts[i]);
                    }
                }
                resolve();
            }).catch(() => {
                reject();
            });
        });
    }

    _parseAdFile (fileContent, fileBaseUrl) {
        var adsManager,
            i;

        // Parse the file
        this._sequence = this._parser.parse(fileContent);

        if (!this._sequence) {
            return;
        }

        // Store base URL for subsequent VATS files download
        this._sequence.baseUrl = fileBaseUrl;

        // Initialize the ad managers
        for (i = 0; i < this._sequence.triggers.length; i++) {
            adsManager = new AdsManager(this._parser.getFormat());
            adsManager.init(this._sequence.triggers[i]);
            this._adsManagers.push(adsManager);
        }
    }

    _onVideoTimeupdate () {
        // Check for mid-roll triggers
        var trigger = this._checkTriggersStart();
        if (trigger !== null) {
            this._activateTrigger(trigger, true);
        }
    }

    _onVideoEnded () {
        // Check for end-roll triggers
        var trigger = this._checkTriggersStart();
        if (trigger !== null) {
            this._activateTrigger(trigger, true);
        }

        this._checkTriggersEnd();
    }

    _onTriggerEnd () {
        this._debug.log('End playing trigger');

        // Remove trigger end event listener
        this._eventBus.removeEventListener('triggerEnd', this._onTriggerEndListener);

        // Delete VAST player manager
        if (this._vastPlayerManager) {
            this._vastPlayerManager.reset();
            this._vastPlayerManager = null;
        }

        // Check if another trigger has to be activated
        var trigger = this._checkTriggersStart();
        if (trigger !== null) {
            this._activateTrigger(trigger, false);
        } else {
            // Notifies the application ad(s) playback has ended
            this._eventBus.dispatchEvent({type: 'end', data: null});

        }
    }

    _playTrigger (trigger) {
        if (trigger.vasts.length === 0) {
            return;
        }

        // Add trigger end event listener
        this._eventBus.addEventListener('triggerEnd', this._onTriggerEndListener);

        // Play the trigger
        this._debug.log('Start playing trigger ' + trigger.id);
        this._vastPlayerManager = new VastPlayerManager(trigger.vasts, this._adsPlayerContainer, this._mainVideo);
        this._vastPlayerManager.start();
    }

    _activateTrigger (trigger, firstTrigger) {

        // Check if a trigger is not already activated
        if (this._vastPlayerManager || this.loadingTrigger) {
            return;
        }

        if (firstTrigger) {
            // Notifies the application ad(s) playback starts
            this._eventBus.dispatchEvent({type: 'start', data: null});
        }

        this._debug.log('Activate trigger ' + trigger.id);

        trigger.activated = true;

        if (trigger.vasts.length === 0) {
            // Download VAST files
            this.loadingTrigger = true;
            this._loadTriggerVasts(trigger).then(() => {
                this.loadingTrigger = false;
                this._playTrigger(trigger);
            }, () => {
                this.loadingTrigger = false;
                });
        } else {
            this._playTrigger(trigger);
        }
    }

    _checkTriggersStart () {
        for (var i = 0; i < this._adsManagers.length; i++) {
            if (this._adsManagers[i].checkStartConditions(this._mainVideo)) {
                return this._adsManagers[i].getTrigger();
            }
        }
        return null;
    }

    _checkTriggersEnd () {
        for (var i = 0; i < this._adsManagers.length; i++) {
            if (this._adsManagers[i].checkEndConditions(this._mainVideo)) {
                // Remove ad manager => will not be activated anymore
                this._adsManagers.splice(0, 1);
                i--;
            }
        }
    }

    _start () {
        if (!this._sequence) {
            return;
        }

        if (this._sequence.triggers.length === 0) {
            this._debug.warn('No ad in sequence');
        }

        // Check for pre-roll trigger
        var trigger = this._checkTriggersStart();
        if (trigger !== null) {
            this._activateTrigger(trigger, true);
        }

    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    /**
     * Initialize the Ads Player Controller.
     * @method constructor
     * @access public
     * @memberof AdsPlayerController#
     * @param {Object} mainVideo - the HTML5 video element used by the main media player
     * @param {Object} adsPlayerContainer - The container to create the HTML5 video/image elements used to play and render the ads media
     */
    constructor (player, adsPlayerContainer) {

        this._mainPlayer = player;
        this._mainVideo = player.getVideoModel().getElement();
        this._adsPlayerContainer = adsPlayerContainer;
        this._sequence = null;
        this._fileLoaders = [];
        this._adsManagers = [];
        this._vastPlayerManager = null;
        this._parser = new Parser();
        this._vastParser = new VastParser();
        this._errorHandler = ErrorHandler.getInstance();
        this._debug = Debug.getInstance();
        this._eventBus = EventBus.getInstance();
        this.loadingTrigger = false;

        this._onVideoTimeupdateListener = this._onVideoTimeupdate.bind(this);
        this._onVideoEndedListener = this._onVideoEnded.bind(this);
        this._onTriggerEndListener = this._onTriggerEnd.bind(this);

        // Add <video> event listener
        this._mainVideo.addEventListener('timeupdate', this._onVideoTimeupdateListener);
        this._mainVideo.addEventListener('seeking', this._onVideoTimeupdateListener);
        this._mainVideo.addEventListener('ended', this._onVideoEndedListener);

        this._debug.setLevel(4);
    }

    /**
     * Load/open a sequence file.
     * @method load
     * @access public
     * @memberof AdsPlayerController#
     * @param {string} url - the sequence file url
     */
    load (url) {
        let fileLoader = new FileLoader();

        // Reset the sequence and ad managers
        this._sequence = null;
        this._adsManagers = [];

        // Download and parse sequence file
        this._debug.log("Download sequence file: " + url);

        return new Promise((resolve, reject) => {
            fileLoader.load(url).then(result => {
                this._debug.log("Parse sequence file");
                this._parseAdFile(result.response, result.baseUrl);
                // Start managing ads playing
                this._debug.log("Start");
                this._start();
                resolve();
            }).catch(error => {
                if (error) {
                    this._errorHandler.sendError(error.name, error.message, error.data);
                    reject(error);
                } else {
                    resolve();
                }
            });
            this._fileLoaders.push(fileLoader);
        });
    }

    /**
     * Stops and resets the Ads player.
     * @method reset
     * @access public
     * @memberof AdsPlayerController#
     */
    stop () {

        this._debug.log("Stop");

        // Stop/abort the file loaders
        for (var i = 0; i < this._fileLoaders.length; i++) {
            this._fileLoaders[i].abort();
        }
        this._fileLoaders = [];

        // Stop the ad player
        if (this._vastPlayerManager) {
            this._vastPlayerManager.stop();
            this._vastPlayerManager = null;

            this._onTriggerEnd();
        }
    }

    reset () {

        this._debug.log("Reset");

        this.stop();

        // Reset the ad managers
        this._adsManagers = [];

        // Reset the sequence
        this._sequence = null;
    }

    destroy () {

        this._debug.log("Destroy");

        this.reset();

        // Remove <video> event listener
        this._mainVideo.removeEventListener('timeupdate', this._onVideoTimeupdateListener);
        this._mainVideo.removeEventListener('seeking', this._onVideoTimeupdateListener);
        this._mainVideo.removeEventListener('ended', this._onVideoEndedListener);

    }

    /**
     * Plays/resumes the playback of the current ad.
     * @method play
     * @access public
     * @memberof AdsPlayerController#
     */
    play () {

        this._debug.log("Play");
        // Play the ad player
        if (this._vastPlayerManager) {
            this._vastPlayerManager.play();
        }
    }

    /**
     * Pauses the playback of the current ad.
     * @method pause
     * @access public
     * @memberof AdsPlayerController#
     */
    pause () {

        this._debug.log("Pause");
        // Stop the ad player
        if (this._vastPlayerManager) {
            this._vastPlayerManager.pause();
        }
    }

    /**
     * Skip the playback of the current ad.
     * @method skip
     * @access public
     * @memberof AdsPlayerController#
     */
    skip () {

        this._debug.log("skip");
        // Skip the ad player
        if (this._vastPlayerManager) {
            this._vastPlayerManager.skip();
        }
    }
}

export default AdsPlayerController;
