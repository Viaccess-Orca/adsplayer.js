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
    private _onMainVideoPlayingListener: () => void;
    private _timerId: number;

    private _closeDiv: HTMLElement;
    private _closeStyle: HTMLElement;

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

    load(nonLinearAds: any, baseURl: string): boolean {
        this._removeCloseIcon();

        let nonLinear = nonLinearAds.nonLinear[0];

        this._mediaPlayer = new ImagePlayer();
        this._mediaPlayer.load(baseURl,[{"type": nonLinear.staticResource.creativeType,
                                         "uri":  nonLinear.staticResource.uri}]);

        // Add the image to the DOM element
        let image : HTMLElement = this._mediaPlayer.getElement();
        image.style.height = "100%";
        image.style.width = "auto";
        image.style.margin = "auto";
        image.style.display = "block";

        this.adPlayerContainer.appendChild(image);

        // Position image related to the parent positioned div
        let wImage: number = parseInt(nonLinear.width);
        this.adPlayerContainer.style.position= "absolute";
        this.adPlayerContainer.style.bottom = "5%";
        this.adPlayerContainer.style.left = "calc(50% - " + wImage/2 +"px)";
        this.adPlayerContainer.style.height = nonLinear.height+"px";
        this.adPlayerContainer.style.width = nonLinear.width+"px";
        this.adPlayerContainer.style.zIndex = 9999999999;

        if(nonLinear.minSuggestedDuration) {
            this._initiateCloseTimer(nonLinear.minSuggestedDuration);
        }

        // Add a handler on the play of main video
        this.mainVideo.addEventListener('playing', this._onMainVideoPlayingListener);

        return true;
    }

    _initiateCloseTimer(duration: number) {
        this._timerId = window.setTimeout(() => {
            // Create a close icon
            this._addCloseIcon();
        }, duration * 1000);
    }

    _addCloseIcon() {
        // Sizes in pixels
        let iconSize = 20,
            padding = 3;

        // Create the icon's specific CSS style
        let css = `
            #close-non-linear-icon {
                position: absolute;
                top: 5px;
                left: 5px;
                cursor: pointer;
                width: ${iconSize - padding * 2}px;
                height: ${iconSize - padding * 2}px;
                padding: ${padding}px;
                border-radius: ${iconSize / 2}px;
            }
            
            #close-non-linear-icon > svg > path {
                fill: #8D8E92;
            }
            
            #close-non-linear-icon:hover {
                background-color: #FF0000;             
            }
            
            #close-non-linear-icon:hover > svg > path {
                fill: #FFFFFF;
            }
        `;

        // Create the embedded style node
        this._closeStyle = document.createElement("style");
        this._closeStyle.appendChild(document.createTextNode(css));

        // Add the CSS to the DOM
        this.adPlayerContainer.appendChild(this._closeStyle);

        // Create the icon
        this._closeDiv = document.createElement("div");
        this._closeDiv.id = "close-non-linear-icon";

        // Embed the icon's SVG
        this._closeDiv.innerHTML =
            `<svg viewBox="0 0 24 24">
                <path d="M23 20.168l-8.185-8.187 8.185-8.174-2.832-2.807-8.182 8.179-8.176-8.179-2.81 2.81 8.186 8.196-8.186 8.184 2.81 2.81 8.203-8.192 8.18 8.192z"/>
            </svg>`;

        // Add the icon to the DOM
        this.adPlayerContainer.appendChild(this._closeDiv);

        // Handle the click event
        this._closeDiv.onclick = () => {
            this.stop();
        };
    }

    _removeCloseIcon() {
        if (this._closeDiv) {
            if (this._closeDiv.remove) {
                this._closeDiv.remove();
                this._closeStyle.remove();
            } else {
                // remove() may not be supported on IE
                this.adPlayerContainer.removeChild(this._closeDiv);
                this.adPlayerContainer.removeChild(this._closeStyle);
            }
        }
    }

    stop() {
        if (this.mainVideo) {
            this.mainVideo.removeEventListener('playing', this._onMainVideoPlayingListener);
        }

        this._removeCloseIcon();

        if (this._mediaPlayer) {
            if (this._mediaPlayer.getElement()) {
                this.adPlayerContainer.removeChild(this._mediaPlayer.getElement());
            }
            this._mediaPlayer.delete();
        }

        if(this._timerId) {
            window.clearTimeout(this._timerId);
        }
    }

    play() {
        //Nothing to do in case of non linear creative
    }

    pause() {
        //Nothing to do in case of non linear creative
    }

    _onMainVideoPlaying () {
        this._debug.log("(NonLinearCreativePlayer) Main video is playing");
        this.adPlayerContainer.style.display = "block";
    }
}

export default NonLinearCreativePlayer;
