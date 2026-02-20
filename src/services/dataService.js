import { supabase, isSupabaseConfigured } from './supabase';
import { CATEGORIES } from '../data/categories';
import { BUILDING_BLOCKS } from '../data/buildingBlocks';
import { USE_CASES } from '../data/useCases';
import { VALUE_CHAIN_SHORT_LABELS } from '../data/constants';

// Fallback data (hardcoded)
function getHardcodedCategories() {
  return CATEGORIES;
}

function getHardcodedBuildingBlocks() {
  return BUILDING_BLOCKS;
}

function getHardcodedUseCases() {
  return USE_CASES;
}

function getHardcodedValueChainAreas() {
  return Object.entries(VALUE_CHAIN_SHORT_LABELS).map(([name, shortLabel]) => ({ name, shortLabel }));
}

// Supabase fetchers
export async function fetchCategories() {
  if (!isSupabaseConfigured()) return getHardcodedCategories();

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('name, color, abbr, sort_order')
      .order('sort_order');

    if (error) throw error;

    const result = {};
    data.forEach(row => {
      result[row.name] = { color: row.color, abbr: row.abbr };
    });
    return result;
  } catch (e) {
    console.warn('Failed to fetch categories from Supabase, using fallback:', e.message);
    return getHardcodedCategories();
  }
}

export async function fetchBuildingBlocks() {
  if (!isSupabaseConfigured()) return getHardcodedBuildingBlocks();

  try {
    const { data, error } = await supabase
      .from('building_blocks')
      .select('name, category, maturity, sort_order')
      .order('sort_order');

    if (error) throw error;

    return data.map(row => ({
      name: row.name,
      category: row.category,
      maturity: row.maturity,
    }));
  } catch (e) {
    console.warn('Failed to fetch building blocks from Supabase, using fallback:', e.message);
    return getHardcodedBuildingBlocks();
  }
}

export async function fetchUseCases() {
  if (!isSupabaseConfigured()) return getHardcodedUseCases();

  try {
    const { data: useCases, error: ucError } = await supabase
      .from('use_cases')
      .select('id, name, activity_type, value_chain_area, sort_order')
      .order('sort_order');

    if (ucError) throw ucError;

    const { data: blocks, error: bError } = await supabase
      .from('use_case_blocks')
      .select('use_case_id, block_name');

    if (bError) throw bError;

    const blocksByUseCase = {};
    blocks.forEach(row => {
      if (!blocksByUseCase[row.use_case_id]) blocksByUseCase[row.use_case_id] = [];
      blocksByUseCase[row.use_case_id].push(row.block_name);
    });

    return useCases.map(uc => ({
      name: uc.name,
      activityType: uc.activity_type,
      valueChainArea: uc.value_chain_area,
      buildingBlocks: blocksByUseCase[uc.id] || [],
    }));
  } catch (e) {
    console.warn('Failed to fetch use cases from Supabase, using fallback:', e.message);
    return getHardcodedUseCases();
  }
}

export async function fetchValueChainAreas() {
  if (!isSupabaseConfigured()) return getHardcodedValueChainAreas();

  try {
    const { data, error } = await supabase
      .from('value_chain_areas')
      .select('name, short_label, sort_order')
      .order('sort_order');

    if (error) throw error;

    return data.map(row => ({ name: row.name, shortLabel: row.short_label }));
  } catch (e) {
    console.warn('Failed to fetch value chain areas from Supabase, using fallback:', e.message);
    return getHardcodedValueChainAreas();
  }
}

// Admin CRUD operations (require auth)
export async function upsertCategory(category) {
  const { data, error } = await supabase
    .from('categories')
    .upsert({ name: category.name, color: category.color, abbr: category.abbr, sort_order: category.sort_order || 0 }, { onConflict: 'name' })
    .select();
  if (error) throw error;
  return data[0];
}

export async function deleteCategory(name) {
  const { error } = await supabase.from('categories').delete().eq('name', name);
  if (error) throw error;
}

export async function upsertBuildingBlock(block) {
  const { data, error } = await supabase
    .from('building_blocks')
    .upsert({ name: block.name, category: block.category, maturity: block.maturity, sort_order: block.sort_order || 0 }, { onConflict: 'name' })
    .select();
  if (error) throw error;
  return data[0];
}

export async function deleteBuildingBlock(name) {
  const { error } = await supabase.from('building_blocks').delete().eq('name', name);
  if (error) throw error;
}

export async function upsertValueChainArea(area) {
  const { data, error } = await supabase
    .from('value_chain_areas')
    .upsert({ name: area.name, short_label: area.shortLabel, sort_order: area.sort_order || 0 }, { onConflict: 'name' })
    .select();
  if (error) throw error;
  return data[0];
}

export async function deleteValueChainArea(name) {
  const { error } = await supabase.from('value_chain_areas').delete().eq('name', name);
  if (error) throw error;
}

export async function upsertUseCase(useCase) {
  // Upsert the use case itself
  const { data, error } = await supabase
    .from('use_cases')
    .upsert({
      name: useCase.name,
      activity_type: useCase.activityType,
      value_chain_area: useCase.valueChainArea,
      sort_order: useCase.sort_order || 0,
    }, { onConflict: 'name' })
    .select();
  if (error) throw error;

  const ucId = data[0].id;

  // Replace building block associations
  await supabase.from('use_case_blocks').delete().eq('use_case_id', ucId);

  if (useCase.buildingBlocks?.length > 0) {
    const rows = useCase.buildingBlocks.map(blockName => ({ use_case_id: ucId, block_name: blockName }));
    const { error: bError } = await supabase.from('use_case_blocks').insert(rows);
    if (bError) throw bError;
  }

  return data[0];
}

export async function deleteUseCase(name) {
  // Get the ID first so we can clean up junction table
  const { data } = await supabase.from('use_cases').select('id').eq('name', name).single();
  if (data) {
    await supabase.from('use_case_blocks').delete().eq('use_case_id', data.id);
  }
  const { error } = await supabase.from('use_cases').delete().eq('name', name);
  if (error) throw error;
}

// Assessment lead capture
export async function submitAssessmentLead(lead) {
  if (!isSupabaseConfigured()) throw new Error('Supabase is not configured');

  const row = {
    name: lead.name,
    email: lead.email,
    company: lead.company,
    industry: lead.industry || null,
    company_size: lead.companySize || null,
    selected_areas: lead.selectedAreas,
    area_ratings: lead.areaRatings,
    readiness_ratings: lead.readinessRatings,
    overall_score: lead.overallScore,
  };
  if (lead.priorities) row.priorities = lead.priorities;

  const { data, error } = await supabase
    .from('assessment_leads')
    .insert(row)
    .select();

  if (error) {
    console.error('Submit assessment lead failed:', error.message);
    throw new Error('Failed to submit. Please try again.');
  }
  return data[0];
}

export async function fetchAssessmentLeads() {
  if (!isSupabaseConfigured()) return [];

  const { data, error } = await supabase
    .from('assessment_leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch assessment leads failed:', error.message);
    throw new Error('Failed to load leads.');
  }
  return data;
}

export async function deleteAssessmentLead(id) {
  const { error } = await supabase.from('assessment_leads').delete().eq('id', id);
  if (error) throw error;
}

// Deduplicate array by name, keeping the last occurrence
function dedupeByName(arr) {
  const map = new Map();
  arr.forEach(item => map.set(item.name, item));
  return [...map.values()];
}

// Bulk sync from Excel upload
export async function syncFromExcel(buildingBlocks, useCases) {
  const result = { blocksUpserted: 0, useCasesUpserted: 0, blocksRemoved: 0, useCasesRemoved: 0 };

  const dedupedBBs = dedupeByName(buildingBlocks);
  const dedupedUCs = dedupeByName(useCases);

  // 1. Upsert building blocks
  const bbRows = dedupedBBs.map((b, i) => ({
    name: b.name,
    category: b.category,
    maturity: b.maturity,
    sort_order: i,
  }));
  if (bbRows.length > 0) {
    const { error } = await supabase
      .from('building_blocks')
      .upsert(bbRows, { onConflict: 'name' });
    if (error) {
      console.error('Upsert building blocks failed:', error.message);
      throw new Error('Failed to sync building blocks. Please try again.');
    }
    result.blocksUpserted = bbRows.length;
  }

  // 2. Upsert use cases
  const ucRows = dedupedUCs.map((uc, i) => ({
    name: uc.name,
    activity_type: uc.activityType,
    value_chain_area: uc.valueChainArea,
    sort_order: i,
  }));
  if (ucRows.length > 0) {
    const { data: upsertedUCs, error } = await supabase
      .from('use_cases')
      .upsert(ucRows, { onConflict: 'name' })
      .select('id, name');
    if (error) {
      console.error('Upsert use cases failed:', error.message);
      throw new Error('Failed to sync use cases. Please try again.');
    }
    result.useCasesUpserted = ucRows.length;

    // 3. Replace use_case_blocks for all upserted use cases
    const ucIdMap = {};
    upsertedUCs.forEach(uc => { ucIdMap[uc.name] = uc.id; });

    const ucIds = upsertedUCs.map(uc => uc.id);
    await supabase.from('use_case_blocks').delete().in('use_case_id', ucIds);

    const blockRows = [];
    dedupedUCs.forEach(uc => {
      const ucId = ucIdMap[uc.name];
      if (ucId && uc.buildingBlocks?.length > 0) {
        uc.buildingBlocks.forEach(blockName => {
          blockRows.push({ use_case_id: ucId, block_name: blockName });
        });
      }
    });
    if (blockRows.length > 0) {
      const { error: bErr } = await supabase.from('use_case_blocks').insert(blockRows);
      if (bErr) {
        console.error('Insert use case blocks failed:', bErr.message);
        throw new Error('Failed to sync use case associations. Please try again.');
      }
    }
  }

  // 4. Delete use cases not in Excel
  const excelUCNames = dedupedUCs.map(uc => uc.name);
  const { data: allDBUCs } = await supabase.from('use_cases').select('name');
  if (allDBUCs) {
    const toDeleteUCs = allDBUCs.filter(uc => !excelUCNames.includes(uc.name)).map(uc => uc.name);
    if (toDeleteUCs.length > 0) {
      await supabase.from('use_cases').delete().in('name', toDeleteUCs);
      result.useCasesRemoved = toDeleteUCs.length;
    }
  }

  // 5. Delete building blocks not in Excel
  const excelBBNames = dedupedBBs.map(b => b.name);
  const { data: allDBBBs } = await supabase.from('building_blocks').select('name');
  if (allDBBBs) {
    const toDeleteBBs = allDBBBs.filter(b => !excelBBNames.includes(b.name)).map(b => b.name);
    if (toDeleteBBs.length > 0) {
      await supabase.from('building_blocks').delete().in('name', toDeleteBBs);
      result.blocksRemoved = toDeleteBBs.length;
    }
  }

  return result;
}
