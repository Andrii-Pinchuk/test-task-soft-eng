'use strict'

// node version of import testSchema
// const nodeTestSchema = require("./test.json");

const schemaParser = async function receiveTestSchema() {
  const response = await fetch('./test.json');

  if (!response.ok) {
    throw new Error('not found');
  }

  return response.json();
}

const testSchema = await schemaParser();

createResultObject(testSchema);

function createResultObject(testSchema) {

  const newObj = Object.assign({}, generateObjectFromSchema(testSchema));

  document.querySelector('body').innerText = JSON.stringify(newObj, null, ' ');

  function generateObjectFromSchema(schema) {
    if (!schema) { return }

    const parsedData = {};
    const definitionObj = {};

    if (schema.hasOwnProperty('anyOf')) {
      const randomIndex = Math.floor(Math.random() * schema['anyOf'].length);
      const randomRuleType = schema['anyOf'].find(rule => schema['anyOf'].indexOf(rule) === randomIndex)
      return applySchemaTypeRule(randomRuleType);
    }

    if (schema.hasOwnProperty('enum')) {
      const randomIndex = Math.floor(Math.random() * schema['enum'].length);
      return schema['enum'].find(rule => schema['enum'].indexOf(rule) === randomIndex);
    }

    if (schema.hasOwnProperty('type') && schema['properties'] === undefined) {
      return applySchemaTypeRule(schema);
    }

    if (schema['definitions']) {
      const definitionsItems = Object.keys(schema['definitions']);

      definitionsItems.forEach(definition => {
        Object.keys(schema['definitions'][definitionsItems]['properties']).forEach((item) => {
          definitionObj[definition] = {
            ...definitionObj[definition],
            [item]: generateObjectFromSchema(schema['definitions'][definition]['properties'][item])};
        })
      })

    }

    if (schema['properties']) {
      Object.keys(schema['properties']).forEach((item) => {
        parsedData[item] = generateObjectFromSchema(schema['properties'][item])
      })
    }

    if (parsedData.hasOwnProperty('attendees')) {
      parsedData['attendees'] = definitionObj['attendees'];
    }

    function applySchemaTypeRule(currentObject) {
      if (currentObject['type'] === 'string') {
        if (!currentObject.hasOwnProperty('format')) {
          return createRandomStr(Math.ceil(Math.random() * 50));
        } else if (currentObject.hasOwnProperty('pattern')) {
          return `${new RegExp(currentObject['pattern'])}`;
        }
      }

      if (currentObject['type'] === 'integer') {
        let min = 0;
        let max = 0;

        if (!currentObject.hasOwnProperty('minimum') && !currentObject.hasOwnProperty('maximum')) {
          return Math.floor(Math.random() * 1000);
        }

        if (currentObject.hasOwnProperty('minimum')) {
          min = currentObject['minimum'];
        }

        if (currentObject.hasOwnProperty('maximum')) {
          max = currentObject['maximum'];
        }

        return Math.floor(min + Math.random() * (max + 1 - min));
      }

      if (currentObject['type'] === 'null') {
        return null;
      }

      if (schema['type'] === 'array') {
        const randomIndex = Math.ceil(Math.random() * 10);
        const randomArray = [];
        if (!schema.hasOwnProperty('items')) {
          for (let i = 0; i < randomIndex; i++) {
            randomArray.push(createRandomStr(randomIndex));
          }
        }
        return randomArray;
      }

      if (currentObject['type'] === 'boolean') {
        return Math.floor(Math.random() * 2) === true;
      }

      if (currentObject['type'] === 'object' && currentObject['properties'] === undefined) {
        const name = createRandomStr(Math.ceil(Math.random() * 10));
        const value = createRandomStr(Math.ceil(Math.random() * 10));

        return { [name]: value }
      }
    }

    return parsedData
  }

  function createRandomStr(len) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    let randomStr = '';
    for (let i = 0; i < len; i++) {
      const pos = Math.ceil(Math.random() * alphabet.length);

      randomStr += `${alphabet.substring(pos,pos+1)}`;
    }
    return randomStr;
  }
}






