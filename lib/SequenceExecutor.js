
const Executions = require('./Executions');
const { getParamNames } = require('./utils');

class SequenceExecutor {
  constructor(sequencesDescription, observers, catchPipe) {
    this.debug = false;
    // Observers
    this.beforeObservers = [];
    this.nextObservers = [];
    this.errorObservers = [];
    this.completeObservers = [];
    this.catchPipe = catchPipe;

    this.executions = new Executions();
    this.sequences = this.createChainFromDescriptions(sequencesDescription);

    this.addDebuggerObserver();

    this.createObservers(observers);
  }

  setDebug(debug) {
    this.debug = debug;
    if (debug) {
      this.addDebuggerObserver();
    } else {
      this.removeObserver('_int_');
    }
  }

  createObservers(observers) {
    observers.forEach(observer => this.subscribeObserver(observer.name, observer.functions));
  }

  createChainFromDescriptions(executionsDescription) {
    const reducer = (old, executionDescription) => old.concat(this[executionDescription.type](...executionDescription.params));
    return executionsDescription.reduce(reducer, []);
  }

  createDebugOberserver(executions) {
    if (!this.debug) {
      return {};
    }
    const observer = {
      error: (err) => {
        executions.update({
          end: Date.now(),
          error: err.error ? err.error : err,
        });
      },
      next: (data) => {
        executions.update({
          end: Date.now(),
          result: data,
        });
      },
      before: data => executions.set(data),
    };
    return observer;
  }

  addDebuggerObserver() {
    this.subscribeObserver('_int_', this.createDebugOberserver(this.executions), true);
  }

  updateExecution(data) {
    if (this.debug) {
      this.executions.update(data);
    }
  }

  onBeforeExecute(data) {
    this.beforeObservers.forEach(observer => observer.func(data));
    return data;
  }

  onNextExecute(data) {
    this.nextObservers.forEach(observer => observer.func(data));
    return data;
  }

  onComplete(data) {
    const res = {
      input: this.input,
      result: data,
      executions: this.executions,
    };
    this.completeObservers.forEach(observer => observer.func(res));
    return data;
  }

  onError(error) {
    const sendObservers = () => {
      const res = {
        input: this.input,
        error,
        executions: this.executions,
      };
      this.errorObservers.forEach(observer => observer.func(res));
    };


    if (this.catchPipe) {
      const catchExecutions = new Executions();
      this.catchPipe.subscribe(this.createDebugOberserver(catchExecutions))
        .subscribe(
          () => {
            this.updateExecution({ catchExecutions });
            sendObservers();
          },
          () => {
            this.updateExecution({ catchExecutions });
            sendObservers();
          },
        )
        .setDebug(this.debug)
        .of(error);
      return error;
    }

    sendObservers();
    return error;
  }

  chain(...functions) {
    const createChain = func => (input, next) => {
      this.onBeforeExecute({ name: func.name, input, start: Date.now() });
      return getParamNames(func)[1] === 'next' ? func(input, next) : func(input);
    };
    return functions.map(createChain);
  }

  chainConcat(...functions) {
    const chainConcat = input => Promise.all(functions.map(func => this._exec(func, input)));
    return this.chain(chainConcat);
  }

  chainIf(filter, ...functions) {
    const chainIf = functions.map(func => (input, next) => (filter(input) ? func(input, next) : next(input)));
    return this.chain(...chainIf);
  }

  wait(time) {
    const wait = (input, next) => {
      setTimeout(() => next(input), time);
    };
    return this.chain(wait);
  }

  branch(...pipelines) {
    const branch = (input) => {
      let branchNumberIndex = -1;
      const branchExecutions = {};
      return Promise.all(pipelines.map(pipeline => new Promise((resolve, reject) => {
        branchNumberIndex += 1;
        const branchNumber = branchNumberIndex;
        branchExecutions[`branch${branchNumber}`] = new Executions();
        pipeline.subscribe(this.createDebugOberserver(branchExecutions[`branch${branchNumber}`]))
          .subscribe(resolve, reject)
          .setDebug(this.debug)
          .of(input);
      }))).then((res) => {
        this.updateExecution({ branchExecutions });
        return res.map(item => item.result);
      }).catch((res) => {
        this.updateExecution({ branchExecutions });
        throw res.error;
      });
    };
    return this.chain(branch);
  }

  concat(...pipelines) {
    const executeDescriptions = pipelines.reduce((last, pipeline) => last.concat(pipeline.executeDescriptions), []);
    return this.createChainFromDescriptions(executeDescriptions);
  }

  concatIf(filter, ...pipelines) {
    const concatIf = (input, next) => {
      if (filter(input)) {
        const executeDescriptions = pipelines.reduce((last, pipeline) => last.concat(pipeline.executeDescriptions), []);
        this.sequences = this.createChainFromDescriptions(executeDescriptions).concat(this.sequences);
        next(input);
        return;
      }
      next(input);
    };
    return this.chain(concatIf);
  }

  replaceIf(filter, pipeline) {
    const replace = (input, next) => {
      if (filter(input)) {
        this.sequences = [];
        const replaceExecutions = new Executions();
        pipeline.subscribe(this.createDebugOberserver(replaceExecutions))
          .subscribe(
            (res) => {
              this.updateExecution({ replaceExecutions });
              next(res.result);
            },
            (error) => {
              this.updateExecution({ replaceExecutions });
              this.onError(error.error);
            },
          )
          .setDebug(this.debug)
          .of(input);
        return;
      }
      next(input);
    };
    return this.chain(replace);
  }

  _exec(func, inputData) {
    return new Promise((resolve, reject) => {
      const res = func(inputData, item => resolve(item));
      if (res instanceof Promise) {
        res.then(item => resolve(item)).catch(reject);
      } else if (res) {
        resolve(res);
      }
    });
  }

  subscribeObserver(name, observer, first = false) {
    const push = (array, data) => (first ? array.unshift(data) : array.push(data));

    if (observer.complete) {
      push(this.completeObservers, { name, func: observer.complete });
    }
    if (observer.error) {
      push(this.errorObservers, { name, func: observer.error });
    }
    if (observer.next) {
      push(this.nextObservers, { name, func: observer.next });
    }
    if (observer.before) {
      push(this.beforeObservers, { name, func: observer.before });
    }
  }

  removeObserver(name) {
    this.completeObservers = this.completeObservers.filter(observer => observer.name !== name);
    this.errorObservers = this.errorObservers.filter(observer => observer.name !== name);
    this.nextObservers = this.nextObservers.filter(observer => observer.name !== name);
    this.beforeObservers = this.beforeObservers.filter(observer => observer.name !== name);
  }

  execute(input) {
    this.input = input;

    try {
      const next = (inputData) => {
        const func = this.sequences.shift();
        if (!func) {
          return this.onComplete(inputData);
        }

        return this._exec(func, inputData)
          .then(res => this.onNextExecute(res))
          .then(next)
          .catch(err => this.onError(err));
      };
      next(input);
    } catch (err) {
      this.onError(err);
    }
    return this;
  }

  fail(err) {
    this.input = err;
    if (this.debug) {
      this.executions.set({ name: 'fail', input: err, start: Date.now() });
    }

    this.onError(err);
    return this;
  }
}

module.exports = SequenceExecutor;
