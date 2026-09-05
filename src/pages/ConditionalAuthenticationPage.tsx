import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import FingerprintIcon from "@mui/icons-material/Fingerprint";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import axios from "axios";
import { useEffect, useRef, useState } from "react";

import {
  generateConditionalAuthenticationOptions,
  verifyDiscoverableAuthentication,
} from "../api/passkeyApi";

import {
  assertionToJSON,
  getConditionalPasskeyAssertion,
  isConditionalMediationSupported,
} from "../services/webauthn";

type ConditionalStatus =
  | "checking"
  | "unsupported"
  | "starting"
  | "waiting"
  | "verifying"
  | "success"
  | "error";

export default function ConditionalAuthenticationPage() {
  const [status, setStatus] =
    useState<ConditionalStatus>("checking");

  const [error, setError] = useState("");

  const [result, setResult] = useState<any>(null);

  const abortControllerRef =  useRef<AbortController | null>(null);

  useEffect(() => {
    startConditionalAuthentication();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  async function startConditionalAuthentication() {
    abortControllerRef.current?.abort();

    setStatus("checking");
    setError("");
    setResult(null);

    const supported =
      await isConditionalMediationSupported();

    if (!supported) {
      setStatus("unsupported");
      return;
    }

    const abortController =
      new AbortController();

    abortControllerRef.current =
      abortController;

    try {
      setStatus("starting");

      const optionsResponse =
        await generateConditionalAuthenticationOptions();

      setStatus("waiting");

      const credential =
        await getConditionalPasskeyAssertion(
          optionsResponse.public_key,
          abortController.signal
        );

      setStatus("verifying");

      const verificationResponse =
        await verifyDiscoverableAuthentication(
          optionsResponse.challenge_id,
          assertionToJSON(credential)
        );

      setResult(verificationResponse);

      setStatus("success");

    } catch (exception: unknown) {

      if (
        exception instanceof DOMException &&
        exception.name === "AbortError"
      ) {
        return;
      }

      if (axios.isAxiosError(exception)) {

        setError(
          exception.response?.data?.detail ??
          "Conditional authentication failed"
        );

      } else if (
        exception instanceof DOMException
      ) {

        if (
          exception.name === "NotAllowedError"
        ) {

          setError(
            "Authentication was cancelled or no matching passkey was available."
          );

        } else {

          setError(
            exception.message
          );
        }

      } else if (
        exception instanceof Error
      ) {

        setError(
          exception.message
        );

      } else {

        setError(
          "Unexpected authentication failure"
        );
      }

      setStatus("error");
    }
  }

  const busy =
    status === "checking" ||
    status === "starting" ||
    status === "verifying";

  return (
    <Box>

      <Typography
        variant="h4"
        sx={{ fontWeight: 700 }}
        gutterBottom
      >
        Conditional UI
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Experience modern Passkey Autofill using
        WebAuthn Conditional Mediation.
      </Typography>

      <Card
        sx={{
          maxWidth: 700,
        }}
      >

        <CardContent
          sx={{
            p: 4,
          }}
        >

          <Stack spacing={3}>

            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: "center" }}
            >

              <FingerprintIcon
                color="primary"
              />

              <Typography variant="h6">
                Passkey Autofill Login
              </Typography>

              {status === "waiting" && (

                <Chip
                  label="Waiting for user selection"
                  color="primary"
                  size="small"
                />

              )}

            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Click into the username field below.
              If your browser supports Conditional UI,
              passkey suggestions should appear in the
              autofill dropdown.
            </Typography>

            <TextField
              label="Username / Email"
              fullWidth
              autoComplete="username webauthn"
              helperText="Focus this field and look for passkey suggestions."
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              autoComplete="current-password"
              helperText="Password login is not implemented. This field exists only to mimic a real login form."
            />

            {busy && (

              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: "center" }}
              >

                <CircularProgress size={24} />

                <Typography>
                  Preparing passkey autofill...
                </Typography>

              </Stack>

            )}

            {status === "waiting" && (

              <Alert severity="info">
                Conditional authentication is active.
                Focus the username field to view passkey suggestions.
              </Alert>

            )}

            {status === "unsupported" && (

              <Alert severity="warning">
                Your browser does not currently support
                Conditional Mediation. Use Username-less Login instead.
              </Alert>

            )}

            {status === "error" && (

              <Alert severity="error">
                {error}
              </Alert>

            )}

            {status === "success" &&
              result && (

                <Alert severity="success">

                  <Typography
                    sx={{ fontWeight: 700 }}
                  >
                    Welcome {result.display_name}
                  </Typography>

                  <Typography variant="body2">
                    Username: {result.username}
                  </Typography>

                  <Typography variant="body2">
                    Passkey: {result.nickname}
                  </Typography>

                  <Typography variant="body2">
                    Sign Count: {result.sign_count}
                  </Typography>

                </Alert>

            )}

            <Button
              variant="outlined"
              startIcon={
                <RestartAltIcon />
              }
              disabled={busy}
              onClick={
                startConditionalAuthentication
              }
            >
              Restart Conditional Request
            </Button>

          </Stack>

        </CardContent>

      </Card>

    </Box>
  );
}