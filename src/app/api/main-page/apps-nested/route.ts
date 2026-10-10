import { NextResponse } from 'next/server';
import mainPage from '@/mocks/data/main-page.json';
import { mockEnvelope } from '@/shared/api/mockEnvelope';

export function GET() {
  return NextResponse.json(mockEnvelope(mainPage));
}
