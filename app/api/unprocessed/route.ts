import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8000';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const size = searchParams.get('size') || '10';

    // Forward the request to the backend
    const response = await fetch(
      `${BACKEND_URL}/unprocessed?page=${page}&size=${size}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch unprocessed transactions');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching unprocessed transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch unprocessed transactions' },
      { status: 500 }
    );
  }
}
