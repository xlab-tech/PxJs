/* global it, describe */
const { expect } = require('chai');
const Executions = require('./../lib/Executions');

describe('Executions', () => {
  it('set', () => {
    const executions = new Executions();
    executions.set('test');
    expect(executions.list).to.be.a('array');
    expect(executions.list.length).to.be.eq(1);
    expect(executions.list[0]).to.be.eq('test');
  });
  it('update', () => {
    const executions = new Executions();
    executions.set({ test: 'test' });
    executions.update({ update: 'test' });
    expect(executions.list).to.be.a('array');
    expect(executions.list.length).to.be.eq(1);
    expect(executions.list[0]).to.have.property('update', 'test');
  });
  it('inspect', () => {
    const executions = new Executions();
    executions.set({
      input: 'tt',
      result: 'pp',
      start: 2,
      end: 3,
    });
    const text = executions.inspect(1);
    expect(text).to.be.a('string');
    expect(text).to.include('tt');
    expect(text).to.include('pp');
  });

  it('inspect Error', () => {
    const executions = new Executions();
    executions.set({
      input: 'tt',
      error: 'err',
      start: 2,
      end: 3,
    });
    const text = executions.inspect(1);
    expect(text).to.be.a('string');
    expect(text).to.include('tt');
    expect(text).to.include('err');
  });

  it('inspect branches', () => {
    const branch0Executions = new Executions();
    branch0Executions.set({
      input: 'b1',
      result: 'r1',
      start: 2,
      end: 3,
    });

    const executions = new Executions();
    executions.set({
      input: 'tt',
      result: 'pp',
      start: 2,
      end: 3,
      branchExecutions: {
        branch0: branch0Executions,
      },
    });
    const text = executions.inspect(1);
    expect(text).to.be.a('string');
    expect(text).to.include('b1');
    expect(text).to.include('r1');
  });
  it('inspect replaces', () => {
    const replaceExecutions = new Executions();
    replaceExecutions.set({
      input: 'rep1',
      result: 'rRep1',
      start: 2,
      end: 3,
    });

    const executions = new Executions();
    executions.set({
      input: 'tt',
      result: 'pp',
      start: 2,
      end: 3,
      replaceExecutions,
    });
    const text = executions.inspect(1);
    expect(text).to.be.a('string');
    expect(text).to.include('rep1');
    expect(text).to.include('rRep1');
  });
  it('inspect catch', () => {
    const catchExecutions = new Executions();
    catchExecutions.set({
      input: 'cactch1',
      result: 'rCatch1',
      start: 2,
      end: 3,
    });

    const executions = new Executions();
    executions.set({
      input: 'tt',
      result: 'pp',
      start: 2,
      end: 3,
      catchExecutions,
    });
    const text = executions.inspect(1);
    expect(text).to.be.a('string');
    expect(text).to.include('cactch1');
    expect(text).to.include('rCatch1');
  });
});
