define(function(require) {

    var streams = require('./masts.js');

    var _createInstance = function() {
        return {
            asyncTimeout: 10,
            adsDuration: 10,
            tests : {
                trackingEvents: {
                    play: {
                        streams: [
                            streams.MAST_NONE,
                            streams.MAST_PREROLL_VAST2_LINEAR,
                            streams.MAST_PREROLL_VAST2_LINEAR_IMAGE,
                            streams.MAST_PREROLL_VAST3_LINEAR
                        ]
                    },
                    pause: {
                        streams: [
                            streams.MAST_PREROLL_VAST3_LINEAR_PAUSE
                        ]
                    },
                    mute: {
                        streams: [
                            streams.MAST_PREROLL_VAST3_LINEAR_MUTE
                        ]
                    },
                    closeLinear: {
                        streams: [
                            streams.MAST_PREROLL_VAST3_LINEAR_CLOSE
                        ]
                    },
                    rewind: {
                        streams: [
                            streams.MAST_PREROLL_VAST3_LINEAR_REWIND
                        ]
                    },
                    fullscreen: {
                        streams: [
                            streams.MAST_PREROLL_VAST3_LINEAR_FULLSCREEN
                        ]
                    },
                    acceptInvitationLinear: {
                        streams: [
                            streams.MAST_PREROLL_VAST3_LINEAR_ACCEPTINVITATION
                        ]
                    }
                },

                error: {
                    downloadErrorContent:{
                        streams:[
                            streams.MSS_LIVE_1
                        ],
                        warnCode:"DOWNLOAD_ERR_CONTENT",
                        errorCode:"DOWNLOAD_ERR_CONTENT"
                    },
                    errorManifest: {
                        streams: [
                            streams.MSS_LIVE_UNKNOWN_MANIFEST_TYPE_ERROR,
                            streams.MSS_LIVE_MANIFEST_ERROR,
                            streams.MSS_LIVE_MALFORMED_MANIFEST_ERROR,
                            streams.MSS_LIVE_UNSUPPORTED_AUDIO_CODEC_ERROR,
                            streams.MSS_VOD_WRONG_AUDIO_CODEC_ERROR,
                            streams.MSS_LIVE_EMPTY_VIDEO_FOURCC_ERROR,
                            streams.MSS_LIVE_VIDEO_FOURCC_UNSUPPORTED_ERROR,
                            streams.HLS_LIVE_MANIFEST_MISSING_ERROR
                        ],
                        expectedErrorCodes: [
                            ['MANIFEST_ERR_PARSE'],
                            ['DOWNLOAD_ERR_MANIFEST'],
                            ['MANIFEST_ERR_PARSE'],
                            ['MEDIA_ERR_CODEC_UNSUPPORTED'],
                            ['MEDIA_ERR_CODEC_UNSUPPORTED', 'MEDIA_ERR_SRC_NOT_SUPPORTED'],
                            ['MEDIA_ERR_CODEC_UNSUPPORTED'],
                            ['MEDIA_ERR_CODEC_UNSUPPORTED'],
                            ['DOWNLOAD_ERR_MANIFEST']
                        ]
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
