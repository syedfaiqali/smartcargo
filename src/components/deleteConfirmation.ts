type PendingDelete = { action: () => void; message: string };
let pending: PendingDelete | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function confirmDelete(
  action: () => void,
  message = "Are you sure you want to delete this item?",
) {
  if (pending) return;
  pending = { action, message };
  notify();
}

export function getPendingDelete() {
  return pending;
}
export function subscribeDeleteConfirmation(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function cancelDelete() {
  pending = null;
  notify();
}
export function acceptDelete() {
  const action = pending?.action;
  cancelDelete();
  action?.();
}
