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

function initAdsPluginEvtsHdler(adsPlugin){

    // hide the video player and update the number of start event
    adsPlugin.addEventListener('start', function() {
        var element = document.getElementById('event_start');
        element.setAttribute("value", parseInt(element.getAttribute("value")) + 1);
    });

    // show the video player and update the number of end event
    adsPlugin.addEventListener('end', function() {
        var element = document.getElementById('event_end');
        element.setAttribute("value", parseInt(element.getAttribute("value")) + 1);
    });

    adsPlugin.addEventListener('addElement', function(e) {
        var element = document.getElementById('event_add');
        element.setAttribute("value", parseInt(element.getAttribute("value")) + 1);

        // Store the adPlayer element
        adPlayer = e.data.element;

        // Update #ad_dom_id DOM element with the id of the DOM element created by the CSAdsPlugin to play the ad
        document.querySelector('#ad_dom_id').innerHTML = adPlayer.getAttribute("id");

        // Update #ad_dom_type DOM element with the type of the DOM element created by the CSAdsPlugin to play the ad
        document.querySelector('#ad_dom_type').innerHTML = e.data.type;

        // Change the listener for the pause button
        document.querySelector('#pause_button').removeEventListener("click", onMainVideoPause);
        document.querySelector('#pause_button').addEventListener("click", onAdPause);

        // Change the listener for the mute button
        document.querySelector('#mute_button').removeEventListener("click", onMainVideoMute);
        document.querySelector('#mute_button').addEventListener("click", onAdMute);

        // Change the listener for the HTML5 video events
        updateHtml5VideoEvtsHdler(adPlayer);

        // Disable the "skip" button
        allowSkip(false);
    });

    adsPlugin.addEventListener('removeElement', function() {
        var element = document.getElementById('event_remove');
        element.setAttribute("value", parseInt(element.getAttribute("value")) + 1);

        // Update the adPlayer element
        adPlayer = null;

        // Clear #ad_dom_id DOM element
        document.querySelector('#ad_dom_id').setAttribute("value","");

        // Clear #ad_dom_type DOM element
        document.querySelector('#ad_dom_type').setAttribute("value","");

        // Change the listener for the pause button
        document.querySelector('#pause_button').removeEventListener("click", onAdPause);
        document.querySelector('#pause_button').addEventListener("click", onMainVideoPause);

        // Change the listener for the mute button
        document.querySelector('#mute_button').removeEventListener("click", onAdMute);
        document.querySelector('#mute_button').addEventListener("click", onMainVideoMute);

        // Change the listener for the HTML5 video events
        updateHtml5VideoEvtsHdler(null);

        // Disable the "skip" button
        allowSkip(false);
    });

    adsPlugin.addEventListener('play', function() {
        var element = document.getElementById('event_play');
        element.setAttribute("value", parseInt(element.getAttribute("value")) + 1);
    });

    adsPlugin.addEventListener('pause', function() {
        var element = document.getElementById('event_pause');
        element.setAttribute("value", parseInt(element.getAttribute("value")) + 1);
    });

    adsPlugin.addEventListener('skippable', function(event) {
        // Get the remaining time until ad is skippable
        var remainingTime = 0;
        if(event.data) {
            remainingTime = event.data.remainingTime;
        }

        if(isNaN(remainingTime) ||
                remainingTime === 0) {
            // Let's skip
            allowSkip(true);
        } else {
            // Update the skip button text
            remainingTime = Math.floor(remainingTime);
            document.querySelector("#skip_button").innerText = "Skip in " + remainingTime + " s.";

            // Decrement the counter
            remainingTime--;

            // Create a countdown for skip button
            var countdown = setInterval(function() {
                if (remainingTime === 0) {
                    // When the countdown is over, auto-destroy
                    clearInterval(countdown);

                    // Important: There is no need to allow the skip button here, as another
                    // "skippable" event will be sent by the adsPluggin when remainingTime = 0
                } else {
                    // Update the skip button text
                    document.querySelector("#skip_button").innerText = "Skip in " + remainingTime + " s.";

                    // Decrement the counter
                    remainingTime--;
                }
            }, 1000)
        }
    });

    adsPlugin.addEventListener('skip', function() {
        var element = document.getElementById('event_skip');
        element.setAttribute("value", parseInt(element.getAttribute("value")) + 1);
    });

    // clear events button
    document.querySelector('#clearEvents_button').addEventListener("click",function(e) {
        document.getElementById('event_start').setAttribute("value", 0);
        document.getElementById('event_end').setAttribute("value", 0);
        document.getElementById('event_add').setAttribute("value", 0);
        document.getElementById('event_remove').setAttribute("value", 0);
        document.getElementById('event_play').setAttribute("value", 0);
        document.getElementById('event_pause').setAttribute("value", 0);
        document.getElementById('event_skippable').setAttribute("value", 0);
        document.getElementById('event_skip').setAttribute("value", 0);
    });
}

function onAdPause(e) {
    if (adPlayer == null) {
        return;
    }

    if (document.querySelector('#pause_button').innerHTML == "Pause") {
        adPlayer.pause();
        document.querySelector('#pause_button').innerHTML = "Resume";
    } else {
        adPlayer.play();
        document.querySelector('#pause_button').innerHTML = "Pause";
    }
}

function onAdMute(e) {
    if (adPlayer == null) {
        return;
    }

    if (adPlayer.muted) {
        document.querySelector('#mute_button').innerHTML = "Mute";
        adPlayer.muted = false;
    } else {
        document.querySelector('#mute_button').innerHTML = "Unmute";
        adPlayer.muted = true;
    }
}

function allowSkip(allow) {
    var skipButton = document.querySelector("#skip_button");
    skipButton.innerText = "Skip";

    if (allow) {
        // Increment the "skippable" event counter
        var element = document.getElementById('event_skippable');
        element.setAttribute("value", parseInt(element.getAttribute("value")) + 1);

        // Enable the button
        skipButton.disabled = false;
    } else {
        // Disable the button
        skipButton.disabled = true;
    }
}