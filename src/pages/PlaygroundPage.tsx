import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import KeyIcon from "@mui/icons-material/Key";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import BadgeIcon from "@mui/icons-material/Badge";
import DevicesIcon from "@mui/icons-material/Devices";

import { useNavigate } from "react-router-dom";

interface PlaygroundFeature {
  title: string;

  description: string;

  path: string;

  icon: React.ReactNode;

  status: "Available" | "Coming soon";
}

const features:
PlaygroundFeature[] = [
  {
    title:
      "Registration Playground",

    description:
      "Configure algorithms, attachment, " +
      "resident keys, user verification " +
      "and attestation.",

    path:
      "/playground/registration",

    icon: <KeyIcon fontSize="large" />,

    status: "Available",
  },
  {
    title:
      "Authentication Playground",

    description:
      "Experiment with username-first, " +
      "username-less and conditional " +
      "authentication ceremonies.",

    path:
      "/playground/authentication",

    icon:
      <FingerprintIcon fontSize="large" />,

    status: "Available",
  },
  {
    title:
      "Credential Inspector",

    description:
      "Inspect registered credential IDs, " +
      "public keys, transports, backup state " +
      "and signature counters.",

    path:
      "/playground/credentials",

    icon: <BadgeIcon fontSize="large" />,

    status: "Available",
  },
  {
    title:
      "Browser Capabilities",

    description:
      "Inspect WebAuthn, platform " +
      "authenticator and Conditional UI " +
      "support.",

    path:
      "/playground/capabilities",

    icon: <DevicesIcon fontSize="large" />,

    status: "Available",
  },
];

export default function PlaygroundPage() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700 }}
        gutterBottom
      >
        WebAuthn Playground
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          mb: 4,
          maxWidth: 800,
        }}
      >
        Run, inspect and compare WebAuthn
        ceremonies using configurable
        registration and authentication
        policies.
      </Typography>

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",

            md:
              "repeat(2, minmax(0, 1fr))",
          },

          gap: 3,
        }}
      >
        {features.map((feature) => {
          const available =
            feature.status === "Available";

          return (
            <Card
              key={feature.title}
              variant="outlined"
              sx={{
                height: "100%",
              }}
            >
              <CardActionArea
                disabled={!available}
                onClick={() =>
                  navigate(feature.path)
                }
                sx={{
                  height: "100%",
                  alignItems: "stretch",
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent:
                          "space-between",
                        alignItems:
                          "flex-start",
                      }}
                    >
                      <Box
                        sx={{
                          color: "primary.main",
                        }}
                      >
                        {feature.icon}
                      </Box>

                      <Chip
                        label={feature.status}
                        size="small"
                        color={
                          available
                            ? "success"
                            : "default"
                        }
                        variant={
                          available
                            ? "filled"
                            : "outlined"
                        }
                      />
                    </Stack>

                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700 }}
                    >
                      {feature.title}
                    </Typography>

                    <Typography
                      color="text.secondary"
                    >
                      {feature.description}
                    </Typography>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}