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
                        // start the player
                        .findById("play_button").click().end()
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

            beforeEach: function (test) {
                // execute before each test
            },

            afterEach: function (test) {
                // execute after each test
            },

            // Check the events at the start of an ad
            "start": function () {

                return(command

                        // wait for the main video to be suspended, mean the ad is started
                        .then(pollUntil(function (value) {
                            return parseInt(document.getElementById('event_html5_suspend').value) == 1 ? true : null;
                        }, null, 10000, 1000))
                        .then(function() {
                                // The event pause has been detected, now get the tracking events
                                return utils.getCounterValues(command, "#csadsplugin_events .event input");
                            },
                            function (error) {
                                // the event play has NOT been detected
                                assert.isFalse(true,"the event progress has NOT been detected for test start");
                            }
                        )
                        .then(function(counters) {
                            // Check configuration
                            assert.isDefined(suiteConfig, "Configuration is not defined for start test");
                            assert.isDefined(suiteConfig.startExpectedEvents, "Configuration is not defined for start test");

                            // Finally, check the counter values
                            utils.compareCounters(counters, suiteConfig.startExpectedEvents);
                        })
                );
            },

            // check the DOM <video> element and the parameters associated with the add event
            "checkDom": function () {

                // Check the DOM <video> element has been added in the ads player container
                command
                    .findById("adsplayer-container")
                        .findByTagName("video")
                            .then(
                                function (element) {
                                    assert.isTrue(true,"The DOM element <video> has been created");
                                },
                                function () {
                                    assert.isFalse(true,"The DOM element <video> has NOT been created");
                                }
                            )
                        .end()
                    .end();

                var event_type = "";
                command.findById("ad_dom_type").getVisibleText().then(function(type) {event_type=type});
                var event_id = "";
                command.findById("ad_dom_id").getVisibleText().then(function(id) {event_id=id});

                // Check the add event parameters
                return(command
                    .findById("adsplayer-container")
                        .findByTagName("video")
                            .getAttribute("id")
                                // Check the add event parameters (element, type)
                                .then(
                                    function (adsplayerContainerVideoId) {
                                        // Check the id of DOM <video> element
                                        assert.equal(adsplayerContainerVideoId,event_id,"unexpected id");
                                        // Check the type
                                        assert.equal(event_type,"video","unexpected id");
                                    },
                                    function() {
                                        assert.isFalse(true,"fails to get the adsplayerContainer Video Id ");
                                    }
                                )
                        .end()
                    .end()
                );
            },

            // Check the events at the end of an ad
            "end": function () {

                return(command

                        // wait for the main video progress event > 5, means the preroll ad is completed
                        .then(pollUntil(function (value) {
                            return parseInt(document.getElementById('event_html5_progress').value) > 5 ? true : null;
                        }, null, 20000, 1000))
                        .then(function() {
                                // The event pause has been detected, now get the tracking events
                                return utils.getCounterValues(command, "#csadsplugin_events .event input");
                            },
                            function (error) {
                                // the event play has NOT been detected
                                assert.isFalse(true,"the event progress has NOT been detected for test end");
                            }
                        )
                        .then(function(counters) {
                            // Check configuration
                            assert.isDefined(suiteConfig, "Configuration is not defined for end test");
                            assert.isDefined(suiteConfig.endExpectedEvents, "Configuration is not defined for end test");

                            // Finally, check the counter values
                            utils.compareCounters(counters, suiteConfig.endExpectedEvents);
                        })
                );
            },
        };
    });
});
