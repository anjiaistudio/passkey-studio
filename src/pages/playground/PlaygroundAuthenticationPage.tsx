import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";

import FingerprintIcon from
  "@mui/icons-material/Fingerprint";

import RestartAltIcon from
  "@mui/icons-material/RestartAlt";

import CancelIcon from
  "@mui/icons-material/Cancel";

import axios from "axios";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getUsers,
} from "../../api/userApi";

import {
  generatePlaygroundAuthenticationOptions,
  verifyPlaygroundAuthentication,
} from "../../api/passkeyApi";

import {
  assertionToJSON,
  getConditionalPasskeyAssertion,
  getPasskeyAssertion,
  isConditionalMediationSupported,
  isPasskeySupported,
} from "../../services/webauthn";

import JsonViewer from
  "../../components/playground/JsonViewer";

import type {
  AuthenticationCeremonyMode,
  AuthenticationPlaygroundConfiguration,
} from "../../types/Playground";

import type {
  User,
} from "../../types/User";


type CeremonyStatus =
  | "ready"
  | "checking-support"
  | "generating"
  | "awaiting-authenticator"
  | "waiting-conditional"
  | "verifying"
  | "success"
  | "error";


interface PlaygroundError {
  message: string;

  errorName?: string;

  httpStatus?: number;

  backendDetail?: unknown;
}


const defaultConfiguration:
AuthenticationPlaygroundConfiguration = {
  ceremonyMode: "username_first",

  userId: "",

  userVerification: "required",
};


export default function
PlaygroundAuthenticationPage() {
  const [users, setUsers] =
    useState<User[]>([]);

  const [
    configuration,
    setConfiguration,
  ] = useState<
    AuthenticationPlaygroundConfiguration
  >(defaultConfiguration);

  const [status, setStatus] =
    useState<CeremonyStatus>("ready");

  const [
    conditionalSupported,
    setConditionalSupported,
  ] = useState<boolean | null>(null);

  const [
    authenticationOptions,
    setAuthenticationOptions,
  ] = useState<unknown>(null);

  const [
    browserAssertion,
    setBrowserAssertion,
  ] = useState<unknown>(null);

  const [
    verificationResult,
    setVerificationResult,
  ] = useState<unknown>(null);

  const [
    playgroundError,
    setPlaygroundError,
  ] = useState<PlaygroundError | null>(
    null
  );

  const abortControllerRef =
    useRef<AbortController | null>(null);

  const mountedRef =
    useRef(true);


  useEffect(() => {
    mountedRef.current = true;

    getUsers()
      .then((response) => {
        if (mountedRef.current) {
          setUsers(response);
        }
      })
      .catch((exception: unknown) => {
        if (!mountedRef.current) {
          return;
        }

        setPlaygroundError(
          buildPlaygroundError(exception)
        );

        setStatus("error");
      });

    isConditionalMediationSupported()
      .then((supported) => {
        if (mountedRef.current) {
          setConditionalSupported(
            supported
          );
        }
      })
      .catch(() => {
        if (mountedRef.current) {
          setConditionalSupported(false);
        }
      });

    return () => {
      mountedRef.current = false;

      abortControllerRef.current?.abort();

      abortControllerRef.current = null;
    };
  }, []);


  const activeStep = useMemo(() => {
    switch (status) {
      case "ready":
      case "checking-support":
      case "generating":
      case "error":
        return 0;

      case "awaiting-authenticator":
      case "waiting-conditional":
        return 1;

      case "verifying":
        return 2;

      case "success":
        return 3;

      default:
        return 0;
    }
  }, [status]);


  const isRunning =
    status === "checking-support" ||
    status === "generating" ||
    status === "awaiting-authenticator" ||
    status === "waiting-conditional" ||
    status === "verifying";


  const isConditionalMode =
    configuration.ceremonyMode ===
    "conditional";


  const requestExplanation =
    useMemo(() => {
      switch (
        configuration.ceremonyMode
      ) {
        case "username_first":
          return (
            "The server knows the user before " +
            "authentication and returns that " +
            "user's credential IDs in " +
            "allowCredentials."
          );

        case "username_less":
          return (
            "The server does not know the user. " +
            "allowCredentials is omitted so the " +
            "authenticator can discover eligible " +
            "credentials for this RP."
          );

        case "conditional":
          return (
            "The discoverable authentication " +
            "request uses conditional mediation. " +
            "Focus the username field and select " +
            "a passkey from browser autofill."
          );

        default:
          return "";
      }
    }, [configuration.ceremonyMode]);


  const userVerificationExplanation =
    useMemo(() => {
      switch (
        configuration.userVerification
      ) {
        case "required":
          return (
            "The authenticator is asked to perform " +
            "user verification, and the backend " +
            "requires the UV flag."
          );

        case "preferred":
          return (
            "The authenticator is asked to perform " +
            "user verification where possible. " +
            "The backend does not reject solely " +
            "because the UV flag is absent."
          );

        case "discouraged":
          return (
            "The authenticator is asked to avoid " +
            "user verification where possible. " +
            "User presence and the cryptographic " +
            "assertion are still required."
          );

        default:
          return "";
      }
    }, [configuration.userVerification]);


  function updateConfiguration<
    Key extends keyof
      AuthenticationPlaygroundConfiguration
  >(
    key: Key,
    value:
      AuthenticationPlaygroundConfiguration[Key]
  ) {
    setConfiguration((current) => ({
      ...current,

      [key]: value,
    }));
  }


  function changeCeremonyMode(
    mode: AuthenticationCeremonyMode
  ) {
    abortControllerRef.current?.abort();

    abortControllerRef.current = null;

    setConfiguration((current) => ({
      ...current,

      ceremonyMode: mode,
    }));

    clearCeremonyOutput();
  }


  function clearCeremonyOutput() {
    setAuthenticationOptions(null);

    setBrowserAssertion(null);

    setVerificationResult(null);

    setPlaygroundError(null);

    setStatus("ready");
  }


  function resetPlayground() {
    abortControllerRef.current?.abort();

    abortControllerRef.current = null;

    setConfiguration({
      ...defaultConfiguration,
    });

    clearCeremonyOutput();
  }


  function validateConfiguration():
  string | null {
    if (!isPasskeySupported()) {
      return (
        "WebAuthn is not supported in this " +
        "browser or browsing context."
      );
    }

    if (
      configuration.ceremonyMode ===
        "username_first" &&
      !configuration.userId
    ) {
      return (
        "Select a user for username-first " +
        "authentication."
      );
    }

    if (
      configuration.ceremonyMode ===
        "conditional" &&
      conditionalSupported === false
    ) {
      return (
        "Conditional mediation is unavailable " +
        "in this browser or environment."
      );
    }

    return null;
  }


  function buildPlaygroundError(
    exception: unknown
  ): PlaygroundError {
    if (axios.isAxiosError(exception)) {
      const backendDetail =
        exception.response?.data?.detail;

      return {
        message:
          typeof backendDetail === "string"
            ? backendDetail
            : (
                "The authentication API " +
                "request failed."
              ),

        errorName:
          exception.name,

        httpStatus:
          exception.response?.status,

        backendDetail,
      };
    }

    if (
      exception instanceof DOMException
    ) {
      switch (exception.name) {
        case "AbortError":
          return {
            message:
              "The authentication request " +
              "was cancelled.",

            errorName:
              exception.name,
          };

        case "NotAllowedError":
          return {
            message:
              "Authentication was cancelled, " +
              "timed out, or no matching " +
              "passkey was available.",

            errorName:
              exception.name,
          };

        case "SecurityError":
          return {
            message:
              "The WebAuthn RP ID or browser " +
              "origin is not valid for this " +
              "authentication request.",

            errorName:
              exception.name,
          };

        case "InvalidStateError":
          return {
            message:
              "The authenticator was not in a " +
              "valid state for this request.",

            errorName:
              exception.name,
          };

        case "NotSupportedError":
          return {
            message:
              "The requested authentication " +
              "options are not supported by " +
              "this browser or authenticator.",

            errorName:
              exception.name,
          };

        default:
          return {
            message:
              exception.message ||
              (
                "A browser WebAuthn error " +
                "occurred."
              ),

            errorName:
              exception.name,
          };
      }
    }

    if (exception instanceof Error) {
      return {
        message:
          exception.message,

        errorName:
          exception.name,
      };
    }

    return {
      message:
        "An unexpected authentication " +
        "failure occurred.",
    };
  }


  async function runAuthentication() {
    const validationError =
      validateConfiguration();

    if (validationError) {
      setPlaygroundError({
        message: validationError,
      });

      setStatus("error");

      return;
    }

    abortControllerRef.current?.abort();

    abortControllerRef.current = null;

    setAuthenticationOptions(null);

    setBrowserAssertion(null);

    setVerificationResult(null);

    setPlaygroundError(null);

    try {
      if (isConditionalMode) {
        setStatus("checking-support");

        const supported =
          await isConditionalMediationSupported();

        if (!mountedRef.current) {
          return;
        }

        setConditionalSupported(supported);

        if (!supported) {
          throw new Error(
            "Conditional mediation is not " +
            "supported in this browser."
          );
        }
      }

      setStatus("generating");

      const configurationSnapshot = {
        ...configuration,
      };

      const optionsResponse =
        await generatePlaygroundAuthenticationOptions(
          configurationSnapshot
        );

      if (!mountedRef.current) {
        return;
      }

      setAuthenticationOptions({
        challenge_id:
          optionsResponse.challenge_id,

        ceremony_mode:
          configurationSnapshot
            .ceremonyMode,

        user_verification:
          configurationSnapshot
            .userVerification,

        public_key:
          optionsResponse.public_key,
      });

      let credential:
        PublicKeyCredential;

      if (
        configurationSnapshot
          .ceremonyMode === "conditional"
      ) {
        const abortController =
          new AbortController();

        abortControllerRef.current =
          abortController;

        setStatus("waiting-conditional");

        credential =
          await getConditionalPasskeyAssertion(
            optionsResponse.public_key,

            abortController.signal
          );
      } else {
        setStatus(
          "awaiting-authenticator"
        );

        credential =
          await getPasskeyAssertion(
            optionsResponse.public_key
          );
      }

      if (!mountedRef.current) {
        return;
      }

      const serializedAssertion =
        assertionToJSON(credential);

      setBrowserAssertion(
        serializedAssertion
      );

      setStatus("verifying");

      const result =
        await verifyPlaygroundAuthentication(
          configurationSnapshot,

          optionsResponse.challenge_id,

          serializedAssertion
        );

      if (!mountedRef.current) {
        return;
      }

      setVerificationResult(result);

      setStatus("success");

    } catch (exception: unknown) {
      if (
        exception instanceof DOMException &&
        exception.name === "AbortError"
      ) {
        if (mountedRef.current) {
          setStatus("ready");

          setPlaygroundError(null);
        }

        return;
      }

      if (!mountedRef.current) {
        return;
      }

      setPlaygroundError(
        buildPlaygroundError(exception)
      );

      setStatus("error");
    }
  }


  function cancelConditionalRequest() {
    abortControllerRef.current?.abort();

    abortControllerRef.current = null;

    setStatus("ready");

    setPlaygroundError(null);
  }


  function renderStatusAlert() {
    switch (status) {
      case "checking-support":
        return (
          <Alert severity="info">
            Checking whether Conditional UI
            is supported by this browser.
          </Alert>
        );

      case "generating":
        return (
          <Alert severity="info">
            Generating authentication options
            and storing the challenge.
          </Alert>
        );

      case "awaiting-authenticator":
        return (
          <Alert severity="info">
            Complete the browser or
            authenticator prompt.
          </Alert>
        );

      case "waiting-conditional":
        return (
          <Alert severity="info">
            Conditional authentication is
            active. Focus the username field
            and select a passkey from the
            autofill suggestions.
          </Alert>
        );

      case "verifying":
        return (
          <Alert severity="info">
            The browser returned a signed
            assertion. The backend is
            verifying it now.
          </Alert>
        );

      case "success":
        return (
          <Alert severity="success">
            The authentication ceremony
            completed successfully.
          </Alert>
        );

      case "error":
        return playgroundError ? (
          <Alert severity="error">
            <Typography
              sx={{ fontWeight: 700 }}
            >
              Authentication failed
            </Typography>

            <Typography
              variant="body2"
            >
              {playgroundError.message}
            </Typography>

            {playgroundError.errorName && (
              <Typography
                component="div"
                variant="caption"
                sx={{ mt: 1, display: "block" }}
              >
                Error:
                {" "}
                {playgroundError.errorName}
              </Typography>
            )}

            {playgroundError.httpStatus && (
              <Typography
                component="div"
                variant="caption"
                sx={{ display: "block" }}
              >
                HTTP status:
                {" "}
                {playgroundError.httpStatus}
              </Typography>
            )}
          </Alert>
        ) : null;

      default:
        return null;
    }
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
            Authentication Playground
          </Typography>

          <Typography
            color="text.secondary"
          >
            Configure, run and compare
            multiple WebAuthn authentication
            ceremonies.
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

          <Chip
            label={
              conditionalSupported === null
                ? (
                    "Checking " +
                    "Conditional UI"
                  )
                : conditionalSupported
                  ? (
                      "Conditional UI " +
                      "supported"
                    )
                  : (
                      "Conditional UI " +
                      "unavailable"
                    )
            }
            color={
              conditionalSupported === true
                ? "success"
                : "default"
            }
            variant="outlined"
          />
        </Stack>
      </Stack>

      <Stepper
        activeStep={activeStep}
        sx={{ mb: 4 }}
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
          WebAuthn is unavailable in this
          browser or browsing context.
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",

            lg:
              "400px minmax(0, 1fr)",
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
                Authentication parameters
              </Typography>

              <FormControl>
                <FormLabel>
                  Ceremony mode
                </FormLabel>

                <RadioGroup
                  value={
                    configuration
                      .ceremonyMode
                  }
                  onChange={(event) =>
                    changeCeremonyMode(
                      event.target.value as
                        AuthenticationCeremonyMode
                    )
                  }
                >
                  <FormControlLabel
                    value="username_first"
                    control={<Radio />}
                    label="Username-first"
                    disabled={isRunning}
                  />

                  <FormControlLabel
                    value="username_less"
                    control={<Radio />}
                    label="Username-less"
                    disabled={isRunning}
                  />

                  <FormControlLabel
                    value="conditional"
                    control={<Radio />}
                    label="Conditional UI"
                    disabled={isRunning}
                  />
                </RadioGroup>

                <FormHelperText>
                  Select how the RP discovers
                  the credential and user.
                </FormHelperText>
              </FormControl>

              {configuration.ceremonyMode ===
                "username_first" && (
                <FormControl fullWidth>
                  <InputLabel
                    id={
                      "authentication-" +
                      "playground-user-label"
                    }
                  >
                    User
                  </InputLabel>

                  <Select
                    labelId={
                      "authentication-" +
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
              )}

              <FormControl fullWidth>
                <InputLabel
                  id={
                    "authentication-" +
                    "playground-uv-label"
                  }
                >
                  User verification
                </InputLabel>

                <Select
                  labelId={
                    "authentication-" +
                    "playground-uv-label"
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
                        AuthenticationPlaygroundConfiguration[
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

                <FormHelperText>
                  {userVerificationExplanation}
                </FormHelperText>
              </FormControl>

              <Alert severity="info">
                {requestExplanation}
              </Alert>

              {isConditionalMode && (
                <TextField
                  fullWidth
                  label="Username or email"
                  name="username"
                  autoComplete={
                    "username webauthn"
                  }
                  disabled={
                    status !==
                    "waiting-conditional"
                  }
                  helperText={
                    status ===
                    "waiting-conditional"
                      ? (
                          "Focus this field " +
                          "and select a " +
                          "passkey suggestion."
                        )
                      : (
                          "Start Conditional " +
                          "UI to activate " +
                          "passkey autofill."
                        )
                  }
                />
              )}

              <Button
                variant="contained"
                size="large"
                startIcon={
                  isRunning
                    ? (
                        <CircularProgress
                          size={20}
                          color="inherit"
                        />
                      )
                    : <FingerprintIcon />
                }
                disabled={
                  isRunning ||
                  !isPasskeySupported()
                }
                onClick={runAuthentication}
              >
                {isConditionalMode
                  ? "Start Conditional UI"
                  : (
                      "Generate and " +
                      "Authenticate"
                    )
                }
              </Button>

              {status ===
                "waiting-conditional" && (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<CancelIcon />}
                  onClick={
                    cancelConditionalRequest
                  }
                >
                  Cancel Conditional Request
                </Button>
              )}

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
          {renderStatusAlert()}

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
              title={
                "Authentication Options"
              }
              value={
                authenticationOptions
              }
              emptyMessage={
                "Start a ceremony to inspect " +
                "the server-generated " +
                "authentication options."
              }
            />

            <JsonViewer
              title="Browser Assertion"
              value={browserAssertion}
              emptyMessage={
                "The signed browser assertion " +
                "will appear after the " +
                "authenticator completes."
              }
            />
          </Box>

          <JsonViewer
            title={
              "Server Verification Result"
            }
            value={verificationResult}
            emptyMessage={
              "The verification result will " +
              "appear after the backend " +
              "validates the signed assertion."
            }
          />

          {Boolean(playgroundError?.backendDetail) && (
            <JsonViewer
              title="Backend Error Detail"
              value={
                playgroundError?.backendDetail
              }
              emptyMessage={
                "No backend error detail."
              }
            />
          )}
        </Stack>
      </Box>
    </Box>
  );
}