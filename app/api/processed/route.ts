import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8000';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const size = searchParams.get('size') || '10';

    // Forward the request to the backend
    const response = await fetch(
      `${BACKEND_URL}/processed?page=${page}&size=${size}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch processed transactions');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching processed transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch processed transactions' },
      { status: 500 }
    );
  }
}

// Get a specific processed transaction by ID
export async function HEAD(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/processed/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch processed transaction');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching processed transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch processed transaction' },
      { status: 500 }
    );
  }
}
