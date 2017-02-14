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
* The AdBreakManager manages the detection of the start and end of an ad break.
* It takes as input an ad break object (as parsed from a VMAP file) and tests the start and end conditions
* to detect the activation and revocation of an ad break.
*/

class AdBreakManager {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

    _comparePercent(percentString, current, total) {
        var percent = parseFloat(percentString),
            res = false;

        if (percent && !isNaN(current) && !isNaN(total)) {
            res = percent / 100 <= current / total;
        }

        return res;
    }

    _compareTimestamp(timestamp, current) {
        var hours = parseInt(timestamp[1]),
            minutes = parseInt(timestamp[2]),
            seconds = parseFloat(timestamp[3]),
            res = false;

        if (!isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
            res = hours * 3600 + minutes * 60 + seconds <= current;
        }

        return res;
    }

    _evaluateTimeOffset (timeOffset, video) {
        var res = false,
            percentRegex = /^(\d+(?:.\d*)?)%$/,
            percent,
            timestampRegex = /^(\d{2}):(\d{2}):(\d{2}(?:.\d{3})?)$/,
            timestamp;

        // Check start time offset for activation
        if (video.currentTime < 0.5 && timeOffset === "start") {
            res = true;
        }

        // Check mid-roll condition for activation
        percent = timeOffset.match(percentRegex);
        if (percent && percent.length >= 2) {
            res = this._comparePercent(percent[1], video.currentTime, video.duration);
        }

        timestamp = timeOffset.match(timestampRegex);
        if (timestamp && timestamp.length >= 4) {
            res = this._compareTimestamp(timestamp, video.currentTime);
        }

        // Check post-roll condition for activation
        if (video.ended && timeOffset === "end") {
            res = true;
        }

        return res;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    constructor() {
        this._adBreak = null;
    }

    /**
     * Initializes the AdBreakManager.
     * @method init
     * @access public
     * @memberof AdBreakManager#
     * @param {Object} trigger - the ad break to handle by this manager
     */
    init (adBreak) {
        this._adBreak = adBreak;
    }

    /**
     * Returns the ad break object managed by this TriggerManager.
     * @method init
     * @access public
     * @memberof AdBreakManager#
     * @return {Object} the managed ad break object
     */
    getTrigger () {
        return this._adBreak;
    }

    /**
     * Evaluates the ad break start conditions.
     * @method checkStartConditions
     * @access public
     * @memberof AdBreakManager#
     * @param {Number} video - the main video element
     */
    checkStartConditions (video) {
        if (this._adBreak.activated) {
            return false;
        }
        return this._evaluateTimeOffset(this._adBreak.timeOffset, video);
    }

    /**
     * Evaluates the trigger end conditions.
     * @method checkEndConditions
     * @access public
     * @memberof AdBreakManager#
     * @param {Number} video - the main video element
     */
    checkEndConditions (video) {
        // TODO: always revoke on video ending with VMAP? -> check
        return true;
    }
}

export default AdBreakManager;
