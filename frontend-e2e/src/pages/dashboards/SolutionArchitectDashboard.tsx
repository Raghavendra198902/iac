import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SolutionArchitectDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Solution Architect Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Blueprints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">18</div>
            <p className="text-sm text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Architecture Designs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">32</div>
            <p className="text-sm text-muted-foreground">Multi-cloud solutions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Cost Estimates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">$245K</div>
            <p className="text-sm text-muted-foreground">Monthly projected</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">12</div>
            <p className="text-sm text-muted-foreground">Optimization suggestions</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Blueprints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'E-Commerce Platform', status: 'In Review', cloud: 'AWS' },
                { name: 'Data Analytics Pipeline', status: 'Design', cloud: 'Azure' },
                { name: 'Microservices Architecture', status: 'Approved', cloud: 'GCP' },
                { name: 'IoT Backend System', status: 'In Progress', cloud: 'Multi-Cloud' },
              ].map((bp, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{bp.name}</div>
                    <div className="text-sm text-gray-500">{bp.cloud}</div>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {bp.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Cloud Resource Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">AWS</span>
                  <span className="text-sm text-muted-foreground">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{width: '45%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Azure</span>
                  <span className="text-sm text-muted-foreground">35%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '35%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">GCP</span>
                  <span className="text-sm text-muted-foreground">20%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '20%'}}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
