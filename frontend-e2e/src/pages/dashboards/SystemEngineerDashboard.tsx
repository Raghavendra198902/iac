import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SystemEngineerDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">System Engineer Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">28</div>
            <p className="text-sm text-muted-foreground">Running pipelines</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">98.7%</div>
            <p className="text-sm text-muted-foreground">Uptime (30 days)</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Open Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-600">3</div>
            <p className="text-sm text-muted-foreground">2 critical, 1 high</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Alerts (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-600">24</div>
            <p className="text-sm text-muted-foreground">12 resolved</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Deployments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { service: 'API Gateway v3.2', status: 'Success', time: '5 min ago', env: 'Production' },
                { service: 'Auth Service v2.8', status: 'Success', time: '15 min ago', env: 'Production' },
                { service: 'Payment Service v1.9', status: 'Failed', time: '1 hour ago', env: 'Staging' },
                { service: 'Notification Service v3.0', status: 'Success', time: '2 hours ago', env: 'Production' },
              ].map((deploy, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{deploy.service}</div>
                    <div className="text-sm text-gray-500">{deploy.env} • {deploy.time}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    deploy.status === 'Success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {deploy.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Infrastructure Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">CPU Utilization</span>
                  <span className="text-sm text-muted-foreground">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm text-muted-foreground">72%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '72%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Network Throughput</span>
                  <span className="text-sm text-muted-foreground">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{width: '45%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Disk I/O</span>
                  <span className="text-sm text-muted-foreground">38%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{width: '38%'}}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Critical Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { message: 'High memory usage on prod-web-02', severity: 'Critical', time: '2 min ago' },
              { message: 'Database connection pool exhausted', severity: 'Critical', time: '15 min ago' },
              { message: 'SSL certificate expiring in 7 days', severity: 'Warning', time: '1 hour ago' },
            ].map((alert, idx) => (
              <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${
                alert.severity === 'Critical' ? 'bg-red-50 border-l-4 border-red-500' : 'bg-yellow-50 border-l-4 border-yellow-500'
              }`}>
                <div>
                  <div className="font-medium">{alert.message}</div>
                  <div className="text-sm text-gray-500">{alert.time}</div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  alert.severity === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {alert.severity}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
