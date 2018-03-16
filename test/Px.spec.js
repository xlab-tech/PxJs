/* global it, describe, beforeEach, afterEach */
const { expect } = require('chai');
const sinon = require('sinon');
const Px = require('./../lib/Px');
const PxFactory = require('./../lib/PxFactory');
const SequenceExecutor = require('./../lib/SequenceExecutor');

describe('Px', () => {

  describe('base function', () => {
    it('_clone', () => {
      const px = new Px();
      const clone = px._clone(px);
      expect(clone).to.not.equal(px);
      expect(clone.sequencesDescription).to.not.equal(px.sequencesDescription);
    });
    it('_createSequenceDescription', () => {
      const px = new Px();
      const clone = px._createSequenceDescription('type', 'params');
      expect(px.sequencesDescription.length).to.equal(0);
      expect(clone.sequencesDescription.length).to.equal(1);
      expect(clone.sequencesDescription[0]).to.have.property('type', 'type');
      expect(clone.sequencesDescription[0]).to.have.property('params', 'params');
    });
    it('create', () => {
      const px = PxFactory.create();
      expect(px).to.be.an.instanceof(Px);
    });
  });

  describe('Operative Function', () => {
    it('static chain', () => {
      const clone = PxFactory.chain(true);
      expect(clone.sequencesDescription.length).to.equal(1);
      expect(clone.sequencesDescription[0]).to.have.property('type', 'chain');
    });

    it('static chainConcat', () => {
      const clone = PxFactory.chainConcat(true);
      expect(clone.sequencesDescription.length).to.equal(1);
      expect(clone.sequencesDescription[0]).to.have.property('type', 'chainConcat');
    });

    it('static chainIf', () => {
      const clone = PxFactory.chainIf(true);
      expect(clone.sequencesDescription.length).to.equal(1);
      expect(clone.sequencesDescription[0]).to.have.property('type', 'chainIf');
    });

    it('static wait', () => {
      const clone = PxFactory.wait(100);
      expect(clone.sequencesDescription.length).to.equal(1);
      expect(clone.sequencesDescription[0]).to.have.property('type', 'wait');
    });
  });

  describe('Work with Pipes', () => {
    it('static branch', () => {
      const clone = PxFactory.branch(true);
      expect(clone.sequencesDescription.length).to.equal(1);
      expect(clone.sequencesDescription[0]).to.have.property('type', 'branch');
    });

    it('static concat', () => {
      const clone = PxFactory.concat(true);
      expect(clone.sequencesDescription.length).to.equal(1);
      expect(clone.sequencesDescription[0]).to.have.property('type', 'concat');
    });

    it('static replaceIf', () => {
      const clone = PxFactory.replaceIf(true);
      expect(clone.sequencesDescription.length).to.equal(1);
      expect(clone.sequencesDescription[0]).to.have.property('type', 'replaceIf');
    });
  });

  describe('catch Errors', () => {
    it('catch function', () => {
      const clone = PxFactory.create().catch(() => { });
      expect(clone.catchPipe).to.be.an.instanceof(Px);
    });

    it('catch pipe', () => {
      const px = PxFactory.create();
      const clone = PxFactory.create().catch(px);
      expect(clone.catchPipe).to.be.an.instanceof(Px);
    });
  });
  describe('Invokers', () => {
    let executeSinon;
    let failSinon;
    let requests;
    let requestsFail;
    beforeEach(() => {
      requests = 0;
      requestsFail = 0;
      executeSinon = sinon.stub(SequenceExecutor.prototype, 'execute');
      failSinon = sinon.stub(SequenceExecutor.prototype, 'fail');
      executeSinon.callsFake(() => {
        requests += 1;
        return true;
      });
      failSinon.callsFake(() => {
        requestsFail += 1;
        return true;
      });
    });
    afterEach(() => {
      executeSinon.restore();
      failSinon.restore();
    });
    it('of', () => {
      const px = PxFactory.create().of('test');
      expect(px.input).to.equal('test');
    });
    it('iter Array', () => {
      PxFactory.create().iter([1, 2, 3, 4]);
      expect(requests).to.eq(4);
    });
    it('iter Object', () => {
      PxFactory.create().iter({ aa: 1, bb: 2 });
      expect(requests).to.eq(2);
    });

    it('iter generator', () => {
      function* test() {
        yield 1;
        yield 2;
        yield 3;
      }
      PxFactory.create().iter(test);
      expect(requests).to.eq(3);
    });
    it('From promise', async () => {
      const pro = Promise.resolve('test');
      PxFactory.create().fromPromise(pro);
      await (pro);
      expect(requests).to.eq(1);
    });
    it('From promise fail', async () => {
      const pro = Promise.reject(new Error('test'));
      PxFactory.create().fromPromise(pro);
      try {
        await (pro);
      } catch (err) {
        expect(requestsFail).to.equal(1);
      }
    });
    it('From observer', () => {
      const observer = {
        subscribe: func => func(),
      };
      PxFactory.create().fromObserver(observer);
      expect(requests).to.eq(1);
    });
    it('From Dom event', () => {
      const event = {
        addEventListener: (type, func) => {
          func();
        },
      };
      global.document.getElementById = () => event;

      PxFactory.create().fromDomEvent('#test', 'click');
      expect(requests).to.eq(1);
    });
  });
});
