/**
 * Generic parser. This class checks the ad file type and
 * initialize the corresponding specific parser
 */

import xmldom from './utils/xmldom';
import MastParser from './mast/MastParser';
import VmapParser from './vmap/VmapParser';

class Parser {
    constructor () {
        this._parser = null;
    }

    parse (xmlDom) {
        if (!this._parser) {
            if (xmldom.getElement(xmlDom, "MAST")) {
                this._parser = new MastParser();
            } else if(xmldom.getElement(xmlDom, "VMAP")) {
                this._parser = new VmapParser();
            } else {
                this._debug.error('Unknown ad format');
                return false;
            }
        }

        return this._parser.parse(xmlDom);
    }
}

export default Parser;