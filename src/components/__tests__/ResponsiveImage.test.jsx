import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveImage from '../ResponsiveImage';
import { useViewport } from '@/hooks/useViewport';

// Mock the useViewport hook
jest.mock('@/hooks/useViewport');

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onLoad, onError, ...props }) {
    return (
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        data-testid="responsive-image"
        {...props}
      />
    );
  };
});

describe('ResponsiveImage', () => {
  const mockUseViewport = useViewport;

  beforeEach(() => {
    mockUseViewport.mockReturnValue({
      deviceType: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders image with correct props', () => {
    render(
      <ResponsiveImage
        src="/test-image.jpg"
        alt="Test image"
        aspectRatio="square"
      />
    );

    const image = screen.getByTestId('responsive-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
    expect(image).toHaveAttribute('alt', 'Test image');
  });

  it('applies correct aspect ratio classes', () => {
    const { container } = render(
      <ResponsiveImage
        src="/test-image.jpg"
        alt="Test image"
        aspectRatio="video"
      />
    );

    const imageContainer = container.firstChild;
    expect(imageContainer).toHaveClass('aspect-video');
  });

  it('generates responsive sizes for square aspect ratio', () => {
    render(
      <ResponsiveImage
        src="/test-image.jpg"
        alt="Test image"
        aspectRatio="square"
      />
    );

    const image = screen.getByTestId('responsive-image');
    expect(image).toHaveAttribute('sizes', '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw');
  });

  it('uses custom sizes when provided', () => {
    const customSizes = '(max-width: 768px) 100vw, 50vw';
    
    render(
      <ResponsiveImage
        src="/test-image.jpg"
        alt="Test image"
        sizes={customSizes}
      />
    );

    const image = screen.getByTestId('responsive-image');
    expect(image).toHaveAttribute('sizes', customSizes);
  });

  it('adjusts quality based on device type', () => {
    mockUseViewport.mockReturnValue({
      deviceType: 'mobile',
      isMobile: true,
      isTablet: false,
      isDesktop: false
    });

    render(
      <ResponsiveImage
        src="/test-image.jpg"
        alt="Test image"
        quality={75}
      />
    );

    const image = screen.getByTestId('responsive-image');
    expect(image).toHaveAttribute('quality', '65'); // 75 - 10 for mobile
  });

  it('shows fallback when no src provided', () => {
    render(
      <ResponsiveImage
        alt="Test image"
        showFallbackIcon={true}
      />
    );

    expect(screen.getByText('Image unavailable')).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument(); // SVG icon
  });

  it('handles image load error and shows fallback', async () => {
    render(
      <ResponsiveImage
        src="/invalid-image.jpg"
        alt="Test image"
        fallbackSrc="/fallback-image.jpg"
      />
    );

    const image = screen.getByTestId('responsive-image');
    
    // Simulate image error
    fireEvent.error(image);

    await waitFor(() => {
      expect(image).toHaveAttribute('src', '/fallback-image.jpg');
    });
  });

  it('calls onLoad callback when image loads', () => {
    const onLoadMock = jest.fn();
    
    render(
      <ResponsiveImage
        src="/test-image.jpg"
        alt="Test image"
        onLoad={onLoadMock}
      />
    );

    const image = screen.getByTestId('responsive-image');
    fireEvent.load(image);

    expect(onLoadMock).toHaveBeenCalledTimes(1);
  });

  it('calls onError callback when image fails to load', () => {
    const onErrorMock = jest.fn();
    
    render(
      <ResponsiveImage
        src="/invalid-image.jpg"
        alt="Test image"
        onError={onErrorMock}
      />
    );

    const image = screen.getByTestId('responsive-image');
    fireEvent.error(image);

    expect(onErrorMock).toHaveBeenCalledTimes(1);
  });

  it('applies priority loading when specified', () => {
    render(
      <ResponsiveImage
        src="/test-image.jpg"
        alt="Test image"
        priority={true}
      />
    );

    const image = screen.getByTestId('responsive-image');
    expect(image).toHaveAttribute('priority', 'true');
  });

  it('does not show hover overlay on mobile devices', () => {
    mockUseViewport.mockReturnValue({
      deviceType: 'mobile',
      isMobile: true,
      isTablet: false,
      isDesktop: false
    });

    const { container } = render(
      <ResponsiveImage
        src="/test-image.jpg"
        alt="Test image"
      />
    );

    const overlay = container.querySelector('.hover\\:bg-black\\/10');
    expect(overlay).not.toBeInTheDocument();
  });

  it('shows hover overlay on desktop devices', () => {
    const { container } = render(
      <ResponsiveImage
        src="/test-image.jpg"
        alt="Test image"
      />
    );

    const overlay = container.querySelector('.hover\\:bg-black\\/10');
    expect(overlay).toBeInTheDocument();
  });

  it('handles auto aspect ratio correctly', () => {
    const { container } = render(
      <ResponsiveImage
        src="/test-image.jpg"
        alt="Test image"
        aspectRatio="auto"
        width={300}
        height={200}
      />
    );

    const imageContainer = container.firstChild;
    expect(imageContainer).not.toHaveClass('aspect-square');
    expect(imageContainer).not.toHaveClass('aspect-video');
  });

  it('applies custom className and containerClassName', () => {
    const { container } = render(
      <ResponsiveImage
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