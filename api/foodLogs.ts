import client from "./client";

// Log food consumption
export const logFood = async (data: {
  food_id: number;
  quantity: number;
  unit: string;
}) => {
  const res = await client.post("/food-logs", data);
  return res.data;
};

// Fetch all logged foods for current user
export const getFoodLogs = async () => {
  const res = await client.get("/food-logs");
  return res.data;
};
