import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveImageContainer, { 
  ProductImageContainer, 
  HeroImageContainer, 
  ThumbnailImageContainer,
  GalleryImageContainer,
  AvatarImageContainer 
} from '../ResponsiveImageContainer';
import { useViewport } from '@/hooks/useViewport';

// Mock the useViewport hook
jest.mock('@/hooks/useViewport');

// Mock ResponsiveImage component
jest.mock('../ResponsiveImage', () => {
  return function MockResponsiveImage({ src, alt, aspectRatio, sizes, className, ...props }) {
    return (
      <div
        data-testid="responsive-image"
        data-src={src}
        data-alt={alt}
        data-aspect-ratio={aspectRatio}
        data-sizes={sizes}
        className={className}
        {...props}
      />
    );
  };
});

describe('ResponsiveImageContainer', () => {
  const mockUseViewport = useViewport;

  beforeEach(() => {
    mockUseViewport.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isTouchDevice: false
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders with product variant configuration', () => {
    render(
      <ResponsiveImageContainer
        src="/product-image.jpg"
        alt="Product image"
        variant="product"
      />
    );

    const image = screen.getByTestId('responsive-image');
    expect(image).toHaveAttribute('data-aspect-ratio', 'square');
    expect(image).toHaveAttribute('data-sizes', '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw');
  });

  it('renders with hero variant configuration', () => {
    render(
      <ResponsiveImageContainer
        src="/hero-image.jpg"
        alt="Hero image"
        variant="hero"
      />
    );

    const image = screen.getByTestId('responsive-image');
    expect(image).toHaveAttribute('data-aspect-ratio', 'video');
    expect(image).toHaveAttribute('data-sizes', '100vw');
  });

  it('renders with thumbnail variant configuration', () => {
    render(
      <ResponsiveImageContainer
        src="/thumb-image.jpg"
        alt="Thumbnail image"
        variant="thumbnail"
      />
    );

    const image = screen.getByTestId('responsive-image');
    expect(image).toHaveAttribute('data-aspect-ratio', 'square');
    expect(image).toHaveAttribute('data-sizes', '(max-width: 640px) 25vw, (max-width: 768px) 20vw, 15vw');
  });

  it('renders with gallery variant configuration', () => {
    render(
      <ResponsiveImageContainer
        src="/gallery-image.jpg"
        alt="Gallery image"
        variant="gallery"
      />
    );

    const image = screen.getByTestId('responsive-image');
    expect(image).toHaveAttribute('data-aspect-ratio', 'auto');
    expect(image).toHaveAttribute('data-sizes', '(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 50vw');
  });

  it('renders with avatar variant configuration', () => {
    render(
      <ResponsiveImageContainer
        src="/avatar-image.jpg"
        alt="Avatar image"
        variant="avatar"
      />
    );

    const image = screen.getByTestId('responsive-image');
    expect(image).toHaveAttribute('data-aspect-ratio', 'square');
    expect(image).toHaveAttribute('data-sizes', '(max-width: 640px) 15vw, 10vw');
  });

  it('handles click events when onImageClick is provided', () => {
    const onClickMock = jest.fn();
    
    render(
      <ResponsiveImageContainer
        src="/test-image.jpg"
        alt="Test image"
        onImageClick={onClickMock}
      />
    );

    const container = screen.getByRole('button');
    fireEvent.click(container);

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events when onImageClick is provided', () => {
    const onClickMock = jest.fn();
    
    render(
      <ResponsiveImageContainer
        src="/test-image.jpg"
        alt="Test image"
        onImageClick={onClickMock}
      />
    );

    const container = screen.getByRole('button');
    
    // Test Enter key
    fireEvent.keyDown(container, { key: 'Enter' });
    expect(onClickMock).toHaveBeenCalledTimes(1);
    
    // Test Space key
    fireEvent.keyDown(container, { key: ' ' });
    expect(onClickMock).toHaveBeenCalledTimes(2);
  });

  it('applies touch target sizing on touch devices', () => {
    mockUseViewport.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isTouchDevice: true
    });

    const onClickMock = jest.fn();
    
    const { container } = render(
      <ResponsiveImageContainer
        src="/test-image.jpg"
        alt="Test image"
        onImageClick={onClickMock}
      />
    );

    const imageContainer = container.firstChild;
    expect(imageContainer).toHaveClass('min-h-[44px]', 'min-w-[44px]');
  });

  it('shows overlay when showOverlay is true', () => {
    const { container } = render(
      <ResponsiveImageContainer
        src="/test-image.jpg"
        alt="Test image"
        showOverlay={true}
        overlayContent={<span>Overlay content</span>}
      />
    );

    expect(screen.getByText('Overlay content')).toBeInTheDocument();
  });

  it('shows mobile loading indicator on mobile devices', () => {
    mockUseViewport.mockReturnValue({
      isMobile: true,
      isTablet: false,
      isTouchDevice: true
    });

    const { container } = render(
      <ResponsiveImageContainer
        src="/test-image.jpg"
        alt="Test image"
      />
    );

    const loadingIndicator = container.querySelector('.animate-pulse');
    expect(loadingIndicator).toBeInTheDocument();
  });

  it('applies custom className and containerClassName', () => {
    const { container } = render(
      <ResponsiveImageContainer
        src="/test-image.jpg"
        alt="Test image"
        className="custom-image-class"
        containerClassName="custom-container-class"
      />
    );

    const imageContainer = container.firstChild;
    const image = screen.getByTestId('responsive-image');
    
    expect(imageContainer).toHaveClass('custom-container-class');
    expect(image).toHaveClass('custom-image-class');
  });
});

describe('Specialized Image Components', () => {
  beforeEach(() => {
    useViewport.mockReturnValue({
      isMobile: false,
      isTablet: false,
      isTouchDevice: false
    });
  });

  it('ProductImageContainer uses product variant', () => {
    render(
      <ProductImageContainer
        src="/product.jpg"
        alt="Product"
      />
    );

    const image = screen.getByTestId('responsive-image');
    expect(image).toHaveAttribute('data-aspect-ratio', 'square');
  });

  it('HeroImageContainer uses hero variant', () => {
    render(
      <HeroImageContainer
        src="/hero.jpg"
        alt="Hero"
      />
    );

    const image = screen.getByTestId('responsive-image');
    expect(image).toHaveAttribute('data-aspect-ratio', 'video');
  });

  it('ThumbnailImageContainer uses thumbnail variant', () => {
    render(
      <ThumbnailImageContainer
        src="/thumb.jpg"
        alt="Thumbnail"
      />
    );

    const image = screen.getByTestId('responsive-image');
    expect(image).toHaveAttribute('data-aspect-ratio', 'square');
    expect(image).toHaveAttribute('data-sizes', '(max-width: 640px) 25vw, (max-width: 768px) 20vw, 15vw');
  });

  it('GalleryImageContainer uses gallery variant with overlay', () => {
    const { container } = render(
      <GalleryImageContainer
        src="/gallery.jpg"
        alt="Gallery"
      />
    );

    const image = screen.getByTestId('responsive-image');
    expect(image).toHaveAttribute('data-aspect-ratio', 'auto');
    
    // Check for overlay
    const overlay = container.querySelector('.group-hover\\:bg-black\\/20');
    expect(overlay).toBeInTheDocument();
  });

  it('AvatarImageContainer uses avatar variant', () => {
    render(
      <AvatarImageContainer
        src="/avatar.jpg"
        alt="Avatar"
      />
    );

    const image = screen.getByTestId('responsive-image');
    expect(image).toHaveAttribute('data-aspect-ratio', 'square');
    expect(image).toHaveAttribute('data-sizes', '(max-width: 640px) 15vw, 10vw');
  });
});