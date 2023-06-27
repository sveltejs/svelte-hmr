import type { Page } from 'playwright-chromium'

type FilesOption = Record<
  string,
  string | ((placeholders: Record<string, string>) => string)
>

declare module 'vitest' {
  export interface TestContext {
    start: (config?: {
      files?: FilesOption
      exposeFunction: Record<string, Function>
    }) => Promise<{
      page: Page

      bodyHTML: () => Promise<string>

      edit: (
        file: string,
        contents: string | ((variables: Record<string, string>) => string)
      ) => Promise<void>
    }>
  }
}
