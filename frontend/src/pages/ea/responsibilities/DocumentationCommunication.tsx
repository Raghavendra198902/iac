import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '../../../components/layout';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  FileText,
  Presentation,
  BookOpen,
  MessageSquare,
} from 'lucide-react';

export default function DocumentationCommunication() {
  const responsibilities = [
    {
      title: 'Architecture Artifacts',
      icon: FileText,
      items: [
        'Maintain architecture blueprints and diagrams',
        'Document architecture decisions (ADR logs)',
        'Create reference architectures and patterns',
        'Keep architecture repository up to date',
      ],
    },
    {
      title: 'Knowledge Sharing',
      icon: BookOpen,
      items: [
        'Publish architecture guides and playbooks',
        'Share best practices and lessons learned',
        'Create architecture wikis and knowledge bases',
        'Document case studies and success stories',
      ],
    },
    {
      title: 'Presentations & Workshops',
      icon: Presentation,
      items: [
        'Deliver architecture presentations to stakeholders',
        'Conduct architecture reviews and demos',
        'Lead working sessions and brainstorming',
        'Present at architecture forums and communities',
      ],
    },
    {
      title: 'Communication Strategy',
      icon: MessageSquare,
      items: [
        'Define communication channels and cadence',
        'Tailor messaging for different audiences',
        'Use storytelling to explain architecture',
        'Build architecture awareness and buy-in',
      ],
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-indigo-950/20 dark:to-purple-950/20">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 p-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl border border-white/50 dark:border-gray-700/50 shadow-2xl p-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
            <div className="relative z-10 text-white">
              <Link to="/ea/responsibilities" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to EA Responsibilities
              </Link>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                  <FileText className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">14. Documentation & Communication</h1>
                  <p className="text-white/90 text-lg">Maintain blueprints, ADR logs, and deliver presentations</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Architecture Docs', value: '456', icon: FileText, color: 'blue' },
              { label: 'ADRs Published', value: '89', icon: BookOpen, color: 'green' },
              { label: 'Presentations/Year', value: '34', icon: Presentation, color: 'purple' },
              { label: 'Wiki Articles', value: '178', icon: MessageSquare, color: 'orange' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {responsibilities.map((section, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl"
          >
            <Link to="/ea/responsibilities/program-delivery" className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Prev: Program, Portfolio & Delivery
            </Link>
            <Link to="/ea/responsibilities/people-leadership" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg">
              Next: People Leadership & Knowledge
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
