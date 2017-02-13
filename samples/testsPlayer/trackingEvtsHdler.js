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
function trackingEvtsHdler() {
    /** TRACKING EVENTS **/

    var s_ajaxListener = new Object();

    // Added for IE support
    if (typeof XMLHttpRequest === "undefined") {
        XMLHttpRequest = function () {
            try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); }
            catch (e) {}
            try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); }
            catch (e) {}
            try { return new ActiveXObject("Microsoft.XMLHTTP"); }
            catch (e) {}
            throw new Error("This browser does not support XMLHttpRequest.");
        };
    }

    s_ajaxListener.tempOpen = XMLHttpRequest.prototype.open;
    s_ajaxListener.tempSend = XMLHttpRequest.prototype.send;

    // Callback for XHR
    s_ajaxListener.callback = function () {
        // this.method: the ajax method used
        // this.url   : the url of the requested script (including query string, if any) (urlencoded)
        // this.data  : the data sent, if any ex: foo=bar&a=b (urlencoded)
        if (this.url.indexOf("http://cswebplayer.viaccess.fr/adsserver/js?event=")!=-1) {
            // Get event name from URL
            var newEvent = this.data.split("=");
            if (newEvent &&
                newEvent.length > 1) {
                // Get input element from DOM
                var element = document.querySelector('#te_' + newEvent[1]);
                if (element) {
                    // Increment event counter
                    element.setAttribute("value", parseInt(element.getAttribute("value")) + 1);
                }
            }
        }
    }

    XMLHttpRequest.prototype.open = function(a,b) {
        if (!a) var a='';
        if (!b) var b='';
        s_ajaxListener.tempOpen.apply(this, arguments);
        s_ajaxListener.method = a;
        s_ajaxListener.url = b;
        if (a.toLowerCase() == 'get') {
            s_ajaxListener.data = b.split('?');
            s_ajaxListener.data = s_ajaxListener.data[1];
        }
    }

    XMLHttpRequest.prototype.send = function(a,b) {
        if (!a) var a='';
        if (!b) var b='';
        s_ajaxListener.tempSend.apply(this, arguments);
        if(s_ajaxListener.method.toLowerCase() == 'post')s_ajaxListener.data = a;
        s_ajaxListener.callback();
    }

    // "Clear all" button
    document.querySelector('#clear_te_button').addEventListener("click",function(e) {
        // Get tracking event input elements
        var inputs = document.querySelectorAll("#tracking_events .event input");
        for (var i = 0; i < inputs.length; i++) {
            // Reset input value
            inputs[i].setAttribute("value", 0);
        }
    });
}