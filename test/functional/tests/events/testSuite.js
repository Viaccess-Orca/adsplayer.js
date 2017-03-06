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
 TEST_EVENTS:

Check the CsAdsPlugin events

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
            suiteConfig = config.tests.events;

        return {

            name: "TEST_EVENTS",

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

            teardown: function () {
            },

            beforeEach: function (test) {
                // executes before each test

                return (command
                    //clear the ad url
                    .findById("ad_toplay").clearValue()
                    .end()
                    // type the ad url
                    .findById("ad_toplay").type(config.tests.events[test.name].adUrl)
                    .end()
                    // start the player
                    .findById("play_button").click()
                    .end()
                    // wait for the event start
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_start').value === "1" ? true : null;
                    }, null, 40000, 1000))
                    .then(function () {
                        // the event started has been detected
                    }, function (error) {
                        // the event started has NOT been detected
                        assert.isFalse(true,"the event started has NOT been detected for test " + test.name);
                    })
                );
            },

            afterEach: function (test) {
                // executes after each test
                return (command
                // wait for the event end
                    .then(pollUntil(function (value) {
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
                    .end()
                );
            },

            // Check the events in case of preroll video ad
            "preroll": function () {

                // wait for the main video progress event > 5, means the preroll ad is completed
                return(command
                        .then(pollUntil(function (value) {
                            return parseInt(document.getElementById('event_html5_progress').value) > 5 ? true : null;
                        }, null, 10000, 1000))
                        .then(  function() {
                                // The event pause has been detected, now get the tracking events
                                return utils.getCounterValues(command, "#csadsplugin_events .event input");
                            },
                            function (error) {
                                // the event play has NOT been detected
                                assert.isFalse(true,"the event pogress has NOT been detected for test preroll");
                            }
                        )
                        .then(function(counters) {
                            // Check configuration
                            assert.isDefined(suiteConfig.preroll, "Configuration is not defined for preroll test counters");
                            assert.isDefined(suiteConfig.preroll.ExpectedtrackingEvents, "Configuration is not defined for preroll test counters");

                            // Finally, check the counter values
                            utils.compareCounters(counters, suiteConfig.preroll.ExpectedtrackingEvents);
                        })
                );
            },
        };
    });
});
