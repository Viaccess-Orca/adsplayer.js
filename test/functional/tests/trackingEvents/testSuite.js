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
 TRACKING_EVENTS:

Check the ads tracking events are properly sent

 **/
define(function(require) {
    var intern = require('intern');
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');
    var keys = require('intern/dojo/node!leadfoot/keys');
    var pollUntil = require('intern/dojo/node!leadfoot/helpers/pollUntil');
    var config = require('test/functional/config/testsConfig');
    var utils = require('test/functional/utils/utils');


    registerSuite(function(){

        var command = null,
            suiteConfig = config.tests.trackingEvents;

        return {

            name: "TRACKING_EVENTS",

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
                    .findById("ad_toplay").type(suiteConfig[test.name].adsUrl)
                    .end()
                    // start the player
                    .findById("play_button").click()
                    .end()
                    // wait for the event start
                    .then(pollUntil(function (value) {
                        return parseInt(document.getElementById('event_start').value) == 1 ? true : null;
                    }, null, 10000, 1000))
                    .then(function () {
                        // the event started has been detected
                    }, function (error) {
                        // the event started has NOT been detected
                        assert.isFalse(true,"the event started has NOT been detected for test " + test.name);
                    })
                    // wait for the play event
                    .then(pollUntil(function (value) {
                        return parseInt(document.getElementById('event_play').value) == 1 ? true : null;
                    }, null, 10000, 1000))
                    .then(function () {
                        // the event play has been detected
                    },function (error) {
                        // the event has NOT been detected
                        assert.isFalse(true,"the event play has NOT been detected for test " + test.name);
                    })
                );
            },

            afterEach: function (test) {
                // Executes after each test
                return (command
                    // wait for at least (some tests pause the ad) one pause event.
                        .then(pollUntil(function (value) {
                            return parseInt(document.getElementById('event_pause').value) >= 1 ? true : null;
                        }, null, 10000, 1000))
                        .then(function () {
                            // the event pause has been detected
                        },function (error) {
                            // the event play has NOT been detected
                            assert.isFalse(true,"the event pause has NOT been detected for test pause");
                        })
                        // wait for the event end
                        .then(pollUntil(function (value) {
                            return parseInt(document.getElementById('event_end').value) == 1 ? true : null;
                        }, null, 10000, 1000))
                        .then(function () {
                            // the event end has been detected
                            assert.isTrue(true,"End detected");
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
                        // clear the html5 video events
                        .findById("clear_event_html5_button").click()
                        .end()
                );
            },

            // Check the tracking events in case of preroll video ad
            "preroll": function () {
                // wait for the pause event
                return(command
                    .then(pollUntil(function (value) {
                        return parseInt(document.getElementById('event_pause').value) == 1 ? true : null;
                    }, null, 10000, 1000))
                    .then(  function() {
                                // The event pause has been detected, now get the tracking events
                                return utils.getCounterValues(command, "#tracking_events .event input");
                            },
                            function (error) {
                                // the event play has NOT been detected
                                assert.isFalse(true,"the event play has NOT been detected for test preroll");
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

            // Check the tracking events in case of preroll image ad
            "prerollImage": function () {
                // wait for the pause event
                return(command
                    .then(pollUntil(function (value) {
                        return parseInt(document.getElementById('event_pause').value) == 1 ? true : null;
                    }, null, 10000, 1000))
                    .then(function() {
                        // The event pause has been detected, now get the tracking events
                        return utils.getCounterValues(command, "#tracking_events .event input");
                    },
                    function (error) {
                        // the event play has NOT been detected
                        assert.isFalse(true,"the event play has NOT been detected for test prerollImage");
                    })
                    .then(function(counters) {
                        // Check configuration
                        assert.isDefined(suiteConfig.prerollImage, "Configuration is not defined for prerollImage test counters");
                        assert.isDefined(suiteConfig.prerollImage.ExpectedtrackingEvents, "Configuration is not defined for prerollImage test counters");

                        // Finally, check the counter values
                        utils.compareCounters(counters, suiteConfig.prerollImage.ExpectedtrackingEvents);
                    })
                );
            },

            // Check the tracking events in case of preroll video VAST30 ad
            "prerollVast30": function () {
                // wait for the pause event
                return(command
                    .then(pollUntil(function (value) {
                        return parseInt(document.getElementById('event_pause').value) == 1 ? true : null;
                    }, null, 10000, 1000))
                    .then(function() {
                        // The event pause has been detected, now get the tracking events
                        return utils.getCounterValues(command, "#tracking_events .event input");
                    },function (error) {
                        // the event play has NOT been detected
                        assert.isFalse(true,"the event play has NOT been detected for test prerollVast30");
                    })
                    .then(function(counters) {
                        // Check configuration
                        assert.isDefined(suiteConfig.prerollVast30, "Configuration is not defined for prerollVast30 test counters");
                        assert.isDefined(suiteConfig.prerollVast30.ExpectedtrackingEvents, "Configuration is not defined for prerollVast30 test counters");

                        // Finally, check the counter values
                        utils.compareCounters(counters, suiteConfig.prerollVast30.ExpectedtrackingEvents);
                    })
                );
            },

            // Check the tracking events when the ad is paused and resumed
            "pause": function () {
                // wait for the ad current time > 0 , pause test may fail if video current time = 0 because tracking event "resume" is not sent in this case
                return command
                    .then(pollUntil(function () {
                        // Wait until first quartile is reached
                        return parseInt(document.getElementById('te_firstQuartile').value) === 1 ? true : null;
                    }, null, 10000, 1000))
                    .findById("pause_button")
                    // Pause the ad
                    .click()
                    .then(pollUntil(function () {
                        return parseInt(document.getElementById('event_pause').value) === 1 ? true : null;
                    }, null, 10000, 1000))
                    .then(function () {
                        // The event pause has been detected
                        return true;
                    },function () {
                        // the event pause has NOT been detected
                        assert.isFalse(true,"the event pause has NOT been detected for test pause");
                    })
                    .sleep(500)
                    // Resume the ad
                    .click()
                    .end()
                    .then(pollUntil(function () {
                        return parseInt(document.getElementById('event_play').value) === 2 ? true : null;
                    }, null, 10000, 1000))
                    .then(function () {
                        // The event play has been detected
                        return true;
                    },function () {
                        // the event play has NOT been detected
                        assert.isFalse(true,"the event play has NOT been detected for test pause");
                    })
                    // Wait for the end of the ad
                    .then(pollUntil(function () {
                        return parseInt(document.getElementById('event_pause').value) === 2 ? true : null;
                    }, null, 10000, 1000))
                    .then(function () {
                        // The last event pause has been detected, now get the tracking events
                        return utils.getCounterValues(command, "#tracking_events .event input");
                    },function () {
                        // The last event pause has NOT been detected
                        assert.isFalse(true,"the event pause has NOT been detected for test pause");
                    })
                    .then(function(counters) {
                        // Check configuration
                        assert.isDefined(suiteConfig.pause, "Configuration is not defined for pause test counters");
                        assert.isDefined(suiteConfig.pause.ExpectedtrackingEvents, "Configuration is not defined for pause test counters");

                        // Finally, check the counter values
                        utils.compareCounters(counters, suiteConfig.pause.ExpectedtrackingEvents);
                    }
                );
            },

            // Check the tracking events when the ad is muted and un-muted
            "mute": function () {

                command
                // mute the player
                    .findById("mute_button")
                    .click()
                    .end();

                // wait for the volume has changed
                command
                    .then(pollUntil(function (value) {
                        return parseInt(document.getElementById('event_html5_volumechange').value) == 1 ? true : null;
                    }, null, 10000, 1000))
                    .then(function () {
						// the volume has changed
                    },function (error) {
                        assert.isFalse(true,"the player has NOT been muted");
                    })

                command
                // unmute the player
                .findById("mute_button")
                .click()
                .end()

                // wait for the volume has changed
                command
                    .then(pollUntil(function (value) {
                        return parseInt(document.getElementById('event_html5_volumechange').value) == 2 ? true : null;
                    }, null, 10000, 1000))
                    .then(function () {
                    	// the volume has changed
                    },function (error) {
                        assert.isFalse(true,"the player has NOT been muted");
                    })

                // wait for the pause event
                return(command
                        .then(pollUntil(function (value) {
                            return parseInt(document.getElementById('event_pause').value) == 1 ? true : null;
                        }, null, 10000, 1000))
                        .then(function () {
                            // the event pause has been detected, now get the tracking events
                            return utils.getCounterValues(command, "#tracking_events .event input");
                        },function (error) {
                            // the event play has NOT been detected
                            assert.isFalse(true,"the event pause has NOT been detected for test pause");
                        })
                        .then(function(counters) {
                            // Check configuration
                            assert.isDefined(suiteConfig.mute, "Configuration is not defined for mute test counters");
                            assert.isDefined(suiteConfig.mute.ExpectedtrackingEvents, "Configuration is not defined for mute test counters");

                            // Finally, check the counter values
                            utils.compareCounters(counters, suiteConfig.mute.ExpectedtrackingEvents);
                        })
                );
            },

            // Check the tracking events when a linear ad is closed
            "closeLinear": function () {
                if (this.remote.session.capabilities.browserName === 'MicrosoftEdge') {
                    this.skip('Skipped on browser Edge');
                }

                return (command
                    .then(pollUntil(function (value) {
                        return parseInt(document.getElementById('te_firstQuartile').value) == 1 ? true : null;
                    }, null, 10000, 1000))
                    // Enable the confirmation popup
                    .findById("confirmation_button")
                    .click()
                    .end()
                    // Refresh the page to trigger the event
                    .refresh()
                    // Close the confirmation message
                    .dismissAlert()
                    .then(function () {
                        // Get the tracking events
                        return utils.getCounterValues(command, "#tracking_events .event input");
                    })
                    .then(function(counters) {
                        // Check configuration
                        assert.isDefined(suiteConfig.closeLinear, "Configuration is not defined for closeLinear test counters");
                        assert.isDefined(suiteConfig.closeLinear.ExpectedtrackingEvents, "Configuration is not defined for closeLinear test counters");

                        // Finally, check the counter values
                        utils.compareCounters(counters, suiteConfig.closeLinear.ExpectedtrackingEvents);
                    })
                );
            },

            // Check the tracking event when video is rewinded
            // TODO: It could be smarter using the ad's scrollbar,
            // TODO: but moveMouseTo() API seems bugged
            "rewind": function () {
                return (command
                    .then(pollUntil(function (value) {
                            // Wait until third quartile is reached
                            return parseInt(document.getElementById('te_thirdQuartile').value) == 1 ? true : null;
                        }, null, 10000, 1000))
                    // Rewind
                    .findById("goto_input")
                    .clearValue()
                    .type("0")
                    .end()
                    .findById("goto_button")
                    .click()
                    .end()
                    // Go forward
                    .sleep(500)
                    .findById("goto_input")
                    .clearValue()
                    .type("50")
                    .end()
                    .findById("goto_button")
                    .click()
                    .end()
                    // Rewind again
                    .sleep(500)
                    .findById("goto_input")
                    .clearValue()
                    .type("10")
                    .end()
                    .findById("goto_button")
                    .click()
                    .end()
                    .then(function () {
                        // Get the tracking events, we should have 2 "rewind" events
                        return utils.getCounterValues(command, "#tracking_events .event input");
                    })
                    .then(function(counters) {
                        // Check configuration
                        assert.isDefined(suiteConfig.rewind, "Configuration is not defined for rewind test counters");
                        assert.isDefined(suiteConfig.rewind.ExpectedtrackingEvents, "Configuration is not defined for rewind test counters");

                        // Finally, check the counter values
                        utils.compareCounters(counters, suiteConfig.rewind.ExpectedtrackingEvents);
                    })
                );
            },

            // Check the tracking event on fullscreen
            "fullscreen": function () {
                if (this.remote.session.capabilities.browserName === 'MicrosoftEdge') {
                    this.skip('Skipped on browser Edge');
                }

                return (command
                    .then(pollUntil(function (value) {
                        // Wait until first quartile is reached
                        return parseInt(document.getElementById('te_firstQuartile').value) == 1 ? true : null;
                    }, null, 10000, 1000))
                    // Set full screen
                    .findById("fullscreen_button")
                    .click()
                    .sleep(1000)
                    // Escape fullscreen (not working on Chrome)
                    .type(keys.ESCAPE)
                    .end()
                    .then(function () {
                        // Get the tracking events, we should have 2 "rewind" events
                        return utils.getCounterValues(command, "#tracking_events .event input");
                    })
                    .then(function(counters) {
                        // Check configuration
                        assert.isDefined(suiteConfig.fullscreen, "Configuration is not defined for fullscreen test counters");
                        assert.isDefined(suiteConfig.fullscreen.ExpectedtrackingEvents, "Configuration is not defined for fullscreen test counters");

                        // Finally, check the counter values
                        utils.compareCounters(counters, suiteConfig.fullscreen.ExpectedtrackingEvents);
                    })
                );
            },

            // Check the tracking event for acceptInvitationLinear
            "acceptInvitationLinear": function () {
                return (command
                    .then(pollUntil(function (value) {
                        // Wait until first quartile is reached
                        return parseInt(document.getElementById('te_firstQuartile').value) == 1 ? true : null;
                    }, null, 10000, 1000))
                    // Click on the video
                    .findByCssSelector("#adsplayer-container #adsplayer-video")
                    .click()
                    .end()
                    .then(function () {
                        // Get the tracking events
                        return utils.getCounterValues(command, "#tracking_events .event input");
                    })
                    .then(function(counters) {
                        // Check configuration
                        assert.isDefined(suiteConfig.acceptInvitationLinear, "Configuration is not defined for acceptInvitationLinear test counters");
                        assert.isDefined(suiteConfig.acceptInvitationLinear.ExpectedtrackingEvents, "Configuration is not defined for acceptInvitationLinear test counters");

                        // Finally, check the counter values
                        utils.compareCounters(counters, suiteConfig.acceptInvitationLinear.ExpectedtrackingEvents);
                    })
                );
            }
        };
    });
});
