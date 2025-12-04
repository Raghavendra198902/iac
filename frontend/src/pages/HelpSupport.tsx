import { MainLayout } from '../components/layout';
import { HelpCircle, Book, MessageCircle, Video, Mail, FileText, Search } from 'lucide-react';

export default function HelpSupport() {
  const resources = [
    { icon: Book, title: 'Documentation', description: 'Browse comprehensive guides and tutorials', link: '/docs', color: 'from-blue-500 to-blue-600' },
    { icon: Video, title: 'Video Tutorials', description: 'Watch step-by-step video guides', link: '/tutorials', color: 'from-purple-500 to-purple-600' },
    { icon: MessageCircle, title: 'Community Forum', description: 'Ask questions and get help from the community', link: '/forum', color: 'from-green-500 to-green-600' },
    { icon: Mail, title: 'Contact Support', description: 'Get help from our support team', link: 'mailto:support@iacdharma.com', color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
          Help & Support
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((resource, index) => (
            <a key={index} href={resource.link} className={`block p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all hover:shadow-xl`}>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${resource.color} flex items-center justify-center text-white mb-4`}>
                <resource.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{resource.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{resource.description}</p>
            </a>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
