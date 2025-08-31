/**
 * Unit tests for Alpine.js dashboard functions
 * Tests the core functionality without browser DOM dependencies
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Type definitions for test
interface DashboardStat {
  label: string;
  value: number;
  icon: string;
}

interface DashboardSpec {
  id?: number;
  title: string;
  body_md: string;
  status: string;
}

interface MockDashboard {
  specs: DashboardSpec[];
  stats: DashboardStat[];
  loading: boolean;
  connected: boolean;
  showModal: boolean;
  editingSpec: DashboardSpec | null;
  currentSpec: DashboardSpec;
  markdownPreview: string;
  searchQuery: string;
  statusFilter: string;
  sortField: string;
  sortOrder: string;
  currentPage: number;
  limit: number;
  totalSpecs: number;
  ws: any;
  
  loadSpecs(): Promise<any>;
  loadStats(): Promise<any>;
  search(): Promise<any>;
  saveSpec(): Promise<any>;
  deleteSpec(id: number): Promise<any>;
  openCreateModal(): void;
  openEditModal(spec: DashboardSpec): void;
  closeModal(): void;
  updatePreview(): void;
  sortBy(field: string): void;
  nextPage(): void;
  previousPage(): void;
  getStatusClass(status: string): string;
  formatDate(dateString: string): string;
}

// Mock global objects that would be available in browser
(global as any).fetch = jest.fn();
(global as any).WebSocket = jest.fn();
(global as any).marked = {
  parse: jest.fn((text: string) => `<p>${text}</p>`)
};

// Mock dashboard data and functions
const createMockDashboard = (): MockDashboard => ({
  // Data
  specs: [],
  stats: [
    { label: 'Total Specs', value: 0, icon: 'd="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"' },
    { label: 'Draft', value: 0, icon: 'd="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"' },
    { label: 'In Progress', value: 0, icon: 'd="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"' },
    { label: 'Completed', value: 0, icon: 'd="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"' }
  ],
  
  // State
  loading: false,
  connected: false,
  showModal: false,
  editingSpec: null,
  currentSpec: { title: '', body_md: '', status: 'draft' },
  markdownPreview: '',
  
  // Filters and pagination
  searchQuery: '',
  statusFilter: '',
  sortField: 'updated_at',
  sortOrder: 'desc',
  currentPage: 1,
  limit: 20,
  totalSpecs: 0,
  
  // WebSocket
  ws: null,

  // Methods
  async loadSpecs() {
    const params = new URLSearchParams({
      limit: this.limit.toString(),
      offset: ((this.currentPage - 1) * this.limit).toString(),
      sort_by: this.sortField,
      sort_order: this.sortOrder
    });
    
    if (this.statusFilter) params.append('status', this.statusFilter);
    
    const response = await fetch(`/api/specs?${params}`);
    const data = await response.json() as any;
    
    if (data.success) {
      this.specs = data.data.specs;
      this.totalSpecs = data.data.pagination.total;
    }
    return data;
  },

  async loadStats() {
    const response = await fetch('/dashboard/api/stats');
    const data = await response.json() as any;
    
    if (data.success) {
      this.stats[0].value = data.data.total;
      this.stats[1].value = data.data.by_status.draft || 0;
      this.stats[2].value = data.data.by_status['in-progress'] || 0;
      this.stats[3].value = data.data.by_status.done || 0;
    }
    return data;
  },

  async search() {
    if (this.searchQuery.trim()) {
      const response = await fetch(`/api/search?q=${encodeURIComponent(this.searchQuery)}&limit=${this.limit}`);
      const data = await response.json() as any;
      
      if (data.success) {
        this.specs = data.data.results;
        this.totalSpecs = data.data.total;
        this.currentPage = 1;
      }
      return data;
    } else {
      return this.loadSpecs();
    }
  },

  async saveSpec() {
    const method = this.editingSpec ? 'PUT' : 'POST';
    const url = this.editingSpec ? `/api/specs/${this.editingSpec.id}` : '/api/specs';
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.currentSpec)
    });
    
    const data = await response.json() as any;
    return data;
  },

  async deleteSpec(id: number) {
    const response = await fetch(`/api/specs/${id}`, { method: 'DELETE' });
    const data = await response.json() as any;
    return data;
  },

  openCreateModal() {
    this.editingSpec = null;
    this.currentSpec = { title: '', body_md: '', status: 'draft' };
    this.markdownPreview = '';
    this.showModal = true;
  },

  openEditModal(spec: DashboardSpec) {
    this.editingSpec = spec;
    this.currentSpec = { ...spec };
    this.updatePreview();
    this.showModal = true;
  },

  closeModal() {
    this.showModal = false;
    this.editingSpec = null;
    this.currentSpec = { title: '', body_md: '', status: 'draft' };
    this.markdownPreview = '';
  },

  updatePreview() {
    if (typeof (global as any).marked !== 'undefined') {
      this.markdownPreview = (global as any).marked.parse(this.currentSpec.body_md || '');
    }
  },

  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
  },

  nextPage() {
    if (this.currentPage * this.limit < this.totalSpecs) {
      this.currentPage++;
    }
  },

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  },

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'draft': 'bg-gray-100 text-gray-800',
      'todo': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      'done': 'bg-green-100 text-green-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  },

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
});

describe('Alpine.js Dashboard Functions', () => {
  let dashboard: MockDashboard;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Create fresh dashboard instance
    dashboard = createMockDashboard();
  });

  afterEach(() => {
    // Clean up any resources
    jest.restoreAllMocks();
  });

  describe('Data Loading', () => {
    it('should load specs with correct API parameters', async () => {
      const mockResponse = {
        success: true,
        data: {
          specs: [
            { id: 1, title: 'Test Spec', status: 'draft' }
          ],
          pagination: { total: 1 }
        }
      };

      (fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      await dashboard.loadSpecs();

      expect(fetch).toHaveBeenCalledWith('/api/specs?limit=20&offset=0&sort_by=updated_at&sort_order=desc');
      expect(dashboard.specs).toEqual(mockResponse.data.specs);
      expect(dashboard.totalSpecs).toBe(1);
    });

    it('should include status filter when set', async () => {
      dashboard.statusFilter = 'draft';
      
      (fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: { specs: [], pagination: { total: 0 } } })
      });

      await dashboard.loadSpecs();

      expect(fetch).toHaveBeenCalledWith('/api/specs?limit=20&offset=0&sort_by=updated_at&sort_order=desc&status=draft');
    });

    it('should load dashboard stats correctly', async () => {
      const mockStats = {
        success: true,
        data: {
          total: 10,
          by_status: {
            draft: 3,
            'in-progress': 2,
            done: 5
          }
        }
      };

      (fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve(mockStats)
      });

      await dashboard.loadStats();

      expect(dashboard.stats[0].value).toBe(10); // Total
      expect(dashboard.stats[1].value).toBe(3);  // Draft
      expect(dashboard.stats[2].value).toBe(2);  // In Progress
      expect(dashboard.stats[3].value).toBe(5);  // Done
    });
  });

  describe('Search Functionality', () => {
    it('should perform search with query', async () => {
      dashboard.searchQuery = 'test query';
      
      const mockResponse = {
        success: true,
        data: {
          results: [{ id: 1, title: 'Search Result' }],
          total: 1
        }
      };

      (fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      await dashboard.search();

      expect(fetch).toHaveBeenCalledWith('/api/search?q=test%20query&limit=20');
      expect(dashboard.specs).toEqual(mockResponse.data.results);
      expect(dashboard.currentPage).toBe(1);
    });

    it('should fall back to loadSpecs when search query is empty', async () => {
      dashboard.searchQuery = '';
      
      const mockResponse = {
        success: true,
        data: { specs: [], pagination: { total: 0 } }
      };

      (fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      await dashboard.search();

      expect(fetch).toHaveBeenCalledWith('/api/specs?limit=20&offset=0&sort_by=updated_at&sort_order=desc');
    });
  });

  describe('CRUD Operations', () => {
    it('should save new spec correctly', async () => {
      dashboard.currentSpec = {
        title: 'New Spec',
        body_md: '# Test Content',
        status: 'draft'
      };

      const mockResponse = { success: true };
      (fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      await dashboard.saveSpec();

      expect(fetch).toHaveBeenCalledWith('/api/specs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dashboard.currentSpec)
      });
    });

    it('should update existing spec correctly', async () => {
      dashboard.editingSpec = { id: 123, title: 'Existing', body_md: '', status: 'draft' };
      dashboard.currentSpec = {
        title: 'Updated Spec',
        body_md: '# Updated Content',
        status: 'done'
      };

      const mockResponse = { success: true };
      (fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      await dashboard.saveSpec();

      expect(fetch).toHaveBeenCalledWith('/api/specs/123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dashboard.currentSpec)
      });
    });

    it('should delete spec correctly', async () => {
      const mockResponse = { success: true };
      (fetch as any).mockResolvedValueOnce({
        json: () => Promise.resolve(mockResponse)
      });

      await dashboard.deleteSpec(456);

      expect(fetch).toHaveBeenCalledWith('/api/specs/456', { method: 'DELETE' });
    });
  });

  describe('Modal Management', () => {
    it('should open create modal with clean state', () => {
      dashboard.openCreateModal();

      expect(dashboard.editingSpec).toBeNull();
      expect(dashboard.currentSpec).toEqual({ title: '', body_md: '', status: 'draft' });
      expect(dashboard.markdownPreview).toBe('');
      expect(dashboard.showModal).toBe(true);
    });

    it('should open edit modal with spec data', () => {
      const testSpec: DashboardSpec = {
        id: 1,
        title: 'Test Spec',
        body_md: '# Test',
        status: 'todo'
      };

      dashboard.openEditModal(testSpec);

      expect(dashboard.editingSpec).toBe(testSpec);
      expect(dashboard.currentSpec).toEqual(testSpec);
      expect(dashboard.showModal).toBe(true);
    });

    it('should close modal and reset state', () => {
      dashboard.showModal = true;
      dashboard.editingSpec = { id: 1, title: 'test', body_md: '', status: 'draft' };
      dashboard.currentSpec = { title: 'test', body_md: '', status: 'draft' };
      dashboard.markdownPreview = '<p>test</p>';

      dashboard.closeModal();

      expect(dashboard.showModal).toBe(false);
      expect(dashboard.editingSpec).toBeNull();
      expect(dashboard.currentSpec).toEqual({ title: '', body_md: '', status: 'draft' });
      expect(dashboard.markdownPreview).toBe('');
    });
  });

  describe('Markdown Preview', () => {
    it('should update preview with marked.js', () => {
      dashboard.currentSpec.body_md = '# Test Heading';
      ((global as any).marked.parse as any).mockReturnValue('<h1>Test Heading</h1>');

      dashboard.updatePreview();

      expect((global as any).marked.parse).toHaveBeenCalledWith('# Test Heading');
      expect(dashboard.markdownPreview).toBe('<h1>Test Heading</h1>');
    });

    it('should handle empty markdown content', () => {
      dashboard.currentSpec.body_md = '';
      ((global as any).marked.parse as any).mockReturnValue('');

      dashboard.updatePreview();

      expect((global as any).marked.parse).toHaveBeenCalledWith('');
      expect(dashboard.markdownPreview).toBe('');
    });
  });

  describe('Sorting and Pagination', () => {
    it('should toggle sort order for same field', () => {
      dashboard.sortField = 'title';
      dashboard.sortOrder = 'asc';

      dashboard.sortBy('title');

      expect(dashboard.sortField).toBe('title');
      expect(dashboard.sortOrder).toBe('desc');
    });

    it('should set new field and default to asc', () => {
      dashboard.sortField = 'title';
      dashboard.sortOrder = 'desc';

      dashboard.sortBy('created_at');

      expect(dashboard.sortField).toBe('created_at');
      expect(dashboard.sortOrder).toBe('asc');
    });

    it('should navigate to next page when available', () => {
      dashboard.currentPage = 1;
      dashboard.limit = 20;
      dashboard.totalSpecs = 50;

      dashboard.nextPage();

      expect(dashboard.currentPage).toBe(2);
    });

    it('should not navigate beyond last page', () => {
      dashboard.currentPage = 3;
      dashboard.limit = 20;
      dashboard.totalSpecs = 50; // 50/20 = 2.5, so max page is 3

      dashboard.nextPage();

      expect(dashboard.currentPage).toBe(3); // Should not change
    });

    it('should navigate to previous page when available', () => {
      dashboard.currentPage = 2;

      dashboard.previousPage();

      expect(dashboard.currentPage).toBe(1);
    });

    it('should not navigate before first page', () => {
      dashboard.currentPage = 1;

      dashboard.previousPage();

      expect(dashboard.currentPage).toBe(1); // Should not change
    });
  });

  describe('Utility Functions', () => {
    it('should return correct status classes', () => {
      expect(dashboard.getStatusClass('draft')).toBe('bg-gray-100 text-gray-800');
      expect(dashboard.getStatusClass('todo')).toBe('bg-blue-100 text-blue-800');
      expect(dashboard.getStatusClass('in-progress')).toBe('bg-yellow-100 text-yellow-800');
      expect(dashboard.getStatusClass('done')).toBe('bg-green-100 text-green-800');
      expect(dashboard.getStatusClass('unknown')).toBe('bg-gray-100 text-gray-800');
    });

    it('should format dates correctly', () => {
      const testDate = '2024-01-15T10:30:00Z';
      const formatted = dashboard.formatDate(testDate);

      expect(formatted).toMatch(/Jan 15, 2024/); // Basic check for correct format
      expect(formatted).toMatch(/\d{1,2}:\d{2}/); // Check time is included (any time format)
    });
  });
});