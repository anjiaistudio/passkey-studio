import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import LockOutlinedIcon
  from "@mui/icons-material/LockOutlined";

import { useEffect, useState } from "react";
import axios from "axios";

import { getUsers } from "../api/userApi";

import {
  generateAuthenticationOptions,
  verifyAuthentication,
} from "../api/passkeyApi";

import {
  assertionToJSON,
  getPasskeyAssertion,
  isPasskeySupported,
} from "../services/webauthn";

import PasskeyInfoPanel from "../components/PasskeyInfoPanel";

import type { User } from "../types/User";


export default function AuthenticationPage() {
  const [users, setUsers] =
    useState<User[]>([]);

  const [selectedUserId, setSelectedUserId] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState<any>(null);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch(() => {
        setError("Unable to load users");
      });
  }, []);

  async function authenticate() {
    if (!selectedUserId) {
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const optionsResponse =
        await generateAuthenticationOptions(
          selectedUserId
        );

      const credential =
        await getPasskeyAssertion(
          optionsResponse.public_key
        );

      const verificationResponse =
        await verifyAuthentication(
          optionsResponse.challenge_id,
          assertionToJSON(credential)
        );

      setResult(verificationResponse);

    } catch (exception: unknown) {
      if (axios.isAxiosError(exception)) {
        setError(
          exception.response?.data?.detail ??
            "Passkey authentication failed"
        );
      } else if (
        exception instanceof DOMException
      ) {
        if (exception.name === "NotAllowedError") {
          setError(
            "Authentication was cancelled, timed out, " +
              "or no matching passkey was available."
          );
        } else {
          setError(exception.message);
        }
      } else if (
        exception instanceof Error
      ) {
        setError(exception.message);
      } else {
        setError(
          "Unexpected authentication failure"
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700 }}
        gutterBottom
      >
        Passkey Authentication
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Select an account and authenticate using
        one of its registered passkeys.
      </Typography>

      {!isPasskeySupported() && (
        <Alert severity="error" sx={{ mb: 3 }}>
          This browser does not support WebAuthn.
        </Alert>
      )}

      <PasskeyInfoPanel ceremony="authentication" />

      <Card sx={{ maxWidth: 650 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel id="authentication-user-label">
                User
              </InputLabel>

              <Select
                labelId="authentication-user-label"
                value={selectedUserId}
                label="User"
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
                    {user.display_name} ({user.username})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              size="large"
              startIcon={<LockOutlinedIcon />}
              disabled={
                loading ||
                !selectedUserId ||
                !isPasskeySupported()
              }
              onClick={authenticate}
            >
              {loading
                ? "Authenticating..."
                : "Authenticate with Passkey"}
            </Button>

            {loading && <CircularProgress />}

            {error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

            {result && (
              <Alert severity="success">
                <Typography sx={{ fontWeight: 700 }}>
                  Authentication successful
                </Typography>

                <Typography variant="body2">
                  Passkey: {result.nickname}
                </Typography>

                <Typography variant="body2">
                  Signature count: {result.sign_count}
                </Typography>
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}