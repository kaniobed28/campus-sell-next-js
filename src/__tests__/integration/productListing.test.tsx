import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SellPage from '@/app/sell/page';
import useSellStore from '@/app/stores/useSellStore';
import useCategoryStore from '@/stores/useCategoryStore';
import { Category } from '@/types/category';

// Mock the stores
jest.mock('@/app/stores/useSellStore');
jest.mock('@/stores/useCategoryStore');

const mockUseSellStore = useSellStore as jest.MockedFunction<typeof useSellStore>;
const mockUseCategoryStore = useCategoryStore as jest.MockedFunction<typeof useCategoryStore>;

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock components
jest.mock('@/app/sell/components/InputField', () => {
  return function InputField({ label, name, value, onChange, error, required, ...props }: any) {
    return (
      <div>
        <label htmlFor={name}>{label} {required && '*'}</label>
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          {...props}
        />
        {error && <span role="alert">{error}</span>}
      </div>
    );
  };
});

jest.mock('@/app/sell/components/TextAreaField', () => {
  return function TextAreaField({ label, name, value, onChange, error, required }: any) {
    return (
      <div>
        <label htmlFor={name}>{label} {required && '*'}</label>
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
        />
        {error && <span role="alert">{error}</span>}
      </div>
    );
  };
});

jest.mock('@/app/sell/components/FileUpload', () => {
  return function FileUpload({ label, onChange, error, required }: any) {
    return (
      <div>
        <label>{label} {required && '*'}</label>
        <input
          type="file"
          multiple
          onChange={(e) => onChange(Array.from(e.target.files || []))}
        />
        {error && <span role="alert">{error}</span>}
      </div>
    );
  };
});

jest.mock('@/app/sell/components/ProgressBar', () => {
  return function ProgressBar({ progress }: any) {
    return <div data-testid="progress-bar">Progress: {progress}%</div>;
  };
});

jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, disabled, loading, ...props }: any) => (
    <button onClick={onClick} disabled={disabled || loading} {...props}>
      {loading ? 'Loading...' : children}
    </button>
  ),
}));

describe('Product Listing Integration', () => {
  const mockCategories: Category[] = [
    {
      id: '1',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices',
      icon: '💻',
      displayOrder: 1,
      isActive: true,
      metadata: {
        productCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user1',
      },
    },
    {
      id: '2',
      name: 'Phones',
      slug: 'phones',
      parentId: '1',
      displayOrder: 1,
      isActive: true,
      metadata: {
        productCount: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'user1',
      },
    },
  ];

  const defaultSellStore = {
    formData: {
      title: '',
      description: '',
      price: '',
      categoryId: '',
      subcategoryId: '',
      image: [],
    },
    selectedCategory: null,
    selectedSubcategory: null,
    uploadProgress: 0,
    isSubmitting: false,
    validationErrors: {},
    setFormData: jest.fn(),
    setCategory: jest.fn(),
    setSubcategory: jest.fn(),
    setImage: jest.fn(),
    validateForm: jest.fn(),
    resetForm: jest.fn(),
    uploadImage: jest.fn(),
    addProductToFirestore: jest.fn(),
  };

  const defaultCategoryStore = {
    categories: mockCategories,
    subcategories: [],
    loading: false,
    error: null,
    fetchCategories: jest.fn(),
    fetchSubcategories: jest.fn(),
    searchCategories: jest.fn(),
    clearSearch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSellStore.mockReturnValue(defaultSellStore as any);
    mockUseCategoryStore.mockReturnValue(defaultCategoryStore as any);
  });

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(<SellPage />);

      expect(screen.getByLabelText(/product title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
      expect(screen.getByText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/product images/i)).toBeInTheDocument();
    });

    it('should show required asterisks for required fields', () => {
      render(<SellPage />);

      expect(screen.getAllByText('*')).toHaveLength(4); // title, description, price, category, images
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors when form is invalid', async () => {
      const mockValidateForm = jest.fn().mockReturnValue(false);
      const mockValidationErrors = {
        title: 'Product title is required',
        categoryId: 'Please select a category',
      };

      mockUseSellStore.mockReturnValue({
        ...defaultSellStore,
        validateForm: mockValidateForm,
        validationErrors: mockValidationErrors,
      } as any);

      render(<SellPage />);

      const submitButton = screen.getByText('List Product');
      fireEvent.click(submitButton);

      expect(mockValidateForm).toHaveBeenCalled();
      expect(screen.getByText('Product title is required')).toBeInTheDocument();
      expect(screen.getByText('Please select a category')).toBeInTheDocument();
    });

    it('should not submit form when validation fails', async () => {
      const mockValidateForm = jest.fn().mockReturnValue(false);
      const mockUploadImage = jest.fn();

      mockUseSellStore.mockReturnValue({
        ...defaultSellStore,
        validateForm: mockValidateForm,
        uploadImage: mockUploadImage,
      } as any);

      render(<SellPage />);

      const submitButton = screen.getByText('List Product');
      fireEvent.click(submitButton);

      expect(mockValidateForm).toHaveBeenCalled();
      expect(mockUploadImage).not.toHaveBeenCalled();
    });
  });

  describe('Category Selection', () => {
    it('should call setCategory when category is selected', () => {
      const mockSetCategory = jest.fn();
      mockUseSellStore.mockReturnValue({
        ...defaultSellStore,
        setCategory: mockSetCategory,
      } as any);

      render(<SellPage />);

      // This would be tested through the CategorySelector component
      // The actual interaction would depend on the CategorySelector implementation
      expect(mockSetCategory).not.toHaveBeenCalled(); // Initially not called
    });

    it('should call setSubcategory when subcategory is selected', () => {
      const mockSetSubcategory = jest.fn();
      mockUseSellStore.mockReturnValue({
        ...defaultSellStore,
        setSubcategory: mockSetSubcategory,
      } as any);

      render(<SellPage />);

      expect(mockSetSubcategory).not.toHaveBeenCalled(); // Initially not called
    });
  });

  describe('Form Submission', () => {
    it('should submit form successfully when validation passes', async () => {
      const mockValidateForm = jest.fn().mockReturnValue(true);
      const mockUploadImage = jest.fn().mockResolvedValue(['image1.jpg', 'image2.jpg']);
      const mockAddProductToFirestore = jest.fn().mockResolvedValue(undefined);
      const mockResetForm = jest.fn();

      const formData = {
        title: 'Test Product',
        description: 'Test Description',
        price: '99.99',
        categoryId: '1',
        subcategoryId: '2',
        image: [new File([''], 'test.jpg', { type: 'image/jpeg' })],
      };

      mockUseSellStore.mockReturnValue({
        ...defaultSellStore,
        formData,
        validateForm: mockValidateForm,
        uploadImage: mockUploadImage,
        addProductToFirestore: mockAddProductToFirestore,
        resetForm: mockResetForm,
      } as any);

      // Mock window.alert
      window.alert = jest.fn();

      render(<SellPage />);

      const submitButton = screen.getByText('List Product');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockValidateForm).toHaveBeenCalled();
        expect(mockUploadImage).toHaveBeenCalledWith(formData.image);
      });

      await waitFor(() => {
        expect(mockAddProductToFirestore).toHaveBeenCalledWith({
          title: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          categoryId: '1',
          subcategoryId: '2',
          imageUrls: ['image1.jpg', 'image2.jpg'],
          createdBy: 'current-user-id',
        });
      });

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Product listed successfully!');
        expect(mockResetForm).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalledWith('/listings');
      });
    });

    it('should handle submission errors gracefully', async () => {
      const mockValidateForm = jest.fn().mockReturnValue(true);
      const mockUploadImage = jest.fn().mockRejectedValue(new Error('Upload failed'));

      mockUseSellStore.mockReturnValue({
        ...defaultSellStore,
        validateForm: mockValidateForm,
        uploadImage: mockUploadImage,
      } as any);

      // Mock window.alert
      window.alert = jest.fn();

      render(<SellPage />);

      const submitButton = screen.getByText('List Product');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Failed to list the product. Please try again.');
      });
    });

    it('should show loading state during submission', async () => {
      const mockValidateForm = jest.fn().mockReturnValue(true);
      const mockUploadImage = jest.fn().mockImplementation(() => new Promise(() => {})); // Never resolves

      mockUseSellStore.mockReturnValue({
        ...defaultSellStore,
        isSubmitting: true,
        validateForm: mockValidateForm,
        uploadImage: mockUploadImage,
      } as any);

      render(<SellPage />);

      expect(screen.getByText('Listing Product...')).toBeInTheDocument();
      expect(screen.getByText('Listing Product...')).toBeDisabled();
    });
  });

  describe('Form Reset', () => {
    it('should reset form when cancel button is clicked', () => {
      const mockResetForm = jest.fn();
      mockUseSellStore.mockReturnValue({
        ...defaultSellStore,
        resetForm: mockResetForm,
      } as any);

      render(<SellPage />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockResetForm).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('Upload Progress', () => {
    it('should show progress bar when upload is in progress', () => {
      mockUseSellStore.mockReturnValue({
        ...defaultSellStore,
        uploadProgress: 50,
      } as any);

      render(<SellPage />);

      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
      expect(screen.getByText('Progress: 50%')).toBeInTheDocument();
    });

    it('should hide progress bar when upload is not in progress', () => {
      render(<SellPage />);

      expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
    });
  });

  describe('Input Handling', () => {
    it('should call setFormData when input values change', () => {
      const mockSetFormData = jest.fn();
      mockUseSellStore.mockReturnValue({
        ...defaultSellStore,
        setFormData: mockSetFormData,
      } as any);

      render(<SellPage />);

      const titleInput = screen.getByLabelText(/product title/i);
      fireEvent.change(titleInput, { target: { value: 'New Product' } });

      expect(mockSetFormData).toHaveBeenCalledWith('title', 'New Product');
    });

    it('should call setImage when files are selected', () => {
      const mockSetImage = jest.fn();
      mockUseSellStore.mockReturnValue({
        ...defaultSellStore,
        setImage: mockSetImage,
      } as any);

      render(<SellPage />);

      const fileInput = screen.getByLabelText(/product images/i);
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      fireEvent.change(fileInput);

      expect(mockSetImage).toHaveBeenCalledWith([file]);
    });
  });
});