/**
 * Created by vobox on 9/28/16.
 */

"use strict";

class WebPlayer {

    constructor(adsPlugin) {

        //MediaPlayer is NOT an ES6 class, then can't use extends MediaPlayer
        this.mediaPlayer = new MediaPlayer();

        this.mediaPlayer.init(document.getElementById('videoplayer-container'));
        
        this.mediaPlayer.setDebug(false);
        
        this.mediaPlayer.setInitialQualityFor('video', 0);
        this.mediaPlayer.setInitialQualityFor('audio', 0);

        // Load plugins
        if (adsPlugin) {
            this.mediaPlayer.addPlugin(adsPlugin);
        }

        // TODO: get the browser language
        this.mediaPlayer.setDefaultAudioLang('fra');
        this.mediaPlayer.setDefaultSubtitleLang('fre');
        this.mediaPlayer.enableSubtitles(false);
        document.getElementById('cswebplayer_version').textContent+="  "+this.mediaPlayer.getVersion()+" (based on dash.js "+
            this.mediaPlayer.getVersionDashJS()+")";
    }

    /**
     * Start to play a stream. Optionaly, an ad may be provided
     * @method play
     * @access public
     * @memberof WebPlayer#
     * @param {Stream} stream - the stream to play
     * @param {Ad} ad - the ad to play
     * @param {} onPlayCallback - the callback to call when the stream is loaded
     *
     */
    play(stream,ad,onPlayCallback) {
        var protData = new Array();
        for (var i = 0; i < stream.getNumberOfLicensers(); i++){
            protData[stream.getLicenserDrmType(i)] = new Array();
            protData[stream.getLicenserDrmType(i)].laURL = stream.getLicenserUrl(i);
        }

        var stream = {
            url : stream.getUrl(),
            protData : protData,
            adsUrl : ad.getUrl()
        };

        this.mediaPlayer.load(stream);
        this.mediaPlayer.addEventListener("loadeddata", onPlayCallback);
    }

    /**
     * Selects the audio track to be playbacked.
     * @method selectAudio
     * @access public
     * @memberof WebPlayer#
     * @param {Track} lang - the language of audio track to select
     *
     */
    selectAudio(lang){
        var audios = this.getAudios();
        for (var i = 0; i < audios.length; i++) {
            if (audios[i].lang == lang) {
                this.mediaPlayer.setAudioTrack(audios[i]);
            }
        }
    }

    /**
     * Returns the list of available audio tracks.
     * @method getAudios
     * @access public
     * @memberof WebPlayer#
     * @return {Array<Track>} the available audio tracks.
     */
    getAudios(){
        return this.mediaPlayer.getAudioTracks();
    }
    
    /**
     * Returns the current audio track.
     * @method getAudio
     * @access public
     * @memberof WebPlayer#
     * @return {Array<Track>} the current audio track.
     */
    getAudio(){
        if  (this.mediaPlayer.getSelectedAudioTrack())
            return this.mediaPlayer.getSelectedAudioTrack();
        else
            return {id : 'none', lang : 'none'};
    }
    
    /**
     * Selects the subtitle track to be playbacked.
     * @method selectSubtitle
     * @access public
     * @memberof WebPlayer#
     * @param {Track} lang - the language of subtitle track to select
     *
     */
    selectSubtitle(lang){
    	if (lang === 'none'){
    		this.mediaPlayer.enableSubtitles(false);
            this.mediaPlayer.enableSubtitleExternDisplay(false);
    	}
    	else {
            let subtitles = this.getSubtitles();
	        for (let i = 0; i < subtitles.length; i++) {
	            if (subtitles[i].lang == lang) {
                    // Enable subtitle
	                this.mediaPlayer.enableSubtitles(true);
                    
                    // Select subtitle track
                    this.mediaPlayer.setSubtitleTrack(subtitles[i]);
                    break;
	            }
	        }
    	}
    }

    /**
     * Returns the list of available subtitle tracks.
     * @method getSubtitles
     * @access public
     * @memberof WebPlayer#
     * @return {Array<Track>} the available subtitle tracks.
     */
    getSubtitles(){
    	var noSub = {id : 'none', lang : 'none'};
    	var tracks = this.mediaPlayer.getSubtitleTracks();
        tracks.splice(0,0,noSub); // Add a no subtitle track at index 0
        return tracks;
    }
    
    /**
     * Returns the current subtitle track.
     * @method getSubtitle
     * @access public
     * @memberof WebPlayer#
     * @return {Array<Track>} the current subtitle track.
     */
    getSubtitle(){
        if  (this.mediaPlayer.getSelectedSubtitleTrack())
            return this.mediaPlayer.getSelectedSubtitleTrack();
        else
            return {id : 'none', lang : 'none'};
    }
    
    /**
     * Returns the list of available video bitrates.
     * @method getVideoBitrates
     * @access public
     * @memberof WebPlayer#
     * @return {Array<Number>} the available video bitrates. The first bitrate is automatic.
     */
    getVideoBitrates(){
        var vbrList = this.mediaPlayer.getVideoBitrates();
        vbrList.splice(0,0,'automatic'); // Add 'automatic' vbr at index 0
        return vbrList;
    }
    
    /**
     * Returns the current video bitrate.
     * @method getVideoBitrate
     * @access public
     * @memberof WebPlayer#
     * @return {Array<Number>} the current video bitrate as an index of the list provided by {@link WebPlayer#getVideoBitrates}.
     */
    getVideoBitrate(){
        if (this.mediaPlayer.getAutoSwitchQuality())
            return 0;
        else return (this.mediaPlayer.getQualityFor('video') + 1);
    } 
    
    /**
     * Set the current video bitrate.
     * @method getVideoBitrate
     * @access public
     * @memberof WebPlayer#
     * @param {number} value - the video bitrate to set as an index of the list provided by {@link WebPlayer#getVideoBitrates}.
     */    
    setVideoBitrate(value){
        if (value === 0){
            this.mediaPlayer.setAutoSwitchQuality(true);
        } else {
            this.mediaPlayer.setAutoSwitchQuality(false);
            this.mediaPlayer.setQualityFor('video',value - 1);
        }
    } 

}
