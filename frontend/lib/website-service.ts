import { supabase } from './supabase';

export interface Website {
  website_id: number;
  url: string;
  domain: string;
  created_at: string;
}

export interface TermsSnapshot {
  snapshot_id: number;
  website_id: number;
  terms_data: string;
  terms_hash: string;
  captured_at: string;
}

export interface Analysis {
  analysis_id: number;
  snapshot_id: number;
  overall_score: number;
  summary: string;
  analyzed_at: string;
}

export interface AnalysisItem {
  item_id: number;
  analysis_id: number;
  title: string;
  description: string;
  flag: 'critical' | 'warning' | 'info' | 'good';
  category: string | null;
}

export interface UserSavedWebsite {
  user_id: string;
  snapshot_id: number;
  saved_at: string;
  is_active: boolean;
}

export interface WebsiteWithDetails {
  snapshot_id: number;
  website_id: number;
  website_name: string;
  website_url: string;
  domain: string;
  score: number;
  date: string;
  summary: string;
  alerts: {
    type: 'critical' | 'warning' | 'info' | 'good';
    title: string;
    description: string;
  }[];
}

/**
 * Fetch all saved websites for a user
 */
export async function getUserSavedWebsites(userId: string): Promise<WebsiteWithDetails[]> {
  const { data, error } = await supabase
    .from('user_saved_websites')
    .select(`
      snapshot_id,
      saved_at,
      is_active,
      terms_snapshots!inner (
        snapshot_id,
        website_id,
        captured_at,
        websites!inner (
          website_id,
          url,
          domain
        ),
        analyses!inner (
          analysis_id,
          overall_score,
          summary,
          analysis_items (
            item_id,
            title,
            description,
            flag,
            category
          )
        )
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('saved_at', { ascending: false });

  if (error) {
    console.error('Error fetching user websites:', error);
    throw error;
  }

  // Transform the data to match our interface
  const websites: WebsiteWithDetails[] = (data || []).map((item: any) => {
    const snapshot = item.terms_snapshots;
    const website = snapshot.websites;
    const analysis = snapshot.analyses;
    
    // Extract domain name from URL for display
    const websiteName = website.domain.replace(/^www\./, '').split('.')[0];
    const capitalizedName = websiteName.charAt(0).toUpperCase() + websiteName.slice(1);

    return {
      snapshot_id: snapshot.snapshot_id,
      website_id: website.website_id,
      website_name: capitalizedName,
      website_url: website.url,
      domain: website.domain,
      score: analysis.overall_score,
      date: new Date(item.saved_at).toISOString().split('T')[0],
      summary: analysis.summary,
      alerts: (analysis.analysis_items || []).map((item: any) => ({
        type: item.flag,
        title: item.title,
        description: item.description,
      })),
    };
  });

  return websites;
}

/**
 * Fetch a specific website by snapshot ID
 */
export async function getWebsiteBySnapshotId(snapshotId: number): Promise<WebsiteWithDetails | null> {
  const { data, error } = await supabase
    .from('terms_snapshots')
    .select(`
      snapshot_id,
      website_id,
      captured_at,
      websites (
        website_id,
        url,
        domain
      ),
      analyses (
        analysis_id,
        overall_score,
        summary,
        analysis_items (
          item_id,
          title,
          description,
          flag,
          category
        )
      )
    `)
    .eq('snapshot_id', snapshotId)
    .single();

  if (error) {
    console.error('Error fetching website:', error);
    return null;
  }

  if (!data || !data.websites || !data.analyses) {
    return null;
  }

  const website = Array.isArray(data.websites) ? data.websites[0] : data.websites;
  const analysis = Array.isArray(data.analyses) ? data.analyses[0] : data.analyses;
  
  if (!website || !analysis) {
    return null;
  }
  
  // Extract domain name from URL for display
  const websiteName = website.domain.replace(/^www\./, '').split('.')[0];
  const capitalizedName = websiteName.charAt(0).toUpperCase() + websiteName.slice(1);

  return {
    snapshot_id: data.snapshot_id,
    website_id: website.website_id,
    website_name: capitalizedName,
    website_url: website.url,
    domain: website.domain,
    score: analysis.overall_score,
    date: new Date(data.captured_at).toISOString().split('T')[0],
    summary: analysis.summary,
    alerts: (analysis.analysis_items || []).map((item: any) => ({
      type: item.flag,
      title: item.title,
      description: item.description,
    })),
  };
}

/**
 * Get terms data for chatbot
 */
export async function getTermsData(snapshotId: number): Promise<string | null> {
  const { data, error } = await supabase
    .from('terms_snapshots')
    .select('terms_data')
    .eq('snapshot_id', snapshotId)
    .single();

  if (error) {
    console.error('Error fetching terms data:', error);
    return null;
  }

  return data?.terms_data || null;
}

/**
 * Save a website for a user
 */
export async function saveWebsiteForUser(
  userId: string,
  snapshotId: number
): Promise<boolean> {
  const { error } = await supabase
    .from('user_saved_websites')
    .insert({
      user_id: userId,
      snapshot_id: snapshotId,
      is_active: true,
    });

  if (error) {
    console.error('Error saving website:', error);
    return false;
  }

  return true;
}

/**
 * Remove a website from user's saved list
 */
export async function removeWebsiteForUser(
  userId: string,
  snapshotId: number
): Promise<boolean> {
  const { error } = await supabase
    .from('user_saved_websites')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('snapshot_id', snapshotId);

  if (error) {
    console.error('Error removing website:', error);
    return false;
  }

  return true;
}
