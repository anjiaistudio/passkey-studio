import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import axios from "axios";

import {
  useEffect,
  useState,
} from "react";

import {
  getUsers,
} from "../api/userApi";

import {
  getPasskeys,
  renamePasskey,
  deletePasskey,
} from "../api/passkeyApi";

import type { User } from "../types/User";
import type { Passkey } from "../types/Passkey";

interface FeedbackState {
  severity: "success" | "error";
  message: string;
}

export default function ManagePasskeysPage() {
  const [users, setUsers] = useState<User[]>([]);

  const [selectedUserId, setSelectedUserId] =
    useState("");

  const [passkeys, setPasskeys] =
    useState<Passkey[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [renameTarget, setRenameTarget] =
    useState<Passkey | null>(null);

  const [renameValue, setRenameValue] =
    useState("");

  const [deleteTarget, setDeleteTarget] =
    useState<Passkey | null>(null);

  const [feedback, setFeedback] =
    useState<FeedbackState | null>(null);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setPasskeys([]);
      return;
    }

    loadPasskeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  async function loadPasskeys() {
    setLoading(true);

    try {
      const data = await getPasskeys(
        selectedUserId
      );

      setPasskeys(data);
    } catch {
      setFeedback({
        severity: "error",
        message: "Unable to load passkeys.",
      });
    } finally {
      setLoading(false);
    }
  }

  function openRenameDialog(passkey: Passkey) {
    setRenameTarget(passkey);
    setRenameValue(passkey.nickname);
  }

  async function confirmRename() {
    if (!renameTarget || !renameValue.trim()) {
      return;
    }

    try {
      await renamePasskey(
        renameTarget.id,
        renameValue.trim()
      );

      setRenameTarget(null);

      setFeedback({
        severity: "success",
        message: "Passkey renamed.",
      });

      loadPasskeys();
    } catch (exception: unknown) {
      setFeedback({
        severity: "error",
        message: axios.isAxiosError(exception)
          ? exception.response?.data?.detail ??
              "Rename failed."
          : "Rename failed.",
      });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      await deletePasskey(deleteTarget.id);

      setDeleteTarget(null);

      setFeedback({
        severity: "success",
        message: "Passkey deleted.",
      });

      loadPasskeys();
    } catch (exception: unknown) {
      setFeedback({
        severity: "error",
        message: axios.isAxiosError(exception)
          ? exception.response?.data?.detail ??
              "Delete failed."
          : "Delete failed.",
      });
    }
  }

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700 }}
        gutterBottom
      >
        Manage Passkeys
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Select a user to rename or revoke their
        registered passkeys.
      </Typography>

      <FormControl
        sx={{ mb: 3, minWidth: 260 }}
        size="small"
      >
        <InputLabel id="manage-passkeys-user-label">
          User
        </InputLabel>

        <Select
          labelId="manage-passkeys-user-label"
          label="User"
          value={selectedUserId}
          onChange={(event) =>
            setSelectedUserId(
              event.target.value
            )
          }
        >
          {users.map((user) => (
            <MenuItem
              key={user.id}
              value={user.id}
            >
              {user.display_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading && (
        <Stack spacing={2}>
          {[0, 1, 2].map((key) => (
            <Skeleton
              key={key}
              variant="rounded"
              height={120}
            />
          ))}
        </Stack>
      )}

      {!loading &&
        selectedUserId &&
        passkeys.length === 0 && (
          <Alert severity="info">
            This user has no registered passkeys.
          </Alert>
        )}

      {!loading && (
        <Stack spacing={2}>
          {passkeys.map((passkey) => (
            <Card
              key={passkey.id}
              variant="outlined"
            >
              <CardContent>
                <Stack
                  direction="row"
                  sx={{
                    justifyContent:
                      "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{ fontWeight: 700 }}
                    >
                      {passkey.nickname}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Device type:{" "}
                      {passkey.device_type ??
                        "Unknown"}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Sign count:{" "}
                      {passkey.sign_count}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1 }}
                    >
                      <Chip
                        size="small"
                        label={
                          passkey.backup_eligible
                            ? "Backup eligible"
                            : "Not backup eligible"
                        }
                        variant="outlined"
                      />

                      <Chip
                        size="small"
                        label={
                          passkey.backup_state
                            ? "Backed up"
                            : "Not backed up"
                        }
                        color={
                          passkey.backup_state
                            ? "success"
                            : "default"
                        }
                        variant="outlined"
                      />
                    </Stack>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      onClick={() =>
                        openRenameDialog(passkey)
                      }
                    >
                      Rename
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      onClick={() =>
                        setDeleteTarget(passkey)
                      }
                    >
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog
        open={Boolean(renameTarget)}
        onClose={() => setRenameTarget(null)}
      >
        <DialogTitle>Rename Passkey</DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Nickname"
            value={renameValue}
            onChange={(event) =>
              setRenameValue(event.target.value)
            }
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setRenameTarget(null)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={!renameValue.trim()}
            onClick={confirmRename}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
      >
        <DialogTitle>Delete Passkey</DialogTitle>

        <DialogContent>
          <Typography>
            Delete{" "}
            <strong>
              {deleteTarget?.nickname}
            </strong>
            ? This cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setDeleteTarget(null)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={4000}
        onClose={() => setFeedback(null)}
      >
        {feedback ? (
          <Alert
            severity={feedback.severity}
            onClose={() => setFeedback(null)}
          >
            {feedback.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
