import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function TechnicalArchitectDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Technical Architect Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>IaC Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">56</div>
            <p className="text-sm text-muted-foreground">Terraform modules</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Technical Specs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">24</div>
            <p className="text-sm text-muted-foreground">Active documents</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Code Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-600">8</div>
            <p className="text-sm text-muted-foreground">Pending reviews</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Guardrails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">94%</div>
            <p className="text-sm text-muted-foreground">Compliance rate</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent IaC Generations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'AWS EKS Cluster', type: 'Terraform', status: 'Generated' },
                { name: 'Azure AKS Setup', type: 'Terraform', status: 'Validated' },
                { name: 'GCP GKE Configuration', type: 'Terraform', status: 'Deployed' },
                { name: 'Multi-Cloud VPN', type: 'Terraform', status: 'In Progress' },
              ].map((iac, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{iac.name}</div>
                    <div className="text-sm text-gray-500">{iac.type}</div>
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                    {iac.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Security Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">CIS Benchmarks</span>
                  <span className="text-sm text-muted-foreground">96%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '96%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">NIST 800-53</span>
                  <span className="text-sm text-muted-foreground">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '92%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">PCI-DSS</span>
                  <span className="text-sm text-muted-foreground">89%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: '89%'}}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
