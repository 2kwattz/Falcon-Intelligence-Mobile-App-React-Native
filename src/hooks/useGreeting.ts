import { useMemo } from 'react';
import { getGreeting } from '@/utils/date';

export const useGreeting = (): string => useMemo(() => getGreeting(), []);
