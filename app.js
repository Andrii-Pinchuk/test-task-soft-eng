'use strict'

// node version of import testSchema
// const nodeTestSchema = require("./testSchema.json");

const testSchema = await schemaParser();

async function schemaParser() {
  const response = await fetch('./testSchema.json');

  if (!response.ok) {
    throw new Error('not found');
  }

  return response.json();
}

renderTestSchema(testSchema);
renderRandomObjectFromSchema(testSchema);

document.querySelector('.generate-object-button').addEventListener('click', () => {
  renderRandomObjectFromSchema(testSchema);
});

function renderTestSchema(testSchema) {
  document.querySelector('.test-schema').innerText = JSON.stringify(testSchema, null, 2);
}

function renderRandomObjectFromSchema(testSchema) {

  const newObj = Object.assign({}, generateObjectFromSchema(testSchema));

  document.querySelector('.random-object').innerText = JSON.stringify(newObj, null, 2);

  return newObj;

}

function generateObjectFromSchema(schema) {
  if (!schema) { return }

  const generatedObject = {};
  const definitionObject = {};

  if ((schema.hasOwnProperty('type') || schema.hasOwnProperty('enum') || schema.hasOwnProperty('anyOf'))
    && schema['properties'] === undefined) {
    return applySchemaTypeRule(schema);
  }

  if (schema.hasOwnProperty('definitions')) {
    const definitionsItems = Object.keys(schema['definitions']);

    definitionsItems.forEach(definition => {
      Object.keys(schema['definitions'][definitionsItems]['properties']).forEach((item) => {
        definitionObject[definition] = {
          ...definitionObject[definition],
          [item]: generateObjectFromSchema(schema['definitions'][definition]['properties'][item])};
      });
    });
  }

  if (schema.hasOwnProperty('properties')) {
    Object.keys(schema['properties']).forEach((property) => {
      generatedObject[property] = generateObjectFromSchema(schema['properties'][property]);

      if (definitionObject.hasOwnProperty(property)) {
        generatedObject[property] = definitionObject[property];
      }
    });
  }

  return generatedObject;
}

function applySchemaTypeRule(currentObject) {
  if (currentObject['type'] === 'string') {
    if (!currentObject.hasOwnProperty('format')) {
      return createRandomString(Math.ceil(Math.random() * 50));
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

  if (currentObject['type'] === 'array') {
    const randomIndex = Math.ceil(Math.random() * 10);
    const randomArray = [];

    if (!currentObject.hasOwnProperty('items')) {
      for (let i = 0; i < randomIndex; i++) {
        randomArray.push(createRandomString(randomIndex));
      }
    }

    return randomArray;
  }

  if (currentObject['type'] === 'boolean') {
    return Math.floor(Math.random() * 2) === true;
  }

  if (currentObject['type'] === 'object' && currentObject['properties'] === undefined) {
    return createRandomObject(Math.ceil(Math.random() * 10));
  }

  if (currentObject.hasOwnProperty('enum')) {
    const randomIndex = Math.floor(Math.random() * currentObject['enum'].length);
    return currentObject['enum'].find(rule => currentObject['enum'].indexOf(rule) === randomIndex);
  }

  if (currentObject.hasOwnProperty('anyOf')) {
    const randomIndex = Math.floor(Math.random() * currentObject['anyOf'].length);
    const randomRuleType = currentObject['anyOf'].find(rule => currentObject['anyOf'].indexOf(rule) === randomIndex);
    return applySchemaTypeRule(randomRuleType);
  }
}

function createRandomString(randomStringLength) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let randomString = '';
  for (let i = 0; i < randomStringLength; i++) {
    const alphabeticalPosition = Math.ceil(Math.random() * alphabet.length);
    randomString += `${alphabet.substring(alphabeticalPosition, alphabeticalPosition + 1)}`;
  }
  return randomString;
}

function createRandomObject(randomObjectPropertiesNumber) {
  const newRandomObj = {};
  for (let i = 0; i < randomObjectPropertiesNumber; i++) {
    const randomPropertyName = createRandomString(Math.ceil(Math.random() * 10));
    newRandomObj[randomPropertyName] = createRandomString(Math.ceil(Math.random() * 10));
  }

  return newRandomObj;
}






