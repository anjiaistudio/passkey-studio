import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import FingerprintIcon
  from "@mui/icons-material/Fingerprint";

import axios from "axios";
import { useState } from "react";

import {
  generateDiscoverableAuthenticationOptions,
  verifyDiscoverableAuthentication,
} from "../api/passkeyApi";

import {
  assertionToJSON,
  getPasskeyAssertion,
  isPasskeySupported,
} from "../services/webauthn";


export default function
UsernameLessAuthenticationPage() {
  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState<any>(null);


  async function authenticate() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const optionsResponse =
        await generateDiscoverableAuthenticationOptions();

      const credential =
        await getPasskeyAssertion(
          optionsResponse.public_key
        );

      const verificationResponse =
        await verifyDiscoverableAuthentication(
          optionsResponse.challenge_id,
          assertionToJSON(credential)
        );

      setResult(verificationResponse);

    } catch (exception: unknown) {
      if (axios.isAxiosError(exception)) {
        setError(
          exception.response?.data?.detail ??
            "Username-less authentication failed"
        );
      } else if (
        exception instanceof DOMException
      ) {
        if (
          exception.name === "NotAllowedError"
        ) {
          setError(
            "Authentication was cancelled, " +
              "timed out, or no discoverable " +
              "passkey was available."
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
        Username-less Login
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Sign in without entering a username.
        Your authenticator will discover eligible
        passkeys for Passkey Studio.
      </Typography>

      {!isPasskeySupported() && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          This browser does not support WebAuthn.
        </Alert>
      )}

      <Card sx={{ maxWidth: 650 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack
            spacing={3}
            sx={{ alignItems: "flex-start" }}
          >
            <FingerprintIcon
              color="primary"
              sx={{ fontSize: 64 }}
            />

            <Typography variant="h6">
              Sign in with a passkey
            </Typography>

            <Typography color="text.secondary">
              No username is required. Choose an
              available passkey when prompted by
              your browser or operating system.
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<FingerprintIcon />}
              disabled={
                loading ||
                !isPasskeySupported()
              }
              onClick={authenticate}
            >
              {loading
                ? "Checking passkeys..."
                : "Continue with Passkey"}
            </Button>

            {loading && <CircularProgress />}

            {error && (
              <Alert
                severity="error"
                sx={{ width: "100%" }}
              >
                {error}
              </Alert>
            )}

            {result && (
              <Alert
                severity="success"
                sx={{ width: "100%" }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  Welcome, {result.display_name}
                </Typography>

                <Typography variant="body2">
                  Username: {result.username}
                </Typography>

                <Typography variant="body2">
                  Passkey: {result.nickname}
                </Typography>

                <Typography variant="body2">
                  Signature count:
                  {" "}
                  {result.sign_count}
                </Typography>
              </Alert>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}