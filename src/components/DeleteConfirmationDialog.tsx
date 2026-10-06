import { useEffect, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import {
  acceptDelete,
  cancelDelete,
  getPendingDelete,
  subscribeDeleteConfirmation,
} from "./deleteConfirmation";

export function DeleteConfirmationDialog() {
  const pending = useSyncExternalStore(
    subscribeDeleteConfirmation,
    getPendingDelete,
    () => null,
  );
  const location = useLocation();
  useEffect(() => {
    cancelDelete();
    return cancelDelete;
  }, [location.key]);
  return (
    <Dialog
      open={!!pending}
      onClose={cancelDelete}
      fullWidth
      maxWidth="xs"
      aria-labelledby="delete-confirmation-title"
      aria-describedby="delete-confirmation-message"
    >
      <DialogTitle id="delete-confirmation-title">
        Delete confirmation
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-confirmation-message">
          {pending?.message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus variant="outlined" onClick={cancelDelete}>
          No
        </Button>
        <Button color="error" variant="contained" onClick={acceptDelete}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
