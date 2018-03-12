/* global it, describe, beforeEach, afterEach */
const { expect } = require('chai');
const sinon = require('sinon');
const Px = require('./../lib/Px');
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
      const px = Px.create();
      expect(px).to.be.an.instanceof(Px);
    });

    it('static debug', () => {
      Px.setDebug(true);
      expect(Px.getDebug()).to.eq(true);
    });
    it('debug', () => {
      const clone = Px.create().setDebug(true);
      expect(clone.debug).to.eq(true);
    });
  });

  describe('Operative Function', () => {
    it('static chain', () => {
      const clone = Px.chain(true);
      expect(clone.sequencesDescription.length).to.equal(1);
      expect(clone.sequencesDescription[0]).to.have.property('type', 'chain');
    });

    it('static chainConcat', () => {
      const clone = Px.chainConcat(true);
      expect(clone.sequencesDescription.length).to.equal(1);
      expect(clone.sequencesDescription[0]).to.have.property('type', 'chainConcat');
    });

    it('static chainIf', () => {
      const clone = Px.chainIf(true);
      expect(clone.sequencesDescription.length).to.equal(1);
      expect(clone.sequencesDescription[0]).to.have.property('type', 'chainIf');
    });

    it('static wait', () => {
      const clone = Px.wait(100);
      expect(clone.sequencesDescription.length).to.equal(1);
      expect(clone.sequencesDescription[0]).to.have.property('type', 'wait');
    });
  });

  describe('Work with Pipes', () => {
    it('static branch', () => {
      const clone = Px.branch(true);
      expect(clone.sequencesDescription.length).to.equal(1);
      expect(clone.sequencesDescription[0]).to.have.property('type', 'branch');
    });

    it('static concat', () => {
      const clone = Px.concat(true);
      expect(clone.sequencesDescription.length).to.equal(1);
      expect(clone.sequencesDescription[0]).to.have.property('type', 'concat');
    });

    it('static concatIf', () => {
      const clone = Px.concatIf(true);
      expect(clone.sequencesDescription.length).to.equal(1);
      expect(clone.sequencesDescription[0]).to.have.property('type', 'concatIf');
    });

    it('static replaceIf', () => {
      const clone = Px.replaceIf(true);
      expect(clone.sequencesDescription.length).to.equal(1);
      expect(clone.sequencesDescription[0]).to.have.property('type', 'replaceIf');
    });
  });

  describe('catch Errors', () => {
    it('catch function', () => {
      const clone = Px.create().catch(() => { });
      expect(clone.catchPipe).to.be.an.instanceof(Px);
    });

    it('catch pipe', () => {
      const px = Px.create();
      const clone = Px.create().catch(px);
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
      const px = Px.create().of('test');
      expect(px.input).to.equal('test');
    });
    it('iter Array', () => {
      Px.create().iter([1, 2, 3, 4]);
      expect(requests).to.eq(4);
    });
    it('iter Object', () => {
      Px.create().iter({ aa: 1, bb: 2 });
      expect(requests).to.eq(2);
    });

    it('iter generator', () => {
      function* test() {
        yield 1;
        yield 2;
        yield 3;
      }
      Px.create().iter(test);
      expect(requests).to.eq(3);
    });
    it('From promise', async () => {
      const pro = Promise.resolve('test');
      Px.create().fromPromise(pro);
      await (pro);
      expect(requests).to.eq(1);
    });
    it('From promise fail', async () => {
      const pro = Promise.reject(new Error('test'));
      Px.create().fromPromise(pro);
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
      Px.create().fromObserver(observer);
      expect(requests).to.eq(1);
    });
    it('bind', () => {
      const bind = Px.create().bindCallback();
      bind('test');
      expect(requests).to.eq(1);
    });
    it('bind node', () => {
      const bind = Px.create().bindNodeCallback();
      bind(null, 'test');
      expect(requests).to.eq(1);
    });
    it('bind node fail', () => {
      const bind = Px.create().bindNodeCallback();
      bind('err');
      expect(requestsFail).to.eq(1);
    });
    /*
    it('From Dom event', () => {
     const event = {
       addEventListener: (type, func) => {
         func();
       },
     };
     global.document.getElementById = () => event;

     Px.create().fromDomEvent('#test', 'click');
     expect(requests).to.eq(1);
   }); */
  });
  describe('Others', () => {
    it('subscribe', () => {
      const pipe = Px.create().subscribe(() => { });
      expect(pipe.observers).to.have.lengthOf(1);
    });
    it('subscribe Object', () => {
      const pipe = Px.create().subscribe({ complete: () => { } });
      expect(pipe.observers).to.have.lengthOf(1);
    });
  });
});
