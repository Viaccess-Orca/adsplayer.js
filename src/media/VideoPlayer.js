import Debug from '../Debug';
import AdPlayer from "./AdPlayer";
class VideoPlayer extends AdPlayer {
    constructor() {
        super();
        this.debug = Debug.getInstance();
        this.video = null;
        this.uri = "";
    }
    delete() {
        if (!this.video) {
            return;
        }
        this.video = null;
    }
    load(baseUrl, mediaFiles) {
        {
            this.video = document.createElement('video');
            this.video.autoplay = false;
            this.video.id = 'adsplayer-video';
            this.video.style.width = "100%";
        }
        if (!this.isMediaSupported(mediaFiles[0].type)) {
            return false;
        }
        mediaFiles.sort(function (a, b) {
            if (a.bitrate && b.bitrate) {
                return a.bitrate - b.bitrate;
            }
            return -1;
        });
        this.uri = mediaFiles[0].uri;
        this.uri = (this.uri.indexOf('http://') === -1) ? (baseUrl + this.uri) : this.uri;
        this.debug.log("Load video media, uri = " + this.uri);
        this.video.addEventListener('error', function (e) {
            console.log(e);
        });
        this.video.src = this.uri;
        return true;
    }
    getType() {
        return "video";
    }
    getElement() {
        return this.video;
    }
    addEventListener(type, listener) {
        if (!this.video) {
            return;
        }
        this.video.addEventListener(type, listener);
    }
    removeEventListener(type, listener) {
        if (!this.video) {
            return;
        }
        this.video.removeEventListener(type, listener);
    }
    setDuration() {
    }
    getDuration() {
        if (!this.video) {
            return 0;
        }
        return this.video.duration;
    }
    getCurrentTime() {
        if (!this.video) {
            return 0;
        }
        return this.video.currentTime;
    }
    getVolume() {
        if (!this.video) {
            return 0;
        }
        return this.video.muted ? 0 : this.video.volume;
    }
    setVolume(volume) {
        if (!this.video) {
            return;
        }
        this.video.volume = volume;
    }
    play() {
        if (!this.video) {
            return;
        }
        this.video.play();
    }
    stop() {
        if (!this.video) {
            return;
        }
        this.video.pause();
    }
    pause() {
        if (!this.video) {
            return;
        }
        this.video.pause();
    }
    isEnded() {
        if (!this.video) {
            return true;
        }
        return this.video.ended;
    }
    isMediaSupported(mimeType) {
        if (!this.video) {
            throw "isMediaSupported(): element not created";
        }
        var canPlay = this.video.canPlayType(mimeType);
        return (canPlay === "probably" || canPlay === "maybe");
    }
}
export default VideoPlayer;
