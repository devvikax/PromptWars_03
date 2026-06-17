-- Green Hero Postgres SQL Schema
-- Target: Supabase Database

-- 1. Users Profile Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  is_guest BOOLEAN DEFAULT TRUE,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  water_drops INTEGER DEFAULT 0,
  travel_type TEXT,
  ac_usage TEXT,
  food_type TEXT,
  earth_health TEXT DEFAULT 'Good 😊',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- 2. Carbon Missions Catalog Table
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER DEFAULT 15,
  water_reward INTEGER DEFAULT 1,
  category TEXT CHECK (category IN ('transport', 'energy', 'diet')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Missions are publicly readable" 
  ON missions FOR SELECT 
  TO public 
  USING (true);

-- 3. User Completed Missions Junction Table
CREATE TABLE IF NOT EXISTS user_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own completed missions" 
  ON user_missions FOR ALL 
  USING (auth.uid() = user_id);

-- 4. Achievements / Badges Catalog Table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon_slug TEXT NOT NULL,
  xp_required INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are publicly readable" 
  ON achievements FOR SELECT 
  TO public 
  USING (true);

-- 5. User Unlocked Achievements Junction Table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own badges" 
  ON user_achievements FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock badges" 
  ON user_achievements FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 6. Ecological Progress Logs Table
CREATE TABLE IF NOT EXISTS progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  carbon_saved_g DOUBLE PRECISION DEFAULT 0.0,
  water_saved_l DOUBLE PRECISION DEFAULT 0.0,
  log_date DATE DEFAULT CURRENT_DATE NOT NULL
);

-- Enable RLS
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own progress logs" 
  ON progress_logs FOR ALL 
  USING (auth.uid() = user_id);

-- 7. Ecosystem Collections Catalog Table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('flowers', 'birds', 'butterflies', 'natural_wonders', 'decorations', 'rare_creatures', 'seasonal')),
  description TEXT,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  icon_slug TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collections are publicly readable" 
  ON collections FOR SELECT 
  TO public 
  USING (true);

-- 8. User Unlocked Collections Junction Table
CREATE TABLE IF NOT EXISTS user_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, collection_id)
);

-- Enable RLS
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own collections" 
  ON user_collections FOR ALL 
  USING (auth.uid() = user_id);

-- 9. Ecosystem Rewards Table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('ecosystem_upgrade', 'collection_item', 'xp_boost')),
  category TEXT,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  unlock_condition TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rewards are publicly readable" 
  ON rewards FOR SELECT 
  TO public 
  USING (true);

-- 10. Unlock History Table (Audit log)
CREATE TABLE IF NOT EXISTS unlock_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('achievement', 'collection_item', 'reward')),
  item_id UUID NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE unlock_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unlock history" 
  ON unlock_history FOR SELECT 
  USING (auth.uid() = user_id);

-- 11. User Behavior Table
CREATE TABLE IF NOT EXISTS user_behavior (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ignored_missions_count INTEGER DEFAULT 0,
  preferred_category TEXT,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE user_behavior ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own behavior data"
  ON user_behavior FOR ALL
  USING (auth.uid() = user_id);

-- 12. Mission Performance Table
CREATE TABLE IF NOT EXISTS mission_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  completed_count INTEGER DEFAULT 0,
  ignored_count INTEGER DEFAULT 0,
  skipped_count INTEGER DEFAULT 0,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, category)
);

-- Enable RLS
ALTER TABLE mission_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own mission performance data"
  ON mission_performance FOR ALL
  USING (auth.uid() = user_id);

-- 13. AI Recommendations Table
CREATE TABLE IF NOT EXISTS ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  xp_reward INTEGER NOT NULL,
  water_reward INTEGER NOT NULL,
  impact_score DOUBLE PRECISION NOT NULL,
  difficulty_score DOUBLE PRECISION NOT NULL,
  completion_probability DOUBLE PRECISION NOT NULL,
  preference_match DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own recommendations"
  ON ai_recommendations FOR ALL
  USING (auth.uid() = user_id);

-- 14. Mission History Table
CREATE TABLE IF NOT EXISTS mission_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mission_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('recommended', 'active', 'completed', 'ignored', 'skipped')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE mission_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mission history"
  ON mission_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mission history"
  ON mission_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 15. AI Insight Logs Table
CREATE TABLE IF NOT EXISTS insight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE insight_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insight logs"
  ON insight_logs FOR SELECT
  USING (auth.uid() = user_id);

-- 16. Seeding Catalogs
-- Achievements Seeding
INSERT INTO achievements (key, title, description, icon_slug, xp_required) VALUES
('first-mission', 'First Steps', 'Logged your first sustainable carbon saving action.', '🌱', 15),
('first-level-up', 'Eco Sprout', 'Leveled up your ecosystem for the first time.', '🌿', 50),
('first-week', 'Eco Habit', 'Completed at least one action every day for a week.', '🗓️', 100),
('streak-3', 'Habit Builder', 'Logged actions for 3 days in a row.', '🔥', 30),
('streak-7', 'Eco Devotee', 'Logged actions for 7 days in a row.', '⚡', 70),
('streak-30', 'Consistency Legend', 'Logged actions for 30 days in a row.', '🏆', 300),
('streak-100', 'Carbon Slayer', 'Logged actions for 100 days in a row.', '👑', 1000),
('missions-10', 'Green Apprentice', 'Completed 10 sustainable carbon missions.', '🌲', 100),
('missions-50', 'Forest Guardian', 'Completed 50 sustainable carbon missions.', '🌳', 500),
('missions-100', 'Ecosystem Savior', 'Completed 100 sustainable carbon missions.', '🌎', 1000),
('missions-500', 'Planet Healer', 'Completed 500 sustainable carbon missions.', '🪐', 5000),
('earth-protector', 'Earth Protector', 'Unlocked Level 3 carbon savings.', '🌍', 250),
('eco-warrior', 'Eco Warrior', 'Unlocked Level 7 carbon savings.', '🛡️', 750),
('green-champion', 'Green Champion', 'Unlocked Level 15 carbon savings.', '🥇', 2000)
ON CONFLICT (key) DO NOTHING;

-- Collections Seeding
INSERT INTO collections (key, title, category, description, rarity, icon_slug) VALUES
('flower-rose', 'Wild Rose', 'flowers', 'A fragrant pink rose that grows in small clusters.', 'common', '🌹'),
('flower-sun', 'Sunny Dandelion', 'flowers', 'Bright yellow flowers that cheer up the grassy base.', 'common', '🌼'),
('flower-tulip', 'Sweet Tulip', 'flowers', 'A rare pink tulip symbolizing renewal and growth.', 'rare', '🌷'),
('flower-cherry', 'Cherry Blossom', 'flowers', 'An epic pastel-pink petal cluster sitting on the tree twigs.', 'epic', '🌸'),
('flower-gold', 'Golden Cosmos', 'flowers', 'A legendary glowing gold flower radiating purity.', 'legendary', '✨'),
('bird-blue', 'Forest Bluebird', 'birds', 'A cheerful bluebird that perches on tree branches.', 'common', '🐦'),
('bird-sparrow', 'Field Sparrow', 'birds', 'A small brown bird that sings sweet morning songs.', 'common', '🐤'),
('bird-owl', 'Ancient Horned Owl', 'birds', 'An epic sage owl that rests in the high crown.', 'epic', '🦉'),
('butterfly-purple', 'Purple Monarch', 'butterflies', 'A beautiful purple butterfly flying in figure-eights.', 'common', '🦋'),
('butterfly-cyan', 'Cyan Emperor', 'butterflies', 'A rare glowing butterfly drifting in gentle paths.', 'rare', '🦋'),
('wonder-waterfall', 'Ecosystem Waterfall', 'natural_wonders', 'A legendary waterfall cascading down the cliff side.', 'legendary', '🌊'),
('wonder-pond', 'Zen Reflection Pond', 'natural_wonders', 'An epic pond reflecting light on the grass surface.', 'epic', '⛲'),
('wonder-crystal', 'Magical Amethyst', 'natural_wonders', 'A rare glowing purple crystal cluster.', 'rare', '🔮'),
('deco-nest', 'Cozy Twig Nest', 'decorations', 'A small straw nest tucked safely on a branch.', 'common', '🪺'),
('deco-lantern', 'Solar Lantern', 'decorations', 'A warm solar lantern placed at the tree root base.', 'rare', '🏮'),
('deco-lights', 'Fairy Lights', 'decorations', 'Magical lights hanging around the foliage canopy.', 'epic', '✨')
ON CONFLICT (key) DO NOTHING;

-- Rewards Seeding
INSERT INTO rewards (key, title, description, reward_type, category, rarity, unlock_condition) VALUES
('reward-flowers', 'Blooming Flowers', 'Ecosystem flowers begin blooming on the island base.', 'ecosystem_upgrade', 'flower', 'common', 'Reach 7-day streak or Stage 5'),
('reward-nest', 'Cozy Nest', 'Unlock a cozy bird nest on the tree branch.', 'ecosystem_upgrade', 'nest', 'common', 'Complete 30 missions'),
('reward-fireflies', 'Magical Fireflies', 'Unlock glowing fireflies floating around at night.', 'ecosystem_upgrade', 'creature', 'rare', 'Complete 100 missions'),
('reward-waterfall', 'Ecosystem Waterfall', 'Unlock the cascading waterfall flowing off the island edge.', 'ecosystem_upgrade', 'wonder', 'legendary', 'Complete 200 missions'),
('reward-golden-leaves', 'Rare Golden Leaves', 'Unlock the legendary golden leaves for your centerpiece tree.', 'ecosystem_upgrade', 'flower', 'legendary', 'Unlock the Earth Protector achievement')
ON CONFLICT (key) DO NOTHING;

-- Missions Seeding
INSERT INTO missions (id, title, description, xp_reward, water_reward, category) VALUES
('595dbf41-0731-4171-8bc6-52c6f1400001', 'Walk to the Store', 'Walk instead of driving for short trips under 1 km today.', 15, 1, 'transport'),
('595dbf41-0731-4171-8bc6-52c6f1400002', 'Cycle to Work / School', 'Cycle to save travel carbon emissions today.', 25, 1, 'transport'),
('595dbf41-0731-4171-8bc6-52c6f1400003', 'No Car Day', 'Ditch driving entirely today. Walk, cycle, or use public transit.', 40, 1, 'transport'),
('595dbf41-0731-4171-8bc6-52c6f1400004', 'Unplug Idle Chargers', 'Unplug phone chargers and home appliances when not in use.', 15, 1, 'energy'),
('595dbf41-0731-4171-8bc6-52c6f1400005', 'Wash Clothes in Cold Water', 'Use cold water cycle on your laundry to save heating power.', 25, 1, 'energy'),
('595dbf41-0731-4171-8bc6-52c6f1400006', 'Hour of Darkness', 'Turn off all optional lights and electronics for 1 hour tonight.', 40, 1, 'energy'),
('595dbf41-0731-4171-8bc6-52c6f1400007', 'Choose a Plant-Based Snack', 'Eat fresh fruit or nuts instead of processed snacks.', 15, 1, 'diet'),
('595dbf41-0731-4171-8bc6-52c6f1400008', 'Try One Vegetarian Meal Today', 'Swap meat for a delicious plant-based breakfast, lunch, or dinner.', 25, 1, 'diet'),
('595dbf41-0731-4171-8bc6-52c6f1400009', 'Fully Plant-Based Day', 'Choose vegetarian or vegan meals for all food intakes today.', 40, 1, 'diet'),
('595dbf41-0731-4171-8bc6-52c6f1400010', 'Sort Your Trash', 'Correctly separate recyclables and compostables from landfill trash.', 15, 1, 'diet'),
('595dbf41-0731-4171-8bc6-52c6f1400011', 'No Single-Use Plastics', 'Use a reusable bottle and canvas bags instead of plastic options today.', 25, 1, 'energy'),
('595dbf41-0731-4171-8bc6-52c6f1400012', 'Zero Waste Day', 'Avoid producing any landfill waste for the next 24 hours.', 40, 1, 'transport'),
('595dbf41-0731-4171-8bc6-52c6f1400013', 'Turn Tap Off While Brushing', 'Conserve water by turning off the tap while brushing teeth.', 15, 2, 'energy'),
('595dbf41-0731-4171-8bc6-52c6f1400014', '5-Minute Shower', 'Conserve clean water by taking a quick shower in under 5 minutes.', 25, 2, 'diet'),
('595dbf41-0731-4171-8bc6-52c6f1400015', 'Bucket Wash Car/Cycle', 'Use a bucket instead of running water hose to clean transport items.', 40, 3, 'transport'),
('595dbf41-0731-4171-8bc6-52c6f1400016', 'Share an Eco Tip', 'Tell a family member about home energy saving habits today.', 15, 1, 'energy'),
('595dbf41-0731-4171-8bc6-52c6f1400017', 'Pick Up 3 Pieces of Litter', 'Collect litter from your neighborhood street or local park.', 25, 1, 'transport'),
('595dbf41-0731-4171-8bc6-52c6f1400018', 'Organize an Eco Challenge', 'Invite 3 friends to join you in completing a Green Hero mission.', 40, 2, 'diet')
ON CONFLICT (id) DO NOTHING;

-- 17. RPC Function for guest progress merge
CREATE OR REPLACE FUNCTION merge_guest_progress(p_guest_id UUID, p_auth_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Update completed missions
  UPDATE user_missions 
  SET user_id = p_auth_user_id 
  WHERE user_id = p_guest_id;

  -- Update unlocked achievements
  UPDATE user_achievements 
  SET user_id = p_auth_user_id 
  WHERE user_id = p_guest_id;

  -- Update unlocked collections
  UPDATE user_collections 
  SET user_id = p_auth_user_id 
  WHERE user_id = p_guest_id;

  -- Update progress logs
  UPDATE progress_logs 
  SET user_id = p_auth_user_id 
  WHERE user_id = p_guest_id;

  -- Delete guest user entry from user profiles if exists
  DELETE FROM users WHERE id = p_guest_id;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

