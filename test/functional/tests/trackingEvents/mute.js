/**
TEST_EVT_MUTE:

- load test page
- load stream
- mute the player
- check if <player> is muted
- unmute the player
- check if <player> is unmuted
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
        var sleepTime = 2;
        var NAME = 'TEST_EVT_MUTE';

        return{
            name: NAME,

            setup: function() {
                tests.log(NAME, 'Setup');
                command = this.remote.get(require.toUrl(config.tests.trackingEvents.testPageUrl));
                command = tests.setup(command);
                return command;
            },

            loadStream: function() {
                tests.log(NAME, config.streamUrl);
                return command.execute(player.loadStream, [config.streamUrl, config.tests.trackingEvents.mute.adsUrl])
            },


            "mute": function () {
                tests.log(NAME, 'Wait ' + sleepTime + ' sec. and mute the player');
                return command.sleep(sleepTime * 1000).execute(player.setMute, [true])
                    .then(function () {
                        tests.log(NAME, 'Check if player is muted');
                        return command.execute(player.getMute);
                    })
                    .then(function (isPlayerMuted) {
                        tests.log(NAME, 'Check if player is muted : ' + isPlayerMuted);
                        assert.isTrue(isPlayerMuted);
                    })
            },

            "unmute": function () {
                tests.log(NAME, 'Wait ' + sleepTime + ' sec. and unmute the player');
                return command.sleep(sleepTime * 1000).execute(player.setMute, [false])
                    .then(function () {
                        return command.execute(player.getMute);
                    })
                    .then(function (isPlayerMuted) {
                        tests.log(NAME, 'Check if player is unmuted : ' + isPlayerMuted);
                        assert.isFalse(isPlayerMuted);
                    })
            },

            "checkTrackingEvents": function () {
                tests.log(NAME, 'wait end of ads - ' + config.tests.trackingEvents.adsDuration);
                return command.sleep(config.tests.trackingEvents.adsDuration * 1000)
                 .then(function() {
                    return command.execute(player.getReceivedTackingEvents);
                })
                .then(function (receivedTackingEvents) {
                    // Compare TackingEvents arrays
                    var res = tests.checkTrackingEvents(config.tests.trackingEvents.mute.ExpectedtrackingEvents,receivedTackingEvents);
                    if (!res) {
                        tests.log(NAME, 'Received tracking events: ' + JSON.stringify(receivedTackingEvents));
                        tests.log(NAME, 'expected tracking events: ' + JSON.stringify(config.tests.trackingEvents.mute.ExpectedtrackingEvents));
                    }
                    assert.isTrue(res);
                });
            }
        };
    });
});
