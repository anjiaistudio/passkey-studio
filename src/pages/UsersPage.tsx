import {
  Alert,
  Box,
  Button,
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

import PersonAddIcon from "@mui/icons-material/PersonAdd";

import axios from "axios";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getUsers } from "../api/userApi";

import type { User } from "../types/User";

export default function UsersPage() {
  const navigate = useNavigate();

  const [users, setUsers] =
    useState<User[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((exception: unknown) => {
        setError(
          axios.isAxiosError(exception)
            ? exception.response?.data
                ?.detail ??
                "Unable to load users."
            : "Unable to load users."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Box>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700 }}
            gutterBottom
          >
            Users
          </Typography>

          <Typography color="text.secondary">
            All accounts registered in the
            Passkey Studio.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() =>
            navigate("/users/register")
          }
        >
          Register User
        </Button>
      </Stack>

      {loading && (
        <Stack spacing={1}>
          {[0, 1, 2, 3].map((key) => (
            <Skeleton
              key={key}
              variant="rounded"
              height={52}
            />
          ))}
        </Stack>
      )}

      {error && (
        <Alert severity="error">{error}</Alert>
      )}

      {!loading && !error && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Display Name
                </TableCell>

                <TableCell>Username</TableCell>

                <TableCell align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    {user.display_name}
                  </TableCell>

                  <TableCell>
                    {user.username}
                  </TableCell>

                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() =>
                        navigate(
                          `/users/${user.id}`
                        )
                      }
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
