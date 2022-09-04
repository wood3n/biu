import React from 'react';

interface Props {
  path: string;
}

const modules = import.meta.glob('@/**/*.tsx');

/*
 * 懒加载
 * import() 动态导入的模块在 vite 中使用时有限制，因为 vite 在生产环境打包的时候不会编译这里的 tsx 模块；
 * 所以，这里应该使用 Glob Import 模式来引入模块
 */
const LazyLoad: React.FC<Props> = ({ path }) => {
  // @ts-expect-error 类型“() => Promise<{ [key: string]: any; }>”的参数不能赋给类型“() => Promise<{ default: ComponentType<any>; }>”的参数。
  const Component = React.lazy(modules[`/${path}/index.tsx`]);

  return (
    <React.Suspense fallback={<div>loading...</div>}>
      <Component />
    </React.Suspense>
  );
};

export default LazyLoad;
