import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import axios from "axios";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createUser } from "../api/userApi";

import type { User } from "../types/User";

export default function RegisterUserPage() {
  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [displayName, setDisplayName] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [createdUser, setCreatedUser] =
    useState<User | null>(null);

  function resetForm() {
    setUsername("");
    setDisplayName("");
    setCreatedUser(null);
    setError("");
  }

  async function submit() {
    if (!username.trim() || !displayName.trim()) {
      setError(
        "Enter both a username and a display name."
      );
      return;
    }

    setSubmitting(true);
    setError("");
    setCreatedUser(null);

    try {
      const user = await createUser(
        username.trim(),
        displayName.trim()
      );

      setCreatedUser(user);
      setUsername("");
      setDisplayName("");
    } catch (exception: unknown) {
      setError(
        axios.isAxiosError(exception)
          ? exception.response?.data
              ?.detail ??
              "Unable to register the user."
          : "Unable to register the user."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/users")}
        sx={{ mb: 2 }}
      >
        Back to users
      </Button>

      <Typography
        variant="h4"
        sx={{ fontWeight: 700 }}
        gutterBottom
      >
        Register User
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 3, maxWidth: 650 }}
      >
        Create a new account so it can register
        passkeys.
      </Typography>

      <Card
        variant="outlined"
        sx={{ maxWidth: 500 }}
      >
        <CardContent>
          <Stack spacing={3}>
            <TextField
              label="Username"
              placeholder="jane@example.com"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value
                )
              }
              disabled={submitting}
              fullWidth
            />

            <TextField
              label="Display name"
              placeholder="Jane Example"
              value={displayName}
              onChange={(event) =>
                setDisplayName(
                  event.target.value
                )
              }
              disabled={submitting}
              fullWidth
            />

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            {createdUser && (
              <Alert severity="success">
                {createdUser.display_name}{" "}
                was registered successfully.
              </Alert>
            )}

            <Stack
              direction="row"
              spacing={2}
            >
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                disabled={submitting}
                onClick={submit}
              >
                {submitting
                  ? "Registering..."
                  : "Register user"}
              </Button>

              {createdUser && (
                <Button
                  onClick={() =>
                    navigate(
                      `/users/${createdUser.id}`
                    )
                  }
                >
                  View user
                </Button>
              )}

              {createdUser && (
                <Button onClick={resetForm}>
                  Register another
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
