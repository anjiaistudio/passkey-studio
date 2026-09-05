import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import KeyIcon from "@mui/icons-material/Key";
import LockIcon from "@mui/icons-material/Lock";
import ScienceIcon from "@mui/icons-material/Science";
import BadgeIcon from "@mui/icons-material/Badge";

const features: {
  icon: React.ReactNode;
  title: string;
  description: string;
}[] = [
  {
    icon: <DashboardIcon color="primary" />,
    title: "Dashboard & Analytics",
    description:
      "Live counts of users and passkeys, " +
      "platform vs cross-platform breakdowns " +
      "and recent registration activity.",
  },
  {
    icon: <GroupIcon color="primary" />,
    title: "User Management",
    description:
      "Register accounts and inspect each " +
      "user's registered passkeys in one place.",
  },
  {
    icon: <KeyIcon color="primary" />,
    title: "Registration & Authentication",
    description:
      "Run real WebAuthn registration and " +
      "login ceremonies - username-first, " +
      "username-less and conditional UI.",
  },
  {
    icon: <ScienceIcon color="primary" />,
    title: "Playground",
    description:
      "Experiment with algorithms, attachment, " +
      "resident keys and attestation policies " +
      "without touching real accounts.",
  },
  {
    icon: <BadgeIcon color="primary" />,
    title: "Credential Inspector",
    description:
      "Drill into any credential's authenticator, " +
      "security flags and transports.",
  },
  {
    icon: <LockIcon color="primary" />,
    title: "Browser Capabilities",
    description:
      "Check what the current browser supports " +
      "before running a demo.",
  },
];

const registrationSteps = [
  {
    label: "Request a challenge",
    detail:
      "The app asks the server for a one-time " +
      "challenge and the account's public-key " +
      "requirements.",
  },
  {
    label: "Create a key pair on-device",
    detail:
      "Your authenticator (fingerprint, face, " +
      "PIN or security key) generates a new " +
      "public/private key pair and confirms " +
      "you're present.",
  },
  {
    label: "Store only the public key",
    detail:
      "The public key and a credential ID are " +
      "sent to the server. The private key never " +
      "leaves your device.",
  },
];

const authenticationSteps = [
  {
    label: "Request a challenge",
    detail:
      "The app asks the server for a challenge " +
      "tied to your account's registered " +
      "passkeys.",
  },
  {
    label: "Sign locally",
    detail:
      "Your authenticator unlocks the matching " +
      "private key and signs the challenge on " +
      "your device.",
  },
  {
    label: "Verify the signature",
    detail:
      "The server checks the signature against " +
      "the stored public key. No password is " +
      "ever sent or stored.",
  },
];

const faqs: { question: string; answer: string }[] = [
  {
    question: "Is a passkey the same as a password?",
    answer:
      "No. A passkey is a cryptographic key pair. " +
      "The private key never leaves your device, " +
      "so there is nothing shared with a server " +
      "that could be stolen or phished.",
  },
  {
    question: "What happens if I lose my device?",
    answer:
      "Passkeys backed by platform providers " +
      "(iCloud Keychain, Google Password " +
      "Manager, Windows Hello) can sync to your " +
      "other devices signed into the same " +
      "account.",
  },
  {
    question:
      "Why does the demo ask for user " +
      "verification?",
    answer:
      "User verification confirms it's really " +
      "you (via biometrics or a PIN) rather than " +
      "just proving possession of the device.",
  },
];

export default function AboutPage() {
  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700 }}
        gutterBottom
      >
        How It Works
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 800 }}
      >
        Passkey Lab is a hands-on environment for
        exploring WebAuthn passkeys - end to end,
        from registering an account to inspecting
        the credentials it creates.
      </Typography>

      <Typography
        variant="h5"
        sx={{ fontWeight: 700, mb: 2 }}
      >
        What this application provides
      </Typography>

      <Grid container spacing={2} sx={{ mb: 5 }}>
        {features.map((feature) => (
          <Grid
            key={feature.title}
            size={{ xs: 12, sm: 6, md: 4 }}
          >
            <Card
              variant="outlined"
              sx={{ height: "100%" }}
            >
              <CardContent>
                <Box sx={{ mb: 1 }}>
                  {feature.icon}
                </Box>

                <Typography
                  sx={{ fontWeight: 700, mb: 1 }}
                >
                  {feature.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography
        variant="h5"
        sx={{ fontWeight: 700, mb: 2 }}
      >
        How a passkey is created
      </Typography>

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Stepper
            orientation="vertical"
            nonLinear
          >
            {registrationSteps.map((step) => (
              <Step
                key={step.label}
                active
                completed={false}
              >
                <StepLabel>
                  <Typography
                    sx={{ fontWeight: 600 }}
                  >
                    {step.label}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {step.detail}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Typography
        variant="h5"
        sx={{ fontWeight: 700, mb: 2 }}
      >
        How signing in with a passkey works
      </Typography>

      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent>
          <Stepper
            orientation="vertical"
            nonLinear
          >
            {authenticationSteps.map((step) => (
              <Step
                key={step.label}
                active
                completed={false}
              >
                <StepLabel>
                  <Typography
                    sx={{ fontWeight: 600 }}
                  >
                    {step.label}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {step.detail}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Typography
        variant="h5"
        sx={{ fontWeight: 700, mb: 2 }}
      >
        Frequently asked questions
      </Typography>

      {faqs.map((faq) => (
        <Accordion
          key={faq.question}
          variant="outlined"
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
          >
            <Typography sx={{ fontWeight: 600 }}>
              {faq.question}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <Typography color="text.secondary">
              {faq.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}

      <Box sx={{ mt: 3 }}>
        <Chip
          label="No passwords. No shared secrets."
          color="success"
          variant="outlined"
        />
      </Box>
    </Box>
  );
}
