import {
  useEffect,
  useState,
} from "react";

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

import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";

import {
  getUsers,
} from "../api/userApi";

import {
  generateRegistrationOptions,
  verifyRegistration,
} from "../api/passkeyApi";

import {
  createPasskey,
  credentialToJSON,
} from "../services/webauthn";

import PasskeyInfoPanel from "../components/PasskeyInfoPanel";

import type { User } from "../types/User";

function getRegistrationErrorMessage(
  error: unknown
) {

  if (
    error instanceof DOMException &&
    error.name === "InvalidStateError"
  ) {

    return "This authenticator is already registered for the selected user.";
  }

  return "Registration failed";
}

export default function
RegisterPasskeyPage() {

  const [users, setUsers] =
    useState<User[]>([]);

  const [
    selectedUserId,
    setSelectedUserId,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [
    result,
    setResult,
  ] = useState<any>();

  useEffect(() => {

    getUsers()
      .then(setUsers);

  }, []);

  async function register() {

    setLoading(true);
    setError("");
    setResult(undefined);

    try {

      const optionsResponse =
        await generateRegistrationOptions(
          selectedUserId
        );

      const credential =
        await createPasskey(
          optionsResponse.public_key
        );

      const verifyResponse =
        await verifyRegistration(
          optionsResponse.challenge_id,

          credentialToJSON(
            credential
          )
        );

      setResult(
        verifyResponse
      );

    } catch (exception) {

      console.error(exception);

      setError(
        getRegistrationErrorMessage(
          exception
        )
      );

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
        Register Passkey
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Select an account and create a new
        passkey using this device's
        authenticator.
      </Typography>

      <PasskeyInfoPanel ceremony="registration" />

      <Card sx={{ maxWidth: 650 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel id="register-passkey-user-label">
                User
              </InputLabel>

              <Select
                labelId="register-passkey-user-label"
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
                    {user.display_name} ({user.username})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              size="large"
              startIcon={<KeyOutlinedIcon />}
              disabled={
                loading || !selectedUserId
              }
              onClick={register}
            >
              {loading
                ? "Registering..."
                : "Register Passkey"}
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
                  Passkey registered
                </Typography>

                <Typography variant="body2">
                  Nickname: {result.nickname}
                </Typography>
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}