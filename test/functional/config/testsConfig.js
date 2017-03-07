define(function(require) {

    var vast01 = ["../../media/vo_ad_2.mp4"];

    var _createInstance = function() {
        return {
            // Common tests suite configuration fields
            //testPageUrl : "http://cswebplayer.viaccess.fr/functionnalTests/CSAdsPlugin-Dev/samples/testsPlayer",        // url of the html page under test
            testPageUrl : "http://cswebplayer.viaccess.fr/functionnalTests/CSAdsPlugin-Alain/samples/testsPlayer/",
            streamUrl   : "http://playready.directtaps.net/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/Manifest",// url of the main stream
                                                                                                                        // take care using one with video.currentTime = 0 at the beginning
                                                                                                                        // for the pre-roll tests
            tests : {
                //Events test suite specific configuration fields
                events: {
                    "adUrl": "../ads/xml/mast/preroll.xml",
                    "startExpectedEvents":{"start":1,"end":0,"add":1,"remove":0,"play":1,"pause":0},
                    "endExpectedEvents":{"start":1,"end":1,"add":1,"remove":1,"play":1,"pause":1}

                },

                // Test suite multipleAds specific configuration fields
                multipleAds: {
                    adPod: {
                        mastUrl: "../ads/xml/mast/preroll-vast30-adPods.xml",
                        ads: [{media: "../ads/media/vo_ad_2.mp4", duration: 6000},
                            {media: "../ads/media/vo_ad_4.mp4", duration: 4000}]
                    },
                    doubleAdsInVast: {
                        mastUrl: "../ads/xml/mast/preroll-double-vast2.xml",
                        ads: [{media: "../ads/adsserver/media/vo_ad_2.mp4", duration: 6000},
                            {media: "../ads/adsserver/media/vo_ad_4.mp4", duration: 4000}]
                    },
                    doubleTriggersInMast: {
                        mastUrl: "../ads/xml/mast/preroll1-preroll2.xml",
                        ads: [{media: "../ads/adsserver/media/vo_ad_2.mp4", duration: 6000},
                            {media: "../ads/adsserver/media/vo_ad_4.mp4", duration: 4000}]
                    },
                    doubleVastsInTrigger: {
                        mastUrl: "../ads/xml/mast/preroll-vast30-doubleVastsInTrigger.xml",
                        ads: [{media: "../ads/adsserver/media/vo_ad_2.mp4", duration: 6000},
                            {media: "../ads/adsserver/media/vo_logo.png", duration: 5000}]
                    },
                    doubleAdsInVastVmap: {
                        mastUrl: "../ads/xml/vmap/preroll-double-vast2.xml",
                        ads: [
                            {
                                media: "../ads/adsserver/media/vo_ad_2.mp4",
                                duration: 6000
                            }, {
                                media: "../ads/adsserver/media/vo_ad_4.mp4",
                                duration: 4000
                            }
                        ]
                    },
                    doubleAdBreaksInVmap: {
                        mastUrl: "../ads/xml/vmap/preroll1-preroll2.xml",
                        ads: [
                            {
                                media: "../ads/adsserver/media/vo_ad_2.mp4",
                                duration: 6000
                            }, {
                                media: "../ads/adsserver/media/vo_ad_4.mp4",
                                duration: 4000
                            }
                        ]
                    }
                },

                // trackingEvents test suite specific configuration fields
                trackingEvents: {
                    adsDuration : 10,
                    noAd: {"adsUrl":"",
                        "ExpectedtrackingEvents":{} },

                    preroll: {"adsUrl":"../ads/xml/mast/preroll.xml",
                        "ExpectedtrackingEvents":{"creativeView":1,"start":1,"firstQuartile":1,"midpoint":1,"thirdQuartile":1,"complete":1} },

                    prerollImage: {"adsUrl":"../ads/xml/mast/preroll-image.xml",
                        "ExpectedtrackingEvents":{} },

                    prerollVast30: {"adsUrl":"../ads/xml/mast/preroll-vast30.xml",
                        "ExpectedtrackingEvents":{"creativeView":1,"start":1,"firstQuartile":1,"midpoint":1,"thirdQuartile":1,"complete":1,"progress":3,"rewind":'x'} },

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
                },

                vmap: {
                    marginOfError: 0.5,
                    preroll: {
                        mastUrl: "../ads/xml/vmap/preroll.xml",
                        ads: [
                            {
                                media: vast01[0]
                            }
                        ],
                        timeOffset: 0
                    },
                    midrollTimestamp: {
                        mastUrl: "../ads/xml/vmap/midroll-timestamp.xml",
                        ads: [
                            {
                                media: vast01[0]
                            }
                        ],
                        timeOffset: 5.514
                    },
                    midrollPercent: {
                        mastUrl: "../ads/xml/vmap/midroll-percent.xml",
                        ads: [
                            {
                                media: vast01[0]
                            }
                        ],
                        timeOffset: 3.6
                    },
                    postroll: {
                        mastUrl: "../ads/xml/vmap/postroll.xml",
                        ads: [
                            {
                                media: vast01[0]
                            }
                        ],
                        timeOffset: 120.5
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
