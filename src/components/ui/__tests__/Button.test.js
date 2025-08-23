/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import { ThemeProvider } from '../../ThemeProvider';

// Mock component wrapper with theme provider
const ButtonWithTheme = ({ theme = 'light', ...props }) => (
  <ThemeProvider defaultTheme={theme}>
    <Button {...props} />
  </ThemeProvider>
);

describe('Button Component', () => {
  test('renders button with default props', () => {
    render(<ButtonWithTheme>Click me</ButtonWithTheme>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  test('applies primary variant classes by default', () => {
    render(<ButtonWithTheme>Primary Button</ButtonWithTheme>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-primary');
  });

  test('applies secondary variant classes', () => {
    render(<ButtonWithTheme variant="secondary">Secondary Button</ButtonWithTheme>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-secondary');
  });

  test('applies outline variant classes', () => {
    render(<ButtonWithTheme variant="outline">Outline Button</ButtonWithTheme>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('btn-outline');
  });

  test('shows loading spinner when loading prop is true', () => {
    render(<ButtonWithTheme loading>Loading Button</ButtonWithTheme>);
    const button = screen.getByRole('button');
    const spinner = button.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  test('is disabled when loading', () => {
    render(<ButtonWithTheme loading>Loading Button</ButtonWithTheme>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  test('is disabled when disabled prop is true', () => {
    render(<ButtonWithTheme disabled>Disabled Button</ButtonWithTheme>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<ButtonWithTheme onClick={handleClick}>Clickable Button</ButtonWithTheme>);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies custom className', () => {
    render(<ButtonWithTheme className="custom-class">Custom Button</ButtonWithTheme>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  test('applies different sizes', () => {
    const { rerender } = render(<ButtonWithTheme size="sm">Small Button</ButtonWithTheme>);
    let button = screen.getByRole('button');
    expect(button).toHaveClass('h-9', 'px-3', 'text-sm');

    rerender(<ButtonWithTheme size="lg">Large Button</ButtonWithTheme>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('h-11', 'px-8');
  });
});