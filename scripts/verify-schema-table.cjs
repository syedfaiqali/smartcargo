const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/', pretendToBeVisual: true });
global.window = dom.window; global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
for (const key of ['HTMLElement', 'Element', 'Node', 'DocumentFragment', 'MutationObserver', 'getComputedStyle']) global[key] = dom.window[key];
global.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
global.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
function compile(module, filename) {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText, filename);
}
require.extensions['.ts'] = compile; require.extensions['.tsx'] = compile;
const React = require('react');
const { render, fireEvent, screen, within, cleanup, waitFor } = require('@testing-library/react');
const { MemoryRouter } = require('react-router-dom');
const { SchemaTable } = require('../src/components/SchemaTable.tsx');
const { DeleteConfirmationDialog } = require('../src/components/DeleteConfirmationDialog.tsx');
const rows = [
  { id: 'a', name: 'Alpha', amount: 100, date: '2026-10-05', final: true },
  { id: 'b', name: 'Beta', amount: 2, date: '2026-10-06', final: false },
  { id: 'c', name: 'Gamma', amount: 11, date: '2026-10-05', final: false },
  ...Array.from({ length: 4 }, (_, i) => ({ id: 'extra' + i, name: 'Extra ' + i, amount: 20 + i, date: '2026-10-07', final: false })),
];
const columns = [
  { key: 'name', label: 'Name', value: row => row.name },
  { key: 'amount', label: 'Amount', type: 'number', value: row => row.amount },
  { key: 'date', label: 'Date', type: 'date', value: row => row.date },
  { key: 'final', label: 'Final', type: 'boolean', value: row => row.final },
];
let selected = [], deleted = [], visibleRows = rows;
function TableHarness() {
  const [selection, changeSelection] = React.useState([]);
  selected = selection;
  return React.createElement(SchemaTable, {
    title: 'Test records', rows: visibleRows, columns, getRowId: row => row.id,
    getRowLabel: row => row.name, selected: selection, onSelect: changeSelection, initialPageSize: 5,
    actions: [{ key: 'delete', label: 'Delete record', icon: '?', color: 'error', disabled: row => row.final, confirmDelete: 'Delete this record?', onClick: row => deleted.push(row.id) }],
  });
}
const app = () => React.createElement(MemoryRouter, null, React.createElement(DeleteConfirmationDialog), React.createElement(TableHarness));
const bodyRows = () => within(screen.getByRole('table', { name: 'Test records' })).getAllByRole('row').filter(row => !row.closest('thead'));
(async () => {
  const view = render(app());
  assert.equal(bodyRows().length, 5);
  assert.equal(within(bodyRows()[0]).getByRole('button', { name: 'Delete record' }).disabled, true);
  fireEvent.click(screen.getByRole('button', { name: 'Amount' }));
  assert.ok(bodyRows()[0].textContent.includes('Beta'), 'Numeric sort must put 2 before 11 and 100');
  assert.ok(bodyRows()[1].textContent.includes('Gamma'));
  fireEvent.change(screen.getByRole('textbox', { name: 'Search records' }), { target: { value: '05/10/2026' } });
  assert.equal(bodyRows().length, 2, 'Formatted dates must be searchable');
  fireEvent.click(screen.getByRole('checkbox', { name: 'Select all filtered records' }));
  assert.deepEqual([...selected].sort(), ['a', 'c'], 'Select all must only select matching records');
  fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
  fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Filter Name' }), { target: { value: 'Beta' } });
  assert.equal(bodyRows().length, 1);
  assert.ok(bodyRows()[0].textContent.includes('Beta'));
  fireEvent.click(screen.getByRole('button', { name: 'Delete record' }));
  assert.equal(deleted.length, 0);
  fireEvent.click(screen.getByRole('button', { name: 'No' }));
  await waitFor(() => assert.equal(screen.queryByRole('dialog') === null, true));
  assert.equal(deleted.length, 0);
  fireEvent.click(screen.getByRole('button', { name: 'Delete record' }));
  fireEvent.click(screen.getByRole('button', { name: 'Yes' }));
  assert.deepEqual(deleted, ['b']);
  await waitFor(() => assert.equal(screen.queryByRole('dialog') === null, true));
  fireEvent.change(screen.getByRole('textbox', { name: 'Filter Name' }), { target: { value: 'Missing' } });
  assert.ok(screen.getByText('No matching records'));
  fireEvent.click(screen.getAllByRole('button', { name: 'Clear filters' })[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
  assert.equal(bodyRows().length, 2);
  visibleRows = [rows[0]];
  view.rerender(app());
  assert.ok(bodyRows()[0].textContent.includes('Alpha'), 'A shrinking dataset must clamp the page rather than show an empty page');
  cleanup();
  console.log('SchemaTable checks passed: generic schema, numeric sorting, date search, filters, selection, pagination, disabled actions and Yes/No deletion.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { cleanup(); dom.window.close(); });
