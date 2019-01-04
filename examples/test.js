const Px = require('./../lib/Px');

Px.setDebug(true);

const pipe = Px
  .chain(input => 'Branch 1');

const pipe2 = Px
  .chain(input => 'Branch 2');

Px.chain(input => `${input} Chain`)
  //.branch('t', pipe, 't2', pipe2)
  //.branch(pipe, pipe2)
  .concatCurry(() => [pipe, pipe2])
  // .branchIf(() => false, pipe)
  // .chain(input => `${input} TWO`)
  .subscribe(res => console.log(res), err => console.log(err))
  .of('pepe ');
