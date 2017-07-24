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
 Non Linear Ads:

Check basic functionalities for non Linear Ads

 **/

define(function(require) {
    var intern = require('intern'),
        registerSuite = require('intern!object'),
        assert = require('intern/chai!assert'),
        pollUntil = require('intern/dojo/node!leadfoot/helpers/pollUntil'),
        config = require('test/functional/config/testsConfig');

    registerSuite(function() {
        var command = null,
            suiteConfig = config.tests.nonLinearAds,
            startTimeout = 10000;

        // Extract the media filename from an url
        // For example if url is http://localhost/csadsplugin/samples/ads/xml/vast-3/../../media/vo_ad_2.mp4
        // getMediaFileName returns vo_ad_2.mp4
        var getMediaFileName = function(url) {
            var array = url.split("/");
            return array[array.length-1];
        };

        return {
            name: "NON_LINEAR_ADS",

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
                    .findById("ad_toplay").type(suiteConfig.adUrl)
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
                        return document.getElementById('event_html5_timeupdate').value >= 10 ? true : null;
                    }, null, 40000, 1000))
                    .then(function () {
                        // the event end has been detected
                    }, function (error) {
                        // the event end has NOT been detected
                        assert.isFalse(true, "the event timeupdate has NOT reached the value 10 for test " + test.name);
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

            // play a non linear ad
            "play": function() {
                // wait for the add element
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_add').value === "1" ? true : null;
                    }, null, 10000, 100))
                    .then(function () {
                        // the event has been detected
                    },function (error) {
                        // the event play has NOT been detected
                        assert.isFalse(true,"the event remove has NOT been detected for test " + test.name);
                    });

                // Check the expected ad is played
                command
                    .findById("adsplayer-container")
                    .findByTagName("img")
                    .getAttribute("src")
                    .then(function (src) {
                        assert.strictEqual(getMediaFileName(src), getMediaFileName(suiteConfig.media));
                    })
                    .end()
                    .end()
                    .end();

                // wait for 10 seconds
                command
                    .then(pollUntil(function (value) {
                        return null;
                    }, null, 10000, 1000))
                    .then(function () {

                    },function (error) {

                    });

            }
        };
    });
});
