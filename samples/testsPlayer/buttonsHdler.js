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
		mediaPlayer.reset();
    });

    // pause button
    document.querySelector('#pause_button').addEventListener("click", onMainVideoPause);

    // mute button
    document.querySelector('#mute_button').addEventListener("click", onMainVideoMute);
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
