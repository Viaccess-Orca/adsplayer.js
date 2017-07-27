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
* The ImagePlayer is a MediaPlayer implementation for playing still images.
*/

import Debug from '../Debug';
import AdPlayer from "./AdPlayer";

class ImagePlayer extends AdPlayer{

    private debug: Debug = Debug.getInstance();
    private image: HTMLImageElement = null;
    private uri: string = null;
    private currentTime: number = 0;
    private ended: boolean = false;
    private duration: number = 0;
    private events: Array<string> = ['play', 'pause', 'timeupdate', 'ended'];
    private timerInterval: number = 0;
    private timerTime: number = -1;
    private _listeners: any = {};

    constructor() {
        super();
    }

    // destructor
    delete (): void {
        if (!this.image) {
            return;
        }
        this.image = null;
        this._listeners = {};
    }

    load (baseUrl: string, mediaFiles: Array<any>): boolean {

        var mediaFile = null,
            type,
            i;

        // Load the first supported image format
        // Support only jpeg, png and gif image formats
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

        // Get adsplayer-image element if already declared in DOM
        // TODO: is it really necessary to check if 'adsplayer-image' already exist?
        /* this.image = document.getElementById('adsplayer-image');

        if (!this.image)*/ {
            // Create the image element
            this.image = document.createElement('img');
            this.image.id = 'adsplayer-image';
        }

        // Add base URL
        this.uri = mediaFile.uri;
        this.uri = (this.uri.indexOf('http://') === -1) ? (baseUrl + this.uri) : this.uri;

        this.debug.log("Load image media, uri = " + this.uri);
        this.image.src = this.uri;

        // Reset current time
        this.currentTime = 0;
        this.ended = false;

        return true;
    }

    getType (): string {
        return "image";
    }

    getElement (): HTMLImageElement {
        return this.image;
    }

    addEventListener (type: string, listener: () => void): void {
        if (!this.image) {
            return;
        }
        if (this.events.indexOf(type) !== -1) {
            this._addEventListener(type, listener);
        } else {
            this.image.addEventListener(type, listener);
        }
    }

    removeEventListener (type: string, listener: () => void): void {
        if (!this.image) {
            return;
        }
        if (this.events.indexOf(type) !== -1) {
            this._removeEventListener(type, listener);
        } else {
            this.image.removeEventListener(type, listener);
        }
    }

    setDuration (duration: number): void {
        this.duration = duration;
    }

    getDuration (): number {
        return this.duration;
    }

    getCurrentTime (): number {
        return this.currentTime;
    }

    setVolume (volume: number): void {
        volume=0;
    }

    getVolume (): number {
        return 0;
    }

    play (): void {
        if (!this.image) {
            return;
        }
        this._startTimer();
    }

    pause (): void {
        if (!this.image) {
            return;
        }
        this._stopTimer();
    }

    stop (): void {
        if (!this.image) {
            return;
        }
        this._stopTimer();
    }

    isEnded (): boolean {
        return this.ended;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE /////////////////////////////////////////////

    _getListeners (type: string) {
        if (!(type in this._listeners)) {
            this._listeners[type] = [];
        }
        return this._listeners[type];
    }

    _addEventListener (type: string, listener: () => void) {
        var listeners = this._getListeners(type),
            idx = listeners.indexOf(listener);

        if (idx === -1) {
            listeners.push(listener);
        }
    }

    _removeEventListener (type: string, listener: () => void) {
        var listeners = this._getListeners(type),
            idx = listeners.indexOf(listener);

        if (idx !== -1) {
            listeners.splice(idx, 1);
        }
    }

    _notifyEvent (type: string) {
        var listeners = this._getListeners(type),
            i = 0;

        for (i = 0; i < listeners.length; i++) {
            listeners[i].call(this);
        }
    }

    _updateCurrentTime () {
        var time = new Date().getTime();

        this.currentTime += (time - this.timerTime) / 1000;
        //this.debug.log("Image timeupdate, time = " + this.currentTime);
        this._notifyEvent('timeupdate');

        if (this.currentTime >= this.duration) {
            this._stopTimer();
            this.ended = true;
            this._notifyEvent('ended');
        }

        this.timerTime = time;
    }

    _startTimer () {
        if (this.timerInterval !== 0) {
            return;
        }
        this._notifyEvent('play');
        this.timerTime = new Date().getTime();
        this.timerInterval = setInterval(this._updateCurrentTime.bind(this), 200);
    }

    _stopTimer () {
        if (this.timerInterval === 0) {
            return;
        }
        this._notifyEvent('pause');
        clearInterval(this.timerInterval);
        this.timerInterval = 0;
    }
}

export default ImagePlayer;
