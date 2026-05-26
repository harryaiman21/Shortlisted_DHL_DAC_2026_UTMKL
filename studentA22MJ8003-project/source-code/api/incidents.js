import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const apiKey = req.headers['x-api-key'];
    const expectedKey = process.env.UIPATH_API_KEY || 'uipath-secret-key-12345';

    if (!apiKey || apiKey !== expectedKey) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, description, priority, tags, source, external_id, sender, file_url } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title required' });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const rpaEmail = 'rpa@dhl-incident-system.internal';
    const { data: existingUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', rpaEmail)
      .maybeSingle();

    let userId = existingUser?.id;

    if (!userId) {
      const { data: newUser, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          email: rpaEmail,
          full_name: 'UiPath RPA System',
          role: 'system',
        })
        .select('id')
        .single();

      if (createError) {
        return res.status(500).json({ error: 'Failed to create system user' });
      }

      userId = newUser?.id;
    }

    const tagsList = [
      ...(tags || []),
      ...(source ? [`source:${source}`] : []),
      ...(external_id ? [`external_id:${external_id}`] : []),
    ];

    const { data: incident, error: incidentError } = await supabase
      .from('incidents')
      .insert({
        title: title.trim(),
        description: description || '',
        priority: priority || 'medium',
        status: 'submitted',
        tags: tagsList,
        created_by: userId,
        ...(sender ? { sender } : {}),
        ...(file_url ? { file_url } : {}),
      })
      .select('id, sender')
      .single();

    if (incidentError) {
      return res.status(500).json({ error: `Failed to create incident: ${incidentError.message}` });
    }

    await supabase.from('incident_audit_log').insert({
      incident_id: incident?.id,
      action: 'created_via_rpa',
      actor_id: userId,
      details: {
        source: source || 'uipath',
        external_id,
        sender,
        timestamp: new Date().toISOString(),
      },
    });

    return res.status(201).json({
      success: true,
      incident_id: incident?.id,
      message: 'Incident created successfully',
      data: {
        id: incident?.id,
        sender: incident?.sender || sender,
        file_url: incident?.file_url || file_url || null,
        title,
        description,
        priority,
        tags: tagsList,
        source,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error?.message,
    });
  }
}
