import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8000';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!startDate || !endDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      // Use last 30 days as default range
      const defaultStartDate = thirtyDaysAgo.toISOString().split('T')[0];
      const defaultEndDate = today.toISOString().split('T')[0];

      // Forward the request to the backend with default date range
      const response = await fetch(
        `${BACKEND_URL}/summary?start_date=${defaultStartDate}&end_date=${defaultEndDate}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
        throw new Error(errorData.message || 'Failed to fetch summary');
      }

      const data = await response.json();
      return NextResponse.json(data);
    }

    // Forward the request to the backend with provided date range
    const response = await fetch(
      `${BACKEND_URL}/summary?start_date=${startDate}&end_date=${endDate}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || 'Failed to fetch summary');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}
