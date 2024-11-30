import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8000';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type');

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    if (!type || (type !== 'payment' && type !== 'mtr')) {
      return NextResponse.json(
        { error: 'Valid type (payment or mtr) is required' },
        { status: 400 }
      );
    }

    // Create a new FormData object for the backend request
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    // Forward the request to the appropriate backend endpoint
    const endpoint = type === 'mtr' 
      ? `${BACKEND_URL}/api/upload/mtr`
      : `${BACKEND_URL}/upload/payment`;

    const response = await fetch(endpoint, {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
      throw new Error(errorData.message || 'Failed to upload file');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}
