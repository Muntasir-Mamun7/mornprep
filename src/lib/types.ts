export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  gender: "male" | "female";
  age_range: string;
  activity_level: string;
  diet_type: string;
  allergies: string[];
  cooking_skill: string;
  meals_per_day: number;
  spice_preference: string;
  budget: string;
  has_pcos: boolean;
  pcos_severity?: string;
  pcos_insulin_resistant?: boolean;
  pcos_inflammation?: boolean;
  created_at: string;
}

export interface Meal {
  id: string;
  user_id: string;
  name: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  date: string;
  status: "planned" | "cooked" | "eaten";
  is_in_fridge: boolean;
  guidance_rating?: "good" | "okay" | "bad";
  guidance_note?: string;
  created_at: string;
}

export interface Recipe {
  id: string;
  user_id: string;
  title: string;
  ingredients: string[];
  steps: string[];
  cook_time_mins: number;
  servings: number;
  tags: string[];
  is_shared: boolean;
  share_code?: string;
  created_at: string;
}

export interface WaterLog {
  id: string;
  user_id: string;
  date: string;
  amount_ml: number;
  created_at: string;
}

export interface DailyLog {
  id: string;
  user_id: string;
  date: string;
  foods_eaten: string[];
  guidance_feedback: string;
  created_at: string;
}
