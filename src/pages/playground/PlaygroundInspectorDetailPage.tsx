import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import axios from "axios";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getInspectorCredentialDetail } from "../../api/passkeyApi";

import JsonViewer from "../../components/playground/JsonViewer";

import type { InspectorCredentialDetail } from "../../types/Playground";

function formatDateTime(
  value: string | null | undefined
): string {
  if (!value) {
    return "Never";
  }

  return new Date(value).toLocaleString();
}

function FlagChip({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <Chip
      icon={
        active ? (
          <CheckCircleIcon />
        ) : (
          <CancelIcon />
        )
      }
      label={label}
      color={active ? "success" : "default"}
      variant={active ? "filled" : "outlined"}
      size="small"
    />
  );
}

function FieldRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        py: 1,
        justifyContent: "space-between",
      }}
    >
      <Typography color="text.secondary">
        {label}
      </Typography>

      <Typography
        sx={{
          fontWeight: 600,
          textAlign: "right",
          wordBreak: "break-all",
        }}
      >
        {value ?? "Unknown"}
      </Typography>
    </Stack>
  );
}

export default function
PlaygroundInspectorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [detail, setDetail] =
    useState<InspectorCredentialDetail | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [activeTab, setActiveTab] =
    useState(0);

  useEffect(() => {
    if (!id) {
      return;
    }

    setLoading(true);

    getInspectorCredentialDetail(id)
      .then((response) => {
        setDetail(response);
      })
      .catch((exception: unknown) => {
        setError(
          axios.isAxiosError(exception)
            ? exception.response?.data
                ?.detail ??
                "Unable to load this credential."
            : "Unable to load this credential."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() =>
          navigate("/playground/credentials")
        }
        sx={{ mb: 2 }}
      >
        Back to credentials
      </Button>

      <Typography
        variant="h4"
        sx={{ fontWeight: 700 }}
        gutterBottom
      >
        Credential Inspector
      </Typography>

      {loading && <CircularProgress />}

      {error && (
        <Alert severity="error">{error}</Alert>
      )}

      {!loading && detail && (
        <Card variant="outlined">
          <Tabs
            value={activeTab}
            onChange={(_, value) =>
              setActiveTab(value)
            }
            variant="scrollable"
          >
            <Tab label="Overview" />
            <Tab label="Authenticator" />
            <Tab label="Security" />
            <Tab label="Transports" />
            <Tab label="Raw Data" />
          </Tabs>

          <Divider />

          <CardContent>
            {activeTab === 0 && (
              <Box>
                <FieldRow
                  label="Credential ID"
                  value={
                    detail.credential_id ??
                    detail.id
                  }
                />

                <FieldRow
                  label="Nickname"
                  value={detail.nickname}
                />

                <FieldRow
                  label="User"
                  value={`${detail.display_name} (${detail.username})`}
                />

                <FieldRow
                  label="Created"
                  value={formatDateTime(
                    detail.created_at
                  )}
                />

                <FieldRow
                  label="Last Used"
                  value={formatDateTime(
                    detail.last_used_at
                  )}
                />

                <FieldRow
                  label="Revoked"
                  value={
                    detail.revoked
                      ? "Yes"
                      : "No"
                  }
                />

                <FieldRow
                  label="Sign Count"
                  value={
                    detail.sign_count ?? 0
                  }
                />
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <FieldRow
                  label="Authenticator Name"
                  value={
                    detail.authenticator_name
                  }
                />

                <FieldRow
                  label="Vendor"
                  value={
                    detail.authenticator_vendor
                  }
                />

                <FieldRow
                  label="AAGUID"
                  value={detail.aaguid}
                />

                <FieldRow
                  label="Platform / Cross-platform"
                  value={
                    detail.authenticator_attachment ??
                    "Unknown"
                  }
                />

                <FieldRow
                  label="Attestation Format"
                  value={
                    detail.attestation_format
                  }
                />

                <FieldRow
                  label="Credential Device Type"
                  value={
                    detail.credential_device_type
                  }
                />
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ py: 1, flexWrap: "wrap" }}
                >
                  <FlagChip
                    label="UP"
                    active={
                      detail.flags?.includes(
                        "UP"
                      ) ?? false
                    }
                  />

                  <FlagChip
                    label="UV"
                    active={
                      detail.flags?.includes(
                        "UV"
                      ) ?? false
                    }
                  />

                  <FlagChip
                    label="BE"
                    active={
                      detail.flags?.includes(
                        "BE"
                      ) ?? false
                    }
                  />

                  <FlagChip
                    label="BS"
                    active={
                      detail.flags?.includes(
                        "BS"
                      ) ?? false
                    }
                  />
                </Stack>

                <FieldRow
                  label="Backup Eligible"
                  value={
                    detail.backup_eligible
                      ? "Yes"
                      : "No"
                  }
                />

                <FieldRow
                  label="Backup State"
                  value={
                    detail.backup_state
                      ? "Yes"
                      : "No"
                  }
                />

                <FieldRow
                  label="User Verification Policy"
                  value={
                    detail.user_verification_policy
                  }
                />

                <FieldRow
                  label="Resident Key Policy"
                  value={
                    detail.resident_key_policy
                  }
                />
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                {detail.transports &&
                detail.transports.length > 0 ? (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: "wrap" }}
                  >
                    {detail.transports.map(
                      (transport) => (
                        <Chip
                          key={transport}
                          label={transport}
                          variant="outlined"
                        />
                      )
                    )}
                  </Stack>
                ) : (
                  <Typography color="text.secondary">
                    No transports reported.
                  </Typography>
                )}
              </Box>
            )}

            {activeTab === 4 && (
              <Box sx={{ height: 480 }}>
                <JsonViewer
                  title="Raw credential record"
                  value={detail}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
