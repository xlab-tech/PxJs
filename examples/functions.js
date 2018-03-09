/* eslint-disable */
module.exports = {
  func1: (input, next) => {
    // output.data = input.data
    // Do something great here, next call the next function
    next(`${input} hola`);
  },
  func2: (input, next) => {
    setTimeout(() => {
      next(`${input} oeoeooeer`);
    }, 1000);
  },
  func3: input => new Promise(resolve => setTimeout(() => resolve(JSON.stringify({ promes: `${input} yes` })), 500)),
  func4: input => ({ direct: `${input} yes` }),
};
