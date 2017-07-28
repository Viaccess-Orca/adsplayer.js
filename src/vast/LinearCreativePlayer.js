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
class LinearCreativePlayer {
    constructor(adPlayerContainer, mainVideo) {
        this.adPlayerContainer = adPlayerContainer;
        this.mainVideo = mainVideo;
        this.debug = null;
        this.eventBus = null;
        this.adPlayer = null;
        this.trackingEventsManager = null;
        this.timeOffset = -1;
        this.currentCreative = null;
        this.skipOffsetSent = false;
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
    delete() {
        this._stop();
        this._reset();
    }
    load(creative, baseUrl) {
        return this._load(creative, baseUrl);
    }
    play() {
        this._play();
    }
    pause() {
        this._pause();
    }
    stop() {
        this._stop();
    }
    _parseTime(str) {
        var timeParts, SECONDS_IN_HOUR = 60 * 60, SECONDS_IN_MIN = 60;
        if (!str) {
            return -1;
        }
        timeParts = str.split(':');
        if (timeParts.length !== 3) {
            return -1;
        }
        return (parseInt(timeParts[0]) * SECONDS_IN_HOUR) +
            (parseInt(timeParts[1]) * SECONDS_IN_MIN) +
            (parseFloat(timeParts[2]));
    }
    _onMediaPlay() {
        this.debug.log("Creative media play");
        let playEvent = new PlayEvent();
        this.eventBus.dispatchEvent(playEvent);
    }
    _onMediaPause() {
        this.debug.log("Creative media pause");
        let pauseEvent = new PauseEvent();
        this.eventBus.dispatchEvent(pauseEvent);
    }
    _onMediaError() {
        this.debug.log("Creative media error");
        let creativeEndEvent = new CreativeEndEvent();
        this.eventBus.dispatchEvent(creativeEndEvent);
    }
    _onMediaEnded() {
        this.debug.log("creative media ended");
        this._resumeMainVideo();
        let creativeEndEvent = new CreativeEndEvent();
        this.eventBus.dispatchEvent(creativeEndEvent);
    }
    _onMediaTimeupdate() {
        this._evaluateTimeOffset();
    }
    _initTimeOffset() {
        if (!this.currentCreative) {
            return;
        }
        if (this.currentCreative.skipoffsetInSeconds &&
            !isNaN(this.currentCreative.skipoffsetInSeconds)) {
            this.timeOffset = this.currentCreative.skipoffsetInSeconds;
        }
        else if (this.currentCreative.skipoffsetPercent &&
            !isNaN(this.currentCreative.skipoffsetPercent)) {
            this.timeOffset = this.adPlayer.getDuration() * this.currentCreative.skipoffsetPercent;
        }
        else {
            this.timeOffset = -1;
        }
        if (this.timeOffset !== -1) {
            let event = new SkippableEvent(this.timeOffset);
            this.eventBus.dispatchEvent(event);
        }
    }
    _evaluateTimeOffset() {
        if (this.timeOffset === -1) {
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
            let event = new SkippableEvent(0);
            this.eventBus.dispatchEvent(event);
            this.skipOffsetSent = true;
        }
    }
    _onAdClick(creative) {
        if (!creative.videoClicks) {
            return;
        }
        this.debug.log("Creative Click");
        if (creative.videoClicks.clickThrough) {
            this.debug.log("Ad click, uri = " + creative.videoClicks.clickThrough.uri);
            let clickEvent = new ClickEvent(creative.videoClicks.clickThrough.uri);
            this.eventBus.dispatchEvent(clickEvent);
        }
    }
    _pauseMainVideo() {
        if (!this.mainVideo.paused) {
            this.debug.log("(LinearCreativePlayer) Pause main video");
            this.mainVideo.pause();
        }
        else {
            this.mainVideo.addEventListener("playing", this._onMainVideoPlayListener);
        }
        this.mainVideo.style.display = "none";
    }
    _onMainVideoPlay() {
        this.debug.log("(LinearCreativePlayer) Pause main video");
        this.mainVideo.pause();
    }
    _resumeMainVideo() {
        this.mainVideo.removeEventListener("playing", this._onMainVideoPlayListener);
        if ((this.mainVideo.paused) && (!this.mainVideo.ended)) {
            this.debug.log("(LinearCreativePlayer) Resume main video");
            this.mainVideo.play();
        }
        this.mainVideo.style.display = "block";
    }
    _load(creative, baseUrl) {
        var mediaFile, isVideo, isImage;
        if (!creative) {
            return false;
        }
        if (creative.mediaFiles.length === 0) {
            return false;
        }
        this.skipOffsetSent = false;
        this.currentCreative = creative;
        mediaFile = creative.mediaFiles[0];
        isVideo = mediaFile.type.indexOf('video') !== -1;
        isImage = mediaFile.type.indexOf('image') !== -1;
        if (isVideo) {
            this.adPlayer = new VideoPlayer();
        }
        else if (isImage) {
            this.adPlayer = new ImagePlayer();
        }
        else {
            return false;
        }
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
        if (creative.trackingEvents) {
            this.trackingEventsManager = new TrackingEventsManager(creative.trackingEvents, this.adPlayer);
            this.trackingEventsManager.start();
        }
        let creativeStartEvent = new CreativeStartEvent();
        this.eventBus.dispatchEvent(creativeStartEvent);
        let addElementEvent = new AddElementEvent(this.adPlayer.getElement(), this.adPlayer.getType());
        this.eventBus.dispatchEvent(addElementEvent);
        this.adPlayerContainer.appendChild(this.adPlayer.getElement());
        this.adPlayerContainer.style.position = "absolute";
        this.adPlayerContainer.style.bottom = "0%";
        this.adPlayerContainer.style.left = "0%";
        this.adPlayerContainer.style.height = "100%";
        this.adPlayerContainer.style.width = "100%";
        this.adPlayerContainer.style.display = "block";
        if (creative.videoClicks) {
            if (creative.videoClicks.clickThrough) {
                this.adPlayer.getElement().style.cursor = 'pointer';
            }
            this.adPlayer.getElement().addEventListener('click', this._onAdClick.bind(this, creative));
        }
        this._onMainVideoVolumeChange();
        this._pauseMainVideo();
        this._play();
        return true;
    }
    _play() {
        if (!this.adPlayer) {
            return;
        }
        this.debug.log("Creative play");
        this.adPlayer.play();
    }
    _pause() {
        if (!this.adPlayer) {
            return;
        }
        this.debug.log("Creative pause");
        this.adPlayer.pause();
    }
    _reset() {
        if (!this.adPlayer) {
            return;
        }
        this.mainVideo.removeEventListener('volumechange', this._onMainVideoVolumeChange.bind(this));
        this.mainVideo = null;
    }
    _stop() {
        if (!this.adPlayer) {
            return;
        }
        this.debug.log("Creative stop");
        this.adPlayer.removeEventListener('play', this._onMediaPlayListener);
        this.adPlayer.removeEventListener('pause', this._onMediaPauseListener);
        this.adPlayer.removeEventListener('error', this._onMediaErrorListener);
        this.adPlayer.removeEventListener('timeupdate', this._onMediaTimeupdateListener);
        this.adPlayer.removeEventListener('ended', this._onMediaEndedListener);
        this.adPlayer.stop();
        let removeElementEvent = new RemoveElementEvent(this.adPlayer.getElement(), this.adPlayer.getType());
        this.eventBus.dispatchEvent(removeElementEvent);
        this.adPlayerContainer.style.height = "0%";
        this.adPlayerContainer.style.width = "0%";
        this.adPlayerContainer.style.display = "none";
        this.adPlayerContainer.removeChild(this.adPlayer.getElement());
        this.currentCreative = null;
        this.adPlayer.delete();
        this.adPlayer = null;
        if (this.trackingEventsManager) {
            this.trackingEventsManager.stop();
            this.trackingEventsManager = null;
        }
    }
    _onMainVideoVolumeChange() {
        if (!this.adPlayer) {
            return;
        }
        this.adPlayer.setVolume(this.mainVideo.muted ? 0 : this.mainVideo.volume);
    }
}
export default LinearCreativePlayer;
