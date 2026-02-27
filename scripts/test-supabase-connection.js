
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zkuubxwhpnvogtoxxxib.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprdXVieHdocG52b2d0b3h4eGliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MzYwMjcsImV4cCI6MjA3ODQxMjAyN30.TwiZ7vgEFrf7kosNuYexBCC9cE2hnD7RwDAWenMLqVI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase Connection...');
    console.log('URL:', supabaseUrl);

    try {
        // Try to select from profiles - this confirms DB access and RLS if applicable
        // We select count to be lightweight
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Connection Failed:', error.message);
            console.error('Details:', error);
        } else {
            console.log('✅ Connection Successful!');
            console.log('Supabase is reachable.');
            console.log(`Found ${count} profiles in the database.`);
        }

        // Also check projects to be sure
        const { count: projectCount, error: projectError } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true });

        if (projectError) {
            console.error('❌ Could not fetch projects:', projectError.message);
        } else {
            console.log(`Found ${projectCount} projects in the database.`);
        }

    } catch (err) {
        console.error('❌ Unexpected Error:', err);
    }
}

testConnection();
