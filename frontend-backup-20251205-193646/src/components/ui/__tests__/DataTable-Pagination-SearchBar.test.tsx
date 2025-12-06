import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock DataTable component
const DataTable = ({ columns, data, onSort, sortBy, sortOrder, onRowSelect, selectedRows }: any) => {
  const [localData, setLocalData] = React.useState(data);

  React.useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleSort = (columnKey: string) => {
    const newOrder = sortBy === columnKey && sortOrder === 'asc' ? 'desc' : 'asc';
    const sorted = [...localData].sort((a, b) => {
      if (newOrder === 'asc') {
        return a[columnKey] > b[columnKey] ? 1 : -1;
      }
      return a[columnKey] < b[columnKey] ? 1 : -1;
    });
    setLocalData(sorted);
    onSort?.(columnKey, newOrder);
  };

  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {onRowSelect && <th><input type="checkbox" aria-label="Select all" /></th>}
            {columns.map((col: any) => (
              <th key={col.key} onClick={() => handleSort(col.key)} style={{ cursor: 'pointer' }}>
                {col.label}
                {sortBy === col.key && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {localData.map((row: any, idx: number) => (
            <tr key={idx} className={selectedRows?.includes(idx) ? 'selected' : ''}>
              {onRowSelect && (
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows?.includes(idx)}
                    onChange={() => onRowSelect(idx)}
                    aria-label={`Select row ${idx}`}
                  />
                </td>
              )}
              {columns.map((col: any) => (
                <td key={col.key}>{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

describe('DataTable Component', () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
  ];

  const data = [
    { name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { name: 'Bob Johnson', email: 'bob@example.com', role: 'Editor' },
  ];

  it('should render table with data', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('should sort columns on header click', () => {
    render(<DataTable columns={columns} data={data} sortBy="" sortOrder="asc" onSort={vi.fn()} />);
    
    const nameHeader = screen.getByText('Name');
    fireEvent.click(nameHeader);
    
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Bob Johnson');
  });

  it('should toggle sort order', () => {
    const onSort = vi.fn();
    render(<DataTable columns={columns} data={data} sortBy="name" sortOrder="asc" onSort={onSort} />);
    
    const nameHeader = screen.getByText(/Name/);
    fireEvent.click(nameHeader);
    
    expect(onSort).toHaveBeenCalled();
  });

  it('should select rows', () => {
    const onRowSelect = vi.fn();
    render(<DataTable columns={columns} data={data} onRowSelect={onRowSelect} selectedRows={[]} />);
    
    const checkboxes = screen.getAllByLabelText(/Select row/);
    fireEvent.click(checkboxes[0]);
    
    expect(onRowSelect).toHaveBeenCalledWith(0);
  });

  it('should highlight selected rows', () => {
    const { container } = render(
      <DataTable columns={columns} data={data} onRowSelect={vi.fn()} selectedRows={[0, 2]} />
    );
    
    const selectedRows = container.querySelectorAll('tr.selected');
    expect(selectedRows).toHaveLength(2);
  });
});

// Mock Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange }: any) => {
  return (
    <div className="pagination">
      <button onClick={() => onPageChange(1)} disabled={currentPage === 1}>
        First
      </button>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </button>
      <span className="page-info">
        Page {currentPage} of {totalPages}
      </span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next
      </button>
      <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
        Last
      </button>
      <select value={itemsPerPage} onChange={(e) => onItemsPerPageChange(Number(e.target.value))}>
        <option value={10}>10 per page</option>
        <option value={25}>25 per page</option>
        <option value={50}>50 per page</option>
      </select>
    </div>
  );
};

describe('Pagination Component', () => {
  it('should render page information', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} itemsPerPage={10} />);
    expect(screen.getByText('Page 2 of 5')).toBeInTheDocument();
  });

  it('should navigate to next page', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} itemsPerPage={10} />);
    
    fireEvent.click(screen.getByText('Next'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('should navigate to previous page', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} itemsPerPage={10} />);
    
    fireEvent.click(screen.getByText('Previous'));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('should jump to first page', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} itemsPerPage={10} />);
    
    fireEvent.click(screen.getByText('First'));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('should jump to last page', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} itemsPerPage={10} />);
    
    fireEvent.click(screen.getByText('Last'));
    expect(onPageChange).toHaveBeenCalledWith(5);
  });

  it('should disable previous on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} itemsPerPage={10} />);
    
    const prevButton = screen.getByText('Previous');
    expect(prevButton).toBeDisabled();
  });

  it('should disable next on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} itemsPerPage={10} />);
    
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeDisabled();
  });

  it('should change items per page', () => {
    const onItemsPerPageChange = vi.fn();
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={vi.fn()}
        itemsPerPage={10}
        onItemsPerPageChange={onItemsPerPageChange}
      />
    );
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '25' } });
    
    expect(onItemsPerPageChange).toHaveBeenCalledWith(25);
  });
});

// Mock SearchBar component
const SearchBar = ({ placeholder, value, onChange, onSearch, onClear, suggestions, loading }: any) => {
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSearch?.();
        }}
      />
      {value && (
        <button className="clear-btn" onClick={onClear}>
          ✕
        </button>
      )}
      {loading && <span className="loading">Loading...</span>}
      {showSuggestions && suggestions && suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((suggestion: string, idx: number) => (
            <li key={idx} onClick={() => onChange(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

describe('SearchBar Component', () => {
  it('should render search input', () => {
    render(<SearchBar placeholder="Search..." value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should call onChange when typing', () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    
    expect(onChange).toHaveBeenCalledWith('test');
  });

  it('should show clear button when value exists', () => {
    render(<SearchBar value="test" onChange={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByText('✕')).toBeInTheDocument();
  });

  it('should clear input on clear button click', () => {
    const onClear = vi.fn();
    render(<SearchBar value="test" onChange={vi.fn()} onClear={onClear} />);
    
    fireEvent.click(screen.getByText('✕'));
    expect(onClear).toHaveBeenCalled();
  });

  it('should show loading state', () => {
    render(<SearchBar value="test" onChange={vi.fn()} loading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should show suggestions on focus', () => {
    const suggestions = ['suggestion 1', 'suggestion 2', 'suggestion 3'];
    render(<SearchBar value="" onChange={vi.fn()} suggestions={suggestions} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    expect(screen.getByText('suggestion 1')).toBeInTheDocument();
  });

  it('should call onSearch on Enter key', () => {
    const onSearch = vi.fn();
    render(<SearchBar value="test" onChange={vi.fn()} onSearch={onSearch} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(onSearch).toHaveBeenCalled();
  });

  it('should select suggestion on click', () => {
    const onChange = vi.fn();
    const suggestions = ['apple', 'banana', 'cherry'];
    render(<SearchBar value="" onChange={onChange} suggestions={suggestions} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    
    fireEvent.click(screen.getByText('banana'));
    expect(onChange).toHaveBeenCalledWith('banana');
  });
});

// Mock integrated DataTable with Pagination and SearchBar
const DataTableWithFeatures = ({ data: initialData }: any) => {
  const [data, setData] = React.useState(initialData);
  const [filteredData, setFilteredData] = React.useState(initialData);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
  ];

  React.useEffect(() => {
    if (searchQuery) {
      const filtered = data.filter((item: any) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
    setCurrentPage(1);
  }, [searchQuery, data]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <SearchBar
        placeholder="Search..."
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />
      <DataTable columns={columns} data={paginatedData} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
      />
      <div className="total-count">Total: {filteredData.length} items</div>
    </div>
  );
};

describe('DataTable with Search and Pagination', () => {
  const testData = Array.from({ length: 50 }, (_, i) => ({
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
  }));

  it('should integrate search, table, and pagination', () => {
    render(<DataTableWithFeatures data={testData} />);
    
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByText('User 1')).toBeInTheDocument();
    expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();
  });

  it('should filter data based on search', () => {
    render(<DataTableWithFeatures data={testData} />);
    
    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'User 1' } });
    
    expect(screen.getByText('Total: 11 items')).toBeInTheDocument(); // User 1, 10-19
  });

  it('should paginate through data', () => {
    render(<DataTableWithFeatures data={testData} />);
    
    expect(screen.getByText('User 1')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('User 11')).toBeInTheDocument();
  });
});
