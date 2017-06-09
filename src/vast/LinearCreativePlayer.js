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
* The CreativePlayer manages:
* - the playing of media files within a Creative (with the help of a Image/VideoPlayer)
* - the tracking events (with the help of a TrackingEventsManager)
* - the display of the ad skipping component
* - the user clicks
*/

import TrackingEventsManager from './TrackingEventsManager';
import VideoPlayer from '../media/VideoPlayer';
import ImagePlayer from '../media/ImagePlayer';
import Debug from '../Debug';
import EventBus from '../EventBus';

class LinearCreativePlayer {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

    _parseTime (str) {
        var timeParts,
            SECONDS_IN_HOUR = 60 * 60,
            SECONDS_IN_MIN = 60;

        if (!str) {
            return -1;
        }

        timeParts = str.split(':');

        // Check time format, must be HH:MM:SS(.mmm)
        if (timeParts.length !== 3) {
            return -1;
        }

        return  (parseInt(timeParts[0]) * SECONDS_IN_HOUR) +
                (parseInt(timeParts[1]) * SECONDS_IN_MIN) +
                (parseFloat(timeParts[2]));
    }

    _onMediaPlay () {

        this._debug.log("Creative media play");

        // Notify the creative has ended
        this._eventBus.dispatchEvent({
            type: 'play',
            data: {}
        });
    }

    _onMediaPause () {

        this._debug.log("Creative media pause");

        // Notify the creative has ended
        this._eventBus.dispatchEvent({
            type: 'pause',
            data: {}
        });
    }

    _onMediaError () {

        this._debug.log("Creative media error");

        // Notify the creative has ended
        this._eventBus.dispatchEvent({
            type: 'creativeEnd',
            data: {}
        });
    }

    _onMediaEnded () {

        this._debug.log("creative media ended");

        // Resume main video
        this._resumeMainVideo();

        // Notify the creative has ended
        this._eventBus.dispatchEvent({
            type: 'creativeEnd',
            data: {}
        });
    }

    _onMediaTimeupdate () {
        this._evaluateTimeOffset();
    }

    _initTimeOffset() {
        if (!this.currentCreative) {
            return;
        }

        if (this.currentCreative.skipoffsetInSeconds &&
            !isNaN(this.currentCreative.skipoffsetInSeconds)) {
            this.timeOffset = this.currentCreative.skipoffsetInSeconds;
        } else if (this.currentCreative.skipoffsetPercent &&
            !isNaN(this.currentCreative.skipoffsetPercent)) {
            // Calculate the time offset according to ad duration
            this.timeOffset = this._mediaPlayer.getDuration() * this.currentCreative.skipoffsetPercent;
        } else {
            this.timeOffset = -1;
        }

        if (this.timeOffset !== -1) {
        // Send time offset event with remaining time
            this._eventBus.dispatchEvent({
                type: 'skippable',
                data: {
                    "remainingTime": this.timeOffset
                }
            });
        }
    }

    _evaluateTimeOffset() {
        if (this.timeOffset === null) {
            this._initTimeOffset();
        }

        if (!this.currentCreative ||
            this.timeOffset === -1 ||
            this.skipOffsetSent) {
            return false;
        }

        if (this.timeOffset &&
            !isNaN(this.timeOffset) &&
            this._mediaPlayer.getCurrentTime() > this.timeOffset) {

            // Time offset has been reached
            this._eventBus.dispatchEvent({
                type: 'skippable',
                data: {
                    "remainingTime": 0
                }
            });
            this.skipOffsetSent = true;
        }
    }

    _onAdClick (creative) {
        if (!creative.videoClicks) {
            return;
        }
        this._debug.log("Creative Click");
        // ClickThrough : send an event for the application to open the web page
        if (creative.videoClicks.clickThrough) {
            this._debug.log("Ad click, uri = " + creative.videoClicks.clickThrough.uri);
            this._eventBus.dispatchEvent({
                type: 'click',
                data: {
                    uri: creative.videoClicks.clickThrough.uri
                }
            });
        }

        // TODO
        // ClickTracking
        // if (this.videoClicks.clickTracking) {
        // }
    }

    _pauseMainVideo () {
        // in case of pre-roll ad, the main video may not be started yet
        if (!this._mainVideo.paused) {
            this._debug.log("(LinearCreativePlayer) Pause main video");
            this._mainVideo.pause();
        } else {
            // then add a listener on playing to pause when it occurs
            this._mainVideo.addEventListener("playing", this._onMainVideoPlayListener);
        }
    }

    _onMainVideoPlay () {
        this._debug.log("(LinearCreativePlayer) Pause main video");
        this._mainVideo.pause();
    }

    _resumeMainVideo () {

        this._mainVideo.removeEventListener("playing", this._onMainVideoPlayListener);

        if ((this._mainVideo.paused) && (!this._mainVideo.ended)) {
            this._debug.log("(LinearCreativePlayer) Resume main video");
            this._mainVideo.play();
        }
    }

    _load (creative, baseUrl) {
        var mediaFile,
            isVideo,
            isImage;

        if (!creative) {
            return false;
        }

        if (creative.mediaFiles.length === 0) {
            return false;
        }

        this.timeOffset = null;
        this.skipOffsetSent = false;
        this.currentCreative = creative;
        mediaFile = creative.mediaFiles[0];

        // Video or image media ?
        isVideo = mediaFile.type.indexOf('video') !== -1;
        isImage = mediaFile.type.indexOf('image') !== -1;

        if (isVideo) {
            this._mediaPlayer = new VideoPlayer();
        }
        else if (isImage) {
            this._mediaPlayer = new ImagePlayer();
        } else {
            // Unknown/unsupported media type
            return false;
        }

        // Load the media files
        this._debug.log("Creative load");
        if (!this._mediaPlayer.load(baseUrl, creative.mediaFiles)) {
            this._mediaPlayer = null;
            return false;
        }

        this._mediaPlayer.setDuration(this._parseTime(creative.duration));
        this._mediaPlayer.addEventListener('play', this._onMediaPlayListener);
        this._mediaPlayer.addEventListener('pause', this._onMediaPauseListener);
        this._mediaPlayer.addEventListener('error', this._onMediaErrorListener);
        this._mediaPlayer.addEventListener('timeupdate', this._onMediaTimeupdateListener);
        this._mediaPlayer.addEventListener('ended', this._onMediaEndedListener);

        // Add tracking events
        if (creative.trackingEvents) {
            this._trackingEventsManager = new TrackingEventsManager(creative.trackingEvents, this._mediaPlayer);
            this._trackingEventsManager.start();
        }

        // Notify a creative is starting to play
        this._eventBus.dispatchEvent({
            type: 'creativeStart',
            data: {}
        });

        // Notify a media element has been created and appended into document
        this._eventBus.dispatchEvent({
            type: 'addElement',
            data: {
                element: this._mediaPlayer.getElement(),
                type: this._mediaPlayer.getType()
            }
        });

        // Add the ad DOM container
        this._adPlayerContainer.appendChild(this._mediaPlayer.getElement());

        // Size and position the ad DOM container
        this._adPlayerContainer.style.position = "absolute";
        this._adPlayerContainer.style.bottom = "0%";
        this._adPlayerContainer.style.left = "0%";
        this._adPlayerContainer.style.height = "100%";
        this._adPlayerContainer.style.width = "100%";
        this._adPlayerContainer.style.display = "block";

        // Listener for click
        if (creative.videoClicks) {
            if (creative.videoClicks.clickThrough) {
                this._mediaPlayer.getElement().style.cursor = 'pointer';
            }
            this._mediaPlayer.getElement().addEventListener('click', this._onAdClick.bind(this, creative));
        }

        // Align media volume to main video volume
        this._onMainVideoVolumeChange();

        // Pause main video
        this._pauseMainVideo();

        // Start playing the media
        this._play();

        return true;
    }

    _play () {

        if (!this._mediaPlayer) {
            return;
        }

        this._debug.log("Creative play");

        // Play the media player
        this._mediaPlayer.play();
    }

    _pause () {

        if (!this._mediaPlayer) {
            return;
        }

        this._debug.log("Creative pause");

        // Pause the media player
        this._mediaPlayer.pause();
    }

    _reset () {
        if (!this._mediaPlayer) {
            return;
        }

        this._mainVideo.removeEventListener('volumechange', this._onMainVideoVolumeChange.bind(this));
        this._mainVideo = null;
    }

    _stop () {

        if (!this._mediaPlayer) {
            return;
        }

        this._debug.log("Creative stop");

        // Stop the media player
        this._mediaPlayer.removeEventListener('play', this._onMediaPlayListener);
        this._mediaPlayer.removeEventListener('pause', this._onMediaPauseListener);
        this._mediaPlayer.removeEventListener('error', this._onMediaErrorListener);
        this._mediaPlayer.removeEventListener('timeupdate', this._onMediaTimeupdateListener);
        this._mediaPlayer.removeEventListener('ended', this._onMediaEndedListener);
        this._mediaPlayer.stop();

        // Notify a media element has been removed from document and destroyed
        this._eventBus.dispatchEvent({
            type: 'removeElement',
            data: {
                element: this._mediaPlayer.getElement(),
                type: this._mediaPlayer.getType()
            }
        });

        this._adPlayerContainer.style.height = "0%";
        this._adPlayerContainer.style.width = "0%";
        this._adPlayerContainer.style.display = "none";
        this._adPlayerContainer.removeChild(this._mediaPlayer.getElement());

        this.currentCreative = null;

        // Delete the media player
        this._mediaPlayer.delete();
        this._mediaPlayer = null;

        // Stop the TrackingEvents manager
        if (this._trackingEventsManager) {
            this._trackingEventsManager.stop();
            this._trackingEventsManager = null;
        }
    }

    _onMainVideoVolumeChange () {
        if (!this._mediaPlayer) {
            return;
        }
        this._mediaPlayer.setVolume(this._mainVideo.muted ? 0 : this._mainVideo.volume);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    /**
     * Initializes the creative player.
     * @method constructor
     * @access public
     * @memberof LinearCreativePlayer#
     * @param {Object} adPlayerContainer
     * @param {HTMLVideoElement} mainVideo
     */
    constructor(adPlayerContainer, mainVideo) {
        this._mediaPlayer = null;
        this._trackingEventsManager = null;
        this._debug = Debug.getInstance();
        this._eventBus = EventBus.getInstance();
        this._adPlayerContainer = adPlayerContainer;
        this._mainVideo = mainVideo;

        this._onMediaPlayListener = this._onMediaPlay.bind(this);
        this._onMediaPauseListener = this._onMediaPause.bind(this);
        this._onMediaErrorListener = this._onMediaError.bind(this);
        this._onMediaTimeupdateListener = this._onMediaTimeupdate.bind(this);
        this._onMediaEndedListener = this._onMediaEnded.bind(this);
        this._onMainVideoPlayListener = this._onMainVideoPlay.bind(this);
        this._mainVideo.addEventListener('volumechange', this._onMainVideoVolumeChange.bind(this));

    }

    /**
     * Delete the creative player.
     * @method delete
     * @access public
     * @memberof LinearCreativePlayer#
     */
    delete () {
        this._stop();
        this._reset();
    }

    load (creative, baseUrl) {
        return this._load(creative, baseUrl);
    }

    play () {
        this._play();
    }

    pause () {
        this._pause();
    }

    stop () {
        this._stop();
    }

}

export default LinearCreativePlayer;
