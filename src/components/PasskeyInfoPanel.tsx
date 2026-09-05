import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpCenter";

interface PasskeyInfoPanelProps {
  ceremony: "registration" | "authentication";
}

const registrationSteps = [
  "The app asks the server for a challenge and " +
    "your account's public-key requirements.",
  "Your device's authenticator (fingerprint, " +
    "face, PIN or security key) creates a new " +
    "key pair and proves you're present.",
  "Only the public key and a credential ID are " +
    "sent back to the server - the private key " +
    "never leaves your device.",
];

const authenticationSteps = [
  "The app asks the server for a challenge tied " +
    "to your account's registered passkeys.",
  "Your device's authenticator unlocks the " +
    "matching private key and signs the " +
    "challenge locally.",
  "The server verifies the signature using the " +
    "public key it stored during registration - " +
    "no password is ever sent or stored.",
];

export default function PasskeyInfoPanel({
  ceremony,
}: PasskeyInfoPanelProps) {
  const steps =
    ceremony === "registration"
      ? registrationSteps
      : authenticationSteps;

  return (
    <Accordion
      variant="outlined"
      sx={{ mb: 3 }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
      >
        <HelpOutlineIcon
          fontSize="small"
          sx={{ mr: 1 }}
        />

        <Typography sx={{ fontWeight: 600 }}>
          How does this work?
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Stepper
          orientation="vertical"
          nonLinear
        >
          {steps.map((step) => (
            <Step key={step} active completed={false}>
              <StepLabel>{step}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </AccordionDetails>
    </Accordion>
  );
}
