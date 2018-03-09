/* global it, describe */
const { expect } = require('chai');
const utils = require('./../lib/utils');

describe('Utils', () => {
  it('makeId', () => {
    const id = utils.makeId();
    expect(id).to.be.a('string');
    expect(id.length).to.be.eq(5);
  });

  it('getParamNames params', () => {
    const func = (a, b) => a + b;
    const params = utils.getParamNames(func);

    expect(params).to.be.a('array');
    expect(params[0]).to.be.eq('a');
    expect(params.length).to.be.eq(2);
  });

  it('getParamNames no params', () => {
    const func = () => { };
    const params = utils.getParamNames(func);

    expect(params).to.be.a('array');
    expect(params.length).to.be.eq(0);
  });
});
