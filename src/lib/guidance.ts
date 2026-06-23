import { UserProfile } from "./types";

interface GuidanceResult {
  rating: "good" | "okay" | "bad";
  message: string;
}

const pcosFoodsToAvoid = [
  "white bread", "pasta", "sugar", "soda", "candy", "cake",
  "fried food", "processed meat", "margarine", "white rice",
  "instant noodles", "chips", "cookies", "ice cream",
];

const pcosGoodFoods = [
  "leafy greens", "berries", "salmon", "avocado", "nuts",
  "quinoa", "sweet potato", "turmeric", "cinnamon", "lean protein",
  "eggs", "greek yogurt", "olive oil", "legumes", "brown rice",
];

const generalHealthyFoods = [
  "vegetables", "fruits", "whole grains", "lean protein",
  "fish", "nuts", "seeds", "legumes", "eggs", "yogurt",
];

const generalUnhealthyFoods = [
  "fast food", "soda", "candy", "deep fried", "processed",
  "excessive sugar", "alcohol", "energy drinks",
];

export function getFoodGuidance(
  foodName: string,
  profile: UserProfile
): GuidanceResult {
  const food = foodName.toLowerCase();

  if (profile.has_pcos) {
    if (pcosFoodsToAvoid.some((bad) => food.includes(bad))) {
      return {
        rating: "bad",
        message: `"${foodName}" is not recommended for PCOS. It can spike insulin and worsen symptoms. Try a whole-food alternative.`,
      };
    }
    if (pcosGoodFoods.some((good) => food.includes(good))) {
      return {
        rating: "good",
        message: `"${foodName}" is great for PCOS! It helps with hormone balance and inflammation.`,
      };
    }
  }

  if (generalUnhealthyFoods.some((bad) => food.includes(bad))) {
    return {
      rating: "bad",
      message: `"${foodName}" isn't the best choice. Consider a healthier alternative.`,
    };
  }

  if (generalHealthyFoods.some((good) => food.includes(good))) {
    return {
      rating: "good",
      message: `"${foodName}" is a solid choice! Keep it up.`,
    };
  }

  return {
    rating: "okay",
    message: `"${foodName}" is fine in moderation. Balance it with vegetables and protein.`,
  };
}

export function getDietPlan(profile: UserProfile): string[] {
  const tips: string[] = [];

  if (profile.has_pcos) {
    tips.push("Focus on anti-inflammatory foods: berries, leafy greens, fatty fish");
    tips.push("Eat protein with every meal to stabilize blood sugar");
    tips.push("Avoid refined carbs and added sugars");
    tips.push("Include omega-3 rich foods daily");
    if (profile.pcos_insulin_resistant) {
      tips.push("Keep carbs low-glycemic: quinoa, oats, sweet potato");
      tips.push("Add cinnamon and apple cider vinegar to meals");
    }
    if (profile.pcos_inflammation) {
      tips.push("Add turmeric and ginger to cooking");
      tips.push("Reduce dairy if it triggers inflammation");
    }
  }

  if (profile.activity_level === "high") {
    tips.push("Increase protein to 1.6-2g per kg of body weight");
    tips.push("Eat complex carbs before workouts");
  }

  if (profile.diet_type === "vegetarian" || profile.diet_type === "vegan") {
    tips.push("Ensure adequate B12 and iron from fortified foods or supplements");
    tips.push("Combine legumes with grains for complete proteins");
  }

  if (tips.length === 0) {
    tips.push("Aim for balanced meals: 1/2 plate vegetables, 1/4 protein, 1/4 complex carbs");
    tips.push("Stay hydrated: aim for 2-3 liters of water daily");
    tips.push("Eat at regular intervals to maintain energy");
  }

  return tips;
}
