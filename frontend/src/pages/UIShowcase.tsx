import { useState } from 'react';
import { 
  Code, 
  Zap, 
  Shield, 
  Rocket, 
  Settings, 
  User, 
  Bell,
  LogOut,
  Edit,
  Trash2,
  Copy,
  Download,
  Cloud,
  Server,
  Database,
  GitBranch,
} from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Tooltip from '../components/ui/Tooltip';
import Modal, { ModalFooter } from '../components/ui/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Dropdown, { DropdownItem, DropdownSeparator, DropdownLabel } from '../components/ui/Dropdown';
import Progress, { SegmentedProgress } from '../components/ui/Progress';
import Alert from '../components/ui/Alert';
import CommandPalette, { useCommandPalette, type CommandItem } from '../components/ui/CommandPalette';

export default function UIShowcase() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { isOpen, setIsOpen } = useCommandPalette();

  const commandItems: CommandItem[] = [
    {
      id: '1',
      label: 'Create New Blueprint',
      description: 'Start designing a new infrastructure blueprint',
      icon: <Code className="w-4 h-4" />,
      category: 'Actions',
      keywords: ['new', 'create', 'blueprint', 'design'],
      onSelect: () => console.log('Create blueprint'),
    },
    {
      id: '2',
      label: 'Deploy Infrastructure',
      description: 'Deploy your blueprint to the cloud',
      icon: <Rocket className="w-4 h-4" />,
      category: 'Actions',
      keywords: ['deploy', 'launch', 'provision'],
      onSelect: () => console.log('Deploy'),
    },
    {
      id: '3',
      label: 'View Blueprints',
      description: 'Browse all your infrastructure blueprints',
      icon: <GitBranch className="w-4 h-4" />,
      category: 'Navigation',
      keywords: ['view', 'list', 'browse', 'blueprints'],
      onSelect: () => console.log('View blueprints'),
    },
    {
      id: '4',
      label: 'Settings',
      description: 'Configure application settings',
      icon: <Settings className="w-4 h-4" />,
      category: 'Navigation',
      keywords: ['settings', 'preferences', 'config'],
      onSelect: () => console.log('Settings'),
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            UI Component Showcase
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Explore the enhanced UI components library
          </p>
        </div>

        {/* Command Palette Info */}
        <Alert variant="info" title="Quick Tip">
          Press <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">⌘K</kbd> or{' '}
          <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">Ctrl+K</kbd> to open the command palette
        </Alert>

        {/* Badges & Avatars */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Badges & Avatars</h2>
          
          <div className="space-y-6">
            {/* Badges */}
            <div>
              <h3 className="text-sm font-medium mb-3">Badges</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="success">Active</Badge>
                <Badge variant="warning">Pending</Badge>
                <Badge variant="error">Failed</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success" pill>Deployed</Badge>
                <Badge variant="warning" size="sm">Small</Badge>
                <Badge variant="error" size="lg">Large</Badge>
              </div>
            </div>

            {/* Avatars */}
            <div>
              <h3 className="text-sm font-medium mb-3">Avatars</h3>
              <div className="flex items-center gap-3">
                <Avatar fallback="John Doe" size="xs" />
                <Avatar fallback="Jane Smith" size="sm" />
                <Avatar fallback="Alice Johnson" size="md" />
                <Avatar fallback="Bob Wilson" size="lg" />
                <Avatar fallback="Carol Brown" size="xl" />
              </div>
            </div>
          </div>
        </Card>

        {/* Buttons & Tooltips */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Buttons & Tooltips</h2>
          
          <div className="flex flex-wrap gap-3">
            <Tooltip content="Click to save changes">
              <Button variant="primary">
                <Zap className="w-4 h-4" />
                Primary Action
              </Button>
            </Tooltip>

            <Tooltip content="Secondary action">
              <Button variant="secondary">
                <Shield className="w-4 h-4" />
                Secondary
              </Button>
            </Tooltip>

            <Tooltip content="This will delete the item" position="top">
              <Button variant="danger">
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </Tooltip>

            <Tooltip content="View details" position="right">
              <Button variant="ghost">
                Ghost Button
              </Button>
            </Tooltip>

            <Tooltip content="Currently disabled" position="bottom">
              <Button disabled>
                Disabled
              </Button>
            </Tooltip>
          </div>
        </Card>

        {/* Dropdowns */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Dropdowns</h2>
          
          <div className="flex gap-4">
            <Dropdown
              trigger={
                <Button variant="secondary">
                  Actions
                </Button>
              }
            >
              <DropdownLabel>Quick Actions</DropdownLabel>
              <DropdownItem icon={<Edit className="w-4 h-4" />}>
                Edit Blueprint
              </DropdownItem>
              <DropdownItem icon={<Copy className="w-4 h-4" />}>
                Duplicate
              </DropdownItem>
              <DropdownItem icon={<Download className="w-4 h-4" />}>
                Export
              </DropdownItem>
              <DropdownSeparator />
              <DropdownLabel>Danger Zone</DropdownLabel>
              <DropdownItem icon={<Trash2 className="w-4 h-4" />} destructive>
                Delete
              </DropdownItem>
            </Dropdown>

            <Dropdown
              trigger={
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                  <Avatar fallback="John Doe" size="sm" />
                  <span className="text-sm font-medium">John Doe</span>
                </div>
              }
              align="right"
            >
              <DropdownItem icon={<User className="w-4 h-4" />}>
                Profile
              </DropdownItem>
              <DropdownItem icon={<Settings className="w-4 h-4" />}>
                Settings
              </DropdownItem>
              <DropdownItem icon={<Bell className="w-4 h-4" />}>
                Notifications
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem icon={<LogOut className="w-4 h-4" />} destructive>
                Sign Out
              </DropdownItem>
            </Dropdown>
          </div>
        </Card>

        {/* Tabs */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Tabs</h2>
          
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="costs">Costs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Overview of your infrastructure blueprint and its components.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Cloud className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">12</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Cloud Resources</div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Server className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">8</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Compute Instances</div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Database className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">3</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Databases</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resources">
              <p className="text-gray-600 dark:text-gray-400">
                Detailed view of all resources in your blueprint.
              </p>
            </TabsContent>

            <TabsContent value="security">
              <p className="text-gray-600 dark:text-gray-400">
                Security analysis and compliance status.
              </p>
            </TabsContent>

            <TabsContent value="costs">
              <p className="text-gray-600 dark:text-gray-400">
                Cost breakdown and optimization recommendations.
              </p>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Progress */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Progress Indicators</h2>
          
          <div className="space-y-6">
            <Progress value={30} showLabel label="Deployment Progress" />
            <Progress value={65} variant="success" showLabel label="Health Score" />
            <Progress value={85} variant="warning" showLabel label="Resource Usage" />
            <Progress value={45} variant="error" showLabel label="Security Issues" />
            
            <div className="pt-4">
              <h3 className="text-sm font-medium mb-3">Multi-Segment Progress</h3>
              <SegmentedProgress
                segments={[
                  { value: 45, color: '#3b82f6', label: 'Compute' },
                  { value: 30, color: '#8b5cf6', label: 'Storage' },
                  { value: 25, color: '#10b981', label: 'Network' },
                ]}
                showLabels
              />
            </div>
          </div>
        </Card>

        {/* Alerts */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Alerts</h2>
          
          <div className="space-y-4">
            <Alert variant="info" title="Information">
              Your blueprint has been saved successfully.
            </Alert>

            <Alert variant="success" title="Deployment Successful">
              All resources have been provisioned and are running.
            </Alert>

            <Alert variant="warning" title="Warning">
              Some resources are approaching their capacity limits.
            </Alert>

            <Alert variant="error" title="Error" dismissible onDismiss={() => {}}>
              Failed to provision 2 resources. Please check the logs for details.
            </Alert>
          </div>
        </Card>

        {/* Modals */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Modals</h2>
          
          <div className="flex gap-3">
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Open Modal
            </Button>

            <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
              Delete Confirmation
            </Button>
          </div>

          {/* Regular Modal */}
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Create New Blueprint"
            description="Configure your infrastructure blueprint settings"
            size="lg"
            footer={
              <ModalFooter>
                <Button variant="ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={() => setShowModal(false)}>
                  Create Blueprint
                </Button>
              </ModalFooter>
            }
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Blueprint Name</label>
                <input
                  type="text"
                  placeholder="My Production Environment"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cloud Provider</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option>AWS</option>
                  <option>Azure</option>
                  <option>GCP</option>
                  <option>On-Premise / Data Center</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your infrastructure..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="Delete Blueprint"
            description="This action cannot be undone"
            size="sm"
            footer={
              <ModalFooter>
                <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={() => setShowDeleteModal(false)}>
                  Delete Permanently
                </Button>
              </ModalFooter>
            }
          >
            <Alert variant="warning">
              Are you sure you want to delete this blueprint? All associated resources 
              and deployments will be affected.
            </Alert>
          </Modal>
        </Card>

        {/* Command Palette */}
        <CommandPalette
          items={commandItems}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </div>
    </PageTransition>
  );
}
