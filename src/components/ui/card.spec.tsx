/**
 * Tests for Card components
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card';

describe('Card', () => {
  it('should render Card with children', () => {
    render(
      <Card>
        <div>Card Content</div>
      </Card>,
    );
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should forward ref', () => {
    const ref = { current: null };
    render(
      <Card ref={ref}>
        <div>Content</div>
      </Card>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe('CardHeader', () => {
  it('should render CardHeader with children', () => {
    render(
      <Card>
        <CardHeader>
          <div>Header Content</div>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByText('Header Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Card>
        <CardHeader className="custom-header">Header</CardHeader>
      </Card>,
    );
    expect(container.querySelector('.custom-header')).toBeInTheDocument();
  });
});

describe('CardTitle', () => {
  it('should render CardTitle with text', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('should render as h3 element', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
      </Card>,
    );
    const title = container.querySelector('h3');
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('Card Title');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle className="custom-title">Title</CardTitle>
        </CardHeader>
      </Card>,
    );
    expect(container.querySelector('.custom-title')).toBeInTheDocument();
  });
});

describe('CardDescription', () => {
  it('should render CardDescription with text', () => {
    render(
      <Card>
        <CardHeader>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByText('Card Description')).toBeInTheDocument();
  });

  it('should render as p element', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardDescription>Description</CardDescription>
        </CardHeader>
      </Card>,
    );
    const description = container.querySelector('p');
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent('Description');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardDescription className="custom-desc">Description</CardDescription>
        </CardHeader>
      </Card>,
    );
    expect(container.querySelector('.custom-desc')).toBeInTheDocument();
  });
});

describe('CardContent', () => {
  it('should render CardContent with children', () => {
    render(
      <Card>
        <CardContent>
          <div>Content</div>
        </CardContent>
      </Card>,
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Card>
        <CardContent className="custom-content">Content</CardContent>
      </Card>,
    );
    expect(container.querySelector('.custom-content')).toBeInTheDocument();
  });
});

describe('CardFooter', () => {
  it('should render CardFooter with children', () => {
    render(
      <Card>
        <CardFooter>
          <div>Footer Content</div>
        </CardFooter>
      </Card>,
    );
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Card>
        <CardFooter className="custom-footer">Footer</CardFooter>
      </Card>,
    );
    expect(container.querySelector('.custom-footer')).toBeInTheDocument();
  });
});

describe('Card composition', () => {
  it('should render complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardDescription>Description</CardDescription>
        </CardHeader>
        <CardContent>Content</CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});

