
class Executions {
  constructor() {
    this.list = [];
  }
  set(data) {
    this.list.push(data);
  }
  update(data) {
    const execution = this.list[this.list.length - 1];
    this.list[this.list.length - 1] = Object.assign(execution, data);
  }
  inspect(depth) {
    const strings = this.list.map((execution, index) => {
      const result = execution.result ? `Result: ${execution.result}` : `Error: ${execution.error}`;
      const time = execution.end - execution.start;
      let line = `${' '.repeat(depth * 2)}[${index + 1}- ${execution.name}] Input: ${execution.input} ${result} Time: ${time} ms \n`;
      if (execution.branchExecutions) {
        const branchs = Object.entries(execution.branchExecutions).map(obj => `${' '.repeat(depth * 2)}{${obj[0]}} ${obj[1].inspect(depth + 1)}`);
        line += branchs.join('');
      }
      if (execution.replaceExecutions) {
        line = `${line + ' '.repeat(depth * 2)}{replace} ${execution.replaceExecutions.inspect(depth + 1)}`;
      }
      if (execution.catchExecutions) {
        line = `${line + ' '.repeat(depth * 2)}{catch} ${execution.catchExecutions.inspect(depth + 1)}`;
      }
      return line;
    });
    return `\n${strings.join('')}`;
  }
}

module.exports = Executions;
