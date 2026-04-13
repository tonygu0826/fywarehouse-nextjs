import { NextResponse } from 'next/server';
import { requireApiKey } from '@/lib/api-auth';
import {
  getAllDirectories,
  markAsSubmitted,
  updateDirectoryStatus,
  getSubmissionSummary,
  type SubmissionStatus,
} from '@/lib/directory-submission';

// GET /api/seo/directories — list all directories and submission summary
export async function GET(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as SubmissionStatus | null;

    const directories = getAllDirectories();
    const filtered = status
      ? directories.filter((d) => d.status === status)
      : directories;

    return NextResponse.json({
      summary: getSubmissionSummary(),
      directories: filtered,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to load directories.' },
      { status: 500 },
    );
  }
}

// POST /api/seo/directories — mark a directory as submitted or update status
// Body: { id: string, action: 'submit' | 'update', status?: SubmissionStatus, notes?: string }
export async function POST(request: Request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, action, status, notes } = body;

    if (!id) {
      return NextResponse.json({ message: 'Missing directory id.' }, { status: 400 });
    }

    let result;

    if (action === 'submit') {
      result = markAsSubmitted(id, notes);
    } else if (action === 'update' && status) {
      result = updateDirectoryStatus(id, status, notes);
    } else {
      return NextResponse.json(
        { message: 'Invalid action. Use "submit" or "update" with a status.' },
        { status: 400 },
      );
    }

    if (!result) {
      return NextResponse.json({ message: `Directory "${id}" not found.` }, { status: 404 });
    }

    return NextResponse.json({
      message: `Directory "${result.name}" updated to status: ${result.status}`,
      directory: result,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update directory.' },
      { status: 500 },
    );
  }
}
