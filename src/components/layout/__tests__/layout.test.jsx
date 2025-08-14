import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the viewport hook
jest.mock('@/hooks/useViewport', () => ({
  useResponsiveSpacing: () => ({
    container: 'px-4 md:px-6 lg:px-8',
    gap: 'gap-4 md:gap-6',
    deviceType: 'desktop'
  }),
  useResponsiveGrid: () => ({
    getColumns: () => 4,
    columns: 4,
    deviceType: 'desktop'
  })
}));

// Mock the utils
jest.mock('@/lib/utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

import Container from '../Container';
import Section from '../Section';
import Grid, { Flex } from '../Grid';
import { Spacer, Stack, Inline, Padding, Margin } from '../Spacing';

describe('Layout Components', () => {
  describe('Container', () => {
    it('renders with default props', () => {
      render(
        <Container data-testid="container">
          <div>Content</div>
        </Container>
      );
      
      const container = screen.getByTestId('container');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('mx-auto', 'w-full', 'max-w-7xl');
    });

    it('applies size variants correctly', () => {
      render(
        <Container size="sm" data-testid="container">
          <div>Content</div>
        </Container>
      );
      
      const container = screen.getByTestId('container');
      expect(container).toHaveClass('max-w-3xl');
    });

    it('can disable padding', () => {
      render(
        <Container noPadding data-testid="container">
          <div>Content</div>
        </Container>
      );
      
      const container = screen.getByTestId('container');
      expect(container).not.toHaveClass('px-4');
    });

    it('supports custom component', () => {
      render(
        <Container as="main" data-testid="container">
          <div>Content</div>
        </Container>
      );
      
      const container = screen.getByTestId('container');
      expect(container.tagName).toBe('MAIN');
    });
  });

  describe('Section', () => {
    it('renders with default props', () => {
      render(
        <Section data-testid="section">
          <div>Content</div>
        </Section>
      );
      
      const section = screen.getByTestId('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('theme-transition', 'py-12', 'bg-background');
    });

    it('applies spacing variants correctly', () => {
      render(
        <Section spacing="lg" data-testid="section">
          <div>Content</div>
        </Section>
      );
      
      const section = screen.getByTestId('section');
      expect(section).toHaveClass('py-16');
    });

    it('applies background variants correctly', () => {
      render(
        <Section background="muted" data-testid="section">
          <div>Content</div>
        </Section>
      );
      
      const section = screen.getByTestId('section');
      expect(section).toHaveClass('bg-muted/30');
    });

    it('can disable container', () => {
      render(
        <Section noContainer data-testid="section">
          <div data-testid="content">Content</div>
        </Section>
      );
      
      const section = screen.getByTestId('section');
      const content = screen.getByTestId('content');
      expect(section).toContainElement(content);
    });
  });

  describe('Grid', () => {
    it('renders with default props', () => {
      render(
        <Grid data-testid="grid">
          <div>Item 1</div>
          <div>Item 2</div>
        </Grid>
      );
      
      const grid = screen.getByTestId('grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('grid');
    });

    it('applies content type specific classes', () => {
      render(
        <Grid contentType="products" data-testid="grid">
          <div>Item 1</div>
        </Grid>
      );
      
      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2');
    });

    it('applies gap variants correctly', () => {
      render(
        <Grid gap="lg" data-testid="grid">
          <div>Item 1</div>
        </Grid>
      );
      
      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('gap-6');
    });
  });

  describe('Flex', () => {
    it('renders with default props', () => {
      render(
        <Flex data-testid="flex">
          <div>Item 1</div>
          <div>Item 2</div>
        </Flex>
      );
      
      const flex = screen.getByTestId('flex');
      expect(flex).toBeInTheDocument();
      expect(flex).toHaveClass('flex', 'flex-row', 'flex-wrap');
    });

    it('applies direction variants correctly', () => {
      render(
        <Flex direction="col" data-testid="flex">
          <div>Item 1</div>
        </Flex>
      );
      
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('flex-col');
    });

    it('applies responsive direction', () => {
      render(
        <Flex direction="responsive" data-testid="flex">
          <div>Item 1</div>
        </Flex>
      );
      
      const flex = screen.getByTestId('flex');
      expect(flex).toHaveClass('flex-col', 'md:flex-row');
    });
  });

  describe('Spacing Components', () => {
    describe('Spacer', () => {
      it('renders vertical spacer by default', () => {
        render(<Spacer data-testid="spacer" />);
        
        const spacer = screen.getByTestId('spacer');
        expect(spacer).toHaveClass('h-6');
      });

      it('renders horizontal spacer', () => {
        render(<Spacer direction="horizontal" data-testid="spacer" />);
        
        const spacer = screen.getByTestId('spacer');
        expect(spacer).toHaveClass('w-6');
      });
    });

    describe('Stack', () => {
      it('renders with vertical spacing', () => {
        render(
          <Stack data-testid="stack">
            <div>Item 1</div>
            <div>Item 2</div>
          </Stack>
        );
        
        const stack = screen.getByTestId('stack');
        expect(stack).toHaveClass('space-y-4');
      });
    });

    describe('Inline', () => {
      it('renders with horizontal spacing', () => {
        render(
          <Inline data-testid="inline">
            <div>Item 1</div>
            <div>Item 2</div>
          </Inline>
        );
        
        const inline = screen.getByTestId('inline');
        expect(inline).toHaveClass('flex', 'space-x-4');
      });
    });

    describe('Padding', () => {
      it('applies padding on all sides by default', () => {
        render(
          <Padding data-testid="padding">
            <div>Content</div>
          </Padding>
        );
        
        const padding = screen.getByTestId('padding');
        expect(padding).toHaveClass('p-4');
      });

      it('applies padding to specific sides', () => {
        render(
          <Padding sides="x" data-testid="padding">
            <div>Content</div>
          </Padding>
        );
        
        const padding = screen.getByTestId('padding');
        expect(padding).toHaveClass('px-4');
      });
    });

    describe('Margin', () => {
      it('applies margin on all sides by default', () => {
        render(
          <Margin data-testid="margin">
            <div>Content</div>
          </Margin>
        );
        
        const margin = screen.getByTestId('margin');
        expect(margin).toHaveClass('m-4');
      });

      it('applies margin to specific sides', () => {
        render(
          <Margin sides="y" data-testid="margin">
            <div>Content</div>
          </Margin>
        );
        
        const margin = screen.getByTestId('margin');
        expect(margin).toHaveClass('my-4');
      });
    });
  });
});