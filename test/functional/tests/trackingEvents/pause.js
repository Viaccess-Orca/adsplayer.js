/**
 TEST_EVT_PAUSE:

- load test page
- load stream
- pause the ads player
- check if <ads> is paused
- check if <ads> is not progressing
- resume the ads player
- wait the end of the ads
- check received tracking events
**/

define(function(require) {
    var intern = require('intern');
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');
    var player = require('test/functional/tests/trackingEvents/player_functions');
    var tests = require('test/functional/tests/trackingEvents/tests_functions');
    var ads = require('test/functional/tests/trackingEvents/ads_functions');
    var config = require('test/functional/config/testsConfig');

    registerSuite(function(){

        var command = null;
        var NAME = 'TEST_EVT_PAUSE';
        var PAUSE_DELAY = 5; // Delay (in s) for checking is player is still paused (= not progressing)

        return {
            name: NAME,

            setup: function() {
                tests.log(NAME, 'Setup');
                command = this.remote.get(require.toUrl(config.tests.trackingEvents.testPageUrl));
                command = tests.setup(command);
                return command;
            },

            "play": function() {
                tests.log(NAME, config.streamUrl);
                return command.execute(player.loadStream, [config.streamUrl, config.tests.trackingEvents.pause.adsUrl])
            },

            "pause": function() {
                var currentTime = 0;
                var sleepTime = 5;

                tests.log(NAME, 'Wait ' + sleepTime + ' sec. and pause the ads player');
                return command.sleep(sleepTime * 1000).execute(ads.pause)
                .then(function () {
                    tests.log(NAME, 'Check if paused');
                    return command.execute(ads.isPaused);
                })
                .then(function (paused) {
                    assert.isTrue(paused);
                    return command.execute(ads.getCurrentTime);
                })
                .then(function (time) {
                    currentTime = time;
                    tests.log(NAME, 'Check if not progressing');
                    tests.log(NAME, 'Current time = ' + time );
                    return command.sleep(PAUSE_DELAY * 1000);
                })
                .then(function () {
                    return command.execute(ads.getCurrentTime);
                })
                .then(function (time) {
                    tests.log(NAME, 'Current time = ' + time);
                    assert.strictEqual(time, currentTime);
                    tests.log(NAME, 'Resume the ads player');
                    return command.execute(ads.play);
                })
                .then(function () {
                    return command.execute(ads.getDuration);
                })
                .then(function (adsDuration) {
                    tests.log(NAME, 'wait end of ads - ' + adsDuration);
                     return command.sleep(adsDuration * 1000);
                })
                .then(function() {
                    return command.execute(player.getReceivedTackingEvents);
                })
                .then(function (receivedTackingEvents) {
                    // Compare TackingEvents arrays
                    var res = tests.checkTrackingEvents(config.tests.trackingEvents.pause.ExpectedtrackingEvents,receivedTackingEvents);
                    if (!res) {
                        tests.log(NAME, 'Received tracking events: ' + JSON.stringify(receivedTackingEvents));
                        tests.log(NAME, 'expected tracking events: ' + JSON.stringify(config.tests.trackingEvents.pause.ExpectedtrackingEvents));
                    }
                    assert.isTrue(res);
                });
            }
        };
    });

});
