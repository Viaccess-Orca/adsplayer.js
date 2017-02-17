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
 TEST_MULTIPLE_ADS:

Check the adsPlayer behaviour when the ad xml file embeds more than one ad

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

            name: "TEST_MULTIPLE_ADS",

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
                    .findById("ad_toplay").type(config.tests.multipleAds[test.name].mastUrl)
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

            // Test an ad pod:
            // Check that the first and the second ads are played in the right order
            "adPod": function () {
                // wait for the play event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_play').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event has been detected
                    },function (error) {
                        // the event play has NOT been detected
                        assert.isFalse(true,"the event play has NOT been detected for test " + test.name);
                    });

                // Check the expected ad is played
                command
                    .findById("adsplayer-container")
                        .findByTagName("video")
                            .getAttribute("src")
                            .then(function (src) {
                                assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.adPod.ads[0].media));
                            })
                        .end()
                    .end()
                .end();

                // wait for the pause event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_pause').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event has been detected
                    },function (error) {
                        // the event pause has NOT been detected
                        assert.isFalse(true,"the event pause has NOT been detected for test " + test.name);
                    });

                // wait for the play event
                // Check the expected ad is played
                return(command
                        .then(pollUntil(function (value) {
                            return document.getElementById('event_play').value === "2" ? true : null;
                        }, null, 40000, 100))
                        .then(function () {
                            // the event end has been detected
                        },function (error) {
                            // the event play has NOT been detected
                            assert.isFalse(true,"the event play has NOT been detected for test " + test.name);
                        })
                        .findById("adsplayer-container")
                            .findByTagName("video")
                                .getAttribute("src")
                                .then(function (src) {
                                    assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.adPod.ads[1].media));
                                })
                            .end()
                        .end()
                );
            },

            // Test a vast xml file with 2 ads but outside an ad pod
            // The 2 ads are played in the order they appear in the xml file.
            "doubleAdsInVast": function () {
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

                // Check the expected ad is played
                command
                    .findById("adsplayer-container")
                        .findByTagName("video")
                            .getAttribute("src")
                            .then(function (src){assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.doubleAdsInVast.ads[0].media));})
                        .end()
                    .end();

                // wait for the pause event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_pause').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event pause has been detected
                    },function (error) {
                        // the event pause has NOT been detected
                        assert.isFalse(true,"the event pause has NOT been detected for test " + test.name);
                    });

                // wait for the play event
                // Check the expected ad is played
                return(command
                        .then(pollUntil(function (value) {
                            return document.getElementById('event_play').value === "2" ? true : null;
                        }, null, 40000, 100))
                        .then(function () {
                            // the event end has been detected
                        },function (error) {
                            // the event end has NOT been detected
                            assert.isFalse(true);
                        })
                        .findById("adsplayer-container")
                        .findByTagName("video")
                        .getAttribute("src")
                        .then(function (src){
                            assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.doubleAdsInVast.ads[1].media));
                        })
                        .end()
                        .end()
                );
            },

            // Test a mast xml file with 2 triggers
            "doubleTriggersInMast": function () {
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

                // Check the expected ad is played
                command
                    .findById("adsplayer-container")
                        .findByTagName("video")
                            .getAttribute("src")
                            .then(function (src) {assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.doubleTriggersInMast.ads[0].media));})
                        .end()
                    .end()

                // wait for the pause event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_pause').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event has been detected
                    },function (error) {
                        // the event has NOT been detected
                        assert.isFalse(true,"the event pause has NOT been detected for test " + test.name);
                    });

                return (command
                        .then(pollUntil(function (value) {
                            return document.getElementById('event_play').value === "2" ? true : null;
                        }, null, 40000, 100))
                        .then(function () {
                            // the event end has been detected
                        },function (error) {
                            // the event end has NOT been detected
                            assert.isFalse(true,"the event play has NOT been detected for test " + test.name);
                        })
                        .findById("adsplayer-container")
                            .findByTagName("video")
                                .getAttribute("src")
                                .then(function (src) {assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.doubleTriggersInMast.ads[1].media));})
                            .end()
                        .end()
                );
            },

            // Test a mast xml file with 1 trigger with 2 Vasts xml files
            "doubleVastsInTrigger": function () {

                // wait for the play event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_play').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event has been detected
                    },function (error) {
                        // the event has NOT been detected
                        assert.isFalse(true,"the event play has NOT been detected for test " + test.name);
                    });

                // Check the expected ad is played
                command
                    .findById("adsplayer-container")
                        .findByTagName("video")
                            .getAttribute("src")
                            .then(function (src) {assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.doubleVastsInTrigger.ads[0].media));})
                        .end()
                    .end();

                // wait for the pause event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_pause').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event has been detected
                    },function (error) {
                        // the event pause has NOT been detected
                        assert.isFalse(true,"the event pause has NOT been detected for test " + test.name);
                    });

                return (command
                        .then(pollUntil(function (value) {
                            return document.getElementById('event_play').value === "2" ? true : null;
                        }, null, 40000, 100))
                        .then(function () {
                            // the event end has been detected
                        },function (error) {
                            // the event end has NOT been detected
                            assert.isFalse(true,"the event play has NOT been detected for test " + test.name);
                        })
                        .findById("adsplayer-container")
                            .findByTagName("img")
                                .getAttribute("src")
                                .then(function (src) {assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.doubleVastsInTrigger.ads[1].media));})
                            .end()
                        .end()
                );
            },

            // Test a VMAP XML file with 1 ad break with 2 VASTs XML files
            // The 2 ads are played in the order they appear in the xml file.
            "doubleAdsInVastVmap": function() {
                // wait for the play event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_play').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event play has been detected
                    },function (error) {
                        // the event play has NOT been detected
                        assert.isFalse(true,"the event play has NOT been detected for test doubleAdsInVastVmap");
                    });

                // Check the expected ad is played
                command
                    .findById("adsplayer-container")
                    .findByTagName("video")
                    .getAttribute("src")
                    .then(function (src){assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.doubleAdsInVastVmap.ads[0].media));})
                    .end()
                    .end();

                // wait for the pause event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_pause').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event pause has been detected
                    },function (error) {
                        // the event pause has NOT been detected
                        assert.isFalse(true,"the event pause has NOT been detected for test doubleAdsInVastVmap");
                    });

                // wait for the play event
                // Check the expected ad is played
                return(command
                        .then(pollUntil(function (value) {
                            return document.getElementById('event_play').value === "2" ? true : null;
                        }, null, 40000, 100))
                        .then(function () {
                            // the event end has been detected
                        },function (error) {
                            // the event end has NOT been detected
                            assert.isFalse(true);
                        })
                        .findById("adsplayer-container")
                        .findByTagName("video")
                        .getAttribute("src")
                        .then(function (src){
                            assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.doubleAdsInVastVmap.ads[1].media));
                        })
                        .end()
                        .end()
                );
            },

            // Test a VMAP XML file with 2 ad breaks
            "doubleAdBreaksInVmap": function() {
                // wait for the play event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_play').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event has been detected
                    },function (error) {
                        // the event has NOT been detected
                        assert.isFalse(true,"the event play  has NOT been detected for test doubleAdBreaksInVmap");
                    });

                // Check the expected ad is played
                command
                    .findById("adsplayer-container")
                    .findByTagName("video")
                    .getAttribute("src")
                    .then(function (src) {assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.doubleAdBreaksInVmap.ads[0].media));})
                    .end()
                    .end()

                // wait for the pause event
                command
                    .then(pollUntil(function (value) {
                        return document.getElementById('event_pause').value === "1" ? true : null;
                    }, null, 40000, 100))
                    .then(function () {
                        // the event has been detected
                    },function (error) {
                        // the event has NOT been detected
                        assert.isFalse(true,"the event pause has NOT been detected for test doubleAdBreaksInVmap");
                    });

                return (command
                        .then(pollUntil(function (value) {
                            return document.getElementById('event_play').value === "2" ? true : null;
                        }, null, 40000, 100))
                        .then(function () {
                            // the event end has been detected
                        },function (error) {
                            // the event end has NOT been detected
                            assert.isFalse(true,"the event play has NOT been detected for test doubleAdBreaksInVmap");
                        })
                        .findById("adsplayer-container")
                        .findByTagName("video")
                        .getAttribute("src")
                        .then(function (src) {assert.strictEqual(getMediaFileName(src), getMediaFileName(config.tests.multipleAds.doubleAdBreaksInVmap.ads[1].media));})
                        .end()
                        .end()
                );
            }
        };
    });
});
