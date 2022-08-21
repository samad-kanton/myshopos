import { thousandsSeperator } from "../assets/js/utils";

class ItemModel {
    // constructor(item) {
    //     this.item = item;
    // }
    // totalQty(params) {        
    //     return thousandsSeperator(_.sumBy(params.item, entry => _.toNumber(_.join(_.split(entry, ','), ''))));
    // }
    xcp(params) {
        let { qty, cp, ppq } = params.item, xcp;
        if(!_.isUndefined(ppq)){
            xcp = _.size(JSON.parse(ppq)) > 0 ? (cp / _.maxBy(JSON.parse(ppq), entry => _.toNumber(entry.qty)).qty) * qty : cp;
        }
        return thousandsSeperator(_.toNumber(xcp));
    }
    wp(params) {
        let { ppq } = params.item, wp;
        if(!_.isUndefined(ppq)){
            wp = _.size(JSON.parse(ppq)) > 0 ? _.maxBy(JSON.parse(ppq), entry => _.toNumber(entry.qty)).rate : 'n/a';
        }
        return thousandsSeperator(_.toNumber(wp));
    }
    xwp(params) {
        let { qty, ppq } = params.item, xwp;
        if(!_.isUndefined(ppq)){
            xwp = _.size(JSON.parse(ppq)) > 0 ? (_.maxBy(JSON.parse(ppq), entry => _.toNumber(entry.qty)).rate / _.maxBy(JSON.parse(ppq), entry => _.toNumber(entry.qty)).qty) * qty : 'n/a';
        }
        return thousandsSeperator(_.toNumber(xwp));
    }
    mwp(params) {
        let { qty, ppq } = params.item, xwp;
        if(!_.isUndefined(ppq)){
            xwp = _.size(JSON.parse(ppq)) > 0 ? (_.maxBy(JSON.parse(ppq), entry => _.toNumber(entry.qty)).rate / _.maxBy(JSON.parse(ppq), entry => _.toNumber(entry.qty)).qty) * qty : 'n/a';
        }
        return thousandsSeperator(_.toNumber(xwp) - this.xcp(params));
    }

    rp(params) {
        let { ppq } = params.item, rp;
        if(!_.isUndefined(ppq)){
            rp = _.size(JSON.parse(ppq)) > 0 ? _.minBy(JSON.parse(ppq), entry => _.toNumber(entry.qty)).rate : 'n/a';
        }
        return thousandsSeperator(_.toNumber(rp));
    }
    xrp(params) {
        let { qty, ppq } = params.item, xrp;
        if(!_.isUndefined(ppq)){
            xrp = _.size(JSON.parse(ppq)) > 0 ? (_.minBy(JSON.parse(ppq), entry => _.toNumber(entry.qty)).rate * qty) : 'n/a';
        }
        return thousandsSeperator(_.toNumber(xrp));
    }
    mrp(params) {
        let { ppq } = params.item, mrp;
        if(!_.isUndefined(ppq)){
            mrp = _.size(JSON.parse(ppq)) > 0 ? (this.xrp(params) - this.xcp(params)) : 'n/a';
        }
        return thousandsSeperator(_.toNumber(mrp));
    }
}

export default ItemModel;