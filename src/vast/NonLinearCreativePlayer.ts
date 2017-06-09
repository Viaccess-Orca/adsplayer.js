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

    constructor(private _adPlayerContainer: any, private mainVideo: HTMLVideoElement) {
        this._debug = Debug.getInstance();
        this._eventBus = EventBus.getInstance();

        this._onMainVideoPlayingListener = this._onMainVideoPlaying.bind(this);
    }

    load(nonLinearAds: any, baseURl: string) : boolean {

        this._mediaPlayer = new ImagePlayer();
        this._mediaPlayer.load(baseURl,[{"type": nonLinearAds.nonLinear[0].staticResource.creativeType,
                                         "uri":  nonLinearAds.nonLinear[0].staticResource.uri}]);


        let image : HTMLImageElement = this._mediaPlayer.getElement();
        image.style.height = nonLinearAds.nonLinear[0].height+"px";
        image.style.width = nonLinearAds.nonLinear[0].width+"px";

        // Add the image to the DOM element
        this._adPlayerContainer.appendChild(image);

        // Position image related to the parent positioned div
        let wImage : number = parseInt(nonLinearAds.nonLinear[0].width);
        this._adPlayerContainer.style.position= "absolute";
        this._adPlayerContainer.style.top="auto";
        this._adPlayerContainer.style.bottom="5%";
        this._adPlayerContainer.style.left="calc(50% - " + wImage/2 +"px)";

        // Add a handler on the pay of main video
        this.mainVideo.addEventListener('playing', this._onMainVideoPlayingListener);

        return true;
    }

    play () {
        //Nothing to do in case of non linear creative
    }

    pause () {
        //Nothing to do in case of non linear creative
    }

    stop () {
    }

    reset () {
    }

    _onMainVideoPlaying () {
        this._debug.log("(NonLinearCreativePlayer) Main video is playing");
        this._adPlayerContainer.style.display = "block";
    }
}

export default NonLinearCreativePlayer;
