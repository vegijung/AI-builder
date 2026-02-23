-- =============================================================================
-- AI-Builder Supabase Seed File
-- =============================================================================
-- Self-contained SQL file: creates tables, enables RLS, sets policies,
-- and inserts all reference data.  Safe to run against a fresh Supabase DB.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
-- gen_random_uuid() is available by default in Supabase (pgcrypto / pg14+).

-- ---------------------------------------------------------------------------
-- 1. TABLES
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS categories (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text UNIQUE NOT NULL CHECK (char_length(name) <= 200),
  color      text NOT NULL CHECK (char_length(color) <= 20),
  abbr       text NOT NULL CHECK (char_length(abbr) <= 20),
  sort_order integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS value_chain_areas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text UNIQUE NOT NULL CHECK (char_length(name) <= 200),
  short_label text NOT NULL CHECK (char_length(short_label) <= 50),
  sort_order  integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS building_blocks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text UNIQUE NOT NULL CHECK (char_length(name) <= 200),
  category   text NOT NULL REFERENCES categories(name),
  maturity   integer NOT NULL CHECK (maturity BETWEEN 1 AND 5),
  sort_order integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS use_cases (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text UNIQUE NOT NULL CHECK (char_length(name) <= 200),
  activity_type   text NOT NULL CHECK (activity_type IN ('Primary', 'Support')),
  value_chain_area text NOT NULL REFERENCES value_chain_areas(name),
  sort_order      integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS use_case_blocks (
  use_case_id uuid  NOT NULL REFERENCES use_cases(id) ON DELETE CASCADE,
  block_name  text  NOT NULL REFERENCES building_blocks(name) ON DELETE CASCADE,
  PRIMARY KEY (use_case_id, block_name)
);

-- ---------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------

ALTER TABLE categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_chain_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_blocks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE use_cases        ENABLE ROW LEVEL SECURITY;
ALTER TABLE use_case_blocks  ENABLE ROW LEVEL SECURITY;

-- ---- categories -----------------------------------------------------------

CREATE POLICY "categories_select_all"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "categories_insert_admin"
  ON categories FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' LIKE '%@mmgmc.ch');

CREATE POLICY "categories_update_admin"
  ON categories FOR UPDATE
  USING (auth.jwt() ->> 'email' LIKE '%@mmgmc.ch');

CREATE POLICY "categories_delete_admin"
  ON categories FOR DELETE
  USING (auth.jwt() ->> 'email' LIKE '%@mmgmc.ch');

-- ---- value_chain_areas ----------------------------------------------------

CREATE POLICY "value_chain_areas_select_all"
  ON value_chain_areas FOR SELECT
  USING (true);

CREATE POLICY "value_chain_areas_insert_admin"
  ON value_chain_areas FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' LIKE '%@mmgmc.ch');

CREATE POLICY "value_chain_areas_update_admin"
  ON value_chain_areas FOR UPDATE
  USING (auth.jwt() ->> 'email' LIKE '%@mmgmc.ch');

CREATE POLICY "value_chain_areas_delete_admin"
  ON value_chain_areas FOR DELETE
  USING (auth.jwt() ->> 'email' LIKE '%@mmgmc.ch');

-- ---- building_blocks ------------------------------------------------------

CREATE POLICY "building_blocks_select_all"
  ON building_blocks FOR SELECT
  USING (true);

CREATE POLICY "building_blocks_insert_admin"
  ON building_blocks FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' LIKE '%@mmgmc.ch');

CREATE POLICY "building_blocks_update_admin"
  ON building_blocks FOR UPDATE
  USING (auth.jwt() ->> 'email' LIKE '%@mmgmc.ch');

CREATE POLICY "building_blocks_delete_admin"
  ON building_blocks FOR DELETE
  USING (auth.jwt() ->> 'email' LIKE '%@mmgmc.ch');

-- ---- use_cases ------------------------------------------------------------

CREATE POLICY "use_cases_select_all"
  ON use_cases FOR SELECT
  USING (true);

CREATE POLICY "use_cases_insert_admin"
  ON use_cases FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' LIKE '%@mmgmc.ch');

CREATE POLICY "use_cases_update_admin"
  ON use_cases FOR UPDATE
  USING (auth.jwt() ->> 'email' LIKE '%@mmgmc.ch');

CREATE POLICY "use_cases_delete_admin"
  ON use_cases FOR DELETE
  USING (auth.jwt() ->> 'email' LIKE '%@mmgmc.ch');

-- ---- use_case_blocks ------------------------------------------------------

CREATE POLICY "use_case_blocks_select_all"
  ON use_case_blocks FOR SELECT
  USING (true);

CREATE POLICY "use_case_blocks_insert_admin"
  ON use_case_blocks FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' LIKE '%@mmgmc.ch');

CREATE POLICY "use_case_blocks_update_admin"
  ON use_case_blocks FOR UPDATE
  USING (auth.jwt() ->> 'email' LIKE '%@mmgmc.ch');

CREATE POLICY "use_case_blocks_delete_admin"
  ON use_case_blocks FOR DELETE
  USING (auth.jwt() ->> 'email' LIKE '%@mmgmc.ch');

-- ---------------------------------------------------------------------------
-- 3. SEED DATA
-- ---------------------------------------------------------------------------

-- ---- categories -----------------------------------------------------------

INSERT INTO categories (name, color, abbr, sort_order) VALUES
  ('Understanding & Summarization', '#FBB740', 'U&S', 0),
  ('Extraction & Structuring',     '#F47B20', 'E&S', 1),
  ('Generation & Creativity',      '#50D8A8', 'G&C', 2),
  ('Prediction & Optimization',    '#5BC8D4', 'P&O', 3),
  ('Interaction & Assistance',     '#D94070', 'I&A', 4),
  ('Automation & Execution',       '#5B8AC4', 'A&E', 5),
  ('Coding & Development',         '#7B68C4', 'C&D', 6);

-- ---- value_chain_areas ----------------------------------------------------

INSERT INTO value_chain_areas (name, short_label, sort_order) VALUES
  ('Business Direction / Management', 'Management',      0),
  ('Firm Infrastructure',             'Infrastructure',   1),
  ('Human Ressource Management',      'HR',               2),
  ('Technology',                      'Technology',       3),
  ('Procurement',                     'Procurement',      4),
  ('Legal / Compliance',              'Legal / Compliance', 5),
  ('Marketing / Sales',               'Marketing & Sales', 6),
  ('Service',                         'Service',          7),
  ('Product Management',              'Product Management', 8),
  ('Logistics',                       'Logistics',        9),
  ('Operations',                      'Operations',       10);

-- ---- building_blocks ------------------------------------------------------

INSERT INTO building_blocks (name, category, maturity, sort_order) VALUES
  -- Understanding & Summarization
  ('Text Summarization',       'Understanding & Summarization', 5, 0),
  ('Multi-document synthesis', 'Understanding & Summarization', 4, 1),
  ('Context Understanding',    'Understanding & Summarization', 4, 2),
  ('Translation',              'Understanding & Summarization', 5, 3),
  ('Semantic Search',          'Understanding & Summarization', 4, 4),
  ('Reasoning & Logic',        'Understanding & Summarization', 3, 5),
  -- Extraction & Structuring
  ('Entity Extraction',        'Extraction & Structuring', 4, 6),
  ('Classification',           'Extraction & Structuring', 4, 7),
  ('Information Mapping',      'Extraction & Structuring', 3, 8),
  ('Document Parsing',         'Extraction & Structuring', 3, 9),
  ('Knowledge Graph Generation','Extraction & Structuring', 2, 10),
  ('Data Quality & Enrichment','Extraction & Structuring', 3, 11),
  -- Generation & Creativity
  ('Text Generation',          'Generation & Creativity', 4, 12),
  ('Visual Generation',        'Generation & Creativity', 4, 13),
  ('Design Ideation',          'Generation & Creativity', 3, 14),
  ('Scenario Simulation',      'Generation & Creativity', 2, 15),
  ('Storytelling Generation',  'Generation & Creativity', 3, 16),
  -- Prediction & Optimization
  ('Predictive Analytics',     'Prediction & Optimization', 4, 17),
  ('Anomaly Detection',        'Prediction & Optimization', 4, 18),
  ('Optimization Modelling',   'Prediction & Optimization', 3, 19),
  ('Scoring & Ranking',        'Prediction & Optimization', 4, 20),
  ('Decision Support',         'Prediction & Optimization', 3, 21),
  -- Interaction & Assistance
  ('Conversational AI',        'Interaction & Assistance', 5, 22),
  ('Copilots',                 'Interaction & Assistance', 3, 23),
  ('Knowledge Q&A',            'Interaction & Assistance', 4, 24),
  ('Contextual Recall',        'Interaction & Assistance', 2, 25),
  ('Multimodal Interaction',   'Interaction & Assistance', 3, 26),
  -- Automation & Execution
  ('Document Automation',      'Automation & Execution', 3, 27),
  ('Workflow Automation',       'Automation & Execution', 3, 28),
  ('RPA & AI Integration',    'Automation & Execution', 3, 29),
  ('API Execution',            'Automation & Execution', 3, 30),
  ('Agentic Systems',          'Automation & Execution', 1, 31),
  -- Coding & Development
  ('Code Generation',          'Coding & Development', 5, 32),
  ('Code Completion',          'Coding & Development', 5, 33),
  ('Code Explanation',         'Coding & Development', 4, 34),
  ('Refactoring & Optimization','Coding & Development', 3, 35),
  ('Testing & Debugging',      'Coding & Development', 3, 36),
  ('Security Code Analysis',   'Coding & Development', 3, 37);

-- ---- use_cases ------------------------------------------------------------

INSERT INTO use_cases (name, activity_type, value_chain_area, sort_order) VALUES
  ('Query generation',               'Support', 'Technology',                       0),
  ('Multi-lingual translation',      'Primary', 'Service',                          1),
  ('Content repurposing',            'Primary', 'Marketing / Sales',                2),
  ('Summarize support tickets',      'Primary', 'Service',                          3),
  ('Summarizing feedback',           'Support', 'Human Ressource Management',       4),
  ('Summarize customer insights',    'Primary', 'Product Management',               5),
  ('Analyze feedback',               'Primary', 'Product Management',               6),
  ('Competitive intelligence',       'Primary', 'Product Management',               7),
  ('Voice-of-customer analysis',     'Primary', 'Service',                          8),
  ('Summarize strategic report',     'Support', 'Business Direction / Management',  9),
  ('Code generation',                'Support', 'Technology',                       10),
  ('Supplier risk scoring',          'Support', 'Procurement',                      11),
  ('Regulatory change monitoring',   'Support', 'Legal / Compliance',               12),
  ('Shipment tracking summaries',    'Primary', 'Logistics',                        13),
  ('Sentiment detection',            'Primary', 'Service',                          14),
  ('Assisted software development',  'Support', 'Technology',                       15),
  ('Employee Q&A bots',             'Support', 'Human Ressource Management',       16),
  ('Track KPIs',                     'Support', 'Firm Infrastructure',              17),
  ('Chatbots',                       'Primary', 'Service',                          18),
  ('Risk assessment',                'Support', 'Business Direction / Management',  19),
  ('Board reporting automation',     'Support', 'Business Direction / Management',  20),
  ('Candidate screening',            'Support', 'Human Ressource Management',       21),
  ('Lead scoring & prioritization',  'Primary', 'Marketing / Sales',                22),
  ('RFP generation / evaluation',    'Support', 'Procurement',                      23),
  ('Knowledge base auto-updating',   'Primary', 'Service',                          24),
  ('Compliance report drafting',     'Support', 'Legal / Compliance',               25),
  ('Policy comparison',              'Support', 'Legal / Compliance',               26),
  ('Spend analysis',                 'Support', 'Procurement',                      27),
  ('Infrastructure anomaly detection','Support','Technology',                       28),
  ('Vendor classification',          'Support', 'Procurement',                      29),
  ('Forecast sales',                 'Primary', 'Marketing / Sales',                30),
  ('Automate routing',               'Primary', 'Service',                          31),
  ('Automated test generation',      'Support', 'Technology',                       32),
  ('Detect anomalies',               'Support', 'Firm Infrastructure',              33),
  ('System monitoring',              'Support', 'Technology',                       34),
  ('Process monitoring',             'Primary', 'Operations',                       35),
  ('Personalize messaging',          'Primary', 'Marketing / Sales',                36),
  ('Compliance document generation', 'Support', 'Firm Infrastructure',              37),
  ('Contract clause extraction',     'Support', 'Procurement',                      38),
  ('Security vulnerability detection','Support','Technology',                       39),
  ('Contract review',                'Support', 'Legal / Compliance',               40),
  ('Generate campaigns',             'Primary', 'Marketing / Sales',                41),
  ('Generate product specs',         'Primary', 'Product Management',               42),
  ('Legacy code modernization',      'Support', 'Technology',                       43),
  ('Voice-based customer service',   'Primary', 'Service',                          44),
  ('Visual document verification',   'Support', 'Firm Infrastructure',              45),
  ('Personalized client advisory',   'Primary', 'Service',                          46),
  ('Demand prediction',              'Support', 'Procurement',                      47),
  ('Demand forecasting',             'Primary', 'Logistics',                        48),
  ('Extract data from reports',      'Support', 'Firm Infrastructure',              49),
  ('Resume parsing',                 'Support', 'Human Ressource Management',       50),
  ('Data extraction',                'Support', 'Technology',                       51),
  ('Data extraction from sensors',   'Primary', 'Operations',                       52),
  ('Personalized learning path',     'Support', 'Human Ressource Management',       53),
  ('AI assistants for CRM',          'Primary', 'Marketing / Sales',                54),
  ('Predictive maintenance',         'Primary', 'Operations',                       55),
  ('SOP generation',                 'Primary', 'Operations',                       56),
  ('Use copilots for decision prep', 'Support', 'Business Direction / Management',  57),
  ('Automate approvals',             'Support', 'Firm Infrastructure',              58),
  ('Onboarding automation',          'Support', 'Human Ressource Management',       59),
  ('Financial recon automation',     'Support', 'Firm Infrastructure',              60),
  ('Code review automation',         'Support', 'Technology',                       61),
  ('Regulatory relationship mapping','Support', 'Legal / Compliance',               62),
  ('Client network analysis',        'Primary', 'Marketing / Sales',                63),
  ('Route optimization',             'Primary', 'Logistics',                        64),
  ('Generate strategic plans',       'Support', 'Business Direction / Management',  65),
  ('Inventory automation',           'Primary', 'Logistics',                        66),
  ('Long-running case management',   'Primary', 'Service',                          67),
  ('Automated ordering',             'Support', 'Procurement',                      68),
  ('Forecast scenarios',             'Support', 'Business Direction / Management',  69),
  ('Simulate scenarios',             'Primary', 'Product Management',               70),
  ('Autonomous research & reporting','Support', 'Business Direction / Management',  71),
  ('Workflow automation (Tech)',      'Support', 'Technology',                       72),
  ('Workflow automation (Ops)',       'Primary', 'Operations',                       73),
  ('End-to-end process orchestration','Primary','Operations',                       74);

-- ---- use_case_blocks (junction) -------------------------------------------
-- Each INSERT uses a subquery to resolve the use_case id by name.

-- 1. Query generation
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Code Generation' FROM use_cases WHERE name = 'Query generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Query generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Reasoning & Logic' FROM use_cases WHERE name = 'Query generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Code Completion' FROM use_cases WHERE name = 'Query generation';

-- 2. Multi-lingual translation
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Translation' FROM use_cases WHERE name = 'Multi-lingual translation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Multi-lingual translation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Generation' FROM use_cases WHERE name = 'Multi-lingual translation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Multi-lingual translation';

-- 3. Content repurposing
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Generation' FROM use_cases WHERE name = 'Content repurposing';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Summarization' FROM use_cases WHERE name = 'Content repurposing';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Translation' FROM use_cases WHERE name = 'Content repurposing';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Content repurposing';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Design Ideation' FROM use_cases WHERE name = 'Content repurposing';

-- 4. Summarize support tickets
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Summarization' FROM use_cases WHERE name = 'Summarize support tickets';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Summarize support tickets';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Summarize support tickets';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Summarize support tickets';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Summarize support tickets';

-- 5. Summarizing feedback
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Summarization' FROM use_cases WHERE name = 'Summarizing feedback';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Summarizing feedback';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Summarizing feedback';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Summarizing feedback';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Summarizing feedback';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Summarizing feedback';

-- 6. Summarize customer insights
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Summarization' FROM use_cases WHERE name = 'Summarize customer insights';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Summarize customer insights';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Summarize customer insights';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Summarize customer insights';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Summarize customer insights';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Summarize customer insights';

-- 7. Analyze feedback
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Analyze feedback';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Analyze feedback';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Analyze feedback';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Summarization' FROM use_cases WHERE name = 'Analyze feedback';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Analyze feedback';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Analyze feedback';

-- 8. Competitive intelligence
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Competitive intelligence';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Competitive intelligence';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Competitive intelligence';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Competitive intelligence';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Competitive intelligence';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Summarization' FROM use_cases WHERE name = 'Competitive intelligence';

-- 9. Voice-of-customer analysis
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Voice-of-customer analysis';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Summarization' FROM use_cases WHERE name = 'Voice-of-customer analysis';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Voice-of-customer analysis';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Voice-of-customer analysis';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Voice-of-customer analysis';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Voice-of-customer analysis';

-- 10. Summarize strategic report
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Summarization' FROM use_cases WHERE name = 'Summarize strategic report';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Summarize strategic report';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Summarize strategic report';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Reasoning & Logic' FROM use_cases WHERE name = 'Summarize strategic report';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Summarize strategic report';

-- 11. Code generation
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Code Generation' FROM use_cases WHERE name = 'Code generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Code Completion' FROM use_cases WHERE name = 'Code generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Code generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Reasoning & Logic' FROM use_cases WHERE name = 'Code generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Testing & Debugging' FROM use_cases WHERE name = 'Code generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Code Explanation' FROM use_cases WHERE name = 'Code generation';

-- 12. Supplier risk scoring
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Supplier risk scoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Supplier risk scoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Predictive Analytics' FROM use_cases WHERE name = 'Supplier risk scoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Supplier risk scoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Supplier risk scoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Supplier risk scoring';

-- 13. Regulatory change monitoring
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Regulatory change monitoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Regulatory change monitoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Regulatory change monitoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Regulatory change monitoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Regulatory change monitoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Regulatory change monitoring';

-- 14. Shipment tracking summaries
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Shipment tracking summaries';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Summarization' FROM use_cases WHERE name = 'Shipment tracking summaries';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Shipment tracking summaries';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Shipment tracking summaries';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'API Execution' FROM use_cases WHERE name = 'Shipment tracking summaries';

-- 15. Sentiment detection
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Sentiment detection';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Sentiment detection';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Sentiment detection';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Sentiment detection';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Sentiment detection';

-- 16. Assisted software development
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Code Completion' FROM use_cases WHERE name = 'Assisted software development';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Code Generation' FROM use_cases WHERE name = 'Assisted software development';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Assisted software development';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Code Explanation' FROM use_cases WHERE name = 'Assisted software development';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Testing & Debugging' FROM use_cases WHERE name = 'Assisted software development';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Refactoring & Optimization' FROM use_cases WHERE name = 'Assisted software development';

-- 17. Employee Q&A bots
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Conversational AI' FROM use_cases WHERE name = 'Employee Q&A bots';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Knowledge Q&A' FROM use_cases WHERE name = 'Employee Q&A bots';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Employee Q&A bots';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Employee Q&A bots';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Contextual Recall' FROM use_cases WHERE name = 'Employee Q&A bots';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Employee Q&A bots';

-- 18. Track KPIs
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Track KPIs';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Predictive Analytics' FROM use_cases WHERE name = 'Track KPIs';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Track KPIs';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'API Execution' FROM use_cases WHERE name = 'Track KPIs';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Summarization' FROM use_cases WHERE name = 'Track KPIs';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Information Mapping' FROM use_cases WHERE name = 'Track KPIs';

-- 19. Chatbots
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Conversational AI' FROM use_cases WHERE name = 'Chatbots';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Knowledge Q&A' FROM use_cases WHERE name = 'Chatbots';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Chatbots';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Contextual Recall' FROM use_cases WHERE name = 'Chatbots';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Chatbots';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Chatbots';

-- 20. Risk assessment
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Risk assessment';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Predictive Analytics' FROM use_cases WHERE name = 'Risk assessment';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Risk assessment';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Risk assessment';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Decision Support' FROM use_cases WHERE name = 'Risk assessment';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Risk assessment';

-- 21. Board reporting automation
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Board reporting automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Generation' FROM use_cases WHERE name = 'Board reporting automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Summarization' FROM use_cases WHERE name = 'Board reporting automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Automation' FROM use_cases WHERE name = 'Board reporting automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Visual Generation' FROM use_cases WHERE name = 'Board reporting automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Information Mapping' FROM use_cases WHERE name = 'Board reporting automation';

-- 22. Candidate screening
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Candidate screening';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Candidate screening';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Candidate screening';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Parsing' FROM use_cases WHERE name = 'Candidate screening';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Candidate screening';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Candidate screening';

-- 23. Lead scoring & prioritization
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Lead scoring & prioritization';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Predictive Analytics' FROM use_cases WHERE name = 'Lead scoring & prioritization';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Lead scoring & prioritization';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Lead scoring & prioritization';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Data Quality & Enrichment' FROM use_cases WHERE name = 'Lead scoring & prioritization';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Lead scoring & prioritization';

-- 24. RFP generation / evaluation
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Generation' FROM use_cases WHERE name = 'RFP generation / evaluation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Parsing' FROM use_cases WHERE name = 'RFP generation / evaluation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'RFP generation / evaluation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'RFP generation / evaluation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'RFP generation / evaluation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'RFP generation / evaluation';

-- 25. Knowledge base auto-updating
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Knowledge base auto-updating';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Generation' FROM use_cases WHERE name = 'Knowledge base auto-updating';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Knowledge base auto-updating';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Knowledge base auto-updating';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Automation' FROM use_cases WHERE name = 'Knowledge base auto-updating';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Knowledge Q&A' FROM use_cases WHERE name = 'Knowledge base auto-updating';

-- 26. Compliance report drafting
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Generation' FROM use_cases WHERE name = 'Compliance report drafting';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Compliance report drafting';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Compliance report drafting';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Compliance report drafting';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Automation' FROM use_cases WHERE name = 'Compliance report drafting';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Compliance report drafting';

-- 27. Policy comparison
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Policy comparison';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Reasoning & Logic' FROM use_cases WHERE name = 'Policy comparison';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Policy comparison';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Policy comparison';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Policy comparison';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Policy comparison';

-- 28. Spend analysis
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Spend analysis';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Spend analysis';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Data Quality & Enrichment' FROM use_cases WHERE name = 'Spend analysis';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Predictive Analytics' FROM use_cases WHERE name = 'Spend analysis';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Spend analysis';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Spend analysis';

-- 29. Infrastructure anomaly detection
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Infrastructure anomaly detection';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Predictive Analytics' FROM use_cases WHERE name = 'Infrastructure anomaly detection';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Infrastructure anomaly detection';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'API Execution' FROM use_cases WHERE name = 'Infrastructure anomaly detection';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Infrastructure anomaly detection';

-- 30. Vendor classification
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Vendor classification';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Vendor classification';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Vendor classification';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Data Quality & Enrichment' FROM use_cases WHERE name = 'Vendor classification';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Vendor classification';

-- 31. Forecast sales
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Predictive Analytics' FROM use_cases WHERE name = 'Forecast sales';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Forecast sales';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Optimization Modelling' FROM use_cases WHERE name = 'Forecast sales';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Forecast sales';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Forecast sales';

-- 32. Automate routing
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Automate routing';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Automate routing';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Automate routing';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Automate routing';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Workflow Automation' FROM use_cases WHERE name = 'Automate routing';

-- 33. Automated test generation
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Testing & Debugging' FROM use_cases WHERE name = 'Automated test generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Code Generation' FROM use_cases WHERE name = 'Automated test generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Automated test generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Reasoning & Logic' FROM use_cases WHERE name = 'Automated test generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Code Explanation' FROM use_cases WHERE name = 'Automated test generation';

-- 34. Detect anomalies
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Detect anomalies';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Predictive Analytics' FROM use_cases WHERE name = 'Detect anomalies';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Detect anomalies';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Data Quality & Enrichment' FROM use_cases WHERE name = 'Detect anomalies';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'API Execution' FROM use_cases WHERE name = 'Detect anomalies';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Detect anomalies';

-- 35. System monitoring
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'System monitoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Predictive Analytics' FROM use_cases WHERE name = 'System monitoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'System monitoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'API Execution' FROM use_cases WHERE name = 'System monitoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Decision Support' FROM use_cases WHERE name = 'System monitoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'System monitoring';

-- 36. Process monitoring
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Process monitoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Predictive Analytics' FROM use_cases WHERE name = 'Process monitoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Process monitoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'API Execution' FROM use_cases WHERE name = 'Process monitoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Decision Support' FROM use_cases WHERE name = 'Process monitoring';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Process monitoring';

-- 37. Personalize messaging
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Generation' FROM use_cases WHERE name = 'Personalize messaging';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Personalize messaging';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Personalize messaging';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Personalize messaging';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Personalize messaging';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Contextual Recall' FROM use_cases WHERE name = 'Personalize messaging';

-- 38. Compliance document generation
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Generation' FROM use_cases WHERE name = 'Compliance document generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Automation' FROM use_cases WHERE name = 'Compliance document generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Compliance document generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Compliance document generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Compliance document generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Parsing' FROM use_cases WHERE name = 'Compliance document generation';

-- 39. Contract clause extraction
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Parsing' FROM use_cases WHERE name = 'Contract clause extraction';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Contract clause extraction';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Contract clause extraction';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Reasoning & Logic' FROM use_cases WHERE name = 'Contract clause extraction';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Contract clause extraction';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Contract clause extraction';

-- 40. Security vulnerability detection
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Security Code Analysis' FROM use_cases WHERE name = 'Security vulnerability detection';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Security vulnerability detection';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Security vulnerability detection';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Security vulnerability detection';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Testing & Debugging' FROM use_cases WHERE name = 'Security vulnerability detection';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Code Explanation' FROM use_cases WHERE name = 'Security vulnerability detection';

-- 41. Contract review
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Parsing' FROM use_cases WHERE name = 'Contract review';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Reasoning & Logic' FROM use_cases WHERE name = 'Contract review';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Contract review';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Contract review';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Contract review';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Contract review';

-- 42. Generate campaigns
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Generation' FROM use_cases WHERE name = 'Generate campaigns';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Visual Generation' FROM use_cases WHERE name = 'Generate campaigns';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Storytelling Generation' FROM use_cases WHERE name = 'Generate campaigns';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Design Ideation' FROM use_cases WHERE name = 'Generate campaigns';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Generate campaigns';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Generate campaigns';

-- 43. Generate product specs
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Generation' FROM use_cases WHERE name = 'Generate product specs';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Reasoning & Logic' FROM use_cases WHERE name = 'Generate product specs';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Generate product specs';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Generate product specs';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Generate product specs';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Automation' FROM use_cases WHERE name = 'Generate product specs';

-- 44. Legacy code modernization
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Refactoring & Optimization' FROM use_cases WHERE name = 'Legacy code modernization';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Code Explanation' FROM use_cases WHERE name = 'Legacy code modernization';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Code Generation' FROM use_cases WHERE name = 'Legacy code modernization';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Testing & Debugging' FROM use_cases WHERE name = 'Legacy code modernization';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Security Code Analysis' FROM use_cases WHERE name = 'Legacy code modernization';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Legacy code modernization';

-- 45. Voice-based customer service
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multimodal Interaction' FROM use_cases WHERE name = 'Voice-based customer service';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Conversational AI' FROM use_cases WHERE name = 'Voice-based customer service';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Knowledge Q&A' FROM use_cases WHERE name = 'Voice-based customer service';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Voice-based customer service';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Contextual Recall' FROM use_cases WHERE name = 'Voice-based customer service';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Voice-based customer service';

-- 46. Visual document verification
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multimodal Interaction' FROM use_cases WHERE name = 'Visual document verification';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Parsing' FROM use_cases WHERE name = 'Visual document verification';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Visual document verification';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Visual document verification';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Visual document verification';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Visual document verification';

-- 47. Personalized client advisory
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Contextual Recall' FROM use_cases WHERE name = 'Personalized client advisory';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Conversational AI' FROM use_cases WHERE name = 'Personalized client advisory';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Knowledge Q&A' FROM use_cases WHERE name = 'Personalized client advisory';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Personalized client advisory';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Decision Support' FROM use_cases WHERE name = 'Personalized client advisory';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Personalized client advisory';

-- 48. Demand prediction
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Predictive Analytics' FROM use_cases WHERE name = 'Demand prediction';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Optimization Modelling' FROM use_cases WHERE name = 'Demand prediction';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Demand prediction';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'API Execution' FROM use_cases WHERE name = 'Demand prediction';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Demand prediction';

-- 49. Demand forecasting
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Predictive Analytics' FROM use_cases WHERE name = 'Demand forecasting';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Optimization Modelling' FROM use_cases WHERE name = 'Demand forecasting';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Demand forecasting';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'API Execution' FROM use_cases WHERE name = 'Demand forecasting';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Demand forecasting';

-- 50. Extract data from reports
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Parsing' FROM use_cases WHERE name = 'Extract data from reports';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Extract data from reports';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Extract data from reports';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Data Quality & Enrichment' FROM use_cases WHERE name = 'Extract data from reports';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Extract data from reports';

-- 51. Resume parsing
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Parsing' FROM use_cases WHERE name = 'Resume parsing';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Resume parsing';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Resume parsing';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Data Quality & Enrichment' FROM use_cases WHERE name = 'Resume parsing';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Resume parsing';

-- 52. Data extraction
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Parsing' FROM use_cases WHERE name = 'Data extraction';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Data extraction';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Data Quality & Enrichment' FROM use_cases WHERE name = 'Data extraction';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Data extraction';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Data extraction';

-- 53. Data extraction from sensors
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Data extraction from sensors';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Data Quality & Enrichment' FROM use_cases WHERE name = 'Data extraction from sensors';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Data extraction from sensors';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Data extraction from sensors';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'API Execution' FROM use_cases WHERE name = 'Data extraction from sensors';

-- 54. Personalized learning path
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Personalized learning path';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Personalized learning path';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Knowledge Q&A' FROM use_cases WHERE name = 'Personalized learning path';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Personalized learning path';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Contextual Recall' FROM use_cases WHERE name = 'Personalized learning path';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Reasoning & Logic' FROM use_cases WHERE name = 'Personalized learning path';

-- 55. AI assistants for CRM
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Conversational AI' FROM use_cases WHERE name = 'AI assistants for CRM';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Copilots' FROM use_cases WHERE name = 'AI assistants for CRM';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Knowledge Q&A' FROM use_cases WHERE name = 'AI assistants for CRM';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'API Execution' FROM use_cases WHERE name = 'AI assistants for CRM';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Contextual Recall' FROM use_cases WHERE name = 'AI assistants for CRM';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'AI assistants for CRM';

-- 56. Predictive maintenance
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Predictive Analytics' FROM use_cases WHERE name = 'Predictive maintenance';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Predictive maintenance';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Predictive maintenance';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Optimization Modelling' FROM use_cases WHERE name = 'Predictive maintenance';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'API Execution' FROM use_cases WHERE name = 'Predictive maintenance';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Data Quality & Enrichment' FROM use_cases WHERE name = 'Predictive maintenance';

-- 57. SOP generation
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Generation' FROM use_cases WHERE name = 'SOP generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Parsing' FROM use_cases WHERE name = 'SOP generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'SOP generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'SOP generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Automation' FROM use_cases WHERE name = 'SOP generation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Information Mapping' FROM use_cases WHERE name = 'SOP generation';

-- 58. Use copilots for decision prep
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Copilots' FROM use_cases WHERE name = 'Use copilots for decision prep';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Decision Support' FROM use_cases WHERE name = 'Use copilots for decision prep';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Use copilots for decision prep';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Reasoning & Logic' FROM use_cases WHERE name = 'Use copilots for decision prep';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Use copilots for decision prep';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Use copilots for decision prep';

-- 59. Automate approvals
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Automate approvals';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Automate approvals';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Reasoning & Logic' FROM use_cases WHERE name = 'Automate approvals';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Automate approvals';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Workflow Automation' FROM use_cases WHERE name = 'Automate approvals';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Automation' FROM use_cases WHERE name = 'Automate approvals';

-- 60. Onboarding automation
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Workflow Automation' FROM use_cases WHERE name = 'Onboarding automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Automation' FROM use_cases WHERE name = 'Onboarding automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Generation' FROM use_cases WHERE name = 'Onboarding automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Knowledge Q&A' FROM use_cases WHERE name = 'Onboarding automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Conversational AI' FROM use_cases WHERE name = 'Onboarding automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Contextual Recall' FROM use_cases WHERE name = 'Onboarding automation';

-- 61. Financial recon automation
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Financial recon automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Financial recon automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Financial recon automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Data Quality & Enrichment' FROM use_cases WHERE name = 'Financial recon automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Information Mapping' FROM use_cases WHERE name = 'Financial recon automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'RPA & AI Integration' FROM use_cases WHERE name = 'Financial recon automation';

-- 62. Code review automation
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Testing & Debugging' FROM use_cases WHERE name = 'Code review automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Refactoring & Optimization' FROM use_cases WHERE name = 'Code review automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Security Code Analysis' FROM use_cases WHERE name = 'Code review automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Code review automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Code Explanation' FROM use_cases WHERE name = 'Code review automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Code review automation';

-- 63. Regulatory relationship mapping
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Knowledge Graph Generation' FROM use_cases WHERE name = 'Regulatory relationship mapping';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Regulatory relationship mapping';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Reasoning & Logic' FROM use_cases WHERE name = 'Regulatory relationship mapping';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Regulatory relationship mapping';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Regulatory relationship mapping';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Regulatory relationship mapping';

-- 64. Client network analysis
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Knowledge Graph Generation' FROM use_cases WHERE name = 'Client network analysis';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Entity Extraction' FROM use_cases WHERE name = 'Client network analysis';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Client network analysis';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Classification' FROM use_cases WHERE name = 'Client network analysis';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Data Quality & Enrichment' FROM use_cases WHERE name = 'Client network analysis';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Client network analysis';

-- 65. Route optimization
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Optimization Modelling' FROM use_cases WHERE name = 'Route optimization';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Predictive Analytics' FROM use_cases WHERE name = 'Route optimization';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'API Execution' FROM use_cases WHERE name = 'Route optimization';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scoring & Ranking' FROM use_cases WHERE name = 'Route optimization';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Decision Support' FROM use_cases WHERE name = 'Route optimization';

-- 66. Generate strategic plans
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Generation' FROM use_cases WHERE name = 'Generate strategic plans';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Reasoning & Logic' FROM use_cases WHERE name = 'Generate strategic plans';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Generate strategic plans';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Context Understanding' FROM use_cases WHERE name = 'Generate strategic plans';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scenario Simulation' FROM use_cases WHERE name = 'Generate strategic plans';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Decision Support' FROM use_cases WHERE name = 'Generate strategic plans';

-- 67. Inventory automation
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Predictive Analytics' FROM use_cases WHERE name = 'Inventory automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Optimization Modelling' FROM use_cases WHERE name = 'Inventory automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Anomaly Detection' FROM use_cases WHERE name = 'Inventory automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Workflow Automation' FROM use_cases WHERE name = 'Inventory automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'API Execution' FROM use_cases WHERE name = 'Inventory automation';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Decision Support' FROM use_cases WHERE name = 'Inventory automation';

-- 68. Long-running case management
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Contextual Recall' FROM use_cases WHERE name = 'Long-running case management';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Summarization' FROM use_cases WHERE name = 'Long-running case management';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Long-running case management';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Decision Support' FROM use_cases WHERE name = 'Long-running case management';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Workflow Automation' FROM use_cases WHERE name = 'Long-running case management';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Copilots' FROM use_cases WHERE name = 'Long-running case management';

-- 69. Automated ordering
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Workflow Automation' FROM use_cases WHERE name = 'Automated ordering';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Predictive Analytics' FROM use_cases WHERE name = 'Automated ordering';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Optimization Modelling' FROM use_cases WHERE name = 'Automated ordering';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'API Execution' FROM use_cases WHERE name = 'Automated ordering';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'RPA & AI Integration' FROM use_cases WHERE name = 'Automated ordering';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Decision Support' FROM use_cases WHERE name = 'Automated ordering';

-- 70. Forecast scenarios
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scenario Simulation' FROM use_cases WHERE name = 'Forecast scenarios';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Predictive Analytics' FROM use_cases WHERE name = 'Forecast scenarios';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Reasoning & Logic' FROM use_cases WHERE name = 'Forecast scenarios';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Decision Support' FROM use_cases WHERE name = 'Forecast scenarios';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Optimization Modelling' FROM use_cases WHERE name = 'Forecast scenarios';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Forecast scenarios';

-- 71. Simulate scenarios
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Scenario Simulation' FROM use_cases WHERE name = 'Simulate scenarios';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Predictive Analytics' FROM use_cases WHERE name = 'Simulate scenarios';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Reasoning & Logic' FROM use_cases WHERE name = 'Simulate scenarios';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Decision Support' FROM use_cases WHERE name = 'Simulate scenarios';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Optimization Modelling' FROM use_cases WHERE name = 'Simulate scenarios';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Simulate scenarios';

-- 72. Autonomous research & reporting
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Agentic Systems' FROM use_cases WHERE name = 'Autonomous research & reporting';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Semantic Search' FROM use_cases WHERE name = 'Autonomous research & reporting';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Multi-document synthesis' FROM use_cases WHERE name = 'Autonomous research & reporting';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Text Generation' FROM use_cases WHERE name = 'Autonomous research & reporting';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Reasoning & Logic' FROM use_cases WHERE name = 'Autonomous research & reporting';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Automation' FROM use_cases WHERE name = 'Autonomous research & reporting';

-- 73. Workflow automation (Tech)
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Workflow Automation' FROM use_cases WHERE name = 'Workflow automation (Tech)';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'RPA & AI Integration' FROM use_cases WHERE name = 'Workflow automation (Tech)';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'API Execution' FROM use_cases WHERE name = 'Workflow automation (Tech)';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Agentic Systems' FROM use_cases WHERE name = 'Workflow automation (Tech)';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Decision Support' FROM use_cases WHERE name = 'Workflow automation (Tech)';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Automation' FROM use_cases WHERE name = 'Workflow automation (Tech)';

-- 74. Workflow automation (Ops)
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Workflow Automation' FROM use_cases WHERE name = 'Workflow automation (Ops)';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'RPA & AI Integration' FROM use_cases WHERE name = 'Workflow automation (Ops)';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'API Execution' FROM use_cases WHERE name = 'Workflow automation (Ops)';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Agentic Systems' FROM use_cases WHERE name = 'Workflow automation (Ops)';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Decision Support' FROM use_cases WHERE name = 'Workflow automation (Ops)';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Document Automation' FROM use_cases WHERE name = 'Workflow automation (Ops)';

-- 75. End-to-end process orchestration
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Agentic Systems' FROM use_cases WHERE name = 'End-to-end process orchestration';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Workflow Automation' FROM use_cases WHERE name = 'End-to-end process orchestration';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'API Execution' FROM use_cases WHERE name = 'End-to-end process orchestration';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Decision Support' FROM use_cases WHERE name = 'End-to-end process orchestration';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'RPA & AI Integration' FROM use_cases WHERE name = 'End-to-end process orchestration';
INSERT INTO use_case_blocks (use_case_id, block_name)
SELECT id, 'Reasoning & Logic' FROM use_cases WHERE name = 'End-to-end process orchestration';

-- ---------------------------------------------------------------------------
-- 6. ASSESSMENT LEADS (for lead capture)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS assessment_leads (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL CHECK (char_length(name) <= 200),
  email             text NOT NULL CHECK (char_length(email) <= 200),
  company           text NOT NULL CHECK (char_length(company) <= 200),
  industry          text CHECK (char_length(industry) <= 100),
  company_size      text CHECK (char_length(company_size) <= 50),
  selected_areas    jsonb NOT NULL DEFAULT '[]',
  area_ratings      jsonb NOT NULL DEFAULT '{}',
  readiness_ratings jsonb NOT NULL DEFAULT '{}',
  overall_score     numeric(3,1) NOT NULL DEFAULT 0,
  priorities        jsonb DEFAULT '[]',
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE assessment_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assessment_leads_insert_public"
  ON assessment_leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "assessment_leads_select_admin"
  ON assessment_leads FOR SELECT
  USING (auth.jwt() ->> 'email' LIKE '%@mmgmc.ch');

CREATE POLICY "assessment_leads_update_admin"
  ON assessment_leads FOR UPDATE
  USING (auth.jwt() ->> 'email' LIKE '%@mmgmc.ch');

CREATE POLICY "assessment_leads_delete_admin"
  ON assessment_leads FOR DELETE
  USING (auth.jwt() ->> 'email' LIKE '%@mmgmc.ch');

-- =============================================================================
-- END OF SEED FILE
-- =============================================================================
