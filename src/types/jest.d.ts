import '@testing-library/jest-dom'

// Extend Jest matchers with testing-library/jest-dom
declare module '@jest/expect' {
  interface Matchers<R> {
    toBeInTheDocument(): R
    toHaveClass(...classNames: string[]): R
    toHaveAttribute(attr: string, value?: string): R
    toHaveTextContent(text: string | RegExp): R
    toBeVisible(): R
    toBeDisabled(): R
    toBeEnabled(): R
    toHaveValue(value: string | string[] | number): R
    toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R
    toBeChecked(): R
    toHaveStyle(css: string | Record<string, any>): R
    toHaveFocus(): R
    toBeEmptyDOMElement(): R
    toBeInvalid(): R
    toBeRequired(): R
    toBeValid(): R
    toContainElement(element: HTMLElement | null): R
    toContainHTML(htmlText: string): R
    toHaveAccessibleDescription(expectedAccessibleDescription?: string | RegExp): R
    toHaveAccessibleName(expectedAccessibleName?: string | RegExp): R
    toHaveErrorMessage(expectedErrorMessage?: string | RegExp): R
  }
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveClass(...classNames: string[]): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveTextContent(text: string | RegExp): R
      toBeVisible(): R
      toBeDisabled(): R
      toBeEnabled(): R
      toHaveValue(value: string | string[] | number): R
      toHaveDisplayValue(value: string | RegExp | (string | RegExp)[]): R
      toBeChecked(): R
      toHaveStyle(css: string | Record<string, any>): R
      toHaveFocus(): R
      toBeEmptyDOMElement(): R
      toBeInvalid(): R
      toBeRequired(): R
      toBeValid(): R
      toContainElement(element: HTMLElement | null): R
      toContainHTML(htmlText: string): R
      toHaveAccessibleDescription(expectedAccessibleDescription?: string | RegExp): R
      toHaveAccessibleName(expectedAccessibleName?: string | RegExp): R
      toHaveErrorMessage(expectedErrorMessage?: string | RegExp): R
    }
  }
}