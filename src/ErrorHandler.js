/*
 * The copyright in this software is being made available under the BSD License, included below. This software may be subject to other third party and contributor rights, including patent rights, and no such rights are granted under this license.
 *
 * Copyright (c) 2013, Digital Primates
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 * •  Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * •  Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * •  Neither the name of the Digital Primates nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
adErrorHandler = (function() {
    var instance;

    function createInstance() {
        var object = new AdsPlayer.ErrorHandler();
        return object;
    }

    return {
        getInstance: function() {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

AdsPlayer.ErrorHandler = function() {
    "use strict";

    return {
        eventBus: undefined,
        debug: undefined,

        sendWarning: function(code, message, data) {
            this.eventBus.dispatchEvent({
                type: "warning",
                data: {
                    code: code,
                    message: message,
                    data: data
                }
            });
            this.debug.warn("[Warn] Code: " + code + ", Message: " + message + ", Data: " + JSON.stringify(data, null, '\t'));
        },

        sendError: function(code, message, data) {
            this.eventBus.dispatchEvent({
                type: "error",
                data: {
                    code: code,
                    message: message,
                    data: data
                }
            });
            this.debug.error("[Error] Code: " + code + ", Message: " + message + ", Data: " + JSON.stringify(data, null, '\t'));
        }
    };
};

AdsPlayer.ErrorHandler.prototype = {
    constructor: AdsPlayer.ErrorHandler
};

// File Loader errors
AdsPlayer.ErrorHandler.prototype.DOWNLOAD_ERR_FILES = "DOWNLOAD_ERR_FILES";
AdsPlayer.ErrorHandler.prototype.DOWNLOAD_ERR_NOT_XML = "DOWNLOAD_ERR_NOT_XML";