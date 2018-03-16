/* eslint no-restricted-syntax: 0 */
// PipeX
const Px = require('./Px');

module.exports = class PxFactory {
  
  static create() {
    return new Px();
  }

  static chain(...functions) {
    const obj = this.create();
    console.log(obj.__proto__.chain)
    return obj.chain(...functions);
  }

  static chainIf(filter, ...functions) {
    return this.create().chainIf(filter, ...functions);
  }

  static chainConcat(...functions) {
    return this.create().chainConcat(...functions);
  }

  static wait(time) {
    return this.create().wait(time);
  }

  static branch(...pipes) {
    return this.create().branch(...pipes);
  }

  static concat(...pipes) {
    return this.create().concat(...pipes);
  }

  static replaceIf(filter, pipe) {
    return this.create().replaceIf(filter, pipe);
  }


}