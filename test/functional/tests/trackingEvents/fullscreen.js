/**
 TEST_EVT_FULLSCREEN:

- load test page
- load stream
- request full screen and exit full screen
- wait the end of the ads
- check received tracking events
**/

define(function(require) {
        var intern = require('intern');
        var registerSuite = require('intern!object');
        var assert = require('intern/chai!assert');
        var player = require('test/functional/tests/trackingEvents/player_functions');
        var tests = require('test/functional/tests/trackingEvents/tests_functions');
        var config = require('test/functional/config/testsConfig');

        registerSuite(function(){
            var command = null;
            var sleepTime = 2;
            var NAME = 'TEST_EVT_FULLSCREEN';

            return {
                name: NAME,

                setup: function () {
                    // executes before suite starts;

                    // Skip entire suite if running in a edge browser
                    if (this.remote.session.capabilities.browserName === 'MicrosoftEdge') {
                        this.skip('skipped on browser Edge');
                    }

                    command = this.remote.get(require.toUrl(config.tests.trackingEvents.testPageUrl));
                    command = tests.setup(command);
                    return command;
                },

                teardown: function () {
                    // executes after suite ends;
                },

                beforeEach: function () {
                    // executes before each test
                },

                afterEach: function (test) {
                    // executes after each test
                },

                "loadStream": function () {
                	tests.log(NAME, config.streamUrl);
                    return command.execute(player.loadStream, [config.streamUrl, config.tests.trackingEvents.fullscreen.adsUrl])
                },

                "requestFullscreen": function () {
                	tests.log(NAME, 'Wait ' + sleepTime + ' sec. and request Fullscreen');
                    return command.sleep(sleepTime * 1000).findByCssSelector('.button-fullscreen').click();
                },

                "exitFullscreen": function () {
                	tests.log(NAME, 'Wait ' + sleepTime + ' sec. and exit Fullscreen');
                    return command.sleep(sleepTime * 1000).findByCssSelector('.button-fullscreen').click();
                },

                "checkTrackingEvents": function () {
                	tests.log(NAME, 'wait end of ads - ' + config.tests.trackingEvents.adsDuration * 1000);
                    return command.sleep(config.tests.trackingEvents.adsDuration * 1000)
                        .then(function () {
                            return command.execute(player.getReceivedTackingEvents);
                        })
                        .then(function (receivedTackingEvents) {
                            // Compare TackingEvents arrays
                            var res = tests.checkTrackingEvents(config.tests.trackingEvents.fullscreen.ExpectedtrackingEvents, receivedTackingEvents);
                            if (!res) {
                                tests.log(NAME, 'Received tracking events: ' + JSON.stringify(receivedTackingEvents));
                                tests.log(NAME, 'expected tracking events: ' + JSON.stringify(config.tests.trackingEvents.fullscreen.ExpectedtrackingEvents));
                            }
                            assert.isTrue(res);
                        });
                }
            }
    });

});
