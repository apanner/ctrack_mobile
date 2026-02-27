// Test Supabase connection
import { supabase } from './supabase';

export async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if we can query profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, role')
      .limit(5);
    
    if (profilesError) {
      console.error('Profiles query error:', profilesError);
      return { success: false, error: profilesError.message };
    }
    
    console.log('✅ Profiles query successful:', profiles?.length || 0, 'profiles found');
    
    // Test 2: Check if we can query projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, code')
      .limit(5);
    
    if (projectsError) {
      console.error('Projects query error:', projectsError);
      return { success: false, error: projectsError.message };
    }
    
    console.log('✅ Projects query successful:', projects?.length || 0, 'projects found');
    
    // Test 3: Check if we can query shots
    const { data: shots, error: shotsError } = await supabase
      .from('shots')
      .select('id, shot_code, status')
      .limit(5);
    
    if (shotsError) {
      console.error('Shots query error:', shotsError);
      return { success: false, error: shotsError.message };
    }
    
    console.log('✅ Shots query successful:', shots?.length || 0, 'shots found');
    
    return {
      success: true,
      data: {
        profiles: profiles?.length || 0,
        projects: projects?.length || 0,
        shots: shots?.length || 0,
      },
    };
  } catch (error: any) {
    console.error('Connection test failed:', error);
    return { success: false, error: error.message };
  }
}

