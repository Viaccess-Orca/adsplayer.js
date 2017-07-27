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
* The VideoPlayer is a MediaPlayer implementation for playing video files.
*/

import Debug from '../Debug';
import AdPlayer from "./AdPlayer";

class VideoPlayer extends AdPlayer{

    private debug: Debug = Debug.getInstance();
    private video: HTMLVideoElement = null;
    private uri: string = "";

    constructor() {
        super();
    }

    // destructor
    delete () {
        if (!this.video) {
            return;
        }
        this.video = null;
    }

    load (baseUrl: string, mediaFiles: Array<any>): boolean {

        // Get 'adsplayer-video' element if already declared in DOM
        // TODO: is it really necessary to check if 'adsplayer-video' already exist?
        /* this.video = document.getElementById('adsplayer-video');

        if (!this.video)*/ {
            // Create the video element
            this.video = document.createElement('video');
            this.video.autoplay = false;
            this.video.id = 'adsplayer-video';
            this.video.style.width = "100%";
        }

        // Check if input format is supported
        if (!this.isMediaSupported(mediaFiles[0].type)) {
            return false;
        }

        // Sort the mediafiles in bitrate ascending order
        mediaFiles.sort(function(a, b) {
            if (a.bitrate && b.bitrate) {
                return a.bitrate - b.bitrate;
            }
            return -1;
        });

        // Play the media file with lowest bitrate
        this.uri = mediaFiles[0].uri;

        // Add base URL
        this.uri = (this.uri.indexOf('http://') === -1) ? (baseUrl + this.uri) : this.uri;

        this.debug.log("Load video media, uri = " + this.uri);

        this.video.addEventListener('error', function(e) {
            console.log(e);
        });

        this.video.src = this.uri;

        return true;
    }

    getType () {
        return "video";
    }

    getElement () {
        return this.video;
    }

    addEventListener (type: string, listener: () => void): void {
        if (!this.video) {
            return;
        }
        this.video.addEventListener(type, listener);
    }

    removeEventListener (type: string, listener: () => void): void {
        if (!this.video) {
            return;
        }
        this.video.removeEventListener(type, listener);
    }

    setDuration (/*duration*/): void {
        // duration is handled by the video element
    }

    getDuration (): number {
        if (!this.video) {
            return 0;
        }
        return this.video.duration;
    }

    getCurrentTime (): number {
        if (!this.video) {
            return 0;
        }
        return this.video.currentTime;
    }

    getVolume (): number {
        if (!this.video) {
            return 0;
        }
        return this.video.muted ? 0 : this.video.volume;
    }

    setVolume (volume: number): void {
        if (!this.video) {
            return;
        }
        this.video.volume = volume;
    }

    play (): void {
        if (!this.video) {
            return;
        }
        this.video.play();
    }

    stop (): void {
        if (!this.video) {
            return;
        }
        this.video.pause();
    }

    pause (): void {
        if (!this.video) {
            return;
        }
        this.video.pause();
    }

    isEnded (): boolean {
        if (!this.video) {
            return true;
        }
        return this.video.ended;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

    isMediaSupported (mimeType: string) {
        if (!this.video) {
            throw "isMediaSupported(): element not created";
        }

        var canPlay = this.video.canPlayType(mimeType);
        return (canPlay === "probably" || canPlay === "maybe");
    }
}

export default VideoPlayer;
