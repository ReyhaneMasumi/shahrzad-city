import { NextResponse } from 'next/server';
import banners from '@/mocks/data/banners.json';
import { mockEnvelope } from '@/shared/api/mockEnvelope';

export function GET() {
  return NextResponse.json(mockEnvelope(banners));
}
