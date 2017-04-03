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

function initButtonsHdler() {
    // play button
    document.querySelector('#play_button').addEventListener("click",function(e) {
        var stream = {
            url : document.getElementById("stream_toplay").value,
            protData : null,
            adsUrl : document.getElementById("ad_toplay").value
        };

        mediaPlayer.load(stream);
    });

    // stop button
    document.querySelector('#stop_button').addEventListener("click",function(e) {
		//mediaPlayer.reset();
        mediaPlayer.stop();
    });

    // pause button
    document.querySelector('#pause_button').addEventListener("click", onMainVideoPause);

    // Skip button
    document.querySelector('#skip_button').addEventListener("click", onSkip);

    // mute button
    document.querySelector('#mute_button').addEventListener("click", onMainVideoMute);

    // Seek bar
    document.querySelector('#seek-slidebar-range').addEventListener("change",function() {
        goTo(document.querySelector('#seek-slidebar-range').value);
    });

    // Go to button
    document.querySelector('#goto_button').addEventListener("click",function() {
        var percentage = document.querySelector("#goto_input").value;
        if (percentage) {
            goTo(percentage);
        }
    });

    // Fullscreen
    document.querySelector('#fullscreen_button').addEventListener("click",function() {
        if(adPlayer) {
            // Deal with all the implementations :C
            if(adPlayer.requestFullscreen) {
                adPlayer.requestFullscreen();
            } else if(adPlayer.mozRequestFullScreen) {
                adPlayer.mozRequestFullScreen();
            } else if(adPlayer.webkitRequestFullscreen) {
                adPlayer.webkitRequestFullscreen();
            } else if(adPlayer.msRequestFullscreen) {
                adPlayer.msRequestFullscreen();
            }
        }
    });

    // Confirmation popup
    document.querySelector('#confirmation_button').addEventListener("click",function() {
        if (!confirmationSet) {
            window.addEventListener("beforeunload", displayConfirmationPopup);
            confirmationSet = true;
        }
    });
}

function onMainVideoPause(e) {
    if (mediaPlayer == null) {
        return;
    }

    if (document.querySelector('#pause_button').innerHTML == "Pause") {
        mediaPlayer.pause();
        document.querySelector('#pause_button').innerHTML = "Resume";
    } else {
        mediaPlayer.play();
        document.querySelector('#pause_button').innerHTML = "Pause";
    }
}

function onMainVideoMute(e) {
    if (mediaPlayer == null) {
        return;
    }

    if (mediaPlayer.getMute()) {
        document.querySelector('#mute_button').innerHTML = "Mute";
        mediaPlayer.setMute(false);
    } else {
        document.querySelector('#mute_button').innerHTML = "Unmute";
        mediaPlayer.setMute(true);
    }
}

function onSkip() {
    if (adsPlugin) {
        adsPlugin.skip();
    }
}

function goTo(percentage) {
    var seekTime = 0;

    if (adPlayer) {
        seekTime = (percentage * adPlayer.duration) / 100;
        adPlayer.currentTime = seekTime;
    }

    displaySeekedTime(seekTime);
}

function displaySeekedTime(time) {
    var seekedTimeDisplayed = "00:00:00";

    if(time > 0) {
        var hours = Math.floor(time / 3600) + "";
        var minutes = Math.floor((time - (hours * 3600)) / 60) + "";
        var seconds = parseInt(time - hours * 3600 - minutes * 60) + "";

        if (hours.length === 1) {
            hours = "0" + hours;
        }

        if (minutes.length === 1) {
            minutes = "0" + minutes;
        }

        if (seconds.length === 1) {
            seconds = "0" + seconds;
        }

        seekedTimeDisplayed = hours + ":" + minutes + ":" + seconds;
    }
    document.getElementById("seekRangeDisplayTime").innerHTML = seekedTimeDisplayed;
}

function displayConfirmationPopup(event) {
    // Remove the listener
    window.removeEventListener("beforeunload", displayConfirmationPopup);
    confirmationSet = false;

    // Display a confirmation popup
    event = event || window.event;

    var s = "Are you sure you want to leave this page?";
    event.returnValue = s;
    return s;
}