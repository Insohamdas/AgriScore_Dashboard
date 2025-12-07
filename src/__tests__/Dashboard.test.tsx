import { render, screen } from '@testing-library/react';
import { Dashboard } from '../pages/Dashboard';

// Mock data service used by Dashboard
vi.mock('../services/mockDataService', () => ({
  api: {
    getTasks: () => Promise.resolve([]),
    getHarvestSummary: () => Promise.resolve([]),
  },
}));

describe('Dashboard', () => {
  it('renders the dashboard subtitle', async () => {
    render(<Dashboard />);
    expect(
      await screen.findByText(/Optimize Your Farm Operations with Real-Time Insights/i)
    ).toBeInTheDocument();
  });
});
