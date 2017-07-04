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
 VMAP:

Check basic functionalities for VMAP format

 **/

define(function(require) {
    var intern = require('intern'),
        registerSuite = require('intern!object'),
        assert = require('intern/chai!assert'),
        pollUntil = require('intern/dojo/node!leadfoot/helpers/pollUntil'),
        config = require('test/functional/config/testsConfig');

    registerSuite(function() {
        var command = null,
            vmapConfig = config.tests.vmap,
            startTimeout = 130000; // Need more than 2 minutes for postroll test

        // Extract the media filename from an url
        // For example if url is http://localhost/csadsplugin/samples/ads/xml/vast-3/../../media/vo_ad_2.mp4
        // getMediaFileName returns vo_ad_2.mp4
        var getMediaFileName = function(url) {
            var array = url.split("/");
            return array[array.length-1];
        };

        // Check that the ad player is playing the expected URL
        var checkAdPlayer = function(url) {
            var adSrc = "";

            return new Promise(function(resolve, reject) {
                // Get the ad player element
                command.findByCssSelector("#adsplayer-container video")
                    .getAttribute("src")
                    .then(function (src) {
                        // Get the ad source URL
                        adSrc = src;
                        resolve();
                    }, function() {
                        throw new Error("Unable to get ad player element");
                        reject();
                    })
                    .end();
            }).then(function() {
                // Once the source URL is fetched, compare it to the expected URL
                assert.strictEqual(getMediaFileName(adSrc), url, "Ad player URL should be as expected");
            });
        };

        // Check that the video played has paused on the expected timeout
        var checkVideoPlayer = function(offset) {
            var currentTime = -1;

            return new Promise(function(resolve, reject) {
                // Get the video player element
                command.findByCssSelector("#videoplayer-container")
                    .getProperty("currentTime")
                    .then(function (time) {
                        // Get the ad current time
                        currentTime = time;
                        resolve();
                    }, function() {
                        throw new Error("Unable to get video player element");
                        reject();
                    })
                    .end();
            }).then(function() {
                 // Current time has to be between expected value and (expected value + margin of error)
                assert.isAtLeast(currentTime, offset, "Ad video current time should be greater than or equal to " + offset);
                assert.isBelow(currentTime, offset + vmapConfig.marginOfError,
                    "Ad video current time should be less than " + (offset + vmapConfig.marginOfError) + " (" + offset + " + " + vmapConfig.marginOfError + ")");
            });
        }

        return {
            name: "VMAP",

            setup: function () {
                // executes before suite starts;

                // load the web test page
                command = this.remote.get(require.toUrl(config.testPageUrl));

                //clear the ad url
                command.findById("stream_toplay").clearValue();

                // set the stream to play
                command.findById("stream_toplay").type(config.streamUrl);

                // clear the CSAdsPlugin events
                command.findById("clearEvents_button").click();

                // clear the Tracking events
                command.findById("clear_te_button").click();

                // clear the html5 video events
                command.findById("clear_event_html5_button").click();

                return command;
            },

            beforeEach: function (test) {
                // executes before each test

                return command
                    //clear the ad url
                    .findById("ad_toplay").clearValue()
                    .end()
                    // type the ad url
                    .findById("ad_toplay").type(vmapConfig[test.name].mastUrl)
                    .end()
                    // start the player
                    .findById("play_button").click()
                    .end()
                    // wait for the event start
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_start').value === "1" ? true : null;
                    }, null, startTimeout, 1000))
                    .then(function () {
                        // the event started has been detected
                    }, function (error) {
                        // the event started has NOT been detected
                        assert.isFalse(true,"the event started has NOT been detected for test " + test.name);
                    });
            },

            afterEach: function (test) {
                // executes after each test
                return command
                // wait for the event end
                    .then(pollUntil(function () {
                        return +document.getElementById('event_end').value >= 1 ? true : null;
                    }, null, 40000, 1000))
                    .then(function () {
                        // the event end has been detected
                    }, function (error) {
                        // the event end has NOT been detected
                        assert.isFalse(true, "the event end has NOT been detected for test " + test.name);
                    })
                    //stop the player
                    .findById("stop_button").click()
                    .end()
                    // clear the CSAdsPlugin events
                    .findById("clearEvents_button").click()
                    .end()
                    // clear the Tracking events
                    .findById("clear_te_button").click()
                    .end()
                    .findById("clear_event_html5_button").click()
                    .end();
            },

            // 1 preroll ad break
            "preroll": function() {
                // The right ad video should already be playing
                return checkAdPlayer(getMediaFileName(vmapConfig.preroll.ads[0].media))
                    .then(function() {
                        return checkVideoPlayer(vmapConfig.preroll.timeOffset);
                    }
                );
            },

             // 1 midroll ad break trigged by timestamp
             "midrollTimestamp": function() {
                // The right ad video should already be playing
                return checkAdPlayer(getMediaFileName(vmapConfig.midrollTimestamp.ads[0].media))
                    .then(function() {
                        return checkVideoPlayer(vmapConfig.midrollTimestamp.timeOffset);
                    }
                );
             },

            // 1 midroll ad break trigged by percentage
            "midrollPercent": function() {
                // The right ad video should already be playing
                return checkAdPlayer(getMediaFileName(vmapConfig.midrollPercent.ads[0].media))
                    .then(function() {
                        return checkVideoPlayer(vmapConfig.midrollPercent.timeOffset);
                    }
                );
            },

            // 1 preroll ad break + repeat after
            "prerollRepeat": function() {
                // The right ad video should already be playing
                return command
                    .then(function() {
                        return checkAdPlayer(getMediaFileName(vmapConfig.prerollRepeat.ads[0].media));
                    })
                    .then(function() {
                        return checkVideoPlayer(vmapConfig.prerollRepeat.timeOffsets[0]);
                    })
                    // Wait for the second occurrence
                    .then(pollUntil(function () {
                        return document.getElementById('event_start').value === "2" ? true : null;
                    }, null, startTimeout, 1000), function () {
                        assert.isFalse(true, "Unable to detect the 2nd occurence");
                    })
                    .then(function() {
                        return checkAdPlayer(getMediaFileName(vmapConfig.prerollRepeat.ads[0].media));
                    })
                    .then(function() {
                        return checkVideoPlayer(vmapConfig.prerollRepeat.timeOffsets[1]);
                    })
                    // Wait for the third occurrence
                    .then(pollUntil(function () {
                        return document.getElementById('event_start').value === "3" ? true : null;
                    }, null, startTimeout, 1000), function () {
                        assert.isFalse(true, "Unable to detect the 3rd occurence");
                    })
                    .then(function() {
                        return checkAdPlayer(getMediaFileName(vmapConfig.prerollRepeat.ads[0].media));
                    })
                    .then(function() {
                        return checkVideoPlayer(vmapConfig.prerollRepeat.timeOffsets[2]);
                    })
                    // Don't check the other occurrences, because the test would be very long
            },

            // 1 midroll ad break + repeat after
            "midrollRepeat": function() {
                // The right ad video should already be playing
                return command
                    .then(function() {
                        return checkAdPlayer(getMediaFileName(vmapConfig.midrollRepeat.ads[0].media));
                    })
                    .then(function() {
                        return checkVideoPlayer(vmapConfig.midrollRepeat.timeOffsets[0]);
                    })
                    // Wait for the second occurrence
                    .then(pollUntil(function () {
                        return document.getElementById('event_start').value === "2" ? true : null;
                    }, null, startTimeout, 1000), function () {
                        assert.isFalse(true, "Unable to detect the 2nd occurence");
                    })
                    .then(function() {
                        return checkAdPlayer(getMediaFileName(vmapConfig.midrollRepeat.ads[0].media));
                    })
                    .then(function() {
                        return checkVideoPlayer(vmapConfig.midrollRepeat.timeOffsets[1]);
                    })
                    // Wait for the third occurrence
                    .then(pollUntil(function () {
                        return document.getElementById('event_start').value === "3" ? true : null;
                    }, null, startTimeout, 1000), function () {
                        assert.isFalse(true, "Unable to detect the 3rd occurence");
                    })
                    .then(function() {
                        return checkAdPlayer(getMediaFileName(vmapConfig.midrollRepeat.ads[0].media));
                    })
                    .then(function() {
                        return checkVideoPlayer(vmapConfig.midrollRepeat.timeOffsets[2]);
                    })
                // Don't check the other occurrences, because the test would be very long
            },

            // 1 postroll ad break
            "postroll": function() {
                // The right ad video should already be playing
                return checkAdPlayer(getMediaFileName(vmapConfig.postroll.ads[0].media))
                    .then(function() {
                            return checkVideoPlayer(vmapConfig.postroll.timeOffset);
                        }
                    );
            }
        };
    });
});
