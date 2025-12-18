/// <reference types="@rsbuild/core/types" />

declare module "*.svg" {
  import type * as React from "react";

  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
}
