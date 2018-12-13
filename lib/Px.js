/* eslint no-restricted-syntax: 0 */
/* global document */
// PipeX
const cloneObject = require('clone');
const SequenceExecutor = require('./SequenceExecutor');
const { makeId } = require('./utils');

let _debug = false;

class Px {
  constructor() {
    this.sequencesDescription = [];
    this.input = null;
    this.observers = [];
    this.SequenceExecutor = SequenceExecutor;
    this.catchPipe = null;
    this.debug = null;
  }

  _clone() {
    // return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    return cloneObject(this);
  }

  _createSequenceDescription(type, params) {
    const clone = this._clone();
    clone.sequencesDescription.push({ type, params });
    return clone;
  }

  static create() {
    return new Px();
  }

  static getDebug() {
    return _debug;
  }

  static setDebug(debug) {
    _debug = debug;
  }

  static enableNext(enable) {
    return Px.create().enableNext(enable);
  }

  static chain(...functions) {
    return Px.create().chain(...functions);
  }

  static chainIf(filter, ...functions) {
    return Px.create().chainIf(filter, ...functions);
  }

  static chainConcat(...functions) {
    return Px.create().chainConcat(...functions);
  }

  static wait(time) {
    return Px.create().wait(time);
  }

  static branch(...pipes) {
    return Px.create().branch(...pipes);
  }

  static concat(...pipes) {
    return Px.create().concat(...pipes);
  }

  static concatIf(filter, ...pipes) {
    return Px.create().concatIf(filter, ...pipes);
  }

  static replaceIf(filter, pipe) {
    return Px.create().replaceIf(filter, pipe);
  }

  static do(...functions) {
    return Px.create().do(...functions);
  }

  setDebug(debug) {
    this.debug = debug;
    return this;
  }

  input() {
    return this._createSequenceDescription('input', []);
  }

  chain(...functions) {
    return this._createSequenceDescription('chain', functions);
  }

  chainIf(filter, ...functions) {
    return this._createSequenceDescription('chainIf', [filter, ...functions]);
  }

  chainConcat(...functions) {
    return this._createSequenceDescription('chainConcat', functions);
  }

  wait(time) {
    return this._createSequenceDescription('wait', [time]);
  }

  // Trabajo con Pipe's
  branch(...pipes) {
    return this._createSequenceDescription('branch', pipes);
  }

  branchIf(filter, ...pipes) {
    return this._createSequenceDescription('branchIf', [filter, ...pipes]);
  }

  concat(...pipes) {
    return this._createSequenceDescription('concat', pipes);
  }

  concatIf(filter, ...pipes) {
    return this._createSequenceDescription('concatIf', [filter, ...pipes]);
  }

  replaceIf(filter, pipe) {
    return this._createSequenceDescription('replaceIf', [filter, pipe]);
  }

  do(...functions) {
    return this._createSequenceDescription('do', functions);
  }

  catch(pipeOrFunction) {
    const clone = this._clone();
    clone.catchPipe = typeof pipeOrFunction === 'function' ? Px.chain(pipeOrFunction) : pipeOrFunction;
    return clone;
  }

  // Invocacion
  of(input) {
    const clone = this._clone();
    clone.input = input;
    return clone.execute();
  }

  iter(iterable) {
    let iter = iterable;
    if (typeof iterable === 'object') {
      iter = Object.values(iterable);
    }
    if (typeof iterable === 'function') {
      iter = iterable();
    }

    for (const elem of iter) {
      this.of(elem);
    }
  }

  fromPromise(promise) {
    const clone = this._clone();
    promise.then(res => clone.of(res))
      .catch(err => clone.fail(err));
    return clone;
  }

  fromObserver(observer) {
    const clone = this._clone();
    observer.subscribe(res => clone.of(res), err => clone.fail(err));
    return clone;
  }

  fromDomEvent(nameOrClase, type) {
    const func = nameOrClase.charAt() === '#' ? document.getElementById : document.getElementsByClassName;
    func(nameOrClase.slice(1)).addEventListener(type, event => this.of(event));
  }

  bindCallback() {
    const clone = this._clone();
    return data => clone.of(data);
  }

  bindNodeCallback() {
    const clone = this._clone();
    return (err, data) => {
      if (err) {
        clone.fail(err);
        return;
      }
      clone.of(data);
    };
  }

  fail(err) {
    const sequenceExecutor = new this.SequenceExecutor(this.sequencesDescription, this.observers, this.catchPipe);
    sequenceExecutor.setDebug(this.debug || _debug);
    sequenceExecutor.fail(err);
    return this;
  }

  execute() {
    const sequenceExecutor = new this.SequenceExecutor(this.sequencesDescription, this.observers, this.catchPipe);
    sequenceExecutor.setDebug(this.debug || _debug);
    sequenceExecutor.execute(this.input);
    return this;
  }

  // Subscripion al resultado
  subscribe(complete, error, next, before) {
    let observer = complete;
    if (typeof complete !== 'object') {
      observer = {
        complete, error, next, before,
      };
    }
    const clone = this._clone();
    clone.observers.push({ name: makeId(), functions: observer });
    return clone;
  }
}

module.exports = Px;
