/**
 * The AdPlayer manages the sequencing of playing creatives of a single Ad.
 * It takes as input the Ad object as returned by the VAST parser.
 * The AdPlayer plays sequentially all contained Creatives,
 * with the help of a CreativePlayer.
 *
 * Dispatch events:
 *  - "creativesStart" when the first creative is played
 *  - "creativesEnd" when all the creative are played
 *
 */

import LinearCreativePlayer from './LinearCreativePlayer';
import Debug from '../Debug';
import EventBus from '../EventBus';
import NonLinearCreativePlayer from './NonLinearCreativePlayer';

class CreativesPlayer {

        _sendImpressions (impressions){
            let impression;

            if (impressions.length === 0) {
                return;
            }

            for (let i = 0; i < impressions.length; i++) {
                impression = impressions[i];
                if (impression.uri && impression.uri.length > 0) {
                    this._debug.info("Send Impression, uri = " + impression.uri);
                    var http = new XMLHttpRequest();
                    http.open("GET", impression.uri, true);
                    http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
                    http.send();
                }
            }
        }

        _onCreativeEnd (){

            this._debug.info("(CreativesPlayer) onCreativeEnd");

            // Stop the current creative media
            this._stopCreative();

            this._resetCreative();

            // Play next creative
            this._playNextCreative();
        }

        _resumeCreative (){
            this._debug.info("(CreativesPlayer) resumeCreative ");
            if (!this._creativePlayer) {
                return;
            }
            this._creativePlayer.play();
        }

        _resetCreative(){
            this._debug.info("(CreativesPlayer) resetCreative ");
            if (!this._creativePlayer) {
                return;
            }
            this._creativePlayer.delete();
        }

        _stopCreative(){
            this._debug.info("(CreativesPlayer) stopCreative ");
            this._eventBus.removeEventListener('creativeEnd', this._onCreativeEndListener);

            if (!this._creativePlayer) {
                return;
            }
            this._creativePlayer.stop();
        }

        _playNextCreative(){

            this._creativeIndex++;

            if (this._creativeIndex < this._ad.inLine.creatives.length) {
                this._playCreative(this._creativeIndex);
            } else {
                // Notify end of trigger
                this._eventBus.dispatchEvent({
                    type: "creativesEnd",
                    data: {}
                });
            }
        }

        _playCreative(index){
            let creative = this._ad.inLine.creatives[index];

            this._creativeIndex = index;
            this._debug.info("(CreativesPlayer) playCreative(" + this._creativeIndex + ")");

            // First, play Linear element if it exists
            if (creative.linear) {
                this._debug.info("(CreativesPlayer) Play Linear Ad, duration = " + creative.linear.duration);
                this._eventBus.addEventListener('creativeEnd', this._onCreativeEndListener);
                this._creativePlayer = new LinearCreativePlayer(this._adPlayerContainer, this._mainVideo);
                if (!this._creativePlayer.load(creative.linear, this._baseUrl)) {
                    this._playNextCreative();
                }
            } else {
                // then non-linear if it exists
                if (creative.nonLinearAds) {
                    this._debug.info("(CreativesPlayer) Play Non-Linear Ad");
                    this._eventBus.addEventListener('creativeEnd', this._onCreativeEndListener);
                    this._creativePlayer = new NonLinearCreativePlayer(this._adPlayerContainer, this._mainVideo);
                    if (!this._creativePlayer.load(creative.nonLinearAds, this._baseUrl)) {
                        this._playNextCreative();
                    }
                } else {
                    this._playNextCreative();
                }
            }
        }

        _skipCreative() {
            this._debug.info("(CreativesPlayer) skipCreative ");

            // Notify the creative was skipped
            this._eventBus.dispatchEvent({
                type: 'skip',
                data: {}
            });

            // Stop the current creative media
            this._stopCreative();

            this._resetCreative();

            // Play next creative
            this._playNextCreative();
        }


    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////


    /**
     * Initializes the AdPlayer
     * @method constructor
     * @access public
     * @memberof AdPlayer#
     * @param {Object} ad - the Ad to play
     * @param {Array} adPlayerContainer - the HTML DOM container for ads player components
     * @param {Object} mainVideo - the HTML5 video element used by the main media player
     * @param {string} baseUrl - TODO
     */

    constructor(ad, adPlayerContainer, mainVideo, baseUrl) {
        this._ad = ad;
        this._adPlayerContainer = adPlayerContainer;
        this._mainVideo = mainVideo;
        this._baseUrl = baseUrl;
        this._creativeIndex = -1;
        this._debug = Debug.getInstance();
        this._eventBus = EventBus.getInstance();
        this._onCreativeEndListener = this._onCreativeEnd.bind(this);
    }

    reset() {
        if (!this._creativePlayer) {
            return;
        }

        this._creativePlayer.delete();
    }

    start(){

        this._debug.info("(CreativesPlayer) PlayAd id = " + this._ad.id);

        // Notify an ad is starting to play
        this._eventBus.dispatchEvent({
            type: 'creativesStart',
            data: {}
        });

        // Send Impressions tracking
        this._sendImpressions(this._ad.inLine.impressions);

        // Play first Creative
        this._playCreative(0);
    }

    play() {
        this._resumeCreative();
    }

    pause() {
        this._debug.info("(CreativesPlayer) pauseCreative ");
        if (!this._creativePlayer) {
            return;
        }
        this._creativePlayer.pause();
    }

    stop() {
        if (!this._creativePlayer) {
            return;
        }
        
        this._stopCreative();
    }

    skip() {
        if (!this._creativePlayer) {
            return;
        }

        this._skipCreative();
    }
}

export default CreativesPlayer;
