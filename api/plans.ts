import client from "./client";

// Generate AI meal plan
export const generateMealPlan = async (days: number = 1) => {
  const res = await client.post(`/generate-plan?days=${days}`);
  return res.data;
};

// Fetch all stored AI plans
export const getPlans = async () => {
  const res = await client.get("/plans");
  return res.data;
};

// Fetch single plan by ID
export const getPlanById = async (id: number) => {
  const res = await client.get(`/plans/${id}`);
  return res.data;
};
