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

    _parseTime (str) {
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

    _compareValues (value1, value2, operator) {
        var res = false;

        if (value1 < 0 || value2 < 0) {
            return false;
        }

        return res;
    }

    _evaluateTimeOffset (timeOffset, video) {
        var res = false;

        // Check start time offset for activation
        if (video.currentTime < 0.5 && timeOffset === "start") {
            res = true;
        }

        // Revocation when video is ended
        // TODO: always revoke with VMAP? -> check
        if (video.ended) {
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
        return this._evaluateTimeOffset(this._adBreak.timeOffset, video);
    }
}

export default AdBreakManager;
