import { UserProfile } from "./types";

interface GuidanceResult {
  rating: "good" | "okay" | "bad";
  message: string;
}

const pcosFoodsToAvoid = [
  "white bread", "pasta", "sugar", "soda", "candy", "cake",
  "fried food", "processed meat", "margarine", "white rice",
  "instant noodles", "chips", "cookies", "ice cream",
  "pastry", "donut", "pizza", "burger", "fries", "milkshake",
];

const pcosGoodFoods = [
  "leafy greens", "berries", "salmon", "avocado", "nuts",
  "quinoa", "sweet potato", "turmeric", "cinnamon", "lean protein",
  "eggs", "greek yogurt", "olive oil", "legumes", "brown rice",
  "chia seeds", "flaxseed", "broccoli", "spinach", "kale",
];

const generalHealthyFoods = [
  "vegetables", "fruits", "whole grains", "lean protein",
  "fish", "nuts", "seeds", "legumes", "eggs", "yogurt",
  "oats", "salad", "grilled", "steamed", "baked",
  "smoothie", "soup", "lentils", "chickpeas", "tofu",
];

const generalUnhealthyFoods = [
  "fast food", "soda", "candy", "deep fried", "processed",
  "excessive sugar", "alcohol", "energy drinks",
  "chips", "hot dog", "frozen dinner", "instant ramen",
];

export function getFoodGuidance(foodName: string, profile: UserProfile): GuidanceResult {
  const food = foodName.toLowerCase();

  if (profile.has_pcos) {
    if (pcosFoodsToAvoid.some((bad) => food.includes(bad))) {
      return {
        rating: "bad",
        message: `"${foodName}" is not recommended for PCOS. It can spike insulin and worsen symptoms. Try whole-food alternatives like quinoa, sweet potato, or grilled proteins.`,
      };
    }
    if (pcosGoodFoods.some((good) => food.includes(good))) {
      return {
        rating: "good",
        message: `"${foodName}" is excellent for PCOS! It helps with hormone balance and reduces inflammation.`,
      };
    }
  }

  if (generalUnhealthyFoods.some((bad) => food.includes(bad))) {
    return {
      rating: "bad",
      message: `"${foodName}" isn't the best choice for your goals. Consider a healthier swap — grilled instead of fried, or water instead of soda.`,
    };
  }

  if (generalHealthyFoods.some((good) => food.includes(good))) {
    return {
      rating: "good",
      message: `"${foodName}" is a solid choice! Rich in nutrients your body needs. Keep it up.`,
    };
  }

  return {
    rating: "okay",
    message: `"${foodName}" is fine in moderation. Balance it with vegetables and protein for a complete meal.`,
  };
}

interface TipCategory {
  meal_type: "breakfast" | "lunch" | "dinner" | "snack" | "general";
  time: "morning" | "afternoon" | "evening" | "any";
  tips: string[];
}

const allTips: TipCategory[] = [
  {
    meal_type: "breakfast",
    time: "morning",
    tips: [
      "Start your morning with protein — eggs, Greek yogurt, or a smoothie keep you full longer",
      "Add chia seeds or flaxseeds to your breakfast for omega-3s and fiber",
      "Oatmeal with berries is a powerhouse breakfast: complex carbs + antioxidants",
      "Avoid sugary cereals — they cause a mid-morning energy crash",
      "A glass of warm lemon water before breakfast kickstarts your metabolism",
      "Include healthy fats at breakfast: avocado toast, nuts, or nut butter",
      "Don't skip breakfast — it sets your blood sugar tone for the day",
      "Overnight oats save time and keep your gut happy with probiotics",
    ],
  },
  {
    meal_type: "lunch",
    time: "afternoon",
    tips: [
      "Build your lunch plate: half vegetables, quarter protein, quarter complex carbs",
      "A lunch with fiber and protein prevents the 3pm energy slump",
      "Add a handful of leafy greens to any lunch for vitamins and minerals",
      "Avoid heavy carb-only lunches — they make you sleepy after",
      "Meal prep lunches on Sunday to avoid fast food temptation during the week",
      "Include colorful vegetables — different colors mean different nutrients",
      "Soups and stews are nutrient-dense and easy to portion control",
      "Add legumes (lentils, chickpeas) for plant-based protein and iron",
    ],
  },
  {
    meal_type: "dinner",
    time: "evening",
    tips: [
      "Eat dinner at least 2-3 hours before sleep for better digestion",
      "Keep dinner lighter than lunch — your body slows down in the evening",
      "Grilled fish or chicken with roasted vegetables is a perfect dinner",
      "Include tryptophan-rich foods at dinner (turkey, milk) for better sleep",
      "Avoid heavy, spicy foods at night — they can disrupt sleep quality",
      "A small portion of complex carbs at dinner helps with serotonin production",
      "Dinner is a good time for soups — warm, satisfying, and easy to digest",
      "Stop eating 3 hours before bed to improve sleep quality and digestion",
    ],
  },
  {
    meal_type: "snack",
    time: "any",
    tips: [
      "Nuts and fruit make the perfect snack combo: protein, fat, and natural sugars",
      "Greek yogurt with honey is satisfying and provides protein + probiotics",
      "Hard-boiled eggs are the ultimate portable protein snack",
      "Dark chocolate (70%+) in small amounts satisfies cravings with antioxidants",
      "Rice cakes with nut butter give crunch plus sustained energy",
      "Sliced veggies with hummus — fiber, protein, and healthy fats in one",
      "A banana with almond butter is pre-workout fuel perfection",
      "Avoid snacking out of boredom — drink water first, then decide",
    ],
  },
  {
    meal_type: "general",
    time: "any",
    tips: [
      "Eat slowly — it takes 20 minutes for your brain to register fullness",
      "Drink a glass of water before each meal to aid digestion and prevent overeating",
      "Variety is key — rotate your proteins, grains, and vegetables weekly",
      "Cook at home more — you control ingredients, portions, and nutrition",
      "Read labels: avoid foods with more than 5 ingredients you can't pronounce",
      "Fermented foods (kimchi, yogurt, sauerkraut) support your gut microbiome",
      "Eat the rainbow — aim for 5 different colored foods each day",
      "Plan meals ahead to reduce decision fatigue and impulse eating",
      "Protein with every meal helps maintain muscle and keeps you satisfied",
      "Healthy fats (olive oil, avocado, nuts) are essential — don't fear them",
      "Reduce added sugar gradually — your taste buds will adjust in 2 weeks",
      "Batch cook grains and proteins on weekends to save time all week",
      "Listen to your hunger signals — eat when hungry, stop when satisfied",
      "Season with herbs and spices instead of excess salt",
      "Quality sleep affects food choices — tired people crave more sugar",
      "Stress eating is real — try a 5-minute walk before reaching for food",
    ],
  },
];

const pcosTips = [
  "Focus on anti-inflammatory foods: berries, leafy greens, fatty fish, turmeric",
  "Eat protein with every meal to stabilize blood sugar and reduce insulin spikes",
  "Avoid refined carbs and added sugars — they worsen insulin resistance",
  "Include omega-3 rich foods daily: salmon, walnuts, chia seeds, flaxseed",
  "Keep carbs low-glycemic: quinoa, oats, sweet potato, legumes",
  "Add cinnamon to meals — it helps improve insulin sensitivity",
  "Apple cider vinegar before meals may help blood sugar response",
  "Reduce dairy if it triggers inflammation or acne flare-ups",
  "Add turmeric and ginger to cooking for anti-inflammatory benefits",
  "Spearmint tea may help with androgen levels in PCOS",
  "Chromium-rich foods (broccoli, green beans) support insulin function",
  "Magnesium-rich foods (dark chocolate, spinach, almonds) help with sleep and hormones",
  "Inositol-rich foods (citrus, beans, nuts) support ovarian function",
  "Eat every 3-4 hours to maintain stable blood sugar levels",
  "Prioritize fiber — it slows glucose absorption and feeds good gut bacteria",
];

export function getDietTips(
  profile: UserProfile,
  mealType?: "breakfast" | "lunch" | "dinner" | "snack",
  lastMealName?: string
): string[] {
  const tips: string[] = [];
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  // Get meal-specific tips
  if (mealType) {
    const mealTips = allTips.find((t) => t.meal_type === mealType);
    if (mealTips) {
      const shuffled = [...mealTips.tips].sort(() => Math.random() - 0.5);
      tips.push(...shuffled.slice(0, 2));
    }
  }

  // Get time-appropriate tips
  const timeTips = allTips.filter((t) => t.time === timeOfDay || t.time === "any");
  const timeSpecific = timeTips.flatMap((t) => t.tips).sort(() => Math.random() - 0.5);
  tips.push(...timeSpecific.slice(0, 1));

  // PCOS-specific
  if (profile.has_pcos) {
    const shuffledPcos = [...pcosTips].sort(() => Math.random() - 0.5);
    tips.push(...shuffledPcos.slice(0, 2));
  }

  // Activity-based
  if (profile.activity_level === "high") {
    tips.push("With your active lifestyle, aim for 1.6-2g protein per kg of body weight daily");
  }

  // Diet-specific
  if (profile.diet_type === "vegetarian" || profile.diet_type === "vegan") {
    tips.push("Combine legumes with grains (rice + beans) for complete plant proteins");
  }

  // Weight goal
  if (profile.weight_goal === "lose weight") {
    tips.push("Focus on volume eating — fill up on vegetables and lean proteins first");
  }

  // General filler if too few
  if (tips.length < 4) {
    const general = allTips.find((t) => t.meal_type === "general");
    if (general) {
      const shuffled = [...general.tips].sort(() => Math.random() - 0.5);
      tips.push(...shuffled.slice(0, 4 - tips.length));
    }
  }

  return tips.slice(0, 5);
}

export function getDietPlan(profile: UserProfile): string[] {
  return getDietTips(profile);
}

export { getFoodGuidance as default };
