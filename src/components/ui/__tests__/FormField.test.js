/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormField } from '../FormField';
import { ThemeProvider } from '../../ThemeProvider';

const FormFieldWithTheme = (props) => (
  <ThemeProvider>
    <FormField {...props} />
  </ThemeProvider>
);

describe('FormField Component', () => {
  test('renders label when provided', () => {
    render(<FormFieldWithTheme label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  test('shows required asterisk when required', () => {
    render(<FormFieldWithTheme label="Email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  test('displays error message', () => {
    render(<FormFieldWithTheme label="Email" error="Email is required" />);
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('displays success message', () => {
    render(<FormFieldWithTheme label="Email" success="Valid email" />);
    expect(screen.getByText('Valid email')).toBeInTheDocument();
  });

  test('displays helper text', () => {
    render(<FormFieldWithTheme label="Email" helperText="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  test('sets proper accessibility attributes', () => {
    render(<FormFieldWithTheme label="Email" error="Email is required" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
  });

  test('links label to input with htmlFor', () => {
    render(<FormFieldWithTheme label="Email" id="email-field" />);
    const label = screen.getByText('Email');
    const input = screen.getByRole('textbox');
    expect(label).toHaveAttribute('for', 'email-field');
    expect(input).toHaveAttribute('id', 'email-field');
  });
});