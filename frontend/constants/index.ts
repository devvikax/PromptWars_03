export const APP_ROUTES = {
  SPLASH: "/",
  DASHBOARD: "/dashboard",
  PROGRESS: "/progress",
  REWARDS: "/rewards",
  PROFILE: "/profile",
  AUTH: "/auth",
  ONBOARDING: "/onboarding",
} as const

export const DESIGN_TOKENS = {
  fontFamily: "Outfit, sans-serif",
  borderRadius: {
    card: "16px",
    button: "9999px",
  },
} as const

// Carbon offset calculations
// Translation formulas matching FRONTEND_ARCHITECTURE.md (utils/formula-carbon.ts)
export const CARBON_FORMULAS = {
  // Translate walked distance to carbon saved (g CO2 per km)
  transportSavedGPerKm: 120, 
  // Translate energy saving actions to tree growth equivalents
  carbonGPerTreeEquivalent: 12000, // 12kg of CO2 is equivalent to planting 1 tree
  waterLPerBucket: 10,
} as const
