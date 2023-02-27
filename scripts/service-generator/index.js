const fs = require('fs-extra');
const path = require('path');
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const prettier = require('prettier');
const upperFirst = require('lodash/upperFirst');
const apiData = require('./api.json');

// api 方法生成
(async () => {
  const getMethodName = (method, pathname) => pathname.split('/').filter((v) => v).reduce((result, item) => `${result}${upperFirst(item)}`, method);

  const getInterfaceDeclaration = (api) => {
    const { method = 'get', params, data } = api;
    const properties = Object.entries(method === 'get' ? params : data).map(([key, type]) => {
      // unknown
      let typeAnnotation = t.tsUnknownKeyword();
      if (type === 'string') {
        typeAnnotation = t.tsStringKeyword();
      }
      if (type === 'number') {
        typeAnnotation = t.tsNumberKeyword();
      }
      if (type === 'string[]') {
        typeAnnotation = t.tsArrayType(t.tsStringKeyword());
      }
      if (type === 'number[]') {
        typeAnnotation = t.tsArrayType(t.tsNumberKeyword());
      }

      return t.tsPropertySignature(
        t.identifier(key),
        t.tsTypeAnnotation(typeAnnotation),
      );
    });
    const interfaceDeclaration = t.tsInterfaceDeclaration(
      t.identifier(method === 'get' ? 'RequestParamsType' : 'RequestDataType'),
      null,
      null,
      t.tsInterfaceBody(properties),
    );

    return generate(interfaceDeclaration).code;
  };

  const getFnCode = (api) => {
    const {
      path: pathname, method = 'get', desc, params, data,
    } = api;

    const methodName = getMethodName(method, pathname);

    if (!params && !data) {
      return `
        /*
        * ${desc}
        */
        export const ${methodName} = () => request.${method}('${pathname}');
      `;
    }

    const args = method === 'get' ? 'params:RequestParamsType' : 'data:RequestDataType';
    const axiosConfig = method === 'get' ? '{ params }' : 'data';
    return `
      ${getInterfaceDeclaration(api)}

      /*
       * ${desc}
       */
      export const ${methodName} = (${args}) => request.${method}('${pathname}', ${axiosConfig});
    `;
  };

  const newConfig = apiData.reduce((result, api) => {
    if (api.parsed) {
      return [
        ...result,
        api,
      ];
    }

    const code = `
      import request from './request';

      ${getFnCode(api)}
    `;
    const filename = api.path.split('/').filter((v) => v).join('-');
    fs.outputFileSync(
      path.resolve(process.cwd(), `./src/service/${filename}.ts`),
      prettier.format(code, { parser: 'babel', singleQuote: true, printWidth: 220 }),
    );

    return [
      ...result,
      {
        ...api,
        parsed: true,
      },
    ];
  }, []);

  fs.outputFileSync(
    path.resolve(process.cwd(), './scripts/service-generator/api.json'),
    JSON.stringify(newConfig, null, '\t'),
  );
})();
