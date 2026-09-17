import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

interface ProxyRequestBody {
  provider: string;
  action: 'dispatch' | 'track';
  payload: any;
}

export const handler = async (event: { httpMethod: string; body?: string | null }) => {
  // CORS Headers for secure API consumption
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { provider, action, payload }: ProxyRequestBody = JSON.parse(event.body || '{}');

    if (!provider || !action) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing provider or action' }),
      };
    }

    // Retrieve delivery settings securely from Supabase admin_settings on the server
    let deliverySettings: Record<string, any> = {};
    if (SUPABASE_URL && SUPABASE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'delivery_settings')
        .single();
      if (data?.value) {
        deliverySettings = data.value;
      }
    }

    // Provider: Yalidine Express
    if (provider === 'yalidine') {
      const apiId = (deliverySettings.yalidine_api_id || process.env.YALIDINE_API_ID || '').trim();
      const apiToken = (deliverySettings.yalidine_api_token || process.env.YALIDINE_API_TOKEN || '').trim();

      if (!apiId || !apiToken) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Yalidine credentials not configured on server' }),
        };
      }

      if (action === 'dispatch') {
        const response = await fetch('https://api.yalidine.app/v1/parcels/', {
          method: 'POST',
          headers: {
            'X-API-ID': apiId,
            'X-API-TOKEN': apiToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(Array.isArray(payload) ? payload : [payload]),
        });

        const data = await response.json();
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify(data),
        };
      }

      if (action === 'track') {
        const tracking = payload?.tracking;
        if (!tracking) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Missing tracking number in payload' }),
          };
        }

        const response = await fetch(`https://api.yalidine.app/v1/histories/?tracking=${encodeURIComponent(tracking)}`, {
          headers: {
            'X-API-ID': apiId,
            'X-API-TOKEN': apiToken,
          },
        });

        const data = await response.json();
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify(data),
        };
      }
    }

    // Default response if provider does not have a live server API implementation
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: `Provider '${provider}' or action '${action}' not supported for direct proxy` }),
    };
  } catch (error: any) {
    console.error('delivery-proxy error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
