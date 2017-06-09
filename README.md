# CSAdsPlugin

CSAdsPlugin is a plugin for CSWebPlayer that handles ad-insertion when playing streams with CSWebPlayer.
CSAdsPlugin supports MAST and VMAP file format for describing the list of ad-insertion triggers.
VAST 2.0 & 3.0 formats are supported for ads playing description (Linear and Non-Linear ads).

The CSAdsPlugin plugin takes charge of:
* MAST, VMAP and VAST files downloading
* detecting ad-insertion triggers
* pausing and then resuming the MediaPlayer video when playing a Linear ad
* opening and playing ad media files, by the help of &lt;video&gt; and &lt;img&gt; HTML components, created by the plugin and appended in the "Ad DOM container" provided to the plugin
* sizing and positioning the "Ad DOM container"

The application that uses CSWebPlayer in conjunction with CSAdsPlugin has to take charge of:
* opening the web page when a click on the playing ad has been detected by the plugin
* pausing/resuming the plugin (for example when application visibility changes)

## Build / Run

``` bash
# npm run build
```

The resulting built file csadsplugin.js has to be included along with cswebplayer.min.js.

## Getting Started

First of all, you must create the "Ad DOM container", this is the &lt;div id="adsplayer-container" &gt; here after.
The "Ad DOM container" must be embedded in an upper level container, the "Media DOM container", which one must have a non-static position CSS property.
This way, CSAdsPlugin is able to position the "Ad DOM container" relatively to the "Media DOM container".
The "Media DOM container" must also embed the &lt;video&gt; HTML element, the one provided to the MediaPlayer init function.

The CSAdsPlugin acts on the CSS properties 'bottom', 'left', 'height' and width of the "Ad DOM container" to size and position the ad.
It also set the display CSS property of the "Ad DOM container" to hide and show the ad.
Consequently, width and height CSS properties of the parent div (the "Media DOM container") must be set.

``` html
    <div id="media-container" style="width:854px; height:480px; position:relative">
        <video id="videoplayer-container" style="display:block; width:auto; height:100%;"></video>
        <div id="adsplayer-container" style="display:none"> </div>
    </div>
```

When creating the CSWebPlayer's MediaPlayer instance, create an CSAdsPlugin instance and add it to the MediaPlayer.
The "Ad DOM container" has to be provided in the constructor.

``` js
var mediaPlayer = new MediaPlayer();
MediaPlayer.init(document.querySelector("#videoplayer-container"));
var adsPlayer = new adsplayer.AdsPlayer(document.getElementById('adsplayer-container'));
mediaPlayer.addPlugin(adsPlayer);
```

When opening a stream with the MediaPlayer, the URL for MAST/VMAP file has to be provided in the 'adsUrl' stream parameter.

``` js
var stream = {
    url: "http://playready.directtaps.net/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/Manifest",
    adsUrl: "<ad-url>"
};
mediaPlayer.load(stream);
```

In order to interact with CSAdsPlugin, the application can register to some events raised by the AdsPlayer:

``` js
adsPlayer.addEventListener("start", function (e) {
    // Ad(s) playback is starting
});
adsPlayer.addEventListener("end", function (e) {
    // Ad(s) playback has ended
});
adsPlayer.addEventListener("addElement", function (e) {
    // a DOM element for playing an ad has been created and will be appended in the "Ad DOM container".
    The element can be either a video or an image element.
});
adsPlayer.addEventListener("removeElement", function (e) {
    // the DOM element for playing an ad is being removed from the ads player container and deleted
});
adsPlayer.addEventListener("play", function (e) {
    // An ad's media playback is starting => update play/pause button
});
adsPlayer.addEventListener("pause", function (e) {
    // An ad's media playback is paused => update play/pause button
});
adsPlayer.addEventListener("click", function (e) {
    // A click has beed detected on the media component
    // e.data.uri contains the URI of the webpage to open
});
```

CSAdsPlugin propose some more specific API methods in order to interact with the ad(s) playing:

``` js
adsPlayer.pause(); // Pause the playback of the current ad media
adsPlayer.play();  // Play/resume the playback of the current ad media
```

## License

All code in this repository is covered by the [BSD-3 license](http://opensource.org/licenses/BSD-3-Clause).
See LICENSE file for copyright details.


## Documentation

This API documentation describing CSAdsPlugin public methods and events can be generated using following gulp command:

``` bash
# npm run doc
```
