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
 * Generic ads manager.
 * Initialize the specific parser according to the ads file format.
 */

import TriggerManager from "./mast/TriggerManager";
import AdBreakManager from "./vmap/AdBreakManager";

class AdsManager {
    constructor(format) {
        this._manager = null;

        switch (format) {
            case "mast":
                this._manager = new TriggerManager();
                break;

            case "vmap":
                this._manager = new AdBreakManager();
                break;

            default:
                break;
        }
    }

    init(trigger) {
        if ((this._manager !== null) && (this._manager.init !== undefined)) {
            this._manager.init(trigger);
        }
    }

    getTrigger() {
        if ((this._manager !== null) && (this._manager.getTrigger !== undefined)) {
            return this._manager.getTrigger();
        }
    }

    checkStartConditions(video) {
        if ((this._manager !== null) && (this._manager.checkStartConditions !== undefined)) {
            return this._manager.checkStartConditions(video);
        }
    }

    checkEndConditions(video) {
        if ((this._manager !== null) && (this._manager.checkEndConditions !== undefined)) {
            return this._manager.checkEndConditions(video);
        }
    }
}

export default AdsManager;