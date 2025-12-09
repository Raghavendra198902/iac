import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import apiService from '@/services/api';

interface DashboardData {
  policies: { total: number; active: number };
  compliance: { overall: number };
  patterns: { total: number; approved: number };
  approvals: { count: number };
  loading: boolean;
  error: string | null;
}

export default function EnterpriseArchitectDashboard() {
  const [data, setData] = useState<DashboardData>({
    policies: { total: 0, active: 0 },
    compliance: { overall: 0 },
    patterns: { total: 0, approved: 0 },
    approvals: { count: 0 },
    loading: true,
    error: null,
  });

  useEffect(() => {
    loadDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const [policiesData, complianceData, patternsData, approvalsData] = await Promise.all([
        apiService.governance.getPolicies(),
        apiService.governance.getComplianceScore(),
        apiService.architecture.getPatterns(),
        apiService.architecture.getPendingApprovals(),
      ]);

      setData({
        policies: { total: policiesData.total, active: policiesData.active },
        compliance: { overall: complianceData.overall },
        patterns: { total: patternsData.total, approved: patternsData.approved },
        approvals: { count: approvalsData.count },
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setData(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data',
      }));
    }
  };

  if (data.loading && data.policies.total === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Enterprise Architect Dashboard</h1>
        <button
          onClick={loadDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={data.loading}
        >
          {data.loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {data.error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {data.error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Governance Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data.policies.active}</div>
            <p className="text-sm text-muted-foreground">Active policies</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">{data.compliance.overall}%</div>
            <p className="text-sm text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Architecture Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data.patterns.approved}</div>
            <p className="text-sm text-muted-foreground">Approved patterns</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-600">{data.approvals.count}</div>
            <p className="text-sm text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Standards Compliance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Cloud Architecture Standards</span>
                <span className="text-sm text-muted-foreground">98%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '98%'}}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Security Policies</span>
                <span className="text-sm text-muted-foreground">95%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '95%'}}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Cost Governance</span>
                <span className="text-sm text-muted-foreground">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '92%'}}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
