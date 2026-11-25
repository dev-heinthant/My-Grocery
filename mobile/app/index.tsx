import React from 'react';
import { Redirect } from 'expo-router';
import { useApp } from '@/hooks/useAppContext';

export default function IndexRedirect() {
  const { user } = useApp();
  return <Redirect href={user ? '/(tabs)' : '/auth'} />;
}
