"use client";

import React, { useState, useEffect } from 'react';
import ResponsiveAdminForm from './ResponsiveAdminForm';
import { useAdminResponsive } from '@/hooks/useAdminResponsive';
import { 
  VEHICLE_TYPES, 
  DELIVERY_TYPES, 
  DEFAULT_OPERATING_HOURS,
  FIELD_LABELS,
  VALIDATION_RULES
} from '@/types/delivery';

const DeliveryCompanyForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create' // 'create' or 'edit'
}) => {
  const { formConfig } = useAdminResponsive();
  
  const [formData, setFormData] = useState({
    name: '',
    contactInfo: {
      email: '',
      phone: '',
      contactPerson: '',
      website: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'US'
      }
    },
    businessInfo: {
      registrationNumber: '',
      taxId: '',
      insurancePolicy: '',
      licenses: [],
      bankingInfo: {
        accountName: '',
        accountNumber: '',
        routingNumber: '',
        bankName: ''
      }
    },
    operationalInfo: {
      vehicleFleet: [{ type: 'bike', count: 1, capacity: 10, description: '' }],
      driverCount: 1,
      operatingHours: DEFAULT_OPERATING_HOURS,
      maxDailyCapacity: 50
    },
    capabilities: {
      vehicleTypes: ['bike'],
      maxCapacity: 50,
      deliveryTypes: ['standard'],
      specialServices: []
    },
    integrationConfig: {
      hasAPI: false,
      apiEndpoint: '',
      webhookUrl: '',
      authMethod: null,
      isActive: false
    }
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: 'basic', title: 'Basic Information', icon: '🏢' },
    { id: 'contact', title: 'Contact Details', icon: '📞' },
    { id: 'business', title: 'Business Information', icon: '📋' },
    { id: 'operations', title: 'Operations', icon: '🚛' },
    { id: 'capabilities', title: 'Capabilities', icon: '⚡' },
    { id: 'integration', title: 'Integration', icon: '🔗' }
  ];

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const handleInputChange = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });

    // Clear error for this field
    if (errors[path]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[path];
        return newErrors;
      });
    }
  };

  const validateStep = (stepIndex) => {
    const stepErrors = {};
    
    switch (stepIndex) {
      case 0: // Basic Information
        if (!formData.name || formData.name.length < 2) {
          stepErrors['name'] = 'Company name must be at least 2 characters';
        }
        break;
        
      case 1: // Contact Details
        if (!formData.contactInfo.email || !VALIDATION_RULES.EMAIL.PATTERN.test(formData.contactInfo.email)) {
          stepErrors['contactInfo.email'] = 'Valid email address is required';
        }
        if (!formData.contactInfo.phone || !VALIDATION_RULES.PHONE.PATTERN.test(formData.contactInfo.phone)) {
          stepErrors['contactInfo.phone'] = 'Valid phone number is required';
        }
        if (!formData.contactInfo.contactPerson || formData.contactInfo.contactPerson.length < 2) {
          stepErrors['contactInfo.contactPerson'] = 'Contact person name is required';
        }
        break;
        
      case 2: // Business Information
        if (!formData.businessInfo.registrationNumber) {
          stepErrors['businessInfo.registrationNumber'] = 'Registration number is required';
        }
        if (!formData.businessInfo.taxId) {
          stepErrors['businessInfo.taxId'] = 'Tax ID is required';
        }
        if (!formData.businessInfo.insurancePolicy) {
          stepErrors['businessInfo.insurancePolicy'] = 'Insurance policy is required';
        }
        break;
        
      case 3: // Operations
        if (!formData.operationalInfo.driverCount || formData.operationalInfo.driverCount < 1) {
          stepErrors['operationalInfo.driverCount'] = 'At least 1 driver is required';
        }
        if (!formData.operationalInfo.maxDailyCapacity || formData.operationalInfo.maxDailyCapacity < 1) {
          stepErrors['operationalInfo.maxDailyCapacity'] = 'Daily capacity must be at least 1';
        }
        break;
        
      case 4: // Capabilities
        if (!formData.capabilities.vehicleTypes.length) {
          stepErrors['capabilities.vehicleTypes'] = 'At least one vehicle type is required';
        }
        if (!formData.capabilities.deliveryTypes.length) {
          stepErrors['capabilities.deliveryTypes'] = 'At least one delivery type is required';
        }
        break;
    }
    
    return stepErrors;
  };

  const handleNext = () => {
    const stepErrors = validateStep(currentStep);
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all steps
    let allErrors = {};
    for (let i = 0; i < steps.length; i++) {
      const stepErrors = validateStep(i);
      allErrors = { ...allErrors, ...stepErrors };
    }
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      // Go to first step with errors
      for (let i = 0; i < steps.length; i++) {
        const stepErrors = validateStep(i);
        if (Object.keys(stepErrors).length > 0) {
          setCurrentStep(i);
          break;
        }
      }
      return;
    }
    
    onSubmit(formData);
  };

  const addVehicle = () => {
    setFormData(prev => ({
      ...prev,
      operationalInfo: {
        ...prev.operationalInfo,
        vehicleFleet: [
          ...prev.operationalInfo.vehicleFleet,
          { type: 'bike', count: 1, capacity: 10, description: '' }
        ]
      }
    }));
  };

  const removeVehicle = (index) => {
    setFormData(prev => ({
      ...prev,
      operationalInfo: {
        ...prev.operationalInfo,
        vehicleFleet: prev.operationalInfo.vehicleFleet.filter((_, i) => i !== index)
      }
    }));
  };

  const updateVehicle = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      operationalInfo: {
        ...prev.operationalInfo,
        vehicleFleet: prev.operationalInfo.vehicleFleet.map((vehicle, i) => 
          i === index ? { ...vehicle, [field]: value } : vehicle
        )
      }
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-4">
            <ResponsiveAdminForm.Field
              label={FIELD_LABELS.COMPANY_NAME}
              required
              error={errors['name']}
            >
              <ResponsiveAdminForm.Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter company name"
              />
            </ResponsiveAdminForm.Field>
          </div>
        );

      case 1: // Contact Details
        return (
          <div className="space-y-4">
            <ResponsiveAdminForm.Field
              label={FIELD_LABELS.CONTACT_EMAIL}
              required
              error={errors['contactInfo.email']}
            >
              <ResponsiveAdminForm.Input
                type="email"
                value={formData.contactInfo.email}
                onChange={(e) => handleInputChange('contactInfo.email', e.target.value)}
                placeholder="contact@company.com"
              />
            </ResponsiveAdminForm.Field>

            <ResponsiveAdminForm.Field
              label={FIELD_LABELS.CONTACT_PHONE}
              required
              error={errors['contactInfo.phone']}
            >
              <ResponsiveAdminForm.Input
                type="tel"
                value={formData.contactInfo.phone}
                onChange={(e) => handleInputChange('contactInfo.phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </ResponsiveAdminForm.Field>

            <ResponsiveAdminForm.Field
              label={FIELD_LABELS.CONTACT_PERSON}
              required
              error={errors['contactInfo.contactPerson']}
            >
              <ResponsiveAdminForm.Input
                value={formData.contactInfo.contactPerson}
                onChange={(e) => handleInputChange('contactInfo.contactPerson', e.target.value)}
                placeholder="John Doe"
              />
            </ResponsiveAdminForm.Field>

            <ResponsiveAdminForm.Field
              label={FIELD_LABELS.WEBSITE}
              error={errors['contactInfo.website']}
            >
              <ResponsiveAdminForm.Input
                type="url"
                value={formData.contactInfo.website}
                onChange={(e) => handleInputChange('contactInfo.website', e.target.value)}
                placeholder="https://company.com"
              />
            </ResponsiveAdminForm.Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResponsiveAdminForm.Field
                label="Street Address"
                required
                error={errors['contactInfo.address.street']}
              >
                <ResponsiveAdminForm.Input
                  value={formData.contactInfo.address.street}
                  onChange={(e) => handleInputChange('contactInfo.address.street', e.target.value)}
                  placeholder="123 Main St"
                />
              </ResponsiveAdminForm.Field>

              <ResponsiveAdminForm.Field
                label="City"
                required
                error={errors['contactInfo.address.city']}
              >
                <ResponsiveAdminForm.Input
                  value={formData.contactInfo.address.city}
                  onChange={(e) => handleInputChange('contactInfo.address.city', e.target.value)}
                  placeholder="City"
                />
              </ResponsiveAdminForm.Field>

              <ResponsiveAdminForm.Field
                label="State"
                required
                error={errors['contactInfo.address.state']}
              >
                <ResponsiveAdminForm.Input
                  value={formData.contactInfo.address.state}
                  onChange={(e) => handleInputChange('contactInfo.address.state', e.target.value)}
                  placeholder="State"
                />
              </ResponsiveAdminForm.Field>

              <ResponsiveAdminForm.Field
                label="ZIP Code"
                required
                error={errors['contactInfo.address.zipCode']}
              >
                <ResponsiveAdminForm.Input
                  value={formData.contactInfo.address.zipCode}
                  onChange={(e) => handleInputChange('contactInfo.address.zipCode', e.target.value)}
                  placeholder="12345"
                />
              </ResponsiveAdminForm.Field>
            </div>
          </div>
        );

      case 2: // Business Information
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResponsiveAdminForm.Field
                label={FIELD_LABELS.REGISTRATION_NUMBER}
                required
                error={errors['businessInfo.registrationNumber']}
              >
                <ResponsiveAdminForm.Input
                  value={formData.businessInfo.registrationNumber}
                  onChange={(e) => handleInputChange('businessInfo.registrationNumber', e.target.value)}
                  placeholder="REG123456"
                />
              </ResponsiveAdminForm.Field>

              <ResponsiveAdminForm.Field
                label={FIELD_LABELS.TAX_ID}
                required
                error={errors['businessInfo.taxId']}
              >
                <ResponsiveAdminForm.Input
                  value={formData.businessInfo.taxId}
                  onChange={(e) => handleInputChange('businessInfo.taxId', e.target.value)}
                  placeholder="12-3456789"
                />
              </ResponsiveAdminForm.Field>
            </div>

            <ResponsiveAdminForm.Field
              label={FIELD_LABELS.INSURANCE_POLICY}
              required
              error={errors['businessInfo.insurancePolicy']}
            >
              <ResponsiveAdminForm.Input
                value={formData.businessInfo.insurancePolicy}
                onChange={(e) => handleInputChange('businessInfo.insurancePolicy', e.target.value)}
                placeholder="INS-123456789"
              />
            </ResponsiveAdminForm.Field>

            <div className="border-t pt-4">
              <h4 className="text-lg font-medium mb-4">Banking Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ResponsiveAdminForm.Field
                  label="Account Name"
                  error={errors['businessInfo.bankingInfo.accountName']}
                >
                  <ResponsiveAdminForm.Input
                    value={formData.businessInfo.bankingInfo.accountName}
                    onChange={(e) => handleInputChange('businessInfo.bankingInfo.accountName', e.target.value)}
                    placeholder="Company Name"
                  />
                </ResponsiveAdminForm.Field>

                <ResponsiveAdminForm.Field
                  label="Bank Name"
                  error={errors['businessInfo.bankingInfo.bankName']}
                >
                  <ResponsiveAdminForm.Input
                    value={formData.businessInfo.bankingInfo.bankName}
                    onChange={(e) => handleInputChange('businessInfo.bankingInfo.bankName', e.target.value)}
                    placeholder="Bank Name"
                  />
                </ResponsiveAdminForm.Field>

                <ResponsiveAdminForm.Field
                  label="Account Number"
                  error={errors['businessInfo.bankingInfo.accountNumber']}
                >
                  <ResponsiveAdminForm.Input
                    value={formData.businessInfo.bankingInfo.accountNumber}
                    onChange={(e) => handleInputChange('businessInfo.bankingInfo.accountNumber', e.target.value)}
                    placeholder="1234567890"
                  />
                </ResponsiveAdminForm.Field>

                <ResponsiveAdminForm.Field
                  label="Routing Number"
                  error={errors['businessInfo.bankingInfo.routingNumber']}
                >
                  <ResponsiveAdminForm.Input
                    value={formData.businessInfo.bankingInfo.routingNumber}
                    onChange={(e) => handleInputChange('businessInfo.bankingInfo.routingNumber', e.target.value)}
                    placeholder="123456789"
                  />
                </ResponsiveAdminForm.Field>
              </div>
            </div>
          </div>
        );

      case 3: // Operations
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResponsiveAdminForm.Field
                label={FIELD_LABELS.DRIVER_COUNT}
                required
                error={errors['operationalInfo.driverCount']}
              >
                <ResponsiveAdminForm.Input
                  type="number"
                  min="1"
                  value={formData.operationalInfo.driverCount}
                  onChange={(e) => handleInputChange('operationalInfo.driverCount', parseInt(e.target.value))}
                />
              </ResponsiveAdminForm.Field>

              <ResponsiveAdminForm.Field
                label="Max Daily Capacity"
                required
                error={errors['operationalInfo.maxDailyCapacity']}
              >
                <ResponsiveAdminForm.Input
                  type="number"
                  min="1"
                  value={formData.operationalInfo.maxDailyCapacity}
                  onChange={(e) => handleInputChange('operationalInfo.maxDailyCapacity', parseInt(e.target.value))}
                />
              </ResponsiveAdminForm.Field>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">Vehicle Fleet</h4>
                <ResponsiveAdminForm.Button
                  type="button"
                  variant="outline"
                  onClick={addVehicle}
                >
                  Add Vehicle
                </ResponsiveAdminForm.Button>
              </div>

              <div className="space-y-4">
                {formData.operationalInfo.vehicleFleet.map((vehicle, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="font-medium">Vehicle {index + 1}</h5>
                      {formData.operationalInfo.vehicleFleet.length > 1 && (
                        <ResponsiveAdminForm.Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeVehicle(index)}
                        >
                          Remove
                        </ResponsiveAdminForm.Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <ResponsiveAdminForm.Field label="Vehicle Type">
                        <ResponsiveAdminForm.Select
                          value={vehicle.type}
                          onChange={(e) => updateVehicle(index, 'type', e.target.value)}
                        >
                          {Object.entries(VEHICLE_TYPES).map(([key, value]) => (
                            <option key={key} value={value}>
                              {key.charAt(0) + key.slice(1).toLowerCase()}
                            </option>
                          ))}
                        </ResponsiveAdminForm.Select>
                      </ResponsiveAdminForm.Field>

                      <ResponsiveAdminForm.Field label="Count">
                        <ResponsiveAdminForm.Input
                          type="number"
                          min="1"
                          value={vehicle.count}
                          onChange={(e) => updateVehicle(index, 'count', parseInt(e.target.value))}
                        />
                      </ResponsiveAdminForm.Field>

                      <ResponsiveAdminForm.Field label="Capacity (kg)">
                        <ResponsiveAdminForm.Input
                          type="number"
                          min="1"
                          value={vehicle.capacity}
                          onChange={(e) => updateVehicle(index, 'capacity', parseInt(e.target.value))}
                        />
                      </ResponsiveAdminForm.Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4: // Capabilities
        return (
          <div className="space-y-6">
            <ResponsiveAdminForm.Field
              label="Vehicle Types"
              required
              error={errors['capabilities.vehicleTypes']}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(VEHICLE_TYPES).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.capabilities.vehicleTypes.includes(value)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...formData.capabilities.vehicleTypes, value]
                          : formData.capabilities.vehicleTypes.filter(t => t !== value);
                        handleInputChange('capabilities.vehicleTypes', newTypes);
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{key.charAt(0) + key.slice(1).toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </ResponsiveAdminForm.Field>

            <ResponsiveAdminForm.Field
              label="Delivery Types"
              required
              error={errors['capabilities.deliveryTypes']}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(DELIVERY_TYPES).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.capabilities.deliveryTypes.includes(value)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...formData.capabilities.deliveryTypes, value]
                          : formData.capabilities.deliveryTypes.filter(t => t !== value);
                        handleInputChange('capabilities.deliveryTypes', newTypes);
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{key.charAt(0) + key.slice(1).toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </ResponsiveAdminForm.Field>

            <ResponsiveAdminForm.Field
              label="Maximum Capacity (kg)"
              required
              error={errors['capabilities.maxCapacity']}
            >
              <ResponsiveAdminForm.Input
                type="number"
                min="1"
                value={formData.capabilities.maxCapacity}
                onChange={(e) => handleInputChange('capabilities.maxCapacity', parseInt(e.target.value))}
              />
            </ResponsiveAdminForm.Field>
          </div>
        );

      case 5: // Integration
        return (
          <div className="space-y-4">
            <ResponsiveAdminForm.Field label="API Integration">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.integrationConfig.hasAPI}
                  onChange={(e) => handleInputChange('integrationConfig.hasAPI', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Company has API integration</span>
              </label>
            </ResponsiveAdminForm.Field>

            {formData.integrationConfig.hasAPI && (
              <>
                <ResponsiveAdminForm.Field
                  label="API Endpoint"
                  error={errors['integrationConfig.apiEndpoint']}
                >
                  <ResponsiveAdminForm.Input
                    type="url"
                    value={formData.integrationConfig.apiEndpoint}
                    onChange={(e) => handleInputChange('integrationConfig.apiEndpoint', e.target.value)}
                    placeholder="https://api.company.com/v1"
                  />
                </ResponsiveAdminForm.Field>

                <ResponsiveAdminForm.Field
                  label="Webhook URL"
                  error={errors['integrationConfig.webhookUrl']}
                >
                  <ResponsiveAdminForm.Input
                    type="url"
                    value={formData.integrationConfig.webhookUrl}
                    onChange={(e) => handleInputChange('integrationConfig.webhookUrl', e.target.value)}
                    placeholder="https://api.company.com/webhook"
                  />
                </ResponsiveAdminForm.Field>

                <ResponsiveAdminForm.Field
                  label="Authentication Method"
                  error={errors['integrationConfig.authMethod']}
                >
                  <ResponsiveAdminForm.Select
                    value={formData.integrationConfig.authMethod || ''}
                    onChange={(e) => handleInputChange('integrationConfig.authMethod', e.target.value || null)}
                  >
                    <option value="">Select authentication method</option>
                    <option value="apiKey">API Key</option>
                    <option value="oauth">OAuth</option>
                    <option value="basic">Basic Auth</option>
                  </ResponsiveAdminForm.Select>
                </ResponsiveAdminForm.Field>
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
                  index <= currentStep
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                <span className="text-lg" role="img" aria-label={step.title}>
                  {step.icon}
                </span>
              </div>
              <div className="ml-3 hidden md:block">
                <p className={`text-sm font-medium ${
                  index <= currentStep ? 'text-primary' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-primary' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <ResponsiveAdminForm onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-6">
            {steps[currentStep].title}
          </h3>
          
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <ResponsiveAdminForm.Actions align="between">
          <div>
            {currentStep > 0 && (
              <ResponsiveAdminForm.Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={loading}
              >
                Previous
              </ResponsiveAdminForm.Button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <ResponsiveAdminForm.Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </ResponsiveAdminForm.Button>
            
            {currentStep < steps.length - 1 ? (
              <ResponsiveAdminForm.Button
                type="button"
                onClick={handleNext}
                disabled={loading}
              >
                Next
              </ResponsiveAdminForm.Button>
            ) : (
              <ResponsiveAdminForm.Button
                type="submit"
                loading={loading}
                disabled={loading}
              >
                {mode === 'create' ? 'Create Company' : 'Update Company'}
              </ResponsiveAdminForm.Button>
            )}
          </div>
        </ResponsiveAdminForm.Actions>
      </ResponsiveAdminForm>
    </div>
  );
};

export default DeliveryCompanyForm;