import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Link to="/">
            <Button variant="primary">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link to="/blueprints">
            <Button variant="secondary">
              <Search className="h-4 w-4 mr-2" />
              Browse Blueprints
            </Button>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Links</h3>
          <div className="space-y-2 text-left">
            <Link to="/dashboard" className="block text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              → Dashboard
            </Link>
            <Link to="/designer" className="block text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              → AI Designer
            </Link>
            <Link to="/risk" className="block text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              → Risk Assessment
            </Link>
            <Link to="/cost" className="block text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              → Cost Management
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
