import { browser, by, element, $, $$, ElementFinder, WebElementPromise, Key } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }

  getTestCase(name: string) {
    return new TestCase(element(by.css(`testcase[name='${name}']`)));
  }
}

class E2EHelpers
{
  public static async clearInputValue(input: ElementFinder) {
    while(await input.getAttribute('value') != '') {
      await input.sendKeys(Key.BACK_SPACE)
    }
  }
  public static async changeInputValue(input: ElementFinder, value: string) {
    await E2EHelpers.clearInputValue(input);
    await input.sendKeys(value);
  }
}

export class TestCase
{
  constructor(private testCase: ElementFinder) {
    
  }

  assertIsPresent() {
    return expect(this.testCase.isPresent()).toBeTruthy();
  }

  getTitleInput() {
    return this.testCase.element(by.name('title'));
  }

  async setTitle(title: string) {
    const titleInput = this.getTitleInput();
    await E2EHelpers.changeInputValue(titleInput,title);
  }

  getValidationMessage() : ElementFinder {
    return this.testCase.element(by.css('.rt-validation-message'));
  }
  getCustomTemplateMessage() : ElementFinder {
    return this.testCase.element(by.css('.rt-custom-template-message'));
  }
}
