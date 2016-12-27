/**
 TEST_EVT_CLOSELINEAR:

- load test page
- load stream
- stop the ads player
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
        var sleepTime = 4;
        var NAME = 'TEST_EVT_CLOSELINEAR';

        return {

            name: NAME,

            setup: function() {
                tests.log(NAME, 'Setup');

                // this test is not reliable on firefox, don't know why?
                if ( (this.remote.session.capabilities.browserName === 'firefox') || (this.remote.session.capabilities.browserName === 'MicrosoftEdge') ) {
                    this.skip('skipped on firefox and edge');
                }
                command = this.remote.get(require.toUrl(config.tests.trackingEvents.testPageUrl));
                command = tests.setup(command);

                return command;
            },

            teardown: function () {
                // executes after suite ends;
                // this test is not reliable on firefox, don't know why?
                if ( (this.remote.session.capabilities.browserName === 'firefox') || (this.remote.session.capabilities.browserName === 'MicrosoftEdge') ) {
                    this.skip('skipped on firefox and edge');
                }

                tests.log(NAME, 'teardown ... ' );
                // Cleanly exit the test : load another page and accept the Alert popup
                this.remote.get(require.toUrl(config.tests.trackingEvents.testPageUrl));
                return (command.acceptAlert());
            },

            "loadStream": function() {
                tests.log(NAME, config.streamUrl);
                return command.execute(player.loadStreamAndExitPopup, [config.streamUrl, config.tests.trackingEvents.closeLinear.adsUrl])
            },

            "closeAds": function () {
                tests.log(NAME, 'Wait ' + sleepTime + ' sec. and refresh');
                return (command
                    .sleep(sleepTime * 1000)
                    //.execute( document.location.reload(true))
                    .refresh()
                    .dismissAlert()
                    .then(function () {
                        return command.execute(player.getReceivedTackingEvents);
                    })
                    .then(function (receivedTackingEvents) {
                        // Compare TackingEvents arrays
                        var res = tests.checkTrackingEvents(config.tests.trackingEvents.closeLinear.ExpectedtrackingEvents, receivedTackingEvents);
                        if (!res) {
                            tests.log(NAME, 'Received tracking events: ' + JSON.stringify(receivedTackingEvents));
                            tests.log(NAME, 'expected tracking events: ' + JSON.stringify(config.tests.trackingEvents.closeLinear.ExpectedtrackingEvents));
                        }
                        assert.isTrue(res);
                    }))
            }
        };
    });

});
