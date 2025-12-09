import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ProjectManagerDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Project Manager Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">In execution</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-600">15</div>
            <p className="text-sm text-muted-foreground">Require action</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Budget Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">78%</div>
            <p className="text-sm text-muted-foreground">$780K of $1M</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Migrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">6</div>
            <p className="text-sm text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Cloud Migration Phase 2', progress: 75, status: 'On Track', budget: '$250K' },
                { name: 'Microservices Rollout', progress: 45, status: 'On Track', budget: '$180K' },
                { name: 'Data Center Exit', progress: 60, status: 'At Risk', budget: '$320K' },
                { name: 'Security Hardening', progress: 90, status: 'On Track', budget: '$95K' },
              ].map((project, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <div className="font-medium">{project.name}</div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      project.status === 'On Track' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">Budget: {project.budget}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${project.status === 'On Track' ? 'bg-green-600' : 'bg-orange-500'}`}
                      style={{width: `${project.progress}%`}}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{project.progress}% Complete</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>KPI Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium">On-Time Delivery</div>
                  <div className="text-2xl font-bold text-green-600">92%</div>
                </div>
                <div className="text-green-600">↑ 5%</div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Resource Utilization</div>
                  <div className="text-2xl font-bold text-blue-600">85%</div>
                </div>
                <div className="text-blue-600">↑ 3%</div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Cost Savings</div>
                  <div className="text-2xl font-bold text-purple-600">$1.2M</div>
                </div>
                <div className="text-purple-600">↑ 18%</div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Team Velocity</div>
                  <div className="text-2xl font-bold text-orange-600">87</div>
                </div>
                <div className="text-orange-600">↑ 12</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
