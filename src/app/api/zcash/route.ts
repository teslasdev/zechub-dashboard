import { NextRequest, NextResponse } from 'next/server';

const BLOCKCHAIR_BASE_URL = 'https://api.blockchair.com/zcash';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint') || '';

  if (!endpoint) {
    return NextResponse.json(
      { error: 'Endpoint parameter required' },
      { status: 400 }
    );
  }

  try {
    const url = `${BLOCKCHAIR_BASE_URL}/${endpoint}`;
    
    console.log('Blockchair Request:', url);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Blockchair error: ${response.status} ${errorText}`);
      return NextResponse.json(
        { error: `Blockchair request failed: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Blockchair', details: String(error) },
      { status: 500 }
    );
  }
}
