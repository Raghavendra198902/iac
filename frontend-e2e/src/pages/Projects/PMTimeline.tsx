import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  FlagIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface TimelineEvent {
  id: string;
  title: string;
  project: string;
  type: 'milestone' | 'phase' | 'release' | 'review';
  status: 'completed' | 'in-progress' | 'upcoming' | 'delayed';
  date: string;
  duration: number;
  dependencies: string[];
  team: string;
  progress: number;
}

const PMTimeline: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    loadTimelineEvents();
  }, []);

  const loadTimelineEvents = () => {
    const sampleEvents: TimelineEvent[] = [
      {
        id: '1',
        title: 'Project Kickoff',
        project: 'IAC Dharma v3.0',
        type: 'milestone',
        status: 'completed',
        date: '2024-10-01',
        duration: 1,
        dependencies: [],
        team: 'Platform',
        progress: 100
      },
      {
        id: '2',
        title: 'Architecture Design Phase',
        project: 'IAC Dharma v3.0',
        type: 'phase',
        status: 'completed',
        date: '2024-10-05',
        duration: 15,
        dependencies: ['1'],
        team: 'Architecture',
        progress: 100
      },
      {
        id: '3',
        title: 'Backend Development Sprint 1',
        project: 'IAC Dharma v3.0',
        type: 'phase',
        status: 'completed',
        date: '2024-10-20',
        duration: 21,
        dependencies: ['2'],
        team: 'Backend',
        progress: 100
      },
      {
        id: '4',
        title: 'Frontend Development Sprint 1',
        project: 'IAC Dharma v3.0',
        type: 'phase',
        status: 'completed',
        date: '2024-11-01',
        duration: 21,
        dependencies: ['2'],
        team: 'Frontend',
        progress: 100
      },
      {
        id: '5',
        title: 'Q4 2024 Release',
        project: 'IAC Dharma v3.0',
        type: 'release',
        status: 'in-progress',
        date: '2024-12-08',
        duration: 7,
        dependencies: ['3', '4'],
        team: 'DevOps',
        progress: 75
      },
      {
        id: '6',
        title: 'Security Audit',
        project: 'IAC Dharma v3.0',
        type: 'review',
        status: 'in-progress',
        date: '2024-12-10',
        duration: 5,
        dependencies: ['5'],
        team: 'Security',
        progress: 40
      },
      {
        id: '7',
        title: 'Performance Testing',
        project: 'IAC Dharma v3.0',
        type: 'phase',
        status: 'upcoming',
        date: '2024-12-15',
        duration: 7,
        dependencies: ['5'],
        team: 'QA',
        progress: 0
      },
      {
        id: '8',
        title: 'Production Deployment',
        project: 'IAC Dharma v3.0',
        type: 'milestone',
        status: 'upcoming',
        date: '2024-12-22',
        duration: 1,
        dependencies: ['6', '7'],
        team: 'DevOps',
        progress: 0
      }
    ];

    setEvents(sampleEvents);
    setLoading(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'phase':
        return 'text-blue-400 bg-blue-400/20';
      case 'release':
        return 'text-green-400 bg-green-400/20';
      case 'review':
        return 'text-purple-400 bg-purple-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/20';
      case 'in-progress':
        return 'text-blue-400 bg-blue-400/20';
      case 'upcoming':
        return 'text-gray-400 bg-gray-400/20';
      case 'delayed':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const types = ['all', 'milestone', 'phase', 'release', 'review'];
  const filteredEvents = selectedType === 'all' ? events : events.filter(e => e.type === selectedType);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="w-16 h-16 text-rose-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-rose-500/30 rounded-full blur-3xl animate-pulse top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse bottom-0 left-0 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
              Project Timeline
            </h1>
            <p className="text-gray-300">Project milestones, phases, and deliverables</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors capitalize ${
                  selectedType === type
                    ? 'bg-rose-500 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CalendarIcon className="w-8 h-8 text-rose-400" />
              <span className="text-3xl font-bold text-white">{events.length}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">Total Events</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">
                {events.filter(e => e.status === 'completed').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Completed</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <ClockIcon className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">
                {events.filter(e => e.status === 'in-progress').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">In Progress</h3>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <FlagIcon className="w-8 h-8 text-yellow-400" />
              <span className="text-3xl font-bold text-white">
                {events.filter(e => e.type === 'milestone').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Milestones</h3>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {filteredEvents.map((event, index) => (
            <div
              key={event.id}
              className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all relative"
            >
              {index < filteredEvents.length - 1 && (
                <div className="absolute left-8 top-full w-0.5 h-4 bg-gradient-to-b from-white/30 to-transparent"></div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    <CalendarIcon className="w-6 h-6 text-rose-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                    <div className="flex gap-2 flex-wrap mb-3">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getTypeColor(event.type)}`}>
                        {event.type.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getStatusColor(event.status)}`}>
                        {event.status.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 rounded text-xs font-semibold bg-white/10 text-gray-300">
                        {event.team} Team
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Start Date</p>
                        <p className="text-sm font-semibold text-white">{event.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Duration</p>
                        <p className="text-sm font-semibold text-white">{event.duration} days</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Project</p>
                        <p className="text-sm font-semibold text-white">{event.project}</p>
                      </div>
                    </div>

                    {event.dependencies.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-2">Dependencies</p>
                        <div className="flex gap-2">
                          {event.dependencies.map((dep) => (
                            <span key={dep} className="px-2 py-1 rounded text-xs bg-white/10 text-gray-300">
                              Event #{dep}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white font-semibold">{event.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-rose-500 to-pink-500 h-3 rounded-full transition-all"
                          style={{ width: `${event.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default PMTimeline;
