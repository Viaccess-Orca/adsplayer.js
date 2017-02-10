
/**
 * @class Vmap
 * @ignore
 */
class Vmap {
    constructor () {
        this.format = "vmap";
        this.baseUrl = '';
        this.triggers = [];     // pointer to any number of Ad objects
    }
}

/**
 * @class AdBreak
 * @ignore
 */
class AdBreak {
    constructor () {
        this.breakId = '';
        this.breakType = '';
        this.timeOffset = '';
        this.sources = [];
        this.alreadyProcessed = false;
        this.vasts = [];
        this.activated = false;
    }
}

/**
 * @class Source
 * @ignore
 */
class AdSource {
    constructor () {
        this.id = "";
        this.allowMultipleAds = true;
        this.followRedirects = true;
        this.templateType = "";
        this.uri = "";
        this.VASTAdData = "";
        this.CustomAdData = "";
    }
}

var vmap = {};

vmap.Vmap = Vmap;
vmap.AdBreak = AdBreak;
vmap.AdSource = AdSource;

export default vmap;
export { Vmap, AdBreak, AdSource };