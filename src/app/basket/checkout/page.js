"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../stores/useAuth";
import { useViewport } from "@/hooks/useViewport";
import { useResponsiveTypography } from "@/hooks/useResponsiveTypography";
import Loading from "@/components/Loading";
import { deliveryCompanyService } from "@/services/deliveryCompanyService";
import { COMPANY_STATUS, DELIVERY_TYPES } from "@/types/delivery";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, deleteDoc } from "firebase/firestore";

const CheckoutPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { isMobile, isTablet, isTouchDevice } = useViewport();
  const { getResponsiveTextClass, getResponsiveHeadingClass } = useResponsiveTypography();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [deliveryCompanyId, setDeliveryCompanyId] = useState("");
  const [deliveryType, setDeliveryType] = useState("standard");
  const [deliveryCompanies, setDeliveryCompanies] = useState([]);
  const [availableDeliveryOptions, setAvailableDeliveryOptions] = useState([]);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState(null);
  const [deliveryRate, setDeliveryRate] = useState(0);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingDeliveryOptions, setLoadingDeliveryOptions] = useState(false);

  // Fetch delivery companies on mount
  useEffect(() => {
    const fetchDeliveryCompanies = async () => {
      try {
        setLoadingDeliveryOptions(true);

        // Try using the service first
        let companiesData;
        try {
          companiesData = await deliveryCompanyService.getCompaniesByStatus('active');
        } catch (serviceError) {
          console.warn("Service method failed, falling back to direct Firebase query:", serviceError);

          // Fallback to direct Firebase query
          const companiesQuery = query(
            collection(db, "deliveryCompanies"),
            where("status", "==", "active")
          );
          const companiesSnapshot = await getDocs(companiesQuery);
          companiesData = companiesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        }

        setDeliveryCompanies(companiesData);

        // Set default delivery company if available
        if (companiesData.length > 0) {
          setDeliveryCompanyId(companiesData[0].id);
          // Load delivery options for the first company
          await loadDeliveryOptions(companiesData[0]);
        } else {
          console.log("No delivery companies found. Admin needs to add delivery companies first.");
        }
      } catch (err) {
        console.error("Error fetching delivery companies:", err);
        setError("Failed to load delivery companies. Please try again.");
      } finally {
        setLoadingDeliveryOptions(false);
      }
    };

    if (!authLoading && user) {
      fetchDeliveryCompanies();
    }
  }, [authLoading, user]);

  // Load delivery options when company changes
  const loadDeliveryOptions = async (company) => {
    if (!company) return;

    try {
      setLoadingDeliveryOptions(true);
      const options = [];

      // Add available delivery types based on company configuration
      // Check both deliveryTypes and capabilities.deliveryTypes for compatibility
      const companyDeliveryTypes = company.deliveryTypes || company.capabilities?.deliveryTypes || ['standard'];

      if (companyDeliveryTypes.includes(DELIVERY_TYPES.STANDARD) || companyDeliveryTypes.includes('standard')) {
        options.push({
          type: DELIVERY_TYPES.STANDARD,
          name: 'Standard Delivery',
          rate: company.standardRate || 5.99,
          estimatedTime: company.standardDeliveryTime || '3-5 business days',
          description: 'Regular delivery service'
        });
      }

      if (companyDeliveryTypes.includes(DELIVERY_TYPES.EXPRESS) || companyDeliveryTypes.includes('express')) {
        options.push({
          type: DELIVERY_TYPES.EXPRESS,
          name: 'Express Delivery',
          rate: company.expressRate || 12.99,
          estimatedTime: company.expressDeliveryTime || '1-2 business days',
          description: 'Fast delivery service'
        });
      }

      if (companyDeliveryTypes.includes(DELIVERY_TYPES.SAME_DAY) || companyDeliveryTypes.includes('sameDay')) {
        options.push({
          type: DELIVERY_TYPES.SAME_DAY,
          name: 'Same Day Delivery',
          rate: company.sameDayRate || 19.99,
          estimatedTime: company.sameDayDeliveryTime || 'Same day',
          description: 'Delivered within the same day'
        });
      }

      // If no specific delivery types are configured, add a default standard option
      if (options.length === 0) {
        options.push({
          type: DELIVERY_TYPES.STANDARD,
          name: 'Standard Delivery',
          rate: 5.99,
          estimatedTime: '3-5 business days',
          description: 'Regular delivery service'
        });
      }

      setAvailableDeliveryOptions(options);

      // Set default option (usually the first one)
      if (options.length > 0) {
        setSelectedDeliveryOption(options[0]);
        setDeliveryRate(options[0].rate);
        setEstimatedDeliveryTime(options[0].estimatedTime);
        setDeliveryType(options[0].type);
      }
    } catch (err) {
      console.error("Error loading delivery options:", err);
      setError("Failed to load delivery options.");
    } finally {
      setLoadingDeliveryOptions(false);
    }
  };

  // Handle delivery company change
  const handleDeliveryCompanyChange = async (companyId) => {
    setDeliveryCompanyId(companyId);
    const selectedCompany = deliveryCompanies.find(c => c.id === companyId);
    if (selectedCompany) {
      await loadDeliveryOptions(selectedCompany);
    }
  };

  // Handle delivery option change
  const handleDeliveryOptionChange = (option) => {
    setSelectedDeliveryOption(option);
    setDeliveryRate(option.rate);
    setEstimatedDeliveryTime(option.estimatedTime);
    setDeliveryType(option.type);
  };

  // Handle loading and authentication states
  if (authLoading) return <Loading />;
  if (!user) {
    router.push("/auth");
    return null;
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate inputs
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!validatePhone(phone)) {
      setError("Invalid phone number. It should contain only digits and be between 10 to 15 characters long.");
      return;
    }
    if (!deliveryCompanyId) {
      setError("Please select a delivery company.");
      return;
    }
    // If no delivery option is selected but we have a delivery company, use default
    if (!selectedDeliveryOption && deliveryCompanyId) {
      const selectedCompany = deliveryCompanies.find(c => c.id === deliveryCompanyId);
      if (selectedCompany) {
        // Create a default delivery option
        const defaultOption = {
          type: DELIVERY_TYPES.STANDARD,
          name: 'Standard Delivery',
          rate: selectedCompany.standardRate || 5.99,
          estimatedTime: selectedCompany.standardDeliveryTime || '3-5 business days',
          description: 'Regular delivery service'
        };
        setSelectedDeliveryOption(defaultOption);
        setDeliveryRate(defaultOption.rate);
        setEstimatedDeliveryTime(defaultOption.estimatedTime);
        setDeliveryType(defaultOption.type);
      }
    }

    setIsSubmitting(true);

    try {
      // Fetch cart items
      const cartQuery = query(collection(db, "cart"), where("userId", "==", user.uid));
      const cartSnapshot = await getDocs(cartQuery);
      const cartItems = cartSnapshot.docs.map((doc) => ({
        productId: doc.data().productId,
        quantity: doc.data().quantity || 1,
      }));

      if (cartItems.length === 0) {
        setError("Your cart is empty. Please add items before checking out.");
        setIsSubmitting(false);
        return;
      }

      // Get selected delivery company details
      const selectedCompany = deliveryCompanies.find(c => c.id === deliveryCompanyId);

      // Create order document with enhanced delivery information
      const orderData = {
        userId: user.uid,
        deliveryDetails: {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          notes: notes.trim(),
        },
        items: cartItems,
        deliveryInfo: {
          companyId: deliveryCompanyId,
          companyName: selectedCompany?.name || '',
          deliveryType: deliveryType,
          deliveryRate: deliveryRate,
          estimatedDeliveryTime: estimatedDeliveryTime,
          selectedOption: selectedDeliveryOption
        },
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "orders"), orderData);

      // Clear cart
      const deletePromises = cartSnapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      setSuccess(true);
      const companyName = selectedCompany?.name || "your selected company";
      const deliveryOption = selectedDeliveryOption?.name || "standard delivery";
      alert(`Order placed successfully! It will be delivered by ${companyName} via ${deliveryOption}. Estimated delivery: ${estimatedDeliveryTime}. You will be redirected to your orders.`);

      // Reset form
      setName("");
      setPhone("");
      setAddress("");
      setNotes("");
      if (deliveryCompanies.length > 0) {
        setDeliveryCompanyId(deliveryCompanies[0].id);
        await loadDeliveryOptions(deliveryCompanies[0]);
      }

      router.push("/orders");
    } catch (err) {
      console.error("Error during checkout:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Responsive classes
  const containerClasses = `
    container mx-auto 
    ${isMobile ? 'px-4 py-8' : isTablet ? 'px-6 py-12' : 'px-8 py-16'}
  `;

  const formClasses = `
    mt-6 ${isMobile ? 'w-full' : isTablet ? 'max-w-2xl' : 'max-w-lg'} mx-auto
  `;

  const inputClasses = `
    border border-gray-300 rounded-lg w-full 
    ${isMobile ? 'p-4' : 'p-3'} 
    ${getResponsiveTextClass('body-base')}
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    transition-colors duration-200
  `;

  const labelClasses = `
    block font-medium mb-2 ${getResponsiveTextClass('body-base')}
  `;

  const submitButtonClasses = `
    bg-blue-600 text-white font-bold rounded-lg mt-6 w-full
    ${isMobile ? 'px-6 py-4' : 'px-6 py-3'} 
    ${getResponsiveTextClass('body-lg')}
    ${isTouchDevice ? 'min-h-[48px] active:scale-95' : 'min-h-[44px]'}
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${isSubmitting || deliveryCompanies.length === 0 ? '' : 'hover:bg-blue-700 hover:shadow-lg'}
  `;

  const fieldSpacing = isMobile ? 'mt-6' : 'mt-4';

  return (
    <div className={containerClasses}>
      <div className={isMobile ? 'text-center' : 'text-center'}>
        <h1 className={`${getResponsiveHeadingClass(1, 'display')} mb-6`}>
          Checkout
        </h1>
        <p className={`${getResponsiveTextClass('body-base')} text-gray-600`}>
          Thank you for your purchase, {user.email.split("@")[0]}! Please provide your delivery details below:
        </p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className={`
          bg-red-50 border border-red-200 rounded-lg p-4 mt-6
          ${isMobile ? 'text-center' : ''}
        `}>
          <p className={`${getResponsiveTextClass('body-base')} text-red-800`}>
            {error}
          </p>
        </div>
      )}

      {success && (
        <div className={`
          bg-green-50 border border-green-200 rounded-lg p-4 mt-6
          ${isMobile ? 'text-center' : ''}
        `}>
          <p className={`${getResponsiveTextClass('body-base')} text-green-800`}>
            Order placed successfully!
          </p>
        </div>
      )}

      <form className={formClasses} onSubmit={handleCheckout}>
        {/* Name Field */}
        <div>
          <label htmlFor="name" className={labelClasses}>
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClasses}
            placeholder="Enter your full name"
            required
            autoComplete="name"
          />
        </div>

        {/* Phone Field */}
        <div className={fieldSpacing}>
          <label htmlFor="phone" className={labelClasses}>
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClasses}
            placeholder="Enter your phone number"
            required
            autoComplete="tel"
          />
        </div>

        {/* Address Field */}
        <div className={fieldSpacing}>
          <label htmlFor="address" className={labelClasses}>
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputClasses}
            placeholder="Enter your delivery address"
            required
            autoComplete="address-line1"
          />
        </div>

        {/* Delivery Company Field */}
        <div className={fieldSpacing}>
          <label htmlFor="deliveryCompany" className={labelClasses}>
            Delivery Company <span className="text-red-500">*</span>
          </label>
          <select
            id="deliveryCompany"
            value={deliveryCompanyId}
            onChange={(e) => handleDeliveryCompanyChange(e.target.value)}
            className={inputClasses}
            disabled={deliveryCompanies.length === 0 || loadingDeliveryOptions}
          >
            {deliveryCompanies.length === 0 ? (
              <option value="">No delivery companies available</option>
            ) : (
              deliveryCompanies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name} - {company.serviceAreas?.join(', ') || 'All areas'}
                </option>
              ))
            )}
          </select>
          {deliveryCompanies.length === 0 && (
            <p className={`${getResponsiveTextClass('body-sm')} text-gray-500 mt-2`}>
              Please add a delivery company first.
            </p>
          )}
          {loadingDeliveryOptions && (
            <p className={`${getResponsiveTextClass('body-sm')} text-blue-600 mt-2`}>
              Loading delivery options...
            </p>
          )}
        </div>

        {/* Delivery Options */}
        {availableDeliveryOptions.length > 0 && (
          <div className={fieldSpacing}>
            <label className={labelClasses}>
              Delivery Options <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {availableDeliveryOptions.map((option) => (
                <div
                  key={option.type}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all duration-200
                    ${selectedDeliveryOption?.type === option.type
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-300 hover:border-gray-400'
                    }
                    ${isTouchDevice ? 'active:scale-98' : ''}
                  `}
                  onClick={() => handleDeliveryOptionChange(option)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryOption"
                        value={option.type}
                        checked={selectedDeliveryOption?.type === option.type}
                        onChange={() => handleDeliveryOptionChange(option)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <h4 className={`${getResponsiveTextClass('body-base')} font-medium`}>
                          {option.name}
                        </h4>
                        <p className={`${getResponsiveTextClass('body-sm')} text-gray-600`}>
                          {option.description}
                        </p>
                        <p className={`${getResponsiveTextClass('body-sm')} text-gray-500`}>
                          Estimated: {option.estimatedTime}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`${getResponsiveTextClass('body-base')} font-semibold`}>
                        ${option.rate.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Summary */}
        {selectedDeliveryOption && (
          <div className={`${fieldSpacing} bg-gray-50 rounded-lg p-4`}>
            <h4 className={`${getResponsiveTextClass('body-base')} font-medium mb-2`}>
              Delivery Summary
            </h4>
            <div className="flex justify-between items-center">
              <span className={getResponsiveTextClass('body-sm')}>
                {selectedDeliveryOption.name}
              </span>
              <span className={`${getResponsiveTextClass('body-sm')} font-medium`}>
                ${deliveryRate.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className={`${getResponsiveTextClass('body-sm')} text-gray-600`}>
                Estimated delivery
              </span>
              <span className={`${getResponsiveTextClass('body-sm')} text-gray-600`}>
                {estimatedDeliveryTime}
              </span>
            </div>
          </div>
        )}

        {/* Notes Field */}
        <div className={fieldSpacing}>
          <label htmlFor="notes" className={labelClasses}>
            Additional Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputClasses} resize-none`}
            rows={isMobile ? "4" : "3"}
            placeholder="Any special delivery instructions..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || deliveryCompanies.length === 0 || loadingDeliveryOptions || !deliveryCompanyId || !name.trim() || !phone.trim() || !address.trim()}
          className={submitButtonClasses}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
              Processing...
            </div>
          ) : (
            "Confirm Checkout"
          )}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;



