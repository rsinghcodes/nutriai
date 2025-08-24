import client from "./client";

export const completeOnboarding = async (data: {
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  activity_level: string;
  dietary_prefs: string;
  goals: string;
}) => {
  const res = await client.post("/onboarding", data);
  return res.data;
};
