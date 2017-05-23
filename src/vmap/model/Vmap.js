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
 * @class Vmap
 * @ignore
 */
class Vmap {
    constructor () {
        this.baseUrl = '';
        this.triggers = [];     // pointer to any number of Ad objects
    }
}

/**
 * @class AdBreak
 * @ignore
 */
class AdBreak {
    constructor () {
        this.breakId = '';
        this.breakType = '';
        this.timeOffset = '';
        this.sources = [];
        this.alreadyProcessed = false;
        this.vasts = [];
        this.activated = false;
        this.repeatAfter = "";
        this.repeatTime = null;
    }
}

/**
 * @class Source
 * @ignore
 */
class AdSource {
    constructor () {
        this.id = "";
        this.allowMultipleAds = true;
        this.followRedirects = true;
        this.templateType = "";
        this.uri = "";
        this.VASTAdData = "";
        this.CustomAdData = "";
    }
}

var vmap = {};

vmap.Vmap = Vmap;
vmap.AdBreak = AdBreak;
vmap.AdSource = AdSource;

export default vmap;
export { Vmap, AdBreak, AdSource };