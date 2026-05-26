/**
 * Vercel Serverless Function: UiPath RPA Integration Endpoint
 * Purpose: Accept incident data from UiPath and create incidents in Supabase
 * Route: POST /api/incidents/ingest
 * Updated: May 14, 2026 - Fixed Vercel routing and CORS
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * Request body interface for RPA submissions
 */
interface RpaIncidentRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  source?: string; // e.g., 'uipath-google-drive'
  external_id?: string; // Reference to original document/file
  sender?: string;
}

/**
 * Response interface
 */
interface RpaIncidentResponse {
  success: boolean;
  incident_id?: string;
  message: string;
  error?: string;
}

/**
 * Main handler function
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse<RpaIncidentResponse>
): Promise<void> {
  try {
    // Set CORS headers for preflight requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).json({
        success: false,
        message: 'Method not allowed',
        error: 'Only POST requests are supported',
      });
      return;
    }

    // Validate API key (simple token-based auth for RPA)
    const apiKey = req.headers['x-api-key'] as string;
    const expectedKey = process.env.UIPATH_API_KEY || 'uipath-secret-key-12345';

    if (!apiKey || apiKey !== expectedKey) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: 'Invalid or missing API key',
      });
      return;
    }

    // Parse request body
    const body: RpaIncidentRequest = req.body;

    // Validate required fields
    if (!body.title || body.title.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Title is required and cannot be empty',
      });
      return;
    }

    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: 'Missing Supabase configuration',
      });
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get or create RPA system user (service account)
    const rpaUserEmail = 'rpa@dhl-incident-system.internal';

    // Get the RPA user's profile
    const { data: rpaUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', rpaUserEmail)
      .single();

    let rpauseId: string;

    if (!rpaUser) {
      // Create service account if it doesn't exist
      const { data: newUser } = await supabase
        .from('user_profiles')
        .insert({
          email: rpaUserEmail,
          full_name: 'UiPath RPA System',
          role: 'system',
        })
        .select('id')
        .single();

      rpauseId = newUser?.id || '';
    } else {
      rpauseId = rpaUser.id;
    }

    // Create the incident
    const { data: incident, error: insertError } = await supabase
      .from('incidents')
      .insert({
        title: body.title,
        description: body.description || '',
        priority: body.priority || 'medium',
        status: 'submitted', // RPA submissions are pre-submitted
        tags: body.tags || [],
        created_by: rpauseId,
        ...(body.sender ? { sender: body.sender } : {}),
        // Store RPA metadata in tags if source provided
        ...(body.source && { tags: [...(body.tags || []), `source:${body.source}`] }),
        ...(body.external_id && {
          tags: [...(body.tags || []), `external_id:${body.external_id}`],
        }),
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      res.status(500).json({
        success: false,
        message: 'Failed to create incident',
        error: insertError.message,
      });
      return;
    }

    // Log the RPA submission in audit log
    await supabase.from('incident_audit_log').insert({
      incident_id: incident?.id,
      action: 'created_via_rpa',
      actor_id: rpauseId,
      details: {
        source: body.source || 'uipath',
        external_id: body.external_id,
        timestamp: new Date().toISOString(),
      },
    });

    // Success response
    res.status(201).json({
      success: true,
      incident_id: incident?.id,
      message: 'Incident created successfully from RPA submission',
      data: {
        id: incident?.id,
        sender: body.sender,
      },
    });
  } catch (error: any) {
    console.error('API error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error?.message || 'Unknown error occurred',
    });
  }
}
