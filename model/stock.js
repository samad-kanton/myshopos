import { thousandsSeperator } from "../assets/js/utils.js";

class ItemModel {
    static qty;
    constructor(qty){

    }

    // static cp(params) {
    //     let { qty, cp, ppq } = params.item;
    //     if(!_.isUndefined(ppq)){
    //         cp = _.size(JSON.parse(ppq)) > 1 ? cp / _.maxBy(JSON.parse(ppq), entry => _.toNumber(entry.qty)).qty : cp; 
    //     }
    //     console.log("CP1: ", cp)
    // }

    static xcp(params) {
        let { qty, cp, ppq } = params.item, xcp;
        if(!_.isUndefined(ppq)){
            xcp = _.size(JSON.parse(ppq)) > 1 ? (cp / _.maxBy(JSON.parse(ppq), entry => _.toNumber(entry.qty)).qty * qty) : (cp * qty); 
        }
        return _.toNumber(xcp);
    }

    static wp_qty(params) {
        let { ppq } = params.item, wp_qty;
        if(!_.isUndefined(ppq)){
            wp_qty = _.size(JSON.parse(ppq)) > 1 ? _.maxBy(JSON.parse(ppq), entry => _.toNumber(entry.qty)).qty : 0;
        }        
        return _.toNumber(wp_qty);
    }
    static wp(params) {
        let { ppq } = params.item, wp;
        if(!_.isUndefined(ppq)){
            wp = _.size(JSON.parse(ppq)) > 1 ? _.maxBy(JSON.parse(ppq), entry => _.toNumber(entry.qty)).rate : 0;
        }
        return _.toNumber(wp);
    }
    static xwp(params) {
        let { qty, ppq } = params.item, xwp;
        if(!_.isUndefined(ppq)){
            xwp = _.size(JSON.parse(ppq)) > 1 ? (_.maxBy(JSON.parse(ppq), entry => _.toNumber(entry.qty)).rate / _.maxBy(JSON.parse(ppq), entry => _.toNumber(entry.qty)).qty) * qty : 0;
        }
        return _.toNumber(xwp);
    }
    static mwp(params) {
        let { qty, ppq } = params.item, mwp;
        if(!_.isUndefined(ppq)){
            mwp = _.size(JSON.parse(ppq)) > 1 ? (this.xwp(params) - this.xcp(params)) : 0;
        }
        return _.toNumber(mwp) || 0;
    }

    static rp(params) {
        let { ppq } = params.item, rp;
        if(!_.isUndefined(ppq)){
            rp = _.size(JSON.parse(ppq)) > 0 ? _.minBy(JSON.parse(ppq), entry => _.toNumber(entry.qty)).rate : 0;
        }
        return _.toNumber(rp);
    }
    static xrp(params) {
        let { qty, ppq } = params.item, xrp;
        if(!_.isUndefined(ppq)){
            xrp = _.size(JSON.parse(ppq)) > 0 ? (_.minBy(JSON.parse(ppq), entry => _.toNumber(entry.qty)).rate * qty) : 0;
        }
        return _.toNumber(xrp);
    }
    static mrp(params) {
        let { ppq } = params.item, mrp;
        if(!_.isUndefined(ppq)){
            mrp = _.size(JSON.parse(ppq)) > 0 ? (this.xrp(params) - this.xcp(params)) : 0;
        }
        return _.toNumber(mrp);
    }
}

export default ItemModel;