"use client";

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { Checkbox, CheckboxGroup } from '../ui/Checkbox';
import { Radio, RadioGroup } from '../ui/Radio';
import { FormField } from '../ui/FormField';
import { FormLayout, FormSection, FormRow, FormActions } from '../ui/FormLayout';
import { FormValidationSummary, ValidationMessage, FieldStrengthIndicator } from '../ui/FormValidation';

/**
 * Comprehensive responsive form example demonstrating all form components
 * with touch-friendly interactions and adaptive layouts
 */
const ResponsiveFormExample = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    bio: '',
    category: '',
    interests: [],
    contactMethod: 'email',
    newsletter: false,
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sample options for select components
  const categoryOptions = [
    { value: 'student', label: 'Student' },
    { value: 'faculty', label: 'Faculty' },
    { value: 'staff', label: 'Staff' },
    { value: 'alumni', label: 'Alumni' },
  ];

  const interestOptions = [
    { value: 'books', label: 'Books & Textbooks' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'sports', label: 'Sports Equipment' },
  ];

  // Calculate password strength
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleMultiSelectChange = (name, values) => {
    setFormData(prev => ({ ...prev, [name]: values }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.terms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Form submitted:', formData);
    alert('Form submitted successfully!');
    
    setIsSubmitting(false);
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground md:text-2xl">
          Responsive Form Example
        </h1>
        <p className="text-muted-foreground text-lg md:text-base">
          Demonstrating touch-friendly form components with adaptive layouts
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Validation Summary */}
        <FormValidationSummary errors={errors} />

        {/* Personal Information Section */}
        <FormSection
          title="Personal Information"
          description="Please provide your basic information"
        >
          <FormLayout columns={2} gap="md">
            <FormField
              label="First Name"
              required
              error={errors.firstName}
              size="md"
            >
              <Input
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter your first name"
              />
            </FormField>

            <FormField
              label="Last Name"
              required
              error={errors.lastName}
              size="md"
            >
              <Input
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter your last name"
              />
            </FormField>
          </FormLayout>

          <FormLayout columns={2} gap="md">
            <FormField
              label="Email Address"
              required
              error={errors.email}
              helperText="We'll use this to contact you"
              size="md"
            >
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
              />
            </FormField>

            <FormField
              label="Phone Number"
              error={errors.phone}
              helperText="Optional - for urgent communications"
              size="md"
            >
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
              />
            </FormField>
          </FormLayout>
        </FormSection>

        {/* Account Security Section */}
        <FormSection
          title="Account Security"
          description="Create a secure password for your account"
        >
          <FormLayout columns={2} gap="md">
            <div className="space-y-3">
              <FormField
                label="Password"
                required
                error={errors.password}
                size="md"
              >
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Create a strong password"
                />
              </FormField>
              
              {formData.password && (
                <FieldStrengthIndicator
                  strength={passwordStrength}
                  maxStrength={4}
                  labels={['Weak', 'Fair', 'Good', 'Strong']}
                />
              )}
            </div>

            <FormField
              label="Confirm Password"
              required
              error={errors.confirmPassword}
              size="md"
            >
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
              />
            </FormField>
          </FormLayout>
        </FormSection>

        {/* Profile Information Section */}
        <FormSection
          title="Profile Information"
          description="Tell us more about yourself"
        >
          <FormField
            label="Bio"
            error={errors.bio}
            helperText="Brief description about yourself (optional)"
            size="md"
          >
            <Textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </FormField>

          <FormLayout columns={2} gap="md">
            <FormField
              label="Category"
              required
              error={errors.category}
              size="md"
            >
              <Select
                options={categoryOptions}
                value={formData.category}
                onChange={(value) => handleInputChange('category', value)}
                placeholder="Select your category"
              />
            </FormField>

            <FormField
              label="Interests"
              error={errors.interests}
              helperText="Select all that apply"
              size="md"
            >
              <Select
                options={interestOptions}
                value={formData.interests}
                onChange={(values) => handleMultiSelectChange('interests', values)}
                placeholder="Select your interests"
                multiple
                searchable
              />
            </FormField>
          </FormLayout>
        </FormSection>

        {/* Preferences Section */}
        <FormSection
          title="Communication Preferences"
          description="How would you like us to contact you?"
        >
          <RadioGroup
            label="Preferred Contact Method"
            value={formData.contactMethod}
            onChange={(value) => handleInputChange('contactMethod', value)}
            name="contactMethod"
            orientation="horizontal"
            size="md"
          >
            <Radio value="email" label="Email" />
            <Radio value="phone" label="Phone" />
            <Radio value="sms" label="SMS" />
          </RadioGroup>

          <div className="space-y-4">
            <Checkbox
              checked={formData.newsletter}
              onChange={(checked) => handleCheckboxChange('newsletter', checked)}
              label="Subscribe to newsletter"
              description="Receive updates about new features and campus marketplace news"
              size="md"
            />

            <Checkbox
              checked={formData.terms}
              onChange={(checked) => handleCheckboxChange('terms', checked)}
              label="I accept the terms and conditions"
              description="You must accept our terms to create an account"
              required
              error={!!errors.terms}
              size="md"
            />
          </div>

          {errors.terms && (
            <ValidationMessage type="error" message={errors.terms} />
          )}
        </FormSection>

        {/* Form Actions */}
        <FormActions align="end" gap="md">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
                bio: '',
                category: '',
                interests: [],
                contactMethod: 'email',
                newsletter: false,
                terms: false,
              });
              setErrors({});
            }}
            disabled={isSubmitting}
          >
            Reset Form
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </FormActions>
      </form>
    </div>
  );
};

export default ResponsiveFormExample;