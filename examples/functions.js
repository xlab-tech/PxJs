/* eslint-disable */
module.exports = {
  func1: (input) => {
    // output.data = input.data
    // Do something great here, next call the next function
    return `${input} hola`;
  },
  func2: (input) => {
    return new Promise(resolve => {
      setTimeout(() => { resolve(`${input} oeoeooeer`); }, 1000);
    });
  },
  func3: input => new Promise(resolve => setTimeout(() => resolve(JSON.stringify({ promes: `${input} yes` })), 500)),
  func4: input => ({ direct: `${input} yes` }),
};
