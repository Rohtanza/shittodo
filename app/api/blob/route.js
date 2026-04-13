import { put, list, del } from '@vercel/blob';
import { NextResponse } from 'next/server';

const BLOB_PATH = 'shittodo/data.json';

// GET — load todos from blob
export async function GET() {
  try {
    const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });

    if (blobs.length === 0) {
      return NextResponse.json({ todos: [], lists: [] });
    }

    const blob = blobs[0];
    const response = await fetch(blob.downloadUrl);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Blob read error:', error);
    return NextResponse.json({ todos: [], lists: [] }, { status: 500 });
  }
}

// PUT — save todos to blob
export async function PUT(request) {
  try {
    const data = await request.json();

    // Delete old blobs first
    const { blobs } = await list({ prefix: BLOB_PATH });
    if (blobs.length > 0) {
      await del(blobs.map((b) => b.url));
    }

    // Upload new data
    await put(BLOB_PATH, JSON.stringify(data), {
      access: 'private',
      contentType: 'application/json',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Blob write error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
