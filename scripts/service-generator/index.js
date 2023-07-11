const fs = require('fs-extra');
const path = require('path');
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const prettier = require('prettier');
const upperFirst = require('lodash/upperFirst');
const apiData = require('./api.json');

// neteasecloudmusic api 生成工具
(async () => {
  const getMethodSuffix = (pathname) => pathname.split('/').filter((v) => v).reduce((item, next) => `${upperFirst(item)}${upperFirst(next)}`);

  // 获取  params 或 data 类型定义
  const getInterfaceDeclaration = (interfaceName, paramsOrData) => {
    const properties = Object.entries(paramsOrData).map(([key, type]) => {
      // unknown
      let typeAnnotation;
      if (type === 'string') {
        typeAnnotation = t.tsUnionType([
          t.tsStringKeyword(),
          t.tsUndefinedKeyword(),
        ]);
      }
      if (type === 'number') {
        typeAnnotation = t.tsUnionType([
          t.tsNumberKeyword(),
          t.tsUndefinedKeyword(),
        ]);
      }
      if (type === 'boolean') {
        typeAnnotation = t.tsUnionType([
          t.tsBooleanKeyword(),
          t.tsUndefinedKeyword(),
        ]);
      }
      if (type === 'string[]') {
        typeAnnotation = t.tsUnionType([
          t.tsArrayType(t.tsStringKeyword()),
          t.tsUndefinedKeyword(),
        ]);
      }
      if (type === 'number[]') {
        typeAnnotation = t.tsUnionType([
          t.tsArrayType(t.tsNumberKeyword()),
          t.tsUndefinedKeyword(),
        ]);
      }
      if (type === 'FormData') {
        typeAnnotation = t.tsTypeReference(
          t.identifier('FormData'),
          null,
        );
      }

      return t.tsPropertySignature(
        t.identifier(key), // 属性名称
        t.tsTypeAnnotation(typeAnnotation),
      );
    });
    const interfaceDeclaration = t.exportNamedDeclaration(t.tsInterfaceDeclaration(
      t.identifier(interfaceName),
      null,
      null,
      t.tsInterfaceBody(properties),
    ));

    return generate(interfaceDeclaration).code;
  };

  const getFnCode = (methodName, api) => {
    const {
      path: pathname, method = 'get', desc, params, data,
    } = api;

    if (!params && !data) {
      return `
        /*
        * ${desc}
        */
        export const ${methodName} = () => request.${method}('${pathname}');
      `;
    }

    const methodSuffix = getMethodSuffix(pathname);
    if (method === 'get') {
      return `
        ${getInterfaceDeclaration(`${methodSuffix}RequestParams`, params)}

        /*
        * ${desc}
        */
        export const ${methodName} = (params: ${`${methodSuffix}RequestParams`}) => request.${method}('${pathname}', { params });
      `;
    }

    if (method === 'post') {
      return `
        ${params ? getInterfaceDeclaration(`${methodSuffix}RequestParams`, params) : ''}

        ${data ? getInterfaceDeclaration(`${methodSuffix}RequestData`, data) : ''}

        /*
        * ${desc}
        */
        export const ${methodName} = (data: ${`${methodSuffix}RequestData`}${params ? `,params: ${`${methodSuffix}RequestParams`}` : ''}) => request.${method}('${pathname}', data${params ? ',{params}' : ''});
      `;
    }

    return '';
  };

  const newApiJson = [];
  const exportDeclarationCode = [];
  apiData.forEach((api) => {
    if (api.parsed) {
      newApiJson.push(api);
      return;
    }

    const {
      path: pathname, method = 'get',
    } = api;
    const methodName = `${method}${getMethodSuffix(pathname)}`;
    const code = `
      import request from './request';

      ${getFnCode(methodName, api)}
    `;
    const filename = api.path.split('/').filter((v) => v).join('-');
    fs.outputFileSync(
      path.resolve(process.cwd(), `./src/service/${filename}.ts`),
      prettier.format(code, { parser: 'babel', singleQuote: true, printWidth: 220 }),
    );

    exportDeclarationCode.push(`export { ${methodName} } from './${filename}';`);

    newApiJson.push({
      ...api,
      parsed: true,
    });
  });

  fs.appendFile(
    path.resolve(process.cwd(), './src/service/index.ts'),
    `\n${exportDeclarationCode.join('\n')}`,
  );

  fs.outputFileSync(
    path.resolve(process.cwd(), './scripts/service-generator/api.json'),
    JSON.stringify(newApiJson, null, '\t'),
  );
})();
