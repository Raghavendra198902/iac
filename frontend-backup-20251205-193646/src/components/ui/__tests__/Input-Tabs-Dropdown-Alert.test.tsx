import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock Input component
const Input = React.forwardRef<HTMLInputElement, any>(
  ({ label, error, type = 'text', className = '', ...props }, ref) => {
    return (
      <div className={`input-wrapper ${className}`}>
        {label && <label>{label}</label>}
        <input ref={ref} type={type} className={error ? 'error' : ''} {...props} />
        {error && <span className="error-message">{error}</span>}
      </div>
    );
  }
);

describe('Input Component', () => {
  it('should render with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('should render without label', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.queryByRole('label')).not.toBeInTheDocument();
  });

  it('should show error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('should apply error class', () => {
    const { container } = render(<Input error="Error" />);
    const input = container.querySelector('input');
    expect(input).toHaveClass('error');
  });

  it('should handle text input', () => {
    render(<Input type="text" />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test' } });
    expect(input.value).toBe('test');
  });

  it('should handle number input', () => {
    render(<Input type="number" />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '42' } });
    expect(input.value).toBe('42');
  });

  it('should handle password input', () => {
    render(<Input type="password" />);
    const input = container.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  it('should forward ref', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
});

// Mock Tabs component
const Tabs = ({ children, defaultValue }: any) => {
  const [active, setActive] = React.useState(defaultValue);
  return (
    <div className="tabs">
      {React.Children.map(children, child =>
        React.cloneElement(child, { active, setActive })
      )}
    </div>
  );
};

const TabsList = ({ children, active, setActive }: any) => (
  <div className="tabs-list">
    {React.Children.map(children, child =>
      React.cloneElement(child, { active, setActive })
    )}
  </div>
);

const TabsTrigger = ({ value, children, active, setActive }: any) => (
  <button
    className={active === value ? 'active' : ''}
    onClick={() => setActive(value)}
  >
    {children}
  </button>
);

const TabsContent = ({ value, children, active }: any) => (
  active === value ? <div className="tab-content">{children}</div> : null
);

describe('Tabs Component', () => {
  it('should render tabs', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
  });

  it('should show default tab content', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    );
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('should switch tabs on click', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    fireEvent.click(screen.getByText('Tab 2'));
    expect(screen.getByText('Content 2')).toBeInTheDocument();
    expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
  });

  it('should apply active class', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(screen.getByText('Tab 1')).toHaveClass('active');
  });
});

// Mock Dropdown component
const Dropdown = ({ options, value, onChange, placeholder }: any) => {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

describe('Dropdown Component', () => {
  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  it('should render options', () => {
    render(<Dropdown options={options} value="" onChange={() => {}} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('should show placeholder', () => {
    render(
      <Dropdown
        options={options}
        value=""
        onChange={() => {}}
        placeholder="Select..."
      />
    );
    expect(screen.getByText('Select...')).toBeInTheDocument();
  });

  it('should call onChange when selection changes', () => {
    const onChange = vi.fn();
    render(<Dropdown options={options} value="" onChange={onChange} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });
    expect(onChange).toHaveBeenCalledWith('2');
  });

  it('should show selected value', () => {
    render(<Dropdown options={options} value="2" onChange={() => {}} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    expect(select.value).toBe('2');
  });
});

// Mock Alert component
const Alert = ({ variant = 'info', title, children }: any) => {
  return (
    <div className={`alert alert-${variant}`} role="alert">
      {title && <div className="alert-title">{title}</div>}
      <div className="alert-content">{children}</div>
    </div>
  );
};

describe('Alert Component', () => {
  it('should render with title', () => {
    render(<Alert title="Warning">Message</Alert>);
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('should render content', () => {
    render(<Alert>Alert message</Alert>);
    expect(screen.getByText('Alert message')).toBeInTheDocument();
  });

  it('should apply variant class', () => {
    const { container } = render(<Alert variant="error">Error</Alert>);
    expect(container.querySelector('.alert-error')).toBeInTheDocument();
  });

  it('should have alert role', () => {
    render(<Alert>Message</Alert>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should render different variants', () => {
    const variants = ['info', 'success', 'warning', 'error'];
    
    variants.forEach(variant => {
      const { container, unmount } = render(
        <Alert variant={variant}>Message</Alert>
      );
      expect(container.querySelector(`.alert-${variant}`)).toBeInTheDocument();
      unmount();
    });
  });
});
