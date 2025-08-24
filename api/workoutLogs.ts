import client from "./client";

// Log a workout
export const logWorkout = async (data: {
  exercise_id: number;
  duration_minutes: number;
}) => {
  const res = await client.post("/workout-logs", data);
  return res.data;
};

// Fetch all workouts for current user
export const getWorkoutLogs = async () => {
  const res = await client.get("/workout-logs");
  return res.data;
};
