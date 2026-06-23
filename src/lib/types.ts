export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  display_name?: string;
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
  sleep_hours?: string;
  water_goal_ml: number;
  weight_goal?: string;
  health_conditions: string[];
  prep_time_preference?: string;
  kitchen_equipment: string[];
  living_situation?: string;
  work_schedule?: string;
  preferred_cuisines: string[];
  protein_preferences: string[];
  chronotype?: string;
  snacking_habits?: string;
  emotional_eating?: string;
  onboarding_completed: boolean;
  theme_primary_color: string;
  theme_accent_color: string;
  theme_mode: "light" | "dark";
  notifications_enabled: boolean;
  push_subscription?: any;
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
  image_url?: string;
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

export interface PeriodLog {
  id: string;
  user_id: string;
  date: string;
  log_type: "period_start" | "period_end" | "symptom" | "mood" | "daily";
  flow_intensity?: "light" | "medium" | "heavy";
  symptoms: string[];
  mood?: "happy" | "sad" | "irritable" | "anxious" | "calm" | "neutral";
  notes?: string;
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
