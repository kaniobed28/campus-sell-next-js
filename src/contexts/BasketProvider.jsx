"use client";

import React from 'react';
import { useBasketInitialization } from '@/hooks/useBasketInitialization';

export const BasketProvider = ({ children }) => {
  useBasketInitialization();
  
  return <>{children}</>;
};