import MastParser from './mast/MastParser';

class Parser {
    constructor () {
        this._parser = null;
    }

    parse (xmlDom) {
        if (!this._parser) {
            if (xmldom.getElement(xmlDom, "MAST")) {
                this._parser = new MastParser();
            } else if(xmldom.getElement(xmlDom, "vmap:VMAP")) {
                // VMAP
            } else {
                this._debug.error('Unknown ad format');
                return false;
            }
        }

        return this._parser.parse(xmldom);
    }
}

export default Parser;