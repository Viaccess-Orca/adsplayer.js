/**
 TEST_EVT_ACCEPTINVITATIONLINEAR:

- load test page
- load stream
- click on ads player
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

    registerSuite(function() {
        var command = null;
        var sleepTime = 3;
        var NAME = 'TEST_EVT_ACCEPTINVITATIONLINEAR';

        return {
            name: NAME,

            setup: function () {
                tests.log(NAME, 'Setup');

                // Skip entire suite if running on windows10/firefox
                // this.remote.session.capabilities.platform === 'XP' on windows10
                if ((this.remote.session.capabilities.browserName === 'firefox') && (this.remote.session.capabilities.platform === 'XP'))  {
                    this.skip('skipped on windows10/firefox');
                }
                
                command = this.remote.get(require.toUrl(config.tests.trackingEvents.testPageUrl));
                command = tests.setup(command);
                return command;
            },

            teardown: function () {
                // executes after suite ends;
            },

            beforeEach: function (test) {
                // executes before each test
            },

            afterEach: function (test) {
                // executes after each test
            },

            "loadStream": function () {
                tests.log(NAME, config.streamUrl);
                return command.execute(player.loadStream, [config.streamUrl, config.tests.trackingEvents.acceptInvitationLinear.adsUrl])
            },

            "doAction": function () {
                tests.log(NAME, 'Wait ' + sleepTime + ' sec. and click on ads player');
                return command.sleep(sleepTime * 1000).findByCssSelector('#adsplayer-video').click();
            },

            "checkTrackingEvents": function () {
                tests.log(NAME, 'wait end of ads - ' + config.tests.trackingEvents.adsDuration * 1000);
                return command.sleep(config.tests.trackingEvents.adsDuration * 1000)
                    .then(function () {
                        return command.execute(player.getReceivedTackingEvents);
                    })
                    .then(function (receivedTackingEvents) {
                        // Compare TackingEvents arrays
                        var res = tests.checkTrackingEvents(config.tests.trackingEvents.acceptInvitationLinear.ExpectedtrackingEvents, receivedTackingEvents);
                        if (!res) {
                            tests.log(NAME, 'Received tracking events: ' + JSON.stringify(receivedTackingEvents));
                            tests.log(NAME, 'expected tracking events: ' + JSON.stringify(config.tests.trackingEvents.acceptInvitationLinear.ExpectedtrackingEvents));
                        }
                        assert.isTrue(res);
                    });
            }
        };
    });
});


