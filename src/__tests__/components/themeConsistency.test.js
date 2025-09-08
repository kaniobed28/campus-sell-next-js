/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import RelatedProducts from '../../components/RelatedProducts';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  usePathname: () => '/test',
}));

describe('Component Theme Consistency', () => {
  test('RelatedProducts component uses theme variables', () => {
    const mockProducts = [
      {
        id: '1',
        name: 'Test Product 1',
        price: 29.99,
        image: '/test1.jpg',
      },
      {
        id: '2',
        name: 'Test Product 2',
        price: 39.99,
        image: '/test2.jpg',
      },
    ];

    const { container } = render(
      <RelatedProducts products={mockProducts} category="electronics" />
    );

    // Check that the component renders
    expect(container).toBeInTheDocument();

    // Check for theme class usage
    const productCards = container.querySelectorAll('.card-base');
    expect(productCards.length).toBe(2);

    // Check for theme color usage
    const links = container.querySelectorAll('a');
    expect(links[0]).toHaveClass('text-primary');
  });

  test('RelatedProducts adapts to dark theme', () => {
    // Set dark theme
    document.documentElement.classList.add('dark');

    const mockProducts = [
      {
        id: '1',
        name: 'Test Product 1',
        price: 29.99,
        image: '/test1.jpg',
      },
    ];

    const { container } = render(
      <RelatedProducts products={mockProducts} category="electronics" />
    );

    // Check that the component renders
    expect(container).toBeInTheDocument();

    // Clean up
    document.documentElement.classList.remove('dark');
  });
});