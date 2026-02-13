import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EnvironmentStatusDashboard from '@/components/dashboard/EnvironmentStatusDashboard';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
};

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('EnvironmentStatusDashboard', () => {
  it('renders loading state initially', () => {
    renderWithQueryClient(<EnvironmentStatusDashboard />);
    expect(screen.getByText('Build Environments')).toBeInTheDocument();
    expect(screen.getByText('Monitor and manage your automated build environments')).toBeInTheDocument();
  });

  it('displays environments when data is loaded', async () => {
    renderWithQueryClient(<EnvironmentStatusDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Java Spring Boot Project')).toBeInTheDocument();
      expect(screen.getByText('Node.js React App')).toBeInTheDocument();
      expect(screen.getByText('Python Django API')).toBeInTheDocument();
    });
  });

  it('shows environment status badges correctly', async () => {
    renderWithQueryClient(<EnvironmentStatusDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('ACTIVE')).toBeInTheDocument();
      expect(screen.getByText('CONFIGURING')).toBeInTheDocument();
      expect(screen.getByText('ERROR')).toBeInTheDocument();
    });
  });

  it('displays installed tools for each environment', async () => {
    renderWithQueryClient(<EnvironmentStatusDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('JAVA')).toBeInTheDocument();
      expect(screen.getByText('MAVEN')).toBeInTheDocument();
      expect(screen.getByText('NODEJS')).toBeInTheDocument();
    });
  });

  it('handles create environment button click', async () => {
    const onCreateEnvironment = jest.fn();
    renderWithQueryClient(
      <EnvironmentStatusDashboard onCreateEnvironment={onCreateEnvironment} />
    );
    
    await waitFor(() => {
      const createButton = screen.getByText('Create Environment');
      fireEvent.click(createButton);
      expect(onCreateEnvironment).toHaveBeenCalledTimes(1);
    });
  });

  it('handles configure environment button click', async () => {
    const onConfigureEnvironment = jest.fn();
    renderWithQueryClient(
      <EnvironmentStatusDashboard onConfigureEnvironment={onConfigureEnvironment} />
    );
    
    await waitFor(() => {
      const configureButtons = screen.getAllByText('Configure');
      fireEvent.click(configureButtons[0]);
      expect(onConfigureEnvironment).toHaveBeenCalledWith('env-001');
    });
  });

  it('handles view details button click', async () => {
    const onViewDetails = jest.fn();
    renderWithQueryClient(
      <EnvironmentStatusDashboard onViewDetails={onViewDetails} />
    );
    
    await waitFor(() => {
      const viewButtons = screen.getAllByText('View');
      fireEvent.click(viewButtons[0]);
      expect(onViewDetails).toHaveBeenCalledWith('env-001');
    });
  });

  it('displays empty state when no environments exist', async () => {
    // Override the mock to return empty array
    server.use(
      http.get('*/build-environments', () => {
        return HttpResponse.json([]);
      })
    );

    renderWithQueryClient(<EnvironmentStatusDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No build environments found')).toBeInTheDocument();
      expect(screen.getByText('Create Your First Environment')).toBeInTheDocument();
    });
  });

  it('displays error state when API call fails', async () => {
    // Override the mock to return error
    server.use(
      http.get('*/build-environments', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    renderWithQueryClient(<EnvironmentStatusDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load environments')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('handles refresh button click', async () => {
    renderWithQueryClient(<EnvironmentStatusDashboard />);
    
    await waitFor(() => {
      const refreshButton = screen.getByText('Refresh');
      fireEvent.click(refreshButton);
      // The button should be clickable and not throw errors
    });
  });

  it('shows health status icons correctly', async () => {
    renderWithQueryClient(<EnvironmentStatusDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Health: HEALTHY')).toBeInTheDocument();
      expect(screen.getByText('Health: DEGRADED')).toBeInTheDocument();
      expect(screen.getByText('Health: UNHEALTHY')).toBeInTheDocument();
    });
  });

  it('displays environment creation time correctly', async () => {
    renderWithQueryClient(<EnvironmentStatusDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/Created/)).toBeInTheDocument();
    });
  });

  it('shows environment variables count', async () => {
    renderWithQueryClient(<EnvironmentStatusDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('3 env vars')).toBeInTheDocument();
      expect(screen.getByText('2 env vars')).toBeInTheDocument();
      expect(screen.getByText('0 env vars')).toBeInTheDocument();
    });
  });
});
