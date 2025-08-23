"use client";

import React from 'react';
import { Container, Section, Grid, Flex, Spacer, Stack, Inline, Padding, Margin } from '../index';

/**
 * Example usage of responsive layout components
 * This file demonstrates how to use all the layout components
 */
const LayoutExamples = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Container Examples */}
      <Section spacing="lg" background="muted">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Responsive Layout Components</h1>
          <p className="text-muted-foreground">
            Examples of responsive container, section, grid, and spacing components
          </p>
        </div>
      </Section>

      {/* Container Size Examples */}
      <Section>
        <Stack spacing="lg">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Container Sizes</h2>
            <Stack spacing="sm">
              <Container size="sm" className="bg-card p-4 rounded-lg">
                <p className="text-center">Small Container (max-w-3xl)</p>
              </Container>
              <Container size="default" className="bg-card p-4 rounded-lg">
                <p className="text-center">Default Container (max-w-7xl)</p>
              </Container>
              <Container size="lg" className="bg-card p-4 rounded-lg">
                <p className="text-center">Large Container (max-w-screen-2xl)</p>
              </Container>
            </Stack>
          </div>
        </Stack>
      </Section>

      {/* Grid Examples */}
      <Section background="muted">
        <Stack spacing="lg">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Responsive Grids</h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Product Grid</h3>
              <Grid contentType="products">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} className="bg-card p-4 rounded-lg text-center">
                    <div className="w-full h-32 bg-muted rounded mb-2"></div>
                    <p>Product {i + 1}</p>
                  </div>
                ))}
              </Grid>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Category Grid</h3>
              <Grid contentType="categories">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="bg-card p-4 rounded-lg text-center">
                    <div className="text-2xl mb-2">📱</div>
                    <p>Category {i + 1}</p>
                  </div>
                ))}
              </Grid>
            </div>
          </div>
        </Stack>
      </Section>

      {/* Flex Examples */}
      <Section>
        <Stack spacing="lg">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Flexible Layouts</h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Responsive Flex (Column on mobile, Row on desktop)</h3>
              <Flex direction="responsive" className="bg-card p-4 rounded-lg">
                <div className="bg-primary text-primary-foreground p-4 rounded flex-1">Item 1</div>
                <div className="bg-secondary text-secondary-foreground p-4 rounded flex-1">Item 2</div>
                <div className="bg-accent text-accent-foreground p-4 rounded flex-1">Item 3</div>
              </Flex>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Justified Space Between</h3>
              <Flex justify="between" align="center" className="bg-card p-4 rounded-lg">
                <div className="bg-primary text-primary-foreground p-3 rounded">Left</div>
                <div className="bg-secondary text-secondary-foreground p-3 rounded">Center</div>
                <div className="bg-accent text-accent-foreground p-3 rounded">Right</div>
              </Flex>
            </div>
          </div>
        </Stack>
      </Section>

      {/* Spacing Examples */}
      <Section background="muted">
        <Stack spacing="lg">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Spacing Components</h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Stack (Vertical Spacing)</h3>
              <div className="bg-card p-4 rounded-lg">
                <Stack spacing="sm">
                  <div className="bg-primary text-primary-foreground p-3 rounded">Item 1</div>
                  <div className="bg-secondary text-secondary-foreground p-3 rounded">Item 2</div>
                  <div className="bg-accent text-accent-foreground p-3 rounded">Item 3</div>
                </Stack>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Inline (Horizontal Spacing)</h3>
              <div className="bg-card p-4 rounded-lg">
                <Inline spacing="sm">
                  <div className="bg-primary text-primary-foreground p-3 rounded">Tag 1</div>
                  <div className="bg-secondary text-secondary-foreground p-3 rounded">Tag 2</div>
                  <div className="bg-accent text-accent-foreground p-3 rounded">Tag 3</div>
                </Inline>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Spacers</h3>
              <div className="bg-card p-4 rounded-lg">
                <div className="bg-primary text-primary-foreground p-3 rounded">Content Above</div>
                <Spacer size="lg" />
                <div className="bg-secondary text-secondary-foreground p-3 rounded">Content Below (Large Spacer)</div>
                <Spacer size="sm" />
                <div className="bg-accent text-accent-foreground p-3 rounded">Content Below (Small Spacer)</div>
              </div>
            </div>
          </div>
        </Stack>
      </Section>

      {/* Padding and Margin Examples */}
      <Section>
        <Stack spacing="lg">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Padding and Margin</h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Responsive Padding</h3>
              <div className="bg-muted rounded-lg">
                <Padding size="lg" className="bg-card rounded-lg">
                  <p>This content has large responsive padding</p>
                </Padding>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Responsive Margin</h3>
              <div className="bg-muted p-4 rounded-lg">
                <Margin size="lg" className="bg-card p-4 rounded-lg">
                  <p>This content has large responsive margin</p>
                </Margin>
              </div>
            </div>
          </div>
        </Stack>
      </Section>

      {/* Real-world Example */}
      <Section background="gradient" spacing="xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Real-world Example</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Here's how these components work together in a typical page layout
          </p>
          
          <Grid contentType="products" className="mb-8">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="bg-card rounded-lg overflow-hidden">
                <div className="w-full h-48 bg-muted"></div>
                <Padding size="default">
                  <Stack spacing="sm">
                    <h3 className="font-semibold">Product {i + 1}</h3>
                    <p className="text-muted-foreground text-sm">Product description here</p>
                    <Flex justify="between" align="center">
                      <span className="font-bold text-primary">$99.99</span>
                      <button className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm">
                        Add to Cart
                      </button>
                    </Flex>
                  </Stack>
                </Padding>
              </div>
            ))}
          </Grid>
          
          <Inline spacing="sm" className="justify-center">
            <button className="bg-primary text-primary-foreground px-6 py-2 rounded">
              View All Products
            </button>
            <button className="bg-secondary text-secondary-foreground px-6 py-2 rounded">
              Browse Categories
            </button>
          </Inline>
        </div>
      </Section>
    </div>
  );
};

export default LayoutExamples;