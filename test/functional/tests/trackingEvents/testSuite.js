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
    }

    registerSuite(function(){

        var command = null;

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
                    .findById("ad_toplay").type(config.tests.trackingEvents[test.name].adsUrl)
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
                        assert.isFalse(true,"the event play has NOT been detected for test " + test.name);
                    });

                // wait for the pause event
                return(command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_pause').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event pause has been detected
                        // Check the tracking events
                        command.findById("te_creativeView")
                    },function (error) {
                        // the event play has NOT been detected
                        assert.isFalse(true,"the event play has NOT been detected for test " + test.name);
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
                        assert.isFalse(true,"the event play  has NOT been detected for test " + test.name);
                    });

                // wait for the pause event
                return(command
                        .then(pollUntil(function (value) {
                            return document.getElementById('event_pause').value === "1" ? true : null;
                        }, null, 40000, 100))
                        .then(function () {
                            // the event pause has been detected
                        },function (error) {
                            // the event play has NOT been detected
                            assert.isFalse(true,"the event play has NOT been detected for test " + test.name);
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
                        assert.isFalse(true,"the event play has NOT been detected for test " + test.name);
                    });

                // wait for the pause event
                return(command
                        .then(pollUntil(function (value) {
                            return document.getElementById('event_pause').value === "1" ? true : null;
                        }, null, 40000, 100))
                        .then(function () {
                            // the event pause has been detected
                        },function (error) {
                            // the event play has NOT been detected
                            assert.isFalse(true,"the event play has NOT been detected for test " + test.name);
                        })
                );
            }
        };
    });
});
