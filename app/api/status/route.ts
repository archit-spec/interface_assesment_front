import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8000';

export async function GET(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const jobId = pathname.split('/').pop();

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/status/${jobId}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || 'Failed to fetch job status');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching job status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch job status' },
      { status: 500 }
    );
  }
}
