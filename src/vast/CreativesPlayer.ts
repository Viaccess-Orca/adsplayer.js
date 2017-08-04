/**
 * The AdPlayer manages the sequencing of playing creatives of a single Ad.
 * It takes as input the Ad object as returned by the VAST parser.
 * The AdPlayer plays sequentially all contained Creatives,
 * with the help of a LinearCreativePlayer and NonLinearCreativePlayer.
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
import ICreativePlayer from "./ICreativePlayer";
import SkipEvent from "../events/SkipEvent";
import CreativesStartEvent from "../events/CreativesStartEvent";
import CreativesEndEvent from "../events/CreativesEndEvent";

class CreativesPlayer {

    private debug: Debug = null;
    private eventBus: EventBus = null;
    private creativePlayer: ICreativePlayer = null;
    private creativeIndex: number = -1;
    private onCreativeEndListener: () => void;

    ///////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////// PUBLIC /////////////////////////////////////////////

    constructor(private ad: any, private adPlayerContainer: any,
                private mainVideo: HTMLVideoElement, private baseUrl: string) {

        this.debug = Debug.getInstance();
        this.eventBus = EventBus.getInstance();
        this.onCreativeEndListener = this._onCreativeEnd.bind(this);
    }

    reset() {
        if (!this.creativePlayer) {
            return;
        }

        this.creativePlayer.delete();
    }

    start(){

        this.debug.info("(CreativesPlayer) PlayAd id = " + this.ad.id);

        // Notify an ad is starting to play
        let creativesStartEvent:any = new CreativesStartEvent();
        this.eventBus.dispatchEvent(creativesStartEvent);

        // Send Impressions tracking
        this._sendImpressions(this.ad.inLine.impressions);

        // Play first Creative
        this._playCreative(0);
    }

    play() {
        this._resumeCreative();
    }

    pause() {
        this.debug.info("(CreativesPlayer) pauseCreative ");
        if (!this.creativePlayer) {
            return;
        }
        this.creativePlayer.pause();
    }

    stop() {
        if (!this.creativePlayer) {
            return;
        }

        this._stopCreative();
    }

    skip() {
        if (!this.creativePlayer) {
            return;
        }

        this._skipCreative();
    }

    _sendImpressions (impressions: any): void {
        let impression;

        if (impressions.length === 0) {
            return;
        }

        for (let i = 0; i < impressions.length; i++) {
            impression = impressions[i];
            if (impression.uri && impression.uri.length > 0) {
                this.debug.info("Send Impression, uri = " + impression.uri);
                var http = new XMLHttpRequest();
                http.open("GET", impression.uri, true);
                http.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
                http.send();
            }
        }
    }

    _onCreativeEnd (): void {

        this.debug.info("(CreativesPlayer) onCreativeEnd");

        // Stop the current creative media
        this._stopCreative();

        this._resetCreative();

        // Play next creative
        this._playNextCreative();
    }

    _resumeCreative (): void {
        this.debug.info("(CreativesPlayer) resumeCreative ");
        if (!this.creativePlayer) {
            return;
        }
        this.creativePlayer.play();
    }

    _resetCreative(): void{
        this.debug.info("(CreativesPlayer) resetCreative ");
        if (!this.creativePlayer) {
            return;
        }
        this.creativePlayer.delete();
    }

    _stopCreative(): void {
        this.debug.info("(CreativesPlayer) stopCreative ");
        this.eventBus.removeEventListener("creativeEnd", this.onCreativeEndListener, false);

        if (!this.creativePlayer) {
            return;
        }
        this.creativePlayer.stop();
    }

    _playNextCreative(): void{

        this.creativeIndex++;

        if (this.creativeIndex < this.ad.inLine.creatives.length) {
            this._playCreative(this.creativeIndex);
        } else {
            // Notify end of trigger
            let creativesEndEvent: any = new CreativesEndEvent();
            this.eventBus.dispatchEvent(creativesEndEvent);
        }
    }

    _playCreative(index: number): void {
        let creative = this.ad.inLine.creatives[index];

        this.creativeIndex = index;
        this.debug.info("(CreativesPlayer) playCreative(" + this.creativeIndex + ")");

        // First, play Linear element if it exists
        if (creative.linear) {
            this.debug.info("(CreativesPlayer) Play Linear Ad, duration = " + creative.linear.duration);
            this.eventBus.addEventListener("creativeEnd", this.onCreativeEndListener, false);
            this.creativePlayer = new LinearCreativePlayer(this.adPlayerContainer, this.mainVideo);
            if (!this.creativePlayer.load(creative.linear, this.baseUrl)) {
                this._playNextCreative();
            }
        } else {
            // then non-linear if it exists
            if (creative.nonLinearAds) {
                this.debug.info("(CreativesPlayer) Play Non-Linear Ad");
                this.eventBus.addEventListener("creativeEnd", this.onCreativeEndListener, false);
                this.creativePlayer = new NonLinearCreativePlayer(this.adPlayerContainer, this.mainVideo);
                if (!this.creativePlayer.load(creative.nonLinearAds, this.baseUrl)) {
                    this._playNextCreative();
                }
            } else {
                this._playNextCreative();
            }
        }
    }

    _skipCreative(): void {
        this.debug.info("(CreativesPlayer) skipCreative ");

        // Notify the creative was skipped
        let skipEvent:any = new SkipEvent();
        this.eventBus.dispatchEvent(skipEvent);

        // Stop the current creative media
        this._stopCreative();

        this._resetCreative();

        // Play next creative
        this._playNextCreative();
    }
}

export default CreativesPlayer;
