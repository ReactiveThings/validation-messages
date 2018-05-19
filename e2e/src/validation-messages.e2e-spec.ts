import { AppPage, TestCase } from './app.po';
import { browser } from 'protractor';

describe('rt-validation-messages ->', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
    page.navigateTo();
  });

  it( 'ngModel -> should not display validation message by default ', async () => {
    const testCase = page.getTestCase('rt-validation-messages -> ngModel');

    const isValidationMessageVisible = await testCase.getValidationMessage().isPresent();

    expect(isValidationMessageVisible).toBeFalsy();
  });

  it( 'ngModel -> should display default validation message after change', async () => {
    const testCase = page.getTestCase('rt-validation-messages -> ngModel');

    await testCase.setTitle('title')
    await testCase.setTitle('')

    const validationMessage = await testCase.getValidationMessage().getText();
    expect(validationMessage).toBeTruthy('required: true');
  });

  it( 'formControlName -> should not display validation message by default ', async () => {
    const testCase = page.getTestCase('rt-validation-messages -> formControlName');

    const isValidationMessageVisible = await testCase.getValidationMessage().isPresent();

    expect(isValidationMessageVisible).toBeFalsy();
  });

  it( 'formControlName -> should display default validation message after change', async () => {
    const testCase = page.getTestCase('rt-validation-messages -> formControlName');

    await testCase.setTitle('title')
    await testCase.setTitle('')
    const validationMessage = await testCase.getValidationMessage().getText();
    
    expect(validationMessage).toBeTruthy('required: true');
  });

  it( 'formControl -> should not display validation message by default ', async () => {
    const testCase = page.getTestCase('rt-validation-messages -> formControl');

    const isValidationMessageVisible = await testCase.getValidationMessage().isPresent();

    expect(isValidationMessageVisible).toBeFalsy();
  });

  it( 'formControl -> should display default validation message after change', async () => {
    const testCase = page.getTestCase('rt-validation-messages -> formControl');

    await testCase.setTitle('title')
    await testCase.setTitle('')

    const validationMessage = await testCase.getValidationMessage().getText();
    expect(validationMessage).toBeTruthy('required: true');
  });

  it( 'formGroup -> should not display validation message by default ', async () => {
    const testCase = page.getTestCase('rt-validation-messages -> formGroup');

    const isValidationMessageVisible = await testCase.getValidationMessage().isPresent();

    expect(isValidationMessageVisible).toBeFalsy();
  });

  it( 'formGroup -> should display default validation message after change', async () => {
    const testCase = page.getTestCase('rt-validation-messages -> formGroup');

    await testCase.setTitle('title')
    await testCase.setTitle('')

    const validationMessage = await testCase.getValidationMessage().getText();
    expect(validationMessage).toBeTruthy('formGroupValidator: true');
  });

  it( 'shows custom message', async () => {
    const testCase = page.getTestCase('rt-validation-messages -> shows custom message');

    await testCase.setTitle('title')
    await testCase.setTitle('')

    const validationMessage = await testCase.getValidationMessage().getText();
    expect(validationMessage).toBeTruthy('Field is required');
  });
  it( 'shows message with custom parameters', async () => {
    const testCase = page.getTestCase('rt-validation-messages -> shows message with custom parameters');

    await testCase.setTitle('title')
    await testCase.setTitle('')

    const validationMessage = await testCase.getValidationMessage().getText();
    expect(validationMessage).toBeTruthy('required: Title');
  });
  it( 'shows message in custom template', async () => {
    const testCase = page.getTestCase('rt-validation-messages -> shows message in custom template');

    await testCase.setTitle('title')
    await testCase.setTitle('')

    const validationMessage = await testCase.getCustomTemplateMessage().getText();
    expect(validationMessage).toBeTruthy('required: Title');
  });
  it( 'shows message in custom inline template', async () => {
    const testCase = page.getTestCase('rt-validation-messages -> shows message in custom inline template');

    await testCase.setTitle('title')
    await testCase.setTitle('')

    const validationMessage = await testCase.getCustomTemplateMessage().getText();
    expect(validationMessage).toBeTruthy('required: Title');
  });
  
});

