import TriggerManager from "./mast/TriggerManager";
import AdBreakManager from "./vmap/AdBreakManager";

class AdsManager {
    constructor(format) {
        this._manager = null;

        switch (format) {
            case "mast":
                this._manager = new TriggerManager();
                break;

            case "vmap":
                this._manager = new AdBreakManager();
                break;

            default:
                break;
        }
    }

    init(trigger) {
        if ((this._manager !== null) && (this._manager.init !== undefined)) {
            this._manager.init(trigger);
        }
    }

    getTrigger() {
        if ((this._manager !== null) && (this._manager.getTrigger !== undefined)) {
            return this._manager.getTrigger();
        }
    }

    checkStartConditions(video) {
        if ((this._manager !== null) && (this._manager.checkStartConditions !== undefined)) {
            return this._manager.checkStartConditions(video);
        }
    }

    checkEndConditions(video) {
        if ((this._manager !== null) && (this._manager.checkEndConditions !== undefined)) {
            return this._manager.checkEndConditions(video);
        }
    }
}

export default AdsManager;