"use strict";

const { PARAM_PREFIX } = require("./constants");

class HelpPrinter {
  constructor(programName, version, globalParamDefinitions, tasks) {
    this.programName = programName;
    this.version = version;
    this.globalParamDefinitions = globalParamDefinitions;
    this.tasks = tasks;
  }

  printGlobalHelp(includeInternalTasks = false) {
    console.log(`${this.programName} version ${this.version}\n`);

    console.log(
      `Usage: npx ${this.programName}${this._getParamsList(
        this.globalParamDefinitions
      )} <TASK> [TASK OPTIONS]\n`
    );

    console.log("GLOBAL OPTIONS:\n");

    this._printParamDetails(this.globalParamDefinitions);

    console.log("\n\nAVAILABLE TASKS:\n");

    const tasksToShow = {};
    for (const [taskName, taskDefinition] of Object.entries(this.tasks)) {
      if (includeInternalTasks || !taskDefinition.isInternal) {
        tasksToShow[taskName] = taskDefinition;
      }
    }

    const nameLength = Object.keys(tasksToShow)
      .map(n => n.length)
      .reduce((a, b) => Math.max(a, b), 0);

    for (const name of Object.keys(tasksToShow).sort()) {
      const description = this.tasks[name].description || "";
      console.log(`  ${name.padEnd(nameLength)}\t${description}`);
    }

    console.log("");

    console.log(
      `For tasks' specific help run: npx ${this.programName} help [task]\n`
    );
  }

  printTaskHelp(taskName) {
    const taskDefinition = this.tasks[taskName];

    if (taskDefinition === undefined) {
      throw new Error(`Unrecognized task ${taskName}.`);
    }

    const description = taskDefinition.description || "";

    console.log(`${this.programName} version ${this.version}\n`);

    console.log(
      `Usage: npx ${this.programName} [GLOBAL OPTIONS] ${
        taskDefinition.name
      }${this._getParamsList(
        taskDefinition.paramDefinitions
      )}${this._getPositionalParamsList(
        taskDefinition.positionalParamDefinitions
      )}\n`
    );

    if (Object.keys(taskDefinition.paramDefinitions).length > 0) {
      console.log("OPTIONS:\n");

      this._printParamDetails(taskDefinition.paramDefinitions);

      console.log("");
    }

    if (taskDefinition.positionalParamDefinitions.length > 0) {
      console.log("POSITIONAL ARGUMENTS:\n");

      this._printPositionalParamDetails(
        taskDefinition.positionalParamDefinitions
      );

      console.log("");
    }

    console.log(`Help for task ${taskDefinition.name}: ${description}\n`);

    console.log(`For global options help run: npx ${this.programName} help\n`);
  }

  _getParamValueDescription(paramDefinition) {
    return `<${paramDefinition.type.name.toUpperCase()}>`;
  }

  _getParamsList(paramDefinitions) {
    let paramsList = "";

    for (const name of Object.keys(paramDefinitions).sort()) {
      const definition = paramDefinitions[name];

      paramsList += " ";

      if (definition.defaultValue !== undefined) {
        paramsList += "[";
      }

      paramsList += `${PARAM_PREFIX}${name}`;

      if (!definition.isFlag) {
        paramsList += ` ${this._getParamValueDescription(definition)}`;
      }

      if (definition.defaultValue !== undefined) {
        paramsList += "]";
      }
    }

    return paramsList;
  }

  _getPositionalParamsList(positionalParamDefinitions) {
    let paramsList = "";

    for (const definition of positionalParamDefinitions) {
      paramsList += " ";

      if (definition.defaultValue !== undefined) {
        paramsList += "[";
      }

      if (definition.isVariadic) {
        paramsList += "...";
      }

      paramsList += definition.name;

      if (definition.defaultValue !== undefined) {
        paramsList += "]";
      }
    }

    return paramsList;
  }

  _printParamDetails(paramDefinitions) {
    const paramsNameLength = Object.keys(paramDefinitions)
      .map(n => n.length)
      .reduce((a, b) => Math.max(a, b), 0);

    for (const name of Object.keys(paramDefinitions).sort()) {
      const description = paramDefinitions[name].description;
      const defaultValue = paramDefinitions[name].defaultValue;

      let msg = `  ${PARAM_PREFIX}${name.padEnd(paramsNameLength)}\t`;

      if (description !== undefined) {
        msg += `${description} `;
      }

      if (defaultValue !== undefined) {
        msg += `(default: ${defaultValue})`;
      }

      console.log(msg);
    }
  }

  _printPositionalParamDetails(positionalParamDefinitions) {
    const paramsNameLength = positionalParamDefinitions
      .map(d => d.name.length)
      .reduce((a, b) => Math.max(a, b), 0);

    for (const definition of positionalParamDefinitions) {
      const name = definition.name;
      const description = definition.description;

      let msg = `  ${name.padEnd(paramsNameLength)}\t`;

      if (description !== undefined) {
        msg += `${description} `;
      }

      console.log(msg);
    }
  }
}

module.exports = { HelpPrinter };