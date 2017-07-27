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
import PlayEvent from "../events/PlayEvent";
import PauseEvent from "../events/PauseEvent";
import CreativeEndEvent from "../events/CreativeEndEvent";
import SkippableEvent from "../events/SkippableEvent";
import CreativeStartEvent from "../events/CreativeStartEvent";
import AddElementEvent from "../events/AddElementEvent";
import RemoveElementEvent from "../events/RemoveElementEvent";
import ClickEvent from "../events/ClickEvent";
import AdPlayer from "../media/AdPlayer";

class LinearCreativePlayer {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    private debug: Debug = null;
    private eventBus: EventBus = null;
    private adPlayer: AdPlayer = null;
    private trackingEventsManager: any = null;
    private _onMediaPlayListener: () => void;
    private _onMediaPauseListener: () => void;
    private _onMediaErrorListener: () => void;
    private _onMediaTimeupdateListener: () => void;
    private _onMediaEndedListener: () => void;
    private _onMainVideoPlayListener: () => void;
    private timeOffset: number = 0;
    private currentCreative: any = null;
    private skipOffsetSent: boolean = false;

    /**
     * Initializes the creative player.
     * @method constructor
     * @access public
     * @memberof LinearCreativePlayer#
     * @param {Object} adPlayerContainer
     * @param {HTMLVideoElement} mainVideo
     */
    constructor(private adPlayerContainer: any, private mainVideo: HTMLVideoElement) {
        this.debug = Debug.getInstance();
        this.eventBus = EventBus.getInstance();

        this._onMediaPlayListener = this._onMediaPlay.bind(this);
        this._onMediaPauseListener = this._onMediaPause.bind(this);
        this._onMediaErrorListener = this._onMediaError.bind(this);
        this._onMediaTimeupdateListener = this._onMediaTimeupdate.bind(this);
        this._onMediaEndedListener = this._onMediaEnded.bind(this);
        this._onMainVideoPlayListener = this._onMainVideoPlay.bind(this);
        this.mainVideo.addEventListener('volumechange', this._onMainVideoVolumeChange.bind(this));

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

    load (creative: any, baseUrl: string) {
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

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

    _parseTime (str:string) : number {
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

    _onMediaPlay () : void {

        this.debug.log("Creative media play");

        // Notify the creative has ended
        let playEvent : any = new PlayEvent();
        this.eventBus.dispatchEvent(playEvent);
    }

    _onMediaPause () : void {

        this.debug.log("Creative media pause");

        // Notify the creative has ended
        let pauseEvent : any = new PauseEvent();
        this.eventBus.dispatchEvent(pauseEvent);
    }

    _onMediaError () : void {

        this.debug.log("Creative media error");

        // Notify the creative has ended
        let creativeEndEvent : any = new CreativeEndEvent();
        this.eventBus.dispatchEvent(creativeEndEvent);
    }

    _onMediaEnded () : void {

        this.debug.log("creative media ended");

        // Resume main video
        this._resumeMainVideo();

        // Notify the creative has ended
        let creativeEndEvent : any = new CreativeEndEvent();
        this.eventBus.dispatchEvent(creativeEndEvent);
    }

    _onMediaTimeupdate () : void {
        this._evaluateTimeOffset();
    }

    _initTimeOffset() : void {
        if (!this.currentCreative) {
            return;
        }

        if (this.currentCreative.skipoffsetInSeconds &&
            !isNaN(this.currentCreative.skipoffsetInSeconds)) {
            this.timeOffset = this.currentCreative.skipoffsetInSeconds;
        } else if (this.currentCreative.skipoffsetPercent &&
            !isNaN(this.currentCreative.skipoffsetPercent)) {
            // Calculate the time offset according to ad duration
            this.timeOffset = this.adPlayer.getDuration() * this.currentCreative.skipoffsetPercent;
        } else {
            this.timeOffset = -1;
        }

        if (this.timeOffset !== -1) {
            // Send time offset event with remaining time
            let event:any = new SkippableEvent(this.timeOffset);
            this.eventBus.dispatchEvent(event);

        }
    }

    _evaluateTimeOffset(): void {
        if (this.timeOffset === null) {
            this._initTimeOffset();
        }

        if (!this.currentCreative ||
            this.timeOffset === -1 ||
            this.skipOffsetSent) {
            return;
        }

        if (this.timeOffset &&
            !isNaN(this.timeOffset) &&
            this.adPlayer.getCurrentTime() > this.timeOffset) {

            // Time offset has been reached
            let event:any = new SkippableEvent(0);
            this.eventBus.dispatchEvent(event);
            this.skipOffsetSent = true;
        }
    }

    _onAdClick (creative : any) : void {
        if (!creative.videoClicks) {
            return;
        }
        this.debug.log("Creative Click");
        // ClickThrough : send an event for the application to open the web page
        if (creative.videoClicks.clickThrough) {
            this.debug.log("Ad click, uri = " + creative.videoClicks.clickThrough.uri);
            let clickEvent: any = new ClickEvent(creative.videoClicks.clickThrough.uri);
            this.eventBus.dispatchEvent(clickEvent);
        }

        // TODO
        // ClickTracking
        // if (this.videoClicks.clickTracking) {
        // }
    }

    _pauseMainVideo () {
        // in case of pre-roll ad, the main video may not be started yet
        if (!this.mainVideo.paused) {
            this.debug.log("(LinearCreativePlayer) Pause main video");
            this.mainVideo.pause();
        } else {
            // then add a listener on playing to pause when it occurs
            this.mainVideo.addEventListener("playing", this._onMainVideoPlayListener);
        }

        this.mainVideo.style.display = "none";
    }

    _onMainVideoPlay () {
        this.debug.log("(LinearCreativePlayer) Pause main video");
        this.mainVideo.pause();
    }

    _resumeMainVideo () {

        this.mainVideo.removeEventListener("playing", this._onMainVideoPlayListener);

        if ((this.mainVideo.paused) && (!this.mainVideo.ended)) {
            this.debug.log("(LinearCreativePlayer) Resume main video");
            this.mainVideo.play();
        }

        this.mainVideo.style.display = "block";
    }

    _load (creative: any, baseUrl: string) {
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
            this.adPlayer = new VideoPlayer();
        }
        else if (isImage) {
            this.adPlayer = new ImagePlayer();
        } else {
            // Unknown/unsupported media type
            return false;
        }

        // Load the media files
        this.debug.log("Creative load");
        if (!this.adPlayer.load(baseUrl, creative.mediaFiles)) {
            this.adPlayer = null;
            return false;
        }

        this.adPlayer.setDuration(this._parseTime(creative.duration));
        this.adPlayer.addEventListener('play', this._onMediaPlayListener);
        this.adPlayer.addEventListener('pause', this._onMediaPauseListener);
        this.adPlayer.addEventListener('error', this._onMediaErrorListener);
        this.adPlayer.addEventListener('timeupdate', this._onMediaTimeupdateListener);
        this.adPlayer.addEventListener('ended', this._onMediaEndedListener);

        // Add tracking events
        if (creative.trackingEvents) {
            this.trackingEventsManager = new TrackingEventsManager(creative.trackingEvents, this.adPlayer);
            this.trackingEventsManager.start();
        }

        // Notify a creative is starting to play
        let creativeStartEvent: any = new CreativeStartEvent();
        this.eventBus.dispatchEvent(creativeStartEvent);

        // Notify a media element has been created and appended into document
        let addElementEvent: any = new AddElementEvent(this.adPlayer.getElement(),this.adPlayer.getType());
        this.eventBus.dispatchEvent(addElementEvent);

        // Add the ad DOM container
        this.adPlayerContainer.appendChild(this.adPlayer.getElement());

        // Size and position the ad DOM container
        this.adPlayerContainer.style.position = "absolute";
        this.adPlayerContainer.style.bottom = "0%";
        this.adPlayerContainer.style.left = "0%";
        this.adPlayerContainer.style.height = "100%";
        this.adPlayerContainer.style.width = "100%";
        this.adPlayerContainer.style.display = "block";

        // Listener for click
        if (creative.videoClicks) {
            if (creative.videoClicks.clickThrough) {
                this.adPlayer.getElement().style.cursor = 'pointer';
            }
            this.adPlayer.getElement().addEventListener('click', this._onAdClick.bind(this, creative));
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

        if (!this.adPlayer) {
            return;
        }

        this.debug.log("Creative play");

        // Play the media player
        this.adPlayer.play();
    }

    _pause () {

        if (!this.adPlayer) {
            return;
        }

        this.debug.log("Creative pause");

        // Pause the media player
        this.adPlayer.pause();
    }

    _reset () {
        if (!this.adPlayer) {
            return;
        }

        this.mainVideo.removeEventListener('volumechange', this._onMainVideoVolumeChange.bind(this));
        this.mainVideo = null;
    }

    _stop () {

        if (!this.adPlayer) {
            return;
        }

        this.debug.log("Creative stop");

        // Stop the media player
        this.adPlayer.removeEventListener('play', this._onMediaPlayListener);
        this.adPlayer.removeEventListener('pause', this._onMediaPauseListener);
        this.adPlayer.removeEventListener('error', this._onMediaErrorListener);
        this.adPlayer.removeEventListener('timeupdate', this._onMediaTimeupdateListener);
        this.adPlayer.removeEventListener('ended', this._onMediaEndedListener);
        this.adPlayer.stop();

        // Notify a media element has been removed from document and destroyed
        let removeElementEvent: any = new RemoveElementEvent(this.adPlayer.getElement(),this.adPlayer.getType());
        this.eventBus.dispatchEvent(removeElementEvent);

        this.adPlayerContainer.style.height = "0%";
        this.adPlayerContainer.style.width = "0%";
        this.adPlayerContainer.style.display = "none";
        this.adPlayerContainer.removeChild(this.adPlayer.getElement());

        this.currentCreative = null;

        // Delete the media player
        this.adPlayer.delete();
        this.adPlayer = null;

        // Stop the TrackingEvents manager
        if (this.trackingEventsManager) {
            this.trackingEventsManager.stop();
            this.trackingEventsManager = null;
        }
    }

    _onMainVideoVolumeChange () {
        if (!this.adPlayer) {
            return;
        }
        this.adPlayer.setVolume(this.mainVideo.muted ? 0 : this.mainVideo.volume);
    }

}

export default LinearCreativePlayer;
