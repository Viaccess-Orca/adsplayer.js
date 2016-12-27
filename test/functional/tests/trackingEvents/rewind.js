/**
TEST_EVT_MUTE:

- load test page
- load stream
- go forward and rewind several times
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
        var currentTime = 0;
        var sleepTime = 3;
        var NAME="TEST_EVT_REWIND";

        return {
            name:NAME,

            setup: function () {
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
                return command.execute(player.loadStream, [config.streamUrl, config.tests.trackingEvents.rewind.adsUrl])
            },

            "seek": function () {
                return command.sleep(sleepTime * 1000).execute(ads.getCurrentTime)
                    .then(function (time) {
                        currentTime = time;
                        tests.log(NAME, 'Current time = ' + time);
                        return command.execute(ads.seek, [3])
                    })
                    .then(function () {
                        command.execute(ads.getCurrentTime)
                    })
                    .then(function (time) {
                        currentTime = time;
                        tests.log(NAME, 'Current time = ' + time);
                        tests.log(NAME, 'Wait 1 sec. and rewind to seconds 1');
                        return command.sleep(1000).execute(ads.seek, [1])
                    })
                    .then(function () {
                        return command.execute(ads.getCurrentTime)
                    })
                    .then(function (time) {
                        currentTime = time;
                        tests.log(NAME, 'Current time = ' + time);
                        tests.log(NAME, 'Wait 1 sec. and go forward to seconds 4');
                        return command.sleep(1000).execute(ads.seek, [4])
                    })
                    .then(function () {
                        return command.execute(ads.getCurrentTime);
                    })
                    .then(function (time) {
                        currentTime = time;
                        tests.log(NAME, 'Current time = ' + time);
                        tests.log(NAME, 'Wait 1 sec. and rewind to seconds 1');
                        return command.sleep(1000).execute(ads.seek, [1])
                    })
                    .then(function () {
                        return command.execute(ads.getCurrentTime)
                    })
                    .then(function (time) {
                        currentTime = time;
                        tests.log(NAME, 'Current time = ' + time);
                        tests.log(NAME, 'Wait 1 sec. and rewind to seconds 1');
                        return command.sleep(5000).execute(ads.seek, [1])
                    })
                    .then(function () {
                        return command.execute(ads.getCurrentTime)
                    })
                    .then(function (time) {
                        currentTime = time;
                        tests.log(NAME, 'Current time = ' + time);
                        tests.log(NAME, 'Wait 1 sec. and rewind to seconds 1');
                        return command.sleep(1000).execute(ads.seek, [1])
                    });
            },

            "checkTrackingEvents": function () {
                return command.sleep(config.tests.trackingEvents.adsDuration * 1000)
                    .then(function () {
                        return command.execute(player.getReceivedTackingEvents);
                    })
                    .then(function (receivedTackingEvents) {
                        // Compare TackingEvents arrays
                        var res = tests.checkTrackingEvents(config.tests.trackingEvents.rewind.ExpectedtrackingEvents, receivedTackingEvents);
                        if (!res) {
                            tests.log(NAME, 'Received tracking events: ' + JSON.stringify(receivedTackingEvents));
                            tests.log(NAME, 'expected tracking events: ' + JSON.stringify(config.tests.trackingEvents.rewind.ExpectedtrackingEvents));
                        }
                        assert.isTrue(res);
                    });
            }
        }
    });

});
