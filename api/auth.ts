import { saveToken } from "../utils/storage";
import client from "./client";

export const registerUser = async (data: {
  email: string;
  password: string;
  name: string;
}) => {
  const res = await client.post("/auth/register", data);
  if (res.data.access_token) {
    await saveToken(res.data.access_token);
  }
  return res.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const res = await client.post("/auth/login", data);
  if (res.data.access_token) {
    await saveToken(res.data.access_token);
  }
  return res.data;
};
