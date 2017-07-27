import Debug from '../Debug';
import AdPlayer from "./AdPlayer";
class ImagePlayer extends AdPlayer {
    constructor() {
        super();
        this.debug = Debug.getInstance();
        this.image = null;
        this.uri = null;
        this.currentTime = 0;
        this.ended = false;
        this.duration = 0;
        this.events = ['play', 'pause', 'timeupdate', 'ended'];
        this.timerInterval = 0;
        this.timerTime = -1;
        this._listeners = {};
    }
    delete() {
        if (!this.image) {
            return;
        }
        this.image = null;
        this._listeners = {};
    }
    load(baseUrl, mediaFiles) {
        var mediaFile = null, type, i;
        for (i = 0; i < mediaFiles.length; i++) {
            type = mediaFiles[i].type;
            if ((type === "image/jpeg") || (type === "image/jpg") || (type === "image/png") || (type === "image/gif")) {
                mediaFile = mediaFiles[i];
                break;
            }
        }
        if (mediaFile === null) {
            return false;
        }
        {
            this.image = document.createElement('img');
            this.image.id = 'adsplayer-image';
        }
        this.uri = mediaFile.uri;
        this.uri = (this.uri.indexOf('http://') === -1) ? (baseUrl + this.uri) : this.uri;
        this.debug.log("Load image media, uri = " + this.uri);
        this.image.src = this.uri;
        this.currentTime = 0;
        this.ended = false;
        return true;
    }
    getType() {
        return "image";
    }
    getElement() {
        return this.image;
    }
    addEventListener(type, listener) {
        if (!this.image) {
            return;
        }
        if (this.events.indexOf(type) !== -1) {
            this._addEventListener(type, listener);
        }
        else {
            this.image.addEventListener(type, listener);
        }
    }
    removeEventListener(type, listener) {
        if (!this.image) {
            return;
        }
        if (this.events.indexOf(type) !== -1) {
            this._removeEventListener(type, listener);
        }
        else {
            this.image.removeEventListener(type, listener);
        }
    }
    setDuration(duration) {
        this.duration = duration;
    }
    getDuration() {
        return this.duration;
    }
    getCurrentTime() {
        return this.currentTime;
    }
    setVolume(volume) {
        volume = 0;
    }
    getVolume() {
        return 0;
    }
    play() {
        if (!this.image) {
            return;
        }
        this._startTimer();
    }
    pause() {
        if (!this.image) {
            return;
        }
        this._stopTimer();
    }
    stop() {
        if (!this.image) {
            return;
        }
        this._stopTimer();
    }
    isEnded() {
        return this.ended;
    }
    _getListeners(type) {
        if (!(type in this._listeners)) {
            this._listeners[type] = [];
        }
        return this._listeners[type];
    }
    _addEventListener(type, listener) {
        var listeners = this._getListeners(type), idx = listeners.indexOf(listener);
        if (idx === -1) {
            listeners.push(listener);
        }
    }
    _removeEventListener(type, listener) {
        var listeners = this._getListeners(type), idx = listeners.indexOf(listener);
        if (idx !== -1) {
            listeners.splice(idx, 1);
        }
    }
    _notifyEvent(type) {
        var listeners = this._getListeners(type), i = 0;
        for (i = 0; i < listeners.length; i++) {
            listeners[i].call(this);
        }
    }
    _updateCurrentTime() {
        var time = new Date().getTime();
        this.currentTime += (time - this.timerTime) / 1000;
        this._notifyEvent('timeupdate');
        if (this.currentTime >= this.duration) {
            this._stopTimer();
            this.ended = true;
            this._notifyEvent('ended');
        }
        this.timerTime = time;
    }
    _startTimer() {
        if (this.timerInterval !== 0) {
            return;
        }
        this._notifyEvent('play');
        this.timerTime = new Date().getTime();
        this.timerInterval = setInterval(this._updateCurrentTime.bind(this), 200);
    }
    _stopTimer() {
        if (this.timerInterval === 0) {
            return;
        }
        this._notifyEvent('pause');
        clearInterval(this.timerInterval);
        this.timerInterval = 0;
    }
}
export default ImagePlayer;
