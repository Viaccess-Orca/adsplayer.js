define(function(require) {

    var _createInstance = function() {
        return {
            // Common tests suite configuration fields
            testPageUrl : "http://cswebplayer.viaccess.fr/functionnalTests/CSAdsPlugin-Dev/samples/testsPlayer",        // url of the html page under test
            streamUrl   : "http://playready.directtaps.net/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/Manifest",// url of the main stream
                                                                                                                        // take care using one with video.currentTime = 0 at the beginning
                                                                                                                        // for the pre-roll tests
            tests : {
                // trackingEvents test suite specific configuration fields
                trackingEvents: {
                    //testPageUrl : "http://cswebplayer.viaccess.fr/functionnalTests/CSAdsPlugin-Master/samples/adsTestsPlayer", //url of the html page under test
                    testPageUrl : "http://localhost/csadsplugin/samples/adsTestsPlayer/",
                    adsDuration : 10,
                    play: {
                        ads: [
                            {"adsUrl":"",
                             "ExpectedtrackingEvents":{} },
                            {"adsUrl":"../ads/xml/mast/preroll.xml",
                             "ExpectedtrackingEvents":{"creativeView":1,"start":1,"firstQuartile":1,"midpoint":1,"thirdQuartile":1,"complete":1} },
                            {"adsUrl":"../ads/xml/mast/preroll-image.xml",
                             "ExpectedtrackingEvents":{} },
                            {"adsUrl":"../ads/xml/mast/preroll-vast30.xml",
                             "ExpectedtrackingEvents":{"creativeView":1,"start":1,"firstQuartile":1,"midpoint":1,"thirdQuartile":1,"complete":1,"progress":3,"rewind":'x'} }
                        ]
                    },
                    pause: {
                        "adsUrl":"../ads/xml/mast/preroll-vast30.xml",
                        "ExpectedtrackingEvents":{"creativeView":1,"start":1,"firstQuartile":1,"midpoint":1,"thirdQuartile":1,"complete":1,"pause":1,"resume":1,"progress":3,"rewind":'x'}
                    },
                    mute: {
                        "adsUrl":"../ads/xml/mast/preroll-vast30.xml",
                        "ExpectedtrackingEvents":{"creativeView":1,"start":1,"firstQuartile":1,"midpoint":1,"thirdQuartile":1,"complete":1,"mute":1,"unmute":1,"progress":3,"rewind":'x'}
                    },
                    closeLinear: {
                        "adsUrl":"../ads/xml/mast/preroll-vast30.xml",
                        "ExpectedtrackingEvents":{"creativeView":1,"start":1,"closeLinear":1,"progress":'x',"midpoint":'x', "firstQuartile":'x',"rewind":'x'}
                    },
                    rewind: {
                        "adsUrl":"../ads/xml/mast/preroll-vast30.xml",
                        "ExpectedtrackingEvents":{"creativeView":1,"start":1,"firstQuartile":1,"midpoint":1,"thirdQuartile":1,"complete":1,"rewind":4,"progress":3}
                    },
                    fullscreen: {
                        "adsUrl":"../ads/xml/mast/preroll-vast30.xml",
                        "ExpectedtrackingEvents":{"creativeView":1,"start":1,"firstQuartile":1,"midpoint":1,"thirdQuartile":1,"complete":1,"progress":3,"exitFullscreen":1,"fullscreen":1,"rewind":'x'}
                    },
                    acceptInvitationLinear: {
                        "adsUrl":"../ads/xml/mast/preroll-vast30.xml",
                        "ExpectedtrackingEvents":{"creativeView":1,"start":1,"firstQuartile":1,"midpoint":1,"thirdQuartile":1,"complete":1,"progress":3,"acceptInvitationLinear":1,"rewind":'x'}
                    }
                }
            }
        };
    };

    var _getInstance = function() {
        if (!this._instance) {
            this._instance = _createInstance();
        }
        return this._instance;
    };

    return _getInstance();
});
