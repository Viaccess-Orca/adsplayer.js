/*
 * The copyright in this software module is being made available under the BSD License, included
 * below. This software module may be subject to other third party and/or contributor rights,
 * including patent rights, and no such rights are granted under this license.
 *
 * Copyright (C) 2016 VIACCESS S.A and/or ORCA Interactive
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted
 * provided that the following conditions are met:
 * - Redistributions of source code must retain the above copyright notice, this list of conditions
 *   and the following disclaimer.
 * - Redistributions in binary form must reproduce the above copyright notice, this list of
 *   conditions and the following disclaimer in the documentation and/or other materials provided
 *   with the distribution.
 * - Neither the name of VIACCESS S.A and/or ORCA Interactive nor the names of its contributors may
 *   be used to endorse or promote products derived from this software module without specific prior
 *   written permission.
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

import ImagePlayer from '../media/ImagePlayer';
import EventBus from '../EventBus';
import Debug from '../Debug';

class NonLinearCreativePlayer {

    private _debug: Debug;
    private _eventBus: EventBus;
    private _mediaPlayer: ImagePlayer;
    private _onMainVideoPlayingListener:  () => void;

    /**
     * Initializes the creative player.
     * @method constructor
     * @access public
     * @memberof NonLinearCreativePlayer#
     * @param {Object} adPlayerContainer
     * @param {HTMLVideoElement} mainVideo
     */
    constructor(private adPlayerContainer: any, private mainVideo: HTMLVideoElement) {
        this._debug = Debug.getInstance();
        this._eventBus = EventBus.getInstance();

        this._onMainVideoPlayingListener = this._onMainVideoPlaying.bind(this);
    }

    /**
     * Delete the creative player.
     * @method delete
     * @access public
     * @memberof LinearCreativePlayer#
     */
    delete () {
        this.stop();
        this._debug = null;
        this._eventBus = null;
        this._mediaPlayer = null;
        this._onMainVideoPlayingListener = null;
        this.adPlayerContainer = null;
        this.mainVideo = null;
    }

    load(nonLinearAds: any, baseURl: string) : boolean {

        this._mediaPlayer = new ImagePlayer();
        this._mediaPlayer.load(baseURl,[{"type": nonLinearAds.nonLinear[0].staticResource.creativeType,
                                         "uri":  nonLinearAds.nonLinear[0].staticResource.uri}]);


        let image : HTMLElement = this._mediaPlayer.getElement();
        image.style.height = "100%";
        image.style.width = "auto";

        // Add the image to the DOM element
        this.adPlayerContainer.appendChild(image);

        // Position image related to the parent positioned div
        let wImage : number = parseInt(nonLinearAds.nonLinear[0].width);
        this.adPlayerContainer.style.position= "absolute";
        this.adPlayerContainer.style.bottom = "5%";
        this.adPlayerContainer.style.left = "calc(50% - " + wImage/2 +"px)";
        this.adPlayerContainer.style.height = nonLinearAds.nonLinear[0].height+"px";
        this.adPlayerContainer.style.width = nonLinearAds.nonLinear[0].width+"px";

        // Add a handler on the play of main video
        this.mainVideo.addEventListener('playing', this._onMainVideoPlayingListener);

        return true;
    }

    stop () {
        if (this.mainVideo) {
            this.mainVideo.removeEventListener('playing', this._onMainVideoPlayingListener);
        }
        if (this.adPlayerContainer) {
            this.adPlayerContainer.style.bottom = "0%";
            this.adPlayerContainer.style.left = "0%";
            this.adPlayerContainer.style.height = "0%";
            this.adPlayerContainer.style.width = "0%";
            this.adPlayerContainer.style.display = "none";
        }

        if (this._mediaPlayer) {
            this.adPlayerContainer.removeChild(this._mediaPlayer.getElement());
            this._mediaPlayer.delete();
        }

    }

    play () {
        //Nothing to do in case of non linear creative
    }

    pause () {
        //Nothing to do in case of non linear creative
    }

    _onMainVideoPlaying () {
        this._debug.log("(NonLinearCreativePlayer) Main video is playing");
        this.adPlayerContainer.style.display = "block";
    }
}

export default NonLinearCreativePlayer;
