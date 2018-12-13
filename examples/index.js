/* eslint-disable */
const Px = require('./../lib/Px');
const functions = require('./functions');

const event = {};
const context = {};

const callback = (err, result) => {
  if (err) {
    console.log('error', err);
    return;
  }
  console.log(result);
};


const exec = (evt, ctx, call) => {
  const pipe2 = Px
    .chainConcat(functions.func1, functions.func2)
    .chain(function tt(input) {
      return input[0] + ' test';
    })
    .chain(function (input) {
      return input + ' re adios';
    });


  const pipe = Px
    .chain(functions.func1)
    .do(console.log)
    .chain(functions.func1, functions.func2)
    .chain(functions.func3)
    //.chain(JSON.parse)
    .chainIf(() => true, functions.func4, input => input + 'chainIf')
    .chainIf(() => false, functions.func4)
    .chain(functions.func4)
    .chain(function (input) {
      return input.direct + ' adios';
    });

  const p1 = Px
    .chain(input => `${input} branch1`)
    .chain(input => `${input} branch1`)
    .chain(input => `${input} branch1`)
    .chain(input => `${input} branch1`)
    .branch(pipe)
    .chain(input => `${input} branch1`)
    .chain(input => `${input} branch1`);

  const p2 = Px
    .chain(input => `${input} branch2`)
    .chain(input => `${input} branch2`)
    .chain(input => `${input} branch2`);

  const pError = Px
    .chain(input => input + 'error');

  function* test() {
    yield 'tttt';
    yield 7;
  }

  const p = (input) => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(input + ' kkkkkk');
      }, 100);
    });
  };

  const t = async function (input) {
    return await p(input);
  }

  p1.chain(input => `${input} KKKKKKK`)
    .subscribe(res => call(null, res), err => call(err))
    .of('kkkk');

  p1.subscribe(res => call(null, res), err => call(err))
    .of('rrr');

  /*
Px.chain(input => input + 'ttt')
    .setDebug(true)
    .chain(t)
    .subscribe(res => call(null, res), err => call(err))
    .of('rrr');

    p1.catch(pError)
    .setDebug(true)
    .subscribe(res => call(null, res), err => call(err))
    .fromPromise(Promise.resolve('start'));

    Px.chain(input => input + ' chain 1')
    .wait(1000)
    .chainConcat(functions.func1, functions.func2)
    .chainIf(() => false, input => input + ' chain 2')
    .chain(input => input + ' chain 3')
    .subscribe(res => call(null, res), err => call(err))
    .of('test')

  Px.branch(p1, p2)
    .chain(input => 'postBracnh ' + input[0] + ' branch2 ' + input[1])
    .subscribe(res => call(null, res), err => call(err))
    .of('aaa');
    p1.subscribe(res => call(null, res), err => call(err))
    .of('pepe ');

   p2.replaceIf(() => true, p1)
    .chain(() => 'NNNNOOOOOOOOOOO')
    .subscribe(res => call(null, res), err => call(err))
    .of('pepe ');

    pipe2
       .chain((input) => {
         throw ('erwr');
         return 's';
       })
       .concat(p2)
       .subscribe(o => call(null, o), e => call(e))
       .of('lll');

       p2.replaceIf(() => true, p1)
         .chain(() => 'NNNNOOOOOOOOOOO')
         .subscribe(res => call(null, res))
         .of('pepe ');

       Px
         .chain(functions.func1)
         .chain(input => 'concat')
         .replaceIf(() => true, p1)
         .chain(input => 'concat')
         .subscribe(res => call(null, res))
         .of('aaa');
     */
};

const c = Px.chain(console.log)
  .catch(err => console.log('error', err))
  .bindNodeCallback();

Px.setDebug(true);

exec(event, context, c);

