import { api } from "./axios";

export const getUsers = async () => {
  const response = await api.get("/users");

  return response.data;
};

export const getUserById = async (
  id: string
) => {
  const response = await api.get(
    `/users/${id}`
  );

  return response.data;
};

export const createUser = async (
  username: string,
  display_name: string
) => {
  const response = await api.post(
    "/users",
    {
      username,
      display_name,
    }
  );

  return response.data;
};