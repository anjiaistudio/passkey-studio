import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import KeyIcon from "@mui/icons-material/Key";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import axios from "axios";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { getUsers } from "../../api/userApi";

import {
  generatePlaygroundRegistrationOptions,
  verifyPlaygroundRegistration,
} from "../../api/passkeyApi";

import {
  createPasskey,
  credentialToJSON,
  isPasskeySupported,
} from "../../services/webauthn";

import JsonViewer from
  "../../components/playground/JsonViewer";

import type {
  RegistrationPlaygroundConfiguration,
} from "../../types/Playground";

import type { User } from "../../types/User";

type CeremonyStatus =
  | "ready"
  | "generating"
  | "awaiting-authenticator"
  | "verifying"
  | "success"
  | "error";

interface AlgorithmOption {
  id: number;

  name: string;

  description: string;

  recommended: boolean;
}

const algorithmOptions:
AlgorithmOption[] = [
  {
    id: -7,
    name: "ES256",
    description:
      "ECDSA using the P-256 curve and SHA-256.",
    recommended: true,
  },
  {
    id: -257,
    name: "RS256",
    description:
      "RSA PKCS#1 v1.5 signature using SHA-256.",
    recommended: true,
  },
  {
    id: -8,
    name: "EdDSA",
    description:
      "Edwards-curve digital signature algorithm.",
    recommended: false,
  },
];

const defaultConfiguration:
RegistrationPlaygroundConfiguration = {
  userId: "",
  nickname: "Playground Passkey",
  authenticatorAttachment: "",
  residentKey: "required",
  userVerification: "required",
  attestation: "none",
  algorithms: [-7, -257],
};

export default function
PlaygroundRegistrationPage() {
  const [users, setUsers] =
    useState<User[]>([]);

  const [
    configuration,
    setConfiguration,
  ] = useState<
    RegistrationPlaygroundConfiguration
  >(defaultConfiguration);

  const [status, setStatus] =
    useState<CeremonyStatus>("ready");

  const [
    registrationOptions,
    setRegistrationOptions,
  ] = useState<unknown>(null);

  const [
    browserCredential,
    setBrowserCredential,
  ] = useState<unknown>(null);

  const [
    verificationResult,
    setVerificationResult,
  ] = useState<unknown>(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    getUsers()
      .then((response) => {
        setUsers(response);
      })
      .catch(() => {
        setError(
          "Unable to load users from the backend."
        );

        setStatus("error");
      });
  }, []);

  const activeStep = useMemo(() => {
    switch (status) {
      case "ready":
      case "generating":
        return 0;

      case "awaiting-authenticator":
        return 1;

      case "verifying":
        return 2;

      case "success":
        return 3;

      case "error":
      default:
        return 0;
    }
  }, [status]);

  const isRunning =
    status === "generating" ||
    status ===
      "awaiting-authenticator" ||
    status === "verifying";

  function updateConfiguration<
    Key extends keyof
      RegistrationPlaygroundConfiguration
  >(
    key: Key,
    value:
      RegistrationPlaygroundConfiguration[Key]
  ) {
    setConfiguration((current) => ({
      ...current,

      [key]: value,
    }));
  }

  function toggleAlgorithm(
    algorithmId: number
  ) {
    setConfiguration((current) => {
      const selected =
        current.algorithms.includes(
          algorithmId
        );

      return {
        ...current,

        algorithms: selected
          ? current.algorithms.filter(
              (value) =>
                value !== algorithmId
            )
          : [
              ...current.algorithms,
              algorithmId,
            ],
      };
    });
  }

  function validateConfiguration():
  string | null {
    if (!configuration.userId) {
      return "Select a user.";
    }

    if (
      !configuration.nickname.trim()
    ) {
      return (
        "Enter a nickname for the passkey."
      );
    }

    if (
      configuration.algorithms.length === 0
    ) {
      return (
        "Select at least one " +
        "public-key algorithm."
      );
    }

    return null;
  }

  function getErrorMessage(
    exception: unknown
  ): string {
    if (axios.isAxiosError(exception)) {
      return (
        exception.response?.data?.detail ??
        "The registration API request failed."
      );
    }

    if (
      exception instanceof DOMException
    ) {
      switch (exception.name) {
        case "NotAllowedError":
          return (
            "Registration was cancelled, " +
            "timed out, or rejected by " +
            "the authenticator."
          );

        case "InvalidStateError":
          return (
            "This authenticator may already " +
            "contain a passkey for the " +
            "selected account."
          );

        case "NotSupportedError":
          return (
            "The selected combination of " +
            "algorithms or authenticator " +
            "options is not supported."
          );

        case "SecurityError":
          return (
            "The WebAuthn RP ID or origin " +
            "configuration is invalid."
          );

        default:
          return exception.message;
      }
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return (
      "An unexpected registration " +
      "failure occurred."
    );
  }

  async function runRegistration() {
    const validationError =
      validateConfiguration();

    if (validationError) {
      setError(validationError);
      setStatus("error");
      return;
    }

    setError("");
    setRegistrationOptions(null);
    setBrowserCredential(null);
    setVerificationResult(null);

    try {
      setStatus("generating");

      const optionsResponse =
        await generatePlaygroundRegistrationOptions(
          configuration
        );

      const optionsForDisplay = {
        challenge_id:
          optionsResponse.challenge_id,

        public_key:
          optionsResponse.public_key,
      };

      setRegistrationOptions(
        optionsForDisplay
      );

      setStatus(
        "awaiting-authenticator"
      );

      const credential =
        await createPasskey(
          optionsResponse.public_key
        );

      const serializedCredential =
        credentialToJSON(credential);

      setBrowserCredential(
        serializedCredential
      );

      setStatus("verifying");

      const result =
        await verifyPlaygroundRegistration(
          optionsResponse.challenge_id,
          configuration.nickname.trim(),
          serializedCredential
        );

      setVerificationResult(result);
      setStatus("success");
    } catch (exception: unknown) {
      setError(
        getErrorMessage(exception)
      );

      setStatus("error");
    }
  }

  function resetPlayground() {
    setConfiguration(
      defaultConfiguration
    );

    setRegistrationOptions(null);
    setBrowserCredential(null);
    setVerificationResult(null);

    setError("");
    setStatus("ready");
  }

  return (
    <Box>
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={2}
        sx={{
          mb: 3,
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700 }}
            gutterBottom
          >
            Registration Playground
          </Typography>

          <Typography
            color="text.secondary"
          >
            Configure, execute and inspect
            a complete WebAuthn registration
            ceremony.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ flexWrap: "wrap" }}
        >
          <Chip
            label={
              `Browser host: ` +
              window.location.hostname
            }
            variant="outlined"
          />

          <Chip
            label={
              isPasskeySupported()
                ? "WebAuthn supported"
                : "WebAuthn unavailable"
            }
            color={
              isPasskeySupported()
                ? "success"
                : "error"
            }
          />
        </Stack>
      </Stack>

      <Stepper
        activeStep={activeStep}
        sx={{
          mb: 4,
        }}
      >
        <Step>
          <StepLabel>
            Generate options
          </StepLabel>
        </Step>

        <Step>
          <StepLabel>
            Authenticator
          </StepLabel>
        </Step>

        <Step>
          <StepLabel>
            Server verification
          </StepLabel>
        </Step>

        <Step>
          <StepLabel>
            Complete
          </StepLabel>
        </Step>
      </Stepper>

      {!isPasskeySupported() && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          WebAuthn is not supported in this
          browser or browsing context.
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",

            lg: "380px minmax(0, 1fr)",
          },

          gap: 3,

          alignItems: "start",
        }}
      >
        <Card
          variant="outlined"
          sx={{
            position: {
              lg: "sticky",
            },

            top: {
              lg: 24,
            },
          }}
        >
          <CardContent>
            <Stack spacing={3}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700 }}
              >
                Registration parameters
              </Typography>

              <FormControl fullWidth>
                <InputLabel
                  id="playground-user-label"
                >
                  User
                </InputLabel>

                <Select
                  labelId={
                    "playground-user-label"
                  }
                  label="User"
                  value={
                    configuration.userId
                  }
                  disabled={isRunning}
                  onChange={(event) =>
                    updateConfiguration(
                      "userId",
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
                      {" ("}
                      {user.username}
                      {")"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Passkey nickname"
                value={
                  configuration.nickname
                }
                disabled={isRunning}
                slotProps={{
                  htmlInput: {
                    maxLength: 100,
                  },
                }}
                onChange={(event) =>
                  updateConfiguration(
                    "nickname",
                    event.target.value
                  )
                }
              />

              <FormControl fullWidth>
                <InputLabel
                  id={
                    "authenticator-attachment-label"
                  }
                >
                  Authenticator attachment
                </InputLabel>

                <Select
                  labelId={
                    "authenticator-attachment-label"
                  }
                  label={
                    "Authenticator attachment"
                  }
                  value={
                    configuration
                      .authenticatorAttachment
                  }
                  disabled={isRunning}
                  onChange={(event) =>
                    updateConfiguration(
                      "authenticatorAttachment",

                      event.target.value as
                        RegistrationPlaygroundConfiguration[
                          "authenticatorAttachment"
                        ]
                    )
                  }
                >
                  <MenuItem value="">
                    Any authenticator
                  </MenuItem>

                  <MenuItem value="platform">
                    Platform
                  </MenuItem>

                  <MenuItem
                    value="cross-platform"
                  >
                    Cross-platform
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel
                  id="resident-key-label"
                >
                  Resident key
                </InputLabel>

                <Select
                  labelId={
                    "resident-key-label"
                  }
                  label="Resident key"
                  value={
                    configuration.residentKey
                  }
                  disabled={isRunning}
                  onChange={(event) =>
                    updateConfiguration(
                      "residentKey",

                      event.target.value as
                        RegistrationPlaygroundConfiguration[
                          "residentKey"
                        ]
                    )
                  }
                >
                  <MenuItem value="required">
                    Required
                  </MenuItem>

                  <MenuItem value="preferred">
                    Preferred
                  </MenuItem>

                  <MenuItem
                    value="discouraged"
                  >
                    Discouraged
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel
                  id={
                    "user-verification-label"
                  }
                >
                  User verification
                </InputLabel>

                <Select
                  labelId={
                    "user-verification-label"
                  }
                  label="User verification"
                  value={
                    configuration
                      .userVerification
                  }
                  disabled={isRunning}
                  onChange={(event) =>
                    updateConfiguration(
                      "userVerification",

                      event.target.value as
                        RegistrationPlaygroundConfiguration[
                          "userVerification"
                        ]
                    )
                  }
                >
                  <MenuItem value="required">
                    Required
                  </MenuItem>

                  <MenuItem value="preferred">
                    Preferred
                  </MenuItem>

                  <MenuItem
                    value="discouraged"
                  >
                    Discouraged
                  </MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel
                  id="attestation-label"
                >
                  Attestation
                </InputLabel>

                <Select
                  labelId={
                    "attestation-label"
                  }
                  label="Attestation"
                  value={
                    configuration.attestation
                  }
                  disabled={isRunning}
                  onChange={(event) =>
                    updateConfiguration(
                      "attestation",

                      event.target.value as
                        RegistrationPlaygroundConfiguration[
                          "attestation"
                        ]
                    )
                  }
                >
                  <MenuItem value="none">
                    None
                  </MenuItem>

                  <MenuItem value="indirect">
                    Indirect
                  </MenuItem>

                  <MenuItem value="direct">
                    Direct
                  </MenuItem>

                  <MenuItem value="enterprise">
                    Enterprise
                  </MenuItem>
                </Select>
              </FormControl>

              <Divider />

              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700 }}
                  >
                    Public-key algorithms
                  </Typography>

                  <Tooltip
                    title={
                      "Algorithms are sent " +
                      "to the authenticator " +
                      "in the selected order."
                    }
                  >
                    <InfoOutlinedIcon
                      fontSize="small"
                      color="action"
                    />
                  </Tooltip>
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    mb: 1,
                  }}
                >
                  Select one or more COSE
                  algorithms.
                </Typography>

                <FormGroup>
                  {algorithmOptions.map(
                    (algorithm) => (
                      <Tooltip
                        key={algorithm.id}
                        title={
                          algorithm.description
                        }
                        placement="right"
                      >
                        <FormControlLabel
                          disabled={isRunning}
                          control={
                            <Checkbox
                              checked={
                                configuration
                                  .algorithms
                                  .includes(
                                    algorithm.id
                                  )
                              }
                              onChange={() =>
                                toggleAlgorithm(
                                  algorithm.id
                                )
                              }
                            />
                          }
                          label={
                            <Stack
                              direction="row"
                              spacing={1}
                              sx={{ alignItems: "center" }}
                            >
                              <Typography
                                variant="body2"
                              >
                                {algorithm.name}
                                {" ("}
                                {algorithm.id}
                                {")"}
                              </Typography>

                              {algorithm
                                .recommended && (
                                <Chip
                                  label={
                                    "Recommended"
                                  }
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                            </Stack>
                          }
                        />
                      </Tooltip>
                    )
                  )}
                </FormGroup>
              </Box>

              <Button
                variant="contained"
                size="large"
                startIcon={<KeyIcon />}
                disabled={
                  isRunning ||
                  !isPasskeySupported()
                }
                onClick={runRegistration}
              >
                {isRunning
                  ? "Ceremony in progress"
                  : "Generate and Register"}
              </Button>

              <Button
                variant="outlined"
                startIcon={
                  <RestartAltIcon />
                }
                disabled={isRunning}
                onClick={resetPlayground}
              >
                Reset playground
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={3}>
          {status === "generating" && (
            <Alert severity="info">
              Generating registration options
              and persisting the challenge.
            </Alert>
          )}

          {status ===
            "awaiting-authenticator" && (
            <Alert severity="info">
              Registration options were
              generated. Complete the browser
              or authenticator prompt.
            </Alert>
          )}

          {status === "verifying" && (
            <Alert severity="info">
              The browser returned a
              credential. The backend is
              verifying the registration
              response.
            </Alert>
          )}

          {status === "success" && (
            <Alert severity="success">
              The passkey registration
              ceremony completed successfully.
            </Alert>
          )}

          {status === "error" &&
            error && (
              <Alert severity="error">
                {error}
              </Alert>
            )}

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",

                xl:
                  "repeat(2, minmax(0, 1fr))",
              },

              gap: 3,
            }}
          >
            <JsonViewer
              title="Registration Options"
              value={registrationOptions}
              emptyMessage={
                "Generate registration " +
                "options to inspect the " +
                "server-created request."
              }
            />

            <JsonViewer
              title="Browser Credential"
              value={browserCredential}
              emptyMessage={
                "The browser credential " +
                "will appear after the " +
                "authenticator completes " +
                "the ceremony."
              }
            />
          </Box>

          <JsonViewer
            title={
              "Server Verification Result"
            }
            value={verificationResult}
            emptyMessage={
              "The result will appear after " +
              "the backend validates and " +
              "stores the credential."
            }
          />
        </Stack>
      </Box>
    </Box>
  );
}