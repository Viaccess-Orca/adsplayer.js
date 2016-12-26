/**
 TEST_EVT_CLOSELINEAR:

- load test page
- for each stream:
    - load stream
    - stop the ads player
    - wait the end of the ads
    - check received tracking events
**/

define([
    'intern!object',
    'intern/chai!assert',
    'require',
    'test/functional/config/testsConfig',
    'test/functional/tests/player_functions',
    'test/functional/tests/tests_functions'
    ], function(registerSuite, assert, require, config, player, tests) {

        // Suite name
        var NAME = 'TEST_EVT_CLOSELINEAR';

        // Test configuration (see config/testConfig.js)
        var testConfig = config.tests.trackingEvents.closeLinear,
            streams = testConfig.streams;

        // Test constants
        var ADS_DURATION = config.tests.trackingEvents.adsDuration; // ads duration (in s)

        // Test variables
        var command = null;

    var testSetup = function (stream) {
        var sleepTime = 4;

        registerSuite({
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

            loadStream: function() {
                tests.logLoadStream(NAME, stream);
                return command.execute(player.loadStreamAndExitPopup, [stream])
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
                        var res = tests.checkTrackingEvents(stream.ExpectedtrackingEvents,receivedTackingEvents);
                        if (!res) {
                            tests.log(NAME, 'Received tracking events: ' + JSON.stringify(receivedTackingEvents));
                            tests.log(NAME, 'expected tracking events: ' + JSON.stringify(stream.ExpectedtrackingEvents));
                        }
                        assert.isTrue(res);
                    }))
            }
        });
    };

    for (var i = 0; i < streams.length; i++) {
            // Performs load test page, stream and tests
        testSetup(streams[i]);
        }
});
