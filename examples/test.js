const Px = require('./../lib/Px');

Px.setDebug(true);

const pipe = Px
  .chain(input => `${input} Branch`)
  .chain(input => `${input} Branch`);

Px.chain(input => `${input} Chain`)
  .branch(pipe)
  // .branchIf(() => false, pipe)
  .chain(input => `${input} TWO`)
  .subscribe(res => console.log(res), err => console.log(err))
  .of('pepe ');
