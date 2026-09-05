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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import axios from "axios";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getUserById } from "../api/userApi";
import { getPasskeys } from "../api/passkeyApi";

import type { User } from "../types/User";
import type { Passkey } from "../types/Passkey";

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] =
    useState<User | null>(null);

  const [passkeys, setPasskeys] =
    useState<Passkey[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!id) {
      return;
    }

    setLoading(true);

    Promise.all([
      getUserById(id),
      getPasskeys(id),
    ])
      .then(([userResponse, passkeysResponse]) => {
        setUser(userResponse);
        setPasskeys(passkeysResponse);
      })
      .catch((exception: unknown) => {
        setError(
          axios.isAxiosError(exception)
            ? exception.response?.data
                ?.detail ??
                "Unable to load this user."
            : "Unable to load this user."
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
        onClick={() => navigate("/users")}
        sx={{ mb: 2 }}
      >
        Back to users
      </Button>

      {loading && <CircularProgress />}

      {error && (
        <Alert severity="error">{error}</Alert>
      )}

      {!loading && user && (
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 700 }}
            >
              {user.display_name}
            </Typography>

            <Typography color="text.secondary">
              {user.username}
            </Typography>
          </Box>

          <Card variant="outlined">
            <CardContent>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2 }}
              >
                Registered Passkeys
              </Typography>

              <Divider sx={{ mb: 2 }} />

              {passkeys.length === 0 && (
                <Typography color="text.secondary">
                  This user has not registered
                  any passkeys yet.
                </Typography>
              )}

              {passkeys.length > 0 && (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Nickname
                      </TableCell>

                      <TableCell>
                        Device Type
                      </TableCell>

                      <TableCell>
                        Sign Count
                      </TableCell>

                      <TableCell>
                        Backup
                      </TableCell>

                      <TableCell>
                        Created
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {passkeys.map((passkey) => (
                      <TableRow key={passkey.id}>
                        <TableCell>
                          {passkey.nickname}
                        </TableCell>

                        <TableCell>
                          {passkey.device_type ??
                            "Unknown"}
                        </TableCell>

                        <TableCell>
                          {passkey.sign_count}
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              passkey.backup_state
                                ? "Backed up"
                                : "Not backed up"
                            }
                            color={
                              passkey.backup_state
                                ? "success"
                                : "default"
                            }
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell>
                          {passkey.created_at
                            ? new Date(
                                passkey.created_at
                              ).toLocaleString()
                            : "Unknown"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}
    </Box>
  );
}
