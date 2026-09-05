import {
  Box,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import {
  useEffect,
  useState,
} from "react";

import { getRecentRegistrations } from "../../api/analyticsApi";

function formatListValue(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.join(", ")}]`;
  }

  if (typeof value === "string") {
    return value || "-";
  }

  if (value == null) {
    return "-";
  }

  return String(value);
}

export default function RecentRegistrationsPage() {
  const [recentRegistrations, setRecentRegistrations] =
    useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getRecentRegistrations()
      .then((data) => {
        if (active) {
          setRecentRegistrations(data);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <Box>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4">
          Recent Registrations
        </Typography>
        <Typography color="text.secondary">
          Latest passkey registration events for operational review and adoption monitoring.
        </Typography>
      </Stack>

      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Skeleton variant="rounded" height={320} />
        ) : (
          <>
            <Box
              sx={{
                display: {
                  xs: "grid",
                  sm: "none",
                },
                gap: 2,
              }}
            >
              {recentRegistrations.map((row) => (
                <Paper
                  key={row.id}
                  variant="outlined"
                  sx={{ p: 2 }}
                >
                  <Stack spacing={1.5}>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        User
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ overflowWrap: "anywhere" }}
                      >
                        {formatListValue(row.user_id)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(2, minmax(0, 1fr))",
                        gap: 1.5,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Nickname
                        </Typography>
                        <Typography variant="body2">
                          {formatListValue(row.nickname)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Counter
                        </Typography>
                        <Typography variant="body2">
                          {formatListValue(row.sign_counter)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Authenticator
                        </Typography>
                        <Typography variant="body2">
                          {formatListValue(
                            row.authenticator_attachment
                          )}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Device
                        </Typography>
                        <Typography variant="body2">
                          {formatListValue(
                            row.credential_device_type
                          )}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      <Chip
                        size="small"
                        label={`Flags ${formatListValue(
                          row.flags
                        )}`}
                      />
                      <Chip
                        size="small"
                        label={`Transports ${formatListValue(
                          row.transports
                        )}`}
                      />
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Created
                      </Typography>
                      <Typography variant="body2">
                        {formatListValue(row.created_at)}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </Box>

            <TableContainer
              sx={{
                display: {
                  xs: "none",
                  sm: "block",
                },
                overflowX: "auto",
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User_Id</TableCell>
                    <TableCell>Nickname</TableCell>
                    <TableCell>Authenticator Type</TableCell>
                    <TableCell>Device Type</TableCell>
                    <TableCell>Sign counter</TableCell>
                    <TableCell>Flags</TableCell>
                    <TableCell>Transports</TableCell>
                    <TableCell>Created</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {recentRegistrations.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        {formatListValue(row.user_id)}
                      </TableCell>
                      <TableCell>
                        {formatListValue(row.nickname)}
                      </TableCell>
                      <TableCell>
                        {formatListValue(
                          row.authenticator_attachment
                        )}
                      </TableCell>
                      <TableCell>
                        {formatListValue(
                          row.credential_device_type
                        )}
                      </TableCell>
                      <TableCell>
                        {formatListValue(row.sign_counter)}
                      </TableCell>
                      <TableCell>
                        {formatListValue(row.flags)}
                      </TableCell>
                      <TableCell>
                        {formatListValue(row.transports)}
                      </TableCell>
                      <TableCell>
                        {formatListValue(row.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>
    </Box>
  );
}