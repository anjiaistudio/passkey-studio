import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import { useEffect, useState } from "react";

import {
  isConditionalMediationSupported,
  isPasskeySupported,
  isPlatformAuthenticatorAvailable,
} from "../../services/webauthn";

interface CapabilityCheck {
  label: string;

  description: string;

  supported: boolean | null;
}

function CapabilityRow({
  check,
}: {
  check: CapabilityCheck;
}) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        py: 1.5,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography sx={{ fontWeight: 600 }}>
          {check.label}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {check.description}
        </Typography>
      </Box>

      <Chip
        icon={
          check.supported ? (
            <CheckCircleIcon />
          ) : (
            <CancelIcon />
          )
        }
        label={
          check.supported === null
            ? "Checking..."
            : check.supported
              ? "Supported"
              : "Not supported"
        }
        color={
          check.supported ? "success" : "default"
        }
        variant={
          check.supported ? "filled" : "outlined"
        }
      />
    </Stack>
  );
}

export default function
PlaygroundCapabilitiesPage() {
  const [webAuthnSupported] = useState(
    isPasskeySupported()
  );

  const [
    platformAuthenticatorSupported,
    setPlatformAuthenticatorSupported,
  ] = useState<boolean | null>(null);

  const [
    conditionalUiSupported,
    setConditionalUiSupported,
  ] = useState<boolean | null>(null);

  useEffect(() => {
    isPlatformAuthenticatorAvailable().then(
      setPlatformAuthenticatorSupported
    );

    isConditionalMediationSupported().then(
      setConditionalUiSupported
    );
  }, []);

  const checks: CapabilityCheck[] = [
    {
      label: "WebAuthn Support",
      description:
        "The browser exposes the PublicKeyCredential API.",
      supported: webAuthnSupported,
    },
    {
      label: "Platform Authenticator",
      description:
        "A built-in authenticator (Windows Hello, " +
        "Touch ID, etc.) is available.",
      supported: platformAuthenticatorSupported,
    },
    {
      label: "Conditional UI / Autofill",
      description:
        "The browser supports passkey autofill " +
        "on username fields.",
      supported: conditionalUiSupported,
    },
  ];

  const userAgentData =
    (
      navigator as Navigator & {
        userAgentData?: {
          brands?: {
            brand: string;
            version: string;
          }[];
          mobile?: boolean;
          platform?: string;
        };
      }
    ).userAgentData;

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700 }}
        gutterBottom
      >
        Browser Capabilities
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 3, maxWidth: 800 }}
      >
        Inspect WebAuthn, platform authenticator
        and Conditional UI support for the
        current browser.
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          {checks.map((check, index) => (
            <Box key={check.label}>
              <CapabilityRow check={check} />

              {index < checks.length - 1 && (
                <Divider />
              )}
            </Box>
          ))}
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 2 }}
          >
            Browser / OS
          </Typography>

          <Stack spacing={1}>
            <Typography variant="body2">
              User agent: {navigator.userAgent}
            </Typography>

            <Typography variant="body2">
              Platform:{" "}
              {userAgentData?.platform ??
                navigator.platform}
            </Typography>

            <Typography variant="body2">
              Mobile:{" "}
              {userAgentData?.mobile
                ? "Yes"
                : "No"}
            </Typography>

            {userAgentData?.brands && (
              <Typography variant="body2">
                Brands:{" "}
                {userAgentData.brands
                  .map(
                    (brand) =>
                      `${brand.brand} ${brand.version}`
                  )
                  .join(", ")}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
