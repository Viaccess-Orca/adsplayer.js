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
    var pollUntil = require('intern/dojo/node!leadfoot/helpers/pollUntil');
    var config = require('test/functional/config/testsConfig');

    // Extract the media filename from an url
    // For example if url is http://localhost/csadsplugin/samples/ads/xml/vast-3/../../media/vo_ad_2.mp4
    // getMediaFileName returns vo_ad_2.mp4
    var getMediaFileName = function(url){
        var array = url.split("/");
        return array[array.length-1];
    };

    registerSuite(function(){

        var command = null,
            suiteConfig = config.tests.trackingEvents;

        // Get event counter values for specified CSS selector
        var getCounterValues = function(selector) {
            // Object containing the event counter values
            var json = {};

            // Return the result object in a promise
            return new Promise(function(resolve) {
                // Get all counter elements
                command.findAllByCssSelector(selector)
                    .then(function(elements) {
                        var promises = [];
                        // Loop through the elements
                        elements.forEach(function(element) {
                            // Get element data (id + value) in a promise
                            var p = new Promise(function(r) {
                                // Get element ID
                                element
                                    .getAttribute("eventId")
                                    .then(function(id) {
                                        // Get element value
                                        element
                                            .getAttribute("value")
                                            .then(function(value) {
                                                // Update the result object
                                                json[id] = value;

                                                // Once all the element data is fetched, resolve the element promise
                                                r();
                                            })
                                    });
                            });

                            promises.push(p);
                        });

                        // Wait until all element promises are resolved
                        Promise.all(promises).then(function() {
                            // Now that the JSON is full of data, resolve the main promise
                            resolve(json);
                        });
                    });
            });
        };

        // Compare real counter values against expected counter values
        var compareCounters = function(realValues, expectedValues) {
            // Loop through the expected values
            for(var eventId in expectedValues) {
                if (expectedValues.hasOwnProperty(eventId)) {
                    // Check that event counter exists
                    assert.isDefined(realValues[eventId], "Impossible to find event '" + eventId + "' in tracking events");

                    // Check that real value is as expected ("x" means "any")
                    if (expectedValues[eventId] !== "x") {
                        var expectedValue = parseInt(expectedValues[eventId]),
                            realValue = parseInt(realValues[eventId]);

                        assert.strictEqual(
                            realValue,
                            expectedValue,
                            "Wrong value for event '" + eventId + "'");
                    }

                }
            }

            // Loop through real values
            for(var eventId in realValues) {
                if (realValues.hasOwnProperty(eventId)) {
                    // Check that there were no unexpected event dispatched
                    var realValue = parseInt(realValues[eventId]);
                    assert.isFalse(realValue > 0 && !expectedValues[eventId], "Event '" + eventId + "' should not be dispatched");
                }
            }
        };

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
                    .then(pollUntil(function (value) {
                        return parseInt(document.getElementById('event_play').value) == 1 ? true : null;
                    }, null, 10000, 1000))
                    .then(function () {
                        // the event play has been detected
                    },function (error) {
                        // the event has NOT been detected
                        assert.isFalse(true,"the event play has NOT been detected for test " + test.name);
                    })
                    // wait 500 ms after the play, pause test may fail if video current time = 0 because tracking event "resume" is not sent in this case
                    .sleep(500)
                );
            },

            afterEach: function (test) {
                // executes after each test
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
            "prerollMast": function () {

                // wait for the pause event
                return(command
                    .then(pollUntil(function (value) {
                        return parseInt(document.getElementById('event_pause').value) == 1 ? true : null;
                    }, null, 10000, 1000))
                    .then(  function() {
                                // The event pause has been detected, now get the tracking events
                                return getCounterValues("#tracking_events .event input");
                            },
                            function (error) {
                                // the event play has NOT been detected
                                assert.isFalse(true,"the event play has NOT been detected for test prerollMast");
                            }
                    )
                    .then(function(counters) {
                        // Check configuration
                        assert.isDefined(suiteConfig.prerollMast, "Configuration is not defined for preroll test counters");
                        assert.isDefined(suiteConfig.prerollMast.ExpectedtrackingEvents, "Configuration is not defined for preroll test counters");

                        // Finally, check the counter values
                        compareCounters(counters, suiteConfig.prerollMast.ExpectedtrackingEvents);
                    })
                );
            },

            // Check the tracking events in case of preroll image ad
            "prerollMastImage": function () {

                // wait for the pause event
                return(command
                    .then(pollUntil(function (value) {
                        return parseInt(document.getElementById('event_pause').value) == 1 ? true : null;
                    }, null, 10000, 1000))
                    .then(function() {
                        // The event pause has been detected, now get the tracking events
                        return getCounterValues("#tracking_events .event input");
                    },
                    function (error) {
                        // the event play has NOT been detected
                        assert.isFalse(true,"the event play has NOT been detected for test prerollMastImage");
                    })
                    .then(function(counters) {
                        // Check configuration
                        assert.isDefined(suiteConfig.prerollMastImage, "Configuration is not defined for prerollImage test counters");
                        assert.isDefined(suiteConfig.prerollMastImage.ExpectedtrackingEvents, "Configuration is not defined for prerollImage test counters");

                        // Finally, check the counter values
                        compareCounters(counters, suiteConfig.prerollMastImage.ExpectedtrackingEvents);
                    })
                );
            },

            // Check the tracking events in case of preroll video VAST30 ad
            "prerollMastVast30": function () {

                // wait for the pause event
                return(command
                    .then(pollUntil(function (value) {
                        return parseInt(document.getElementById('event_pause').value) == 1 ? true : null;
                    }, null, 10000, 1000))
                    .then(function() {
                        // The event pause has been detected, now get the tracking events
                        return getCounterValues("#tracking_events .event input");
                    },function (error) {
                        // the event play has NOT been detected
                        assert.isFalse(true,"the event play has NOT been detected for test prerollMastVast30");
                    })
                    .then(function(counters) {
                        // Check configuration
                        assert.isDefined(suiteConfig.prerollMastVast30, "Configuration is not defined for prerollVast30 test counters");
                        assert.isDefined(suiteConfig.prerollMastVast30.ExpectedtrackingEvents, "Configuration is not defined for prerollVast30 test counters");

                        // Finally, check the counter values
                        compareCounters(counters, suiteConfig.prerollMastVast30.ExpectedtrackingEvents);
                    })
                );
            },

            // Check the tracking events in case of VMAP preroll video ad
            "prerollVmap": function () {

                // wait for the pause event
                return(command
                        .then(pollUntil(function (value) {
                            return parseInt(document.getElementById('event_pause').value) == 1 ? true : null;
                        }, null, 10000, 1000))
                        .then(  function() {
                                // The event pause has been detected, now get the tracking events
                                return getCounterValues("#tracking_events .event input");
                            },
                            function (error) {
                                // the event play has NOT been detected
                                assert.isFalse(true,"the event play has NOT been detected for test prerollVmap");
                            }
                        )
                        .then(function(counters) {
                            // Check configuration
                            assert.isDefined(suiteConfig.prerollVmap, "Configuration is not defined for midrollVmap test counters");
                            assert.isDefined(suiteConfig.prerollVmap.ExpectedtrackingEvents, "Configuration is not defined for prerollVmap test counters");

                            // Finally, check the counter values
                            compareCounters(counters, suiteConfig.prerollVmap.ExpectedtrackingEvents);
                        })
                );
            },

            // Check the tracking events in case of VMAP midroll with percent video ad
            "midrollVmapPercent": function () {

                // wait for the pause event
                return(command
                        .then(pollUntil(function (value) {
                            return parseInt(document.getElementById('event_pause').value) == 1 ? true : null;
                        }, null, 10000, 1000))
                        .then(  function() {
                                // The event pause has been detected, now get the tracking events
                                return getCounterValues("#tracking_events .event input");
                            },
                            function (error) {
                                // the event play has NOT been detected
                                assert.isFalse(true,"the event play has NOT been detected for test midrollVmapPercent");
                            }
                        )
                        .then(function(counters) {
                            // Check configuration
                            assert.isDefined(suiteConfig.midrollVmapPercent, "Configuration is not defined for midrollVmapPercent test counters");
                            assert.isDefined(suiteConfig.midrollVmapPercent.ExpectedtrackingEvents, "Configuration is not defined for midrollVmapPercent test counters");

                            // Finally, check the counter values
                            compareCounters(counters, suiteConfig.midrollVmapPercent.ExpectedtrackingEvents);
                        })
                );
            },

            // Check the tracking events in case of VMAP midroll video ad
            "midrollVmapTimestamp": function () {

                // wait for the pause event
                return(command
                        .then(pollUntil(function (value) {
                            return parseInt(document.getElementById('event_pause').value) == 1 ? true : null;
                        }, null, 10000, 1000))
                        .then(  function() {
                                // The event pause has been detected, now get the tracking events
                                return getCounterValues("#tracking_events .event input");
                            },
                            function (error) {
                                // the event play has NOT been detected
                                assert.isFalse(true,"the event play has NOT been detected for test midrollVmapTimestamp");
                            }
                        )
                        .then(function(counters) {
                            // Check configuration
                            assert.isDefined(suiteConfig.midrollVmapTimestamp, "Configuration is not defined for midrollVmapTimestamp test counters");
                            assert.isDefined(suiteConfig.midrollVmapTimestamp.ExpectedtrackingEvents, "Configuration is not defined for midrollVmapTimestamp test counters");

                            // Finally, check the counter values
                            compareCounters(counters, suiteConfig.midrollVmapTimestamp.ExpectedtrackingEvents);
                        })
                );
            },

            // Check the tracking events when the ad is paused and resumed
            "pause": function () {

                command
                // pause the player
                .findById("pause_button")
                    .click()
                .end();

                // wait for the pause event
                command
                    .then(pollUntil(function (value) {
                        return parseInt(document.getElementById('event_pause').value) == 1 ? true : null;
                    }, null, 10000, 1000))
                    .then(function () {
                        // the event pause has been detected, now get the tracking events
                    },function (error) {
                        // the event pause has NOT been detected
                        assert.isFalse(true,"the event pause has NOT been detected for test pause");
                    });

                command
                // resume the player
                .findById("pause_button")
                    .click()
                .end();

                // wait for the play event
                command
                    .then(pollUntil(function (value) {
                        return parseInt(document.getElementById('event_play').value) == 2 ? true : null;
                    }, null, 10000, 1000))
                    .then(function () {
                        // the event pause has been detected, now get the tracking events
                    },function (error) {
                        // the event play has NOT been detected
                        assert.isFalse(true,"the event play has NOT been detected for test pause");
                    });

                // wait for the pause event
                return(command
                        .then(pollUntil(function (value) {
                            return parseInt(document.getElementById('event_pause').value) == 2 ? true : null;
                        }, null, 10000, 1000))
                        .then(function () {
                            // the event pause has been detected, now get the tracking events
                            return getCounterValues("#tracking_events .event input");
                        },function (error) {
                            // the event play has NOT been detected
                            assert.isFalse(true,"the event pause has NOT been detected for test pause");
                        })
                        .then(function(counters) {
                            // Check configuration
                            assert.isDefined(suiteConfig.pause, "Configuration is not defined for prerollVast30 test counters");
                            assert.isDefined(suiteConfig.pause.ExpectedtrackingEvents, "Configuration is not defined for prerollVast30 test counters");

                            // Finally, check the counter values
                            compareCounters(counters, suiteConfig.pause.ExpectedtrackingEvents);
                        })
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
                        return parseInt(document.getElementById('event_hml5_volumechange').value) == 1 ? true : null;
                    }, null, 10000, 1000))
                    .then(function () {
                        assert.isFalse(true,"the player has been muted");
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
                        return parseInt(document.getElementById('event_hml5_volumechange').value) == 2 ? true : null;
                    }, null, 10000, 1000))
                    .then(function () {
                        assert.isFalse(true,"the player has been muted");
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
                            return getCounterValues("#tracking_events .event input");
                        },function (error) {
                            // the event play has NOT been detected
                            assert.isFalse(true,"the event pause has NOT been detected for test pause");
                        })
                        .then(function(counters) {
                            // Check configuration
                            assert.isDefined(suiteConfig.mute, "Configuration is not defined for prerollVast30 test counters");
                            assert.isDefined(suiteConfig.mute.ExpectedtrackingEvents, "Configuration is not defined for prerollVast30 test counters");

                            // Finally, check the counter values
                            compareCounters(counters, suiteConfig.mute.ExpectedtrackingEvents);
                        })
                );
            }
        };
    });
});
