/**
 TEST_EVT_PLAY:

- for each stream:
    - load test page
    - load stream
    - wait the end of the ads
    - check if tracking events have been received
**/
define(function(require) {
    var intern = require('intern');
    var registerSuite = require('intern!object');
    var assert = require('intern/chai!assert');
    var player = require('test/functional/tests/trackingEvents/player_functions');
    var tests = require('test/functional/tests/trackingEvents/tests_functions');
    var config = require('test/functional/config/testsConfig');
    var NAME = 'TEST_EVT_PLAY';
    var test = function(ad) {
        var command = null;

        registerSuite({
            name: NAME,

            setup: function() {
                tests.log(NAME, 'Setup');
                command = this.remote.get(require.toUrl(config.tests.trackingEvents.testPageUrl));
                command = tests.setup(command);
                return command;
            },

            "loadStream": function() {
                tests.log(NAME, config.streamUrl);
                return command.execute(player.loadStream, [config.streamUrl,ad.adsUrl]);
            },

            "playing": function() {
                tests.log(NAME, 'wait end of ads - ' + config.tests.trackingEvents.adsDuration);
                return command.sleep(2 * config.tests.trackingEvents.adsDuration * 1000)
                    .then(function() {
                        return command.execute(player.getReceivedTackingEvents);
                    })
                    .then(function (receivedTackingEvents) {
                        // Compare TackingEvents arrays
                        var res = tests.checkTrackingEvents(ad.ExpectedtrackingEvents,receivedTackingEvents);
                        if (!res) {
                            tests.log(NAME, 'Received tracking events: ' + JSON.stringify(receivedTackingEvents));
                            tests.log(NAME, 'expected tracking events: ' + JSON.stringify(ad.ExpectedtrackingEvents));
                        }
                        assert.isTrue(res);
                    });
           }
        });
    };

    for (var i = 0; i < config.tests.trackingEvents.play.ads.length; i++) {
        test(config.tests.trackingEvents.play.ads[i]);
    }
});
