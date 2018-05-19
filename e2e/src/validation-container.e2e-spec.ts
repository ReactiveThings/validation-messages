import { AppPage, TestCase } from './app.po';
import { browser } from 'protractor';

describe('rt-validation-container ->', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
    page.navigateTo();
  });

  it( 'ngModel -> should not display validation message by default ', async () => {
    const testCase = page.getTestCase('rt-validation-container -> ngModel');

    const isValidationMessageVisible = await testCase.getValidationMessage().isPresent();

    expect(isValidationMessageVisible).toBeFalsy();
  });

  it( 'ngModel -> should display default validation message after change', async () => {
    const testCase = page.getTestCase('rt-validation-container -> ngModel');

    await testCase.setTitle('title')
    await testCase.setTitle('')

    const validationMessage = await testCase.getValidationMessage().getText();
    expect(validationMessage).toBeTruthy('required: true');
  });

  it( 'formControlName -> should not display validation message by default ', async () => {
    const testCase = page.getTestCase('rt-validation-container -> formControlName');

    const isValidationMessageVisible = await testCase.getValidationMessage().isPresent();

    expect(isValidationMessageVisible).toBeFalsy();
  });

  it( 'formControlName -> should display default validation message after change', async () => {
    const testCase = page.getTestCase('rt-validation-container -> formControlName');

    await testCase.setTitle('title')
    await testCase.setTitle('')
    const validationMessage = await testCase.getValidationMessage().getText();
    
    expect(validationMessage).toBeTruthy('required: true');
  });

  it( 'formControl -> should not display validation message by default ', async () => {
    const testCase = page.getTestCase('rt-validation-container -> formControl');

    const isValidationMessageVisible = await testCase.getValidationMessage().isPresent();

    expect(isValidationMessageVisible).toBeFalsy();
  });

  it( 'formControl -> should display default validation message after change', async () => {
    const testCase = page.getTestCase('rt-validation-container -> formControl');

    await testCase.setTitle('title')
    await testCase.setTitle('')

    const validationMessage = await testCase.getValidationMessage().getText();
    expect(validationMessage).toBeTruthy('required: true');
  });

  it( 'shows custom message', async () => {
    const testCase = page.getTestCase('rt-validation-container -> custom validation-message');

    await testCase.setTitle('title')
    await testCase.setTitle('')

    const validationMessage = await testCase.getValidationMessage().getText();
    expect(validationMessage).toBeTruthy('Field is required');
  });

  it( 'shows message in custom template', async () => {
    const testCase = page.getTestCase('rt-validation-messages -> shows message in custom template');

    await testCase.setTitle('title')
    await testCase.setTitle('')

    const validationMessage = await testCase.getCustomTemplateMessage().getText();
    expect(validationMessage).toBeTruthy('Field is required');
  });
});

