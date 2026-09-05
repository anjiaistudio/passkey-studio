import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

import BadgeIcon from "@mui/icons-material/Badge";

import axios from "axios";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { getInspectorCredentials } from "../../api/passkeyApi";

import type { InspectorCredentialSummary } from "../../types/Playground";

function formatDateTime(
  value: string | null
): string {
  if (!value) {
    return "Never";
  }

  return new Date(value).toLocaleString();
}

export default function
PlaygroundInspectorPage() {
  const navigate = useNavigate();

  const [passkeys, setPasskeys] =
    useState<InspectorCredentialSummary[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedUserId, setSelectedUserId] =
    useState("all");

  useEffect(() => {
    getInspectorCredentials()
      .then((response) => {
        setPasskeys(response);
      })
      .catch((exception: unknown) => {
        setError(
          axios.isAxiosError(exception)
            ? exception.response?.data
                ?.detail ??
                "Unable to load passkeys."
            : "Unable to load passkeys."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const users = useMemo(() => {
    const unique = new Map<
      string,
      { id: string; label: string }
    >();

    passkeys.forEach((passkey) => {
      unique.set(passkey.user_id, {
        id: passkey.user_id,
        label:
          passkey.display_name ||
          passkey.username,
      });
    });

    return Array.from(unique.values());
  }, [passkeys]);

  const filteredPasskeys = useMemo(() => {
    if (selectedUserId === "all") {
      return passkeys;
    }

    return passkeys.filter(
      (passkey) =>
        passkey.user_id === selectedUserId
    );
  }, [passkeys, selectedUserId]);

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: 700 }}
        gutterBottom
      >
        Credential Inspector
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ mb: 3, maxWidth: 800 }}
      >
        Browse every registered passkey and
        inspect its authenticator, security
        flags and transports.
      </Typography>

      <FormControl
        sx={{ mb: 3, minWidth: 260 }}
        size="small"
      >
        <InputLabel id="passkey-user-filter-label">
          User
        </InputLabel>

        <Select
          labelId="passkey-user-filter-label"
          label="User"
          value={selectedUserId}
          onChange={(event) =>
            setSelectedUserId(
              event.target.value
            )
          }
        >
          <MenuItem value="all">
            All users
          </MenuItem>

          {users.map((user) => (
            <MenuItem
              key={user.id}
              value={user.id}
            >
              {user.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
            mb: 3,
          }}
        >
          {[0, 1, 2].map((key) => (
            <Skeleton
              key={key}
              variant="rounded"
              height={220}
            />
          ))}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading &&
        !error &&
        filteredPasskeys.length === 0 && (
          <Alert severity="info">
            No passkeys found.
          </Alert>
        )}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },

          gap: 2,
        }}
      >
        {filteredPasskeys.map((passkey) => (
          <Card
            key={passkey.id}
            variant="outlined"
          >
            <CardContent>
              <Stack spacing={1.5}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <BadgeIcon
                    color="primary"
                    fontSize="small"
                  />

                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700 }}
                  >
                    {passkey.authenticator_name}
                  </Typography>
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {passkey.nickname}
                </Typography>

                <Typography variant="body2">
                  {passkey.display_name}
                  {" ("}
                  {passkey.username}
                  {")"}
                </Typography>

                <Chip
                  label={
                    passkey.credential_device_type
                  }
                  size="small"
                  variant="outlined"
                />

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Created:{" "}
                  {formatDateTime(
                    passkey.created_at
                  )}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Last used:{" "}
                  {formatDateTime(
                    passkey.last_used_at
                  )}
                </Typography>
              </Stack>
            </CardContent>

            <CardActions>
              <Button
                size="small"
                onClick={() =>
                  navigate(
                    `/playground/credentials/${passkey.id}`
                  )
                }
              >
                Inspect
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
