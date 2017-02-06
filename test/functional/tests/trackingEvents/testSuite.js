/**
 TEST_MULTIPLE_ADS_IN_MAST:

Check the adsPlugin behaviour when the mast file embeds more than one ad

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
            let json = {};

            // Return the result object in a promise
            return new Promise(resolve => {
                // Get all counter elements
                command.findAllByCssSelector(selector)
                    .then(elements => {
                        let promises = [];
                        // Loop through the elements
                        elements.forEach(element => {
                            // Get element data (id + value) in a promise
                            let p = new Promise(r => {
                                // Get element ID
                                element
                                    .getAttribute("eventId")
                                    .then(id => {
                                        // Get element value
                                        element
                                            .getAttribute("value")
                                            .then(value => {
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
                        Promise.all(promises).then(() => {
                            // Now that the JSON is full of data, resolve the main promise
                            resolve(json);
                        });
                    });
            });
        };

        // Compare real counter values against expected counter values
        var compareCounters = function(realValues, expectedValues) {
            // Loop through the expected values
            for(let eventId in expectedValues) {
                if (expectedValues.hasOwnProperty(eventId)) {
                    // Check that event counter exists
                    assert.isDefined(realValues[eventId], "Impossible to find event '" + eventId + "' in tracking events");

                    // Check that real value is as expected ("x" means "any")
                    if (expectedValues[eventId] !== "x") {
                        let expectedValue = parseInt(expectedValues[eventId]),
                            realValue = parseInt(realValues[eventId]);

                        assert.strictEqual(
                            realValue,
                            expectedValue,
                            "Wrong value for event '" + eventId + "'");
                    }

                }
            }
        };

        return {

            name: "TRACKING_EVENTS",

            setup: function () {
                // executes before suite starts;

                // load the web test page
                command = this.remote.get(require.toUrl(config.testPageUrl));

                // set the stream to play
                command.findById("stream_toplay").type(config.streamUrl);

                // clear the CSAdsPlugin events
                command.findById("clearEvents_button").click();

                // clear the Tracking events
                command.findById("clear_te_button").click();

                return command;
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
                );
            },

            // Check the tracking events in case of preroll video ad
            "preroll": function () {
                // wait for the play event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_play').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event play has been detected
                    },function (error) {
                        // the event play has NOT been detected
                        assert.isFalse(true,"the event play has NOT been detected for test preroll");
                    });

                // wait for the pause event
                return(command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_pause').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(() => {
                        // The event pause has been detected, now get the tracking events
                        return getCounterValues("#tracking_events .event input");
                    },
                    function (error) {
                        // the event play has NOT been detected
                        assert.isFalse(true,"the event play has NOT been detected for test preroll");
                    })
                    .then(counters => {
                        // Check configuration
                        assert.isDefined(suiteConfig.preroll, "Configuration is not defined for preroll test counters");
                        assert.isDefined(suiteConfig.preroll.ExpectedtrackingEvents, "Configuration is not defined for preroll test counters");

                        // Finally, check the counter values
                        compareCounters(counters, suiteConfig.preroll.ExpectedtrackingEvents);
                    })
                );
            },

            // Check the tracking events in case of preroll image ad
            "prerollImage": function () {
                // wait for the play event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_play').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event has been detected
                    },function (error) {
                        // the event has NOT been detected
                        assert.isFalse(true,"the event play has NOT been detected for test prerollImage");
                    });

                // wait for the pause event
                return(command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_pause').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(() => {
                        // The event pause has been detected, now get the tracking events
                        return getCounterValues("#tracking_events .event input");
                    },
                    function (error) {
                        // the event play has NOT been detected
                        assert.isFalse(true,"the event play has NOT been detected for test prerollImage");
                    })
                    .then(counters => {
                        // Check configuration
                        assert.isDefined(suiteConfig.prerollImage, "Configuration is not defined for prerollImage test counters");
                        assert.isDefined(suiteConfig.prerollImage.ExpectedtrackingEvents, "Configuration is not defined for prerollImage test counters");

                        // Finally, check the counter values
                        compareCounters(counters, suiteConfig.prerollImage.ExpectedtrackingEvents);
                    })
                );
            },

            // Check the tracking events in case of preroll video VAST30 ad
            "prerollVast30": function () {

                // wait for the play event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_play').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event play has been detected
                    },function (error) {
                        // the event has NOT been detected
                        assert.isFalse(true,"the event play has NOT been detected for test prerollVast30");
                    });

                // wait for the pause event
                return(command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_pause').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(() => {
                        // The event pause has been detected, now get the tracking events
                        return getCounterValues("#tracking_events .event input");
                    },function (error) {
                        // the event play has NOT been detected
                        assert.isFalse(true,"the event play has NOT been detected for test prerollVast30");
                    })
                    .then(counters => {
                        // Check configuration
                        assert.isDefined(suiteConfig.prerollVast30, "Configuration is not defined for prerollVast30 test counters");
                        assert.isDefined(suiteConfig.prerollVast30.ExpectedtrackingEvents, "Configuration is not defined for prerollVast30 test counters");

                        // Finally, check the counter values
                        compareCounters(counters, suiteConfig.prerollVast30.ExpectedtrackingEvents);
                    })
                );
            }
        };
    });
});
