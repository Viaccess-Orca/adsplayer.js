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
 * VMAP parser. This class parses VMAP file in XML format
 * and construct the corresponding VMAP object according to VMAP data model.
 */

import vmap from './model/Vmap';
import xmldom from '../utils/xmldom';

class VmapParser {

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PRIVATE ////////////////////////////////////////////

    _getAdSource(adSourceNode) {
        let adSource = new vmap.AdSource(),
            adTagURINode,
            VASTAdDataNode,
            CustomAdDataNode;

        adSource.id = adSourceNode.getAttribute('id');
        adSource.allowMultipleAds = adSourceNode.getAttribute('allowMultipleAds');
        adSource.followRedirects = adSourceNode.getAttribute('followRedirects');
        adSource.templateType = adSourceNode.getAttribute('templateType');

        adTagURINode = xmldom.getElement(adSourceNode, 'AdTagURI');
        if (adTagURINode ) {
            adSource.uri = xmldom.getNodeTextValue(adTagURINode);
        }

        VASTAdDataNode = xmldom.getElement(adSourceNode, 'VASTAdData');
        if (VASTAdDataNode ) {
            adSource.VASTAdData = xmldom.getNodeTextValue(VASTAdDataNode);
        }

        CustomAdDataNode = xmldom.getElement(adSourceNode, 'CustomAdData');
        if (CustomAdDataNode ) {
            adSource.CustomAdData = xmldom.getNodeTextValue(CustomAdDataNode);
        }

        return adSource;
    }

    _getAdBreak(triggerNode) {
        let adBreak = new vmap.AdBreak(),
            adSourceNode = xmldom.getElement(triggerNode, 'AdSource');

        adBreak.id = triggerNode.getAttribute('breakId');
        adBreak.breakType = triggerNode.getAttribute('breakType');
        adBreak.timeOffset = triggerNode.getAttribute('timeOffset');

        if (adSourceNode) {
            // Create an array for genericity purpose, even if VMAP allows only one source
            adBreak.sources = [this._getAdSource(adSourceNode)];
        }

        return adBreak;
    }

    _AdBreaks(mastNode, vmap) {
        let adBreakNodes = xmldom.getElements(mastNode, 'AdBreak');

        for (let i = 0; i < adBreakNodes.length; i++) {
            vmap.triggers.push(this._getAdBreak(adBreakNodes[i]));
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    constructor() {
    }

    /**
     * Parses the VMAP xml file and get the triggers.
     * @param {object} xmlDom - the XML DOM to parse
     */
    parse (xmlDom) {
        let vmap_ = new vmap.Vmap(),
            vmapNode = xmldom.getElement(xmlDom, 'VMAP');

        if (vmapNode === null) {
            return vmap_;
        }

        this._AdBreaks(vmapNode, vmap_);

        return vmap_;
    }
}


export default VmapParser;