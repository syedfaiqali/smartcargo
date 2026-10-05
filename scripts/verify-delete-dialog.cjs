const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/', pretendToBeVisual: true });
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
for (const key of ['HTMLElement', 'Element', 'Node', 'DocumentFragment', 'MutationObserver', 'getComputedStyle']) global[key] = dom.window[key];
global.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
global.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
function compile(module, filename) {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  });
  module._compile(result.outputText, filename);
}
require.extensions['.ts'] = compile;
require.extensions['.tsx'] = compile;
const React = require('react');
const { MemoryRouter, Link } = require('react-router-dom');
const { render, fireEvent, screen, waitFor, cleanup } = require('@testing-library/react');
const { DeleteConfirmationDialog } = require('../src/components/DeleteConfirmationDialog.tsx');
const { TransactionToolbar } = require('../src/components/TransactionToolbar.tsx');

(async () => {
  let deletions = 0;
  render(React.createElement(MemoryRouter, null,
    React.createElement(DeleteConfirmationDialog),
    React.createElement(TransactionToolbar, { actions: ['delete'], onAction: () => deletions++ }),
    React.createElement(Link, { to: '/another-page' }, 'Navigate'),
  ));
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  assert.ok(screen.getByRole('dialog'));
  assert.equal(deletions, 0);
  fireEvent.click(screen.getByRole('button', { name: 'No' }));
  await waitFor(() => assert.equal(screen.queryByRole('dialog'), null));
  assert.equal(deletions, 0);
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape', keyCode: 27 });
  await waitFor(() => assert.equal(screen.queryByRole('dialog'), null));
  assert.equal(deletions, 0);
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
  await waitFor(() => assert.equal(screen.queryByRole('dialog'), null));
  assert.equal(deletions, 1);
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  fireEvent.click(screen.getByRole('link', { name: 'Navigate', hidden: true }));
  await waitFor(() => assert.equal(screen.queryByRole('dialog'), null));
  assert.equal(deletions, 1, 'Navigating away must cancel a pending delete');
  cleanup();
  console.log('Delete dialog UI checks passed: toolbar opens popup, No/Escape cancel, Yes deletes once, navigation cancels.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => dom.window.close());
