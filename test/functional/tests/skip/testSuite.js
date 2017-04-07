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
 SKIP:

Check the skip feature

 **/
define(function(require) {
    var intern = require('intern');
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');
    var pollUntil = require('intern/dojo/node!leadfoot/helpers/pollUntil');
    var config = require('test/functional/config/testsConfig');
    var utils = require('test/functional/utils/utils');

    registerSuite(function(){

        var command = null,
            suiteConfig = config.tests.skip;

        return {

            name: "TEST_SKIP",

            setup: function () {
                // executes before suite starts

                // load the web test page
                command = this.remote.get(require.toUrl(config.testPageUrl));

                return (command
                    //clear the stream url
                    .findById("stream_toplay").clearValue().end()
                    // type the stream to play
                    .findById("stream_toplay").type(config.streamUrl).end()
                    // clear the CSAdsPlugin events
                    .findById("clearEvents_button").click().end()
                    // clear the Tracking events
                    .findById("clear_te_button").click().end()
                    // clear the html5 video events
                    .findById("clear_event_html5_button").click().end()
                    //clear the ad url
                    .findById("ad_toplay").clearValue().end()
                    // type the ad url
                    .findById("ad_toplay").type(config.tests.events.adUrl).end()
                );
            },

            teardown: function () {
                // executes at the end of the suite

                return (command
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
                    .end()
                );
            },

            // Execute before each test
            beforeEach: function (test) {
                return command
                    // Clear the ad url
                    .findById("ad_toplay").clearValue()
                    .end()
                    // Type the ad url
                    .findById("ad_toplay").type(suiteConfig[test.name].adsUrl)
                    .end()
                    // Start the player
                    .findById("play_button").click()
                    .end()
                    // wait for the event start
                    .then(pollUntil(function () {
                        return document.getElementById('event_start').value === "1" ? true : null;
                    }, null, 10000, 1000))
                    .then(function () {
                        // the event started has been detected
                    }, function () {
                        // the event started has NOT been detected
                        assert.isFalse(true, "The event start has NOT been detected for test " + test.name);
                    });
            },

            // Execute after each test
            afterEach: function (test) {
                return command
                // wait for the event end
                    .then(pollUntil(function () {
                        return document.getElementById('event_end').value === "1" ? true : null;
                    }, null, 40000, 1000))
                    .then(function () {
                        // the event end has been detected
                    }, function (error) {
                        // the event end has NOT been detected
                        assert.isFalse(true,"the event end has NOT been detected for test " + test.name);
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

            // Play a skippable ad file without skipping
            "noSkip": function () {
                return(command
                    // Wait until the second ad video is removed
                    .then(pollUntil(function (value) {
                        return parseInt(document.getElementById('event_remove').value) === 2 ? true : null;
                    }, null, 20000, 1000))
                    .then(function() {
                            // The ads are over, get the counter values
                            return utils.getCounterValues(command, "#csadsplugin_events .event input");
                        },
                        function () {
                            // the event progress never went over 5
                            assert.isFalse(true, "There should be 2 remove events");
                        }
                    )
                    .then(function(counters) {
                        // Check configuration
                        assert.isDefined(suiteConfig.noSkip, "Configuration is not defined for noSkip test");
                        assert.isDefined(suiteConfig.noSkip.expectedEvents, "Configuration is not defined for noSkip test");

                        // Finally, check the counter values
                        utils.compareCounters(counters, suiteConfig.noSkip.expectedEvents);
                    })
                );
            },

            // Play a skippable ad file with percent, and skip
            "skipPercent": function () {
                return(command
                    // Try to skip
                    .findByCssSelector("#skip_button")
                    .click()
                    .end()
                    // Check that the ad video element is still here
                    .findAllByCssSelector("#adsplayer-container video")
                    .then(
                        function(elements) {
                            assert.strictEqual(elements.length, 1, "1 ad video element should still be defined");
                        }
                    )
                    .end()
                    // Wait for "Skip" button to be allowed
                    .sleep(suiteConfig.skipPercent.skipOffset * 1000)
                    // Try to skip again
                    .findByCssSelector("#skip_button")
                    .click()
                    .end()
                    // Check that the ad video element was removed
                    .findAllByCssSelector("#adsplayer-container video")
                    .then(
                        function(elements) {
                            assert.strictEqual(elements.length, 0, "No ad video elements should now be defined");
                        }
                    )
                    .end()
                    .then(function() {
                            // The ads are over, get the counter values
                            return utils.getCounterValues(command, "#csadsplugin_events .event input");
                        }
                    )
                    .then(function(counters) {
                        // Check configuration
                        assert.isDefined(suiteConfig.skipPercent, "Configuration is not defined for skipPercent test");
                        assert.isDefined(suiteConfig.skipPercent.expectedEvents, "Configuration is not defined for skipPercent test");

                        // Finally, check the counter values
                        utils.compareCounters(counters, suiteConfig.skipPercent.expectedEvents);
                    })
                );
            },

            // Play a skippable ad file with timestamp, and skip
            "skipTimestamp": function () {
                return(command
                    // Try to skip
                    .findByCssSelector("#skip_button")
                    .click()
                    .end()
                    // Check that the ad video element is still here
                    .findAllByCssSelector("#adsplayer-container video")
                    .then(
                        function(elements) {
                            assert.strictEqual(elements.length, 1, "1 ad video element should still be defined");
                        }
                    )
                    .end()
                    // Wait for "Skip" button to be allowed
                    .sleep(suiteConfig.skipTimestamp.skipOffset * 1000)
                    // Try to skip again
                    .findByCssSelector("#skip_button")
                    .click()
                    .end()
                    // Check that the ad video element was removed
                    .findAllByCssSelector("#adsplayer-container video")
                    .then(
                        function(elements) {
                            assert.strictEqual(elements.length, 0, "No ad video elements should now be defined");
                        }
                    )
                    .end()
                    .then(function() {
                            // The ads are over, get the counter values
                            return utils.getCounterValues(command, "#csadsplugin_events .event input");
                        }
                    )
                    .then(function(counters) {
                        // Check configuration
                        assert.isDefined(suiteConfig.skipTimestamp, "Configuration is not defined for skipTimestamp test");
                        assert.isDefined(suiteConfig.skipTimestamp.expectedEvents, "Configuration is not defined for skipTimestamp test");

                        // Finally, check the counter values
                        utils.compareCounters(counters, suiteConfig.skipTimestamp.expectedEvents);
                    })
                );
            }
        };
    });
});
