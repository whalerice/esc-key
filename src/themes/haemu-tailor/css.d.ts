/** Lets `pnpm typecheck` see CSS modules before Next writes gitignored next-env.d.ts. */
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
