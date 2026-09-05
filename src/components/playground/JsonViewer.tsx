import {
  Alert,
  Box,
  Button,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";

import { useState } from "react";

interface JsonViewerProps {
  title: string;

  value: unknown;

  emptyMessage?: string;

  maxHeight?: number;
}

export default function JsonViewer({
  title,
  value,
  emptyMessage = "No data available yet.",
  maxHeight = 480,
}: JsonViewerProps) {
  const [copied, setCopied] =
    useState(false);

  const hasValue =
    value !== null &&
    value !== undefined;

  const formattedValue = hasValue
    ? JSON.stringify(value, null, 2)
    : "";

  async function copyJson() {
    if (!formattedValue) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        formattedValue
      );

      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          height: "100%",
          overflow: "hidden",
          borderRadius: 2,
        }}
      >
        <Stack
          direction="row"
          sx={{
            px: 2,
            py: 1.5,
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: 1,
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700 }}
          >
            {title}
          </Typography>

          <Button
            size="small"
            startIcon={
              copied
                ? <CheckIcon />
                : <ContentCopyIcon />
            }
            disabled={!hasValue}
            onClick={copyJson}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </Stack>

        {hasValue ? (
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 2,
              minHeight: 260,
              maxHeight,
              overflow: "auto",
              backgroundColor: "#0f172a",
              color: "#e2e8f0",
              fontFamily:
                '"Roboto Mono", "Consolas", monospace',
              fontSize: "0.78rem",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {formattedValue}
          </Box>
        ) : (
          <Box
            sx={{
              p: 3,
              minHeight: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            {emptyMessage}
          </Box>
        )}
      </Paper>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setCopied(false)}
        >
          JSON copied to clipboard
        </Alert>
      </Snackbar>
    </>
  );
}