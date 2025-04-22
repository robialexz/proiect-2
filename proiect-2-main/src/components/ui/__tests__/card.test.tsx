import React from 'react';
import { render, screen } from '../../../test-utils/test-template';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';

describe('Card Components', () => {
  describe('Card Component', () => {
    it('renders correctly with default props', () => {
      render(<Card>Card Content</Card>);
      const card = screen.getByText('Card Content');
      expect(card.parentElement).toHaveClass('rounded-lg border bg-card text-card-foreground shadow-sm');
    });

    it('applies custom className correctly', () => {
      render(<Card className="custom-class">Card Content</Card>);
      const card = screen.getByText('Card Content');
      expect(card.parentElement).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Card Content</Card>);
      expect(ref.current).not.toBeNull();
      expect(ref.current?.textContent).toBe('Card Content');
    });
  });

  describe('CardHeader Component', () => {
    it('renders correctly with default props', () => {
      render(<CardHeader>Header Content</CardHeader>);
      const header = screen.getByText('Header Content');
      expect(header.parentElement).toHaveClass('flex flex-col space-y-1.5 p-6');
    });

    it('applies custom className correctly', () => {
      render(<CardHeader className="custom-class">Header Content</CardHeader>);
      const header = screen.getByText('Header Content');
      expect(header.parentElement).toHaveClass('custom-class');
    });
  });

  describe('CardTitle Component', () => {
    it('renders correctly with default props', () => {
      render(<CardTitle>Card Title</CardTitle>);
      const title = screen.getByText('Card Title');
      expect(title).toHaveClass('text-2xl font-semibold leading-none tracking-tight');
    });

    it('applies custom className correctly', () => {
      render(<CardTitle className="custom-class">Card Title</CardTitle>);
      const title = screen.getByText('Card Title');
      expect(title).toHaveClass('custom-class');
    });

    it('renders as different element when specified', () => {
      render(<CardTitle as="h3">Card Title</CardTitle>);
      const title = screen.getByText('Card Title');
      expect(title.tagName).toBe('H3');
    });
  });

  describe('CardDescription Component', () => {
    it('renders correctly with default props', () => {
      render(<CardDescription>Card Description</CardDescription>);
      const description = screen.getByText('Card Description');
      expect(description).toHaveClass('text-sm text-muted-foreground');
    });

    it('applies custom className correctly', () => {
      render(<CardDescription className="custom-class">Card Description</CardDescription>);
      const description = screen.getByText('Card Description');
      expect(description).toHaveClass('custom-class');
    });
  });

  describe('CardContent Component', () => {
    it('renders correctly with default props', () => {
      render(<CardContent>Content</CardContent>);
      const content = screen.getByText('Content');
      expect(content.parentElement).toHaveClass('p-6 pt-0');
    });

    it('applies custom className correctly', () => {
      render(<CardContent className="custom-class">Content</CardContent>);
      const content = screen.getByText('Content');
      expect(content.parentElement).toHaveClass('custom-class');
    });
  });

  describe('CardFooter Component', () => {
    it('renders correctly with default props', () => {
      render(<CardFooter>Footer Content</CardFooter>);
      const footer = screen.getByText('Footer Content');
      expect(footer.parentElement).toHaveClass('flex items-center p-6 pt-0');
    });

    it('applies custom className correctly', () => {
      render(<CardFooter className="custom-class">Footer Content</CardFooter>);
      const footer = screen.getByText('Footer Content');
      expect(footer.parentElement).toHaveClass('custom-class');
    });
  });

  describe('Card Composition', () => {
    it('renders a complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Complete Card</CardTitle>
            <CardDescription>This is a complete card example</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <p>Card footer</p>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Complete Card')).toBeInTheDocument();
      expect(screen.getByText('This is a complete card example')).toBeInTheDocument();
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
      expect(screen.getByText('Card footer')).toBeInTheDocument();
    });
  });
});
