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
        if (!xmldom.getElement(xmlDom, "MAST") && !xmldom.getElement(xmlDom, "VMAP")) {
            this._debug.error('Unknown ad format');
            return false;
        }

        if (xmldom.getElement(xmlDom, "MAST") &&
                (!this._parser || this._parser.format !== "mast")) {
            this._parser = null;
            this._parser = new MastParser();
        } else if(xmldom.getElement(xmlDom, "VMAP") &&
                (!this._parser || this._parser.format !== "vmap")) {
            this._parser = null;
            this._parser = new VmapParser();
        }

        return this._parser.parse(xmlDom);
    }
}

export default Parser;