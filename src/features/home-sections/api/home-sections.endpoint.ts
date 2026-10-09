import { getJson } from '@/shared/api';
import type { HomeSectionsDto } from '../types/home-sections.types';
import { homeKeys } from './home-sections.keys';

/** Fetches the main-page sections payload, unwrapped from the API envelope. */
export function getHomeSections(options?: { signal?: AbortSignal }): Promise<HomeSectionsDto> {
  return getJson<HomeSectionsDto>(homeKeys.sections(), options);
}
