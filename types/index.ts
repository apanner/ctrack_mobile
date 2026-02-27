// Type definitions for CineTrack Mobile

export interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'artist' | 'production' | 'manager';
  department: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_active: boolean;
  daily_work_hours: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  client_name: string | null;
  description: string | null;
  start_date: string | null;
  delivery_date: string | null;
  status: 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  logo_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Shot {
  id: string;
  project_id: string;
  shot_code: string;
  sequence_name: string | null;
  description: string | null;
  department: 'Roto' | 'Prep' | 'Comp' | 'Camera';
  artist_id: string | null;
  artist_name?: string | null; // Added for display
  start_date: string | null;
  due_date: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed';
  estimated_hours: number;
  actual_hours: number;
  duration_frames: number | null;
  resolution: string | null;
  fps: number;
  thumbnail_url: string | null;
  reference_urls: string[] | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// For mobile, shots are treated as "tasks" for artists
export interface Task extends Shot {
  // Alias for shot
}

