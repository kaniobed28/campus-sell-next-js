import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { Button } from '../Button';
import { Input } from '../Input';
import { Textarea } from '../Textarea';
import { Select } from '../Select';
import { Checkbox, CheckboxGroup } from '../Checkbox';
import { Radio, RadioGroup } from '../Radio';
import { FormField } from '../FormField';
import { FormLayout, FormSection, FormRow, FormActions } from '../FormLayout';
import { FormValidationSummary, ValidationMessage } from '../FormValidation';

// Mock the utils function
jest.mock('../../../lib/utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

describe('Responsive Form Components', () => {
  describe('Button Component', () => {
    it('renders with touch-friendly size on mobile', () => {
      render(<Button size="touch">Touch Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-12', 'min-h-[44px]', 'min-w-[44px]');
    });

    it('adapts size for desktop', () => {
      render(<Button size="md">Desktop Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-12', 'md:h-10');
    });

    it('shows loading state correctly', () => {
      render(<Button loading>Loading Button</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button')).toHaveClass('cursor-not-allowed', 'opacity-50');
    });
  });

  describe('Input Component', () => {
    it('renders with responsive sizing', () => {
      render(<Input size="md" placeholder="Test input" />);
      const input = screen.getByPlaceholderText('Test input');
      expect(input).toHaveClass('h-12', 'md:h-10', 'text-base', 'md:text-sm');
    });

    it('shows error state correctly', () => {
      render(<Input error placeholder="Error input" />);
      const input = screen.getByPlaceholderText('Error input');
      expect(input).toHaveClass('border-destructive', 'focus:ring-destructive');
    });

    it('shows success state correctly', () => {
      render(<Input success placeholder="Success input" />);
      const input = screen.getByPlaceholderText('Success input');
      expect(input).toHaveClass('border-success', 'focus:ring-success');
    });

    it('handles touch-friendly sizing', () => {
      render(<Input size="touch" placeholder="Touch input" />);
      const input = screen.getByPlaceholderText('Touch input');
      expect(input).toHaveClass('min-h-[44px]');
    });
  });

  describe('Textarea Component', () => {
    it('renders with responsive sizing', () => {
      render(<Textarea size="md" placeholder="Test textarea" />);
      const textarea = screen.getByPlaceholderText('Test textarea');
      expect(textarea).toHaveClass('min-h-[100px]', 'md:min-h-[80px]');
    });

    it('handles different sizes correctly', () => {
      render(<Textarea size="lg" placeholder="Large textarea" />);
      const textarea = screen.getByPlaceholderText('Large textarea');
      expect(textarea).toHaveClass('min-h-[120px]', 'md:min-h-[100px]');
    });
  });

  describe('Select Component', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
      { value: 'option3', label: 'Option 3' },
    ];

    it('renders with placeholder', () => {
      render(<Select options={options} placeholder="Select option" />);
      expect(screen.getByText('Select option')).toBeInTheDocument();
    });

    it('opens dropdown when clicked', async () => {
      const user = userEvent.setup();
      render(<Select options={options} />);
      
      const trigger = screen.getByRole('button');
      await user.click(trigger);
      
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
      expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('handles option selection', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Select options={options} onChange={onChange} />);
      
      const trigger = screen.getByRole('button');
      await user.click(trigger);
      
      const option = screen.getByText('Option 1');
      await user.click(option);
      
      expect(onChange).toHaveBeenCalledWith('option1');
    });

    it('supports multiple selection', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(<Select options={options} onChange={onChange} multiple />);
      
      const trigger = screen.getByRole('button');
      await user.click(trigger);
      
      const option1 = screen.getByText('Option 1');
      const option2 = screen.getByText('Option 2');
      
      await user.click(option1);
      await user.click(option2);
      
      expect(onChange).toHaveBeenCalledWith(['option1']);
      expect(onChange).toHaveBeenCalledWith(['option1', 'option2']);
    });

    it('supports search functionality', async () => {
      const user = userEvent.setup();
      render(<Select options={options} searchable />);
      
      const trigger = screen.getByRole('button');
      await user.click(trigger);
      
      const searchInput = screen.getByPlaceholderText('Search options...');
      await user.type(searchInput, 'Option 1');
      
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Option 2')).not.toBeInTheDocument();
    });
  });

  describe('Checkbox Component', () => {
    it('renders with label and description', () => {
      render(
        <Checkbox
          label="Test Checkbox"
          description="This is a test checkbox"
        />
      );
      
      expect(screen.getByText('Test Checkbox')).toBeInTheDocument();
      expect(screen.getByText('This is a test checkbox')).toBeInTheDocument();
    });

    it('handles check/uncheck', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<Checkbox label="Test Checkbox" onChange={onChange} />);
      
      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      
      expect(onChange).toHaveBeenCalledWith(true, expect.any(Object));
    });

    it('shows error state', () => {
      render(<Checkbox label="Error Checkbox" error />);
      const label = screen.getByText('Error Checkbox');
      expect(label).toHaveClass('text-destructive');
    });

    it('handles touch-friendly sizing', () => {
      render(<Checkbox label="Touch Checkbox" size="touch" />);
      const container = screen.getByText('Touch Checkbox').closest('div');
      expect(container).toHaveClass('min-h-[44px]');
    });
  });

  describe('Radio Component', () => {
    it('renders with label and description', () => {
      render(
        <Radio
          label="Test Radio"
          description="This is a test radio button"
          value="test"
        />
      );
      
      expect(screen.getByText('Test Radio')).toBeInTheDocument();
      expect(screen.getByText('This is a test radio button')).toBeInTheDocument();
    });

    it('handles selection', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(<Radio label="Test Radio" value="test" onChange={onChange} />);
      
      const radio = screen.getByRole('radio');
      await user.click(radio);
      
      expect(onChange).toHaveBeenCalledWith('test', expect.any(Object));
    });
  });

  describe('RadioGroup Component', () => {
    it('renders multiple radio buttons', () => {
      render(
        <RadioGroup label="Test Group" name="test">
          <Radio value="option1" label="Option 1" />
          <Radio value="option2" label="Option 2" />
        </RadioGroup>
      );
      
      expect(screen.getByText('Test Group')).toBeInTheDocument();
      expect(screen.getByText('Option 1')).toBeInTheDocument();
      expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('handles group selection', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      
      render(
        <RadioGroup label="Test Group" name="test" onChange={onChange}>
          <Radio value="option1" label="Option 1" />
          <Radio value="option2" label="Option 2" />
        </RadioGroup>
      );
      
      const radio1 = screen.getByLabelText('Option 1');
      await user.click(radio1);
      
      expect(onChange).toHaveBeenCalledWith('option1', expect.any(Object));
    });
  });

  describe('FormField Component', () => {
    it('renders with label and helper text', () => {
      render(
        <FormField
          label="Test Field"
          helperText="This is helper text"
          placeholder="Test input"
        />
      );
      
      expect(screen.getByText('Test Field')).toBeInTheDocument();
      expect(screen.getByText('This is helper text')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
    });

    it('shows required indicator', () => {
      render(<FormField label="Required Field" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('displays error message with icon', () => {
      render(<FormField label="Error Field" error="This field has an error" />);
      expect(screen.getByText('This field has an error')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('displays success message with icon', () => {
      render(<FormField label="Success Field" success="Field is valid" />);
      expect(screen.getByText('Field is valid')).toBeInTheDocument();
    });
  });

  describe('FormLayout Components', () => {
    it('FormLayout renders with correct grid classes', () => {
      render(
        <FormLayout columns={2} gap="md" data-testid="form-layout">
          <div>Child 1</div>
          <div>Child 2</div>
        </FormLayout>
      );
      
      const layout = screen.getByTestId('form-layout');
      expect(layout).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-4');
    });

    it('FormSection renders with title and description', () => {
      render(
        <FormSection
          title="Test Section"
          description="This is a test section"
        >
          <div>Section content</div>
        </FormSection>
      );
      
      expect(screen.getByText('Test Section')).toBeInTheDocument();
      expect(screen.getByText('This is a test section')).toBeInTheDocument();
      expect(screen.getByText('Section content')).toBeInTheDocument();
    });

    it('FormActions renders with correct alignment', () => {
      render(
        <FormActions align="end" data-testid="form-actions">
          <button>Cancel</button>
          <button>Submit</button>
        </FormActions>
      );
      
      const actions = screen.getByTestId('form-actions');
      expect(actions).toHaveClass('justify-end');
    });
  });

  describe('FormValidationSummary Component', () => {
    it('renders validation errors', () => {
      const errors = {
        email: 'Email is required',
        password: 'Password is too short',
      };
      
      render(<FormValidationSummary errors={errors} />);
      
      expect(screen.getByText('Please fix the following errors:')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is too short')).toBeInTheDocument();
    });

    it('does not render when no errors', () => {
      render(<FormValidationSummary errors={{}} />);
      expect(screen.queryByText('Please fix the following errors:')).not.toBeInTheDocument();
    });

    it('shows error count', () => {
      const errors = {
        email: 'Email is required',
        password: 'Password is too short',
      };
      
      render(<FormValidationSummary errors={errors} showCount />);
      expect(screen.getByText('Please fix the following errors: (2)')).toBeInTheDocument();
    });
  });

  describe('ValidationMessage Component', () => {
    it('renders error message with icon', () => {
      render(<ValidationMessage type="error" message="This is an error" />);
      expect(screen.getByText('This is an error')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('renders success message with icon', () => {
      render(<ValidationMessage type="success" message="This is success" />);
      expect(screen.getByText('This is success')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('does not render when no message', () => {
      render(<ValidationMessage type="error" />);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('applies mobile-first responsive classes', () => {
      render(<Input size="md" data-testid="responsive-input" />);
      const input = screen.getByTestId('responsive-input');
      
      // Should have mobile classes first, then desktop overrides
      expect(input).toHaveClass('h-12', 'md:h-10', 'text-base', 'md:text-sm');
    });

    it('maintains touch targets on mobile', () => {
      render(<Button size="touch" data-testid="touch-button">Touch Me</Button>);
      const button = screen.getByTestId('touch-button');
      
      expect(button).toHaveClass('min-h-[44px]', 'min-w-[44px]');
    });

    it('adapts form layout for different screen sizes', () => {
      render(
        <FormLayout columns={3} data-testid="responsive-layout">
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </FormLayout>
      );
      
      const layout = screen.getByTestId('responsive-layout');
      expect(layout).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA attributes', () => {
      render(
        <FormField
          label="Accessible Field"
          error="Field error"
          helperText="Helper text"
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('associates labels with form controls', () => {
      render(<FormField label="Test Label" />);
      
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Label');
      
      expect(input).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', input.getAttribute('id'));
    });

    it('provides proper focus management', async () => {
      const user = userEvent.setup();
      render(<Input data-testid="focusable-input" />);
      
      const input = screen.getByTestId('focusable-input');
      await user.click(input);
      
      expect(input).toHaveFocus();
    });
  });
});