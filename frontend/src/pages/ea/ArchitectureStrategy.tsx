import { useState, useEffect } from 'react';
import { MainLayout } from '../../components/layout';
import {
  Target,
  FileText,
  Users,
  Shield,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Edit,
  Plus,
  Download,
  Upload
} from 'lucide-react';
import jsPDF from 'jspdf';
import { API_URL } from '../../config/api';

const API_BASE = API_URL;

export default function ArchitectureStrategy() {
  const [activeTab, setActiveTab] = useState('principles');
  const [showNewPrincipleModal, setShowNewPrincipleModal] = useState(false);
  const [editingPrinciple, setEditingPrinciple] = useState<any>(null);
  const [selectedCommittee, setSelectedCommittee] = useState<any>(null);
  const [selectedPrinciple, setSelectedPrinciple] = useState<any>(null);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Data from API
  const [architecturePrinciples, setArchitecturePrinciples] = useState<any[]>([]);
  const [strategicGoals, setStrategicGoals] = useState<any[]>([]);
  const [governanceFramework, setGovernanceFramework] = useState<any[]>([]);

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [principlesRes, goalsRes, committeesRes] = await Promise.all([
        fetch(`${API_BASE}/ea/principles`),
        fetch(`${API_BASE}/ea/goals`),
        fetch(`${API_BASE}/ea/committees`)
      ]);

      if (principlesRes.ok) {
        const principles = await principlesRes.json();
        console.log('Fetched principles:', principles.length);
        setArchitecturePrinciples(principles);
      }
      if (goalsRes.ok) {
        const goals = await goalsRes.json();
        console.log('Fetched goals:', goals.length);
        setStrategicGoals(goals);
      }
      if (committeesRes.ok) {
        const committees = await committeesRes.json();
        console.log('Fetched committees:', committees.length, committees);
        setGovernanceFramework(committees);
      }
    } catch (error) {
      console.error('Error fetching EA data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Edit principle functionality
  const handleEditPrinciple = (principle: any) => {
    setEditingPrinciple(principle);
    setShowNewPrincipleModal(true);
  };

  // View committee details
  const handleViewDetails = (committee: any) => {
    setSelectedCommittee(committee);
  };

  // Export functionality - PDF
  const handleExport = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Helper to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Title
    pdf.setFontSize(24);
    pdf.setTextColor(31, 41, 55);
    pdf.text('Architecture Strategy', margin, yPosition);
    yPosition += 15;

    // Date
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, margin, yPosition);
    yPosition += 15;

    // Architecture Principles Section
    pdf.setFontSize(18);
    pdf.setTextColor(31, 41, 55);
    pdf.text('Architecture Principles', margin, yPosition);
    yPosition += 10;

    architecturePrinciples.forEach((principle, index) => {
      checkPageBreak(35);
      
      // Principle number and name
      pdf.setFontSize(12);
      pdf.setTextColor(37, 99, 235);
      pdf.text(`${index + 1}. ${principle.name}`, margin, yPosition);
      yPosition += 6;

      // Description
      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);
      const descLines = pdf.splitTextToSize(principle.description, pageWidth - 2 * margin);
      pdf.text(descLines, margin + 5, yPosition);
      yPosition += descLines.length * 5;

      // Metadata
      pdf.setFontSize(9);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Category: ${principle.category} | Impact: ${principle.impact} | Compliance: ${principle.compliance}%`, margin + 5, yPosition);
      yPosition += 8;
    });

    // Strategic Goals Section
    checkPageBreak(20);
    yPosition += 10;
    pdf.setFontSize(18);
    pdf.setTextColor(31, 41, 55);
    pdf.text('Strategic Goals', margin, yPosition);
    yPosition += 10;

    strategicGoals.forEach((goal, index) => {
      checkPageBreak(30);
      
      pdf.setFontSize(12);
      pdf.setTextColor(37, 99, 235);
      pdf.text(`${index + 1}. ${goal.title}`, margin, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);
      pdf.text(`Progress: ${goal.progress}% | Status: ${goal.status}`, margin + 5, yPosition);
      yPosition += 5;
      pdf.text(`Initiatives: ${goal.initiatives}`, margin + 5, yPosition);
      yPosition += 5;

      pdf.setFontSize(9);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Timeline: ${goal.timeline} | Budget: ${goal.budget}`, margin + 5, yPosition);
      yPosition += 8;
    });

    // Governance Framework Section
    checkPageBreak(20);
    yPosition += 10;
    pdf.setFontSize(18);
    pdf.setTextColor(31, 41, 55);
    pdf.text('Governance Framework', margin, yPosition);
    yPosition += 10;

    governanceFramework.forEach((committee, index) => {
      checkPageBreak(25);
      
      pdf.setFontSize(12);
      pdf.setTextColor(37, 99, 235);
      pdf.text(`${index + 1}. ${committee.name}`, margin, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);
      pdf.text(`Members: ${committee.members} | Frequency: ${committee.frequency}`, margin + 5, yPosition);
      yPosition += 5;
      pdf.text(`Last Meeting: ${committee.last_meeting}`, margin + 5, yPosition);
      yPosition += 8;
    });

    // Footer on last page
    pdf.setFontSize(8);
    pdf.setTextColor(156, 163, 175);
    pdf.text('Enterprise Architecture - Confidential', margin, pageHeight - 10);

    // Save the PDF
    pdf.save(`architecture-strategy-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // New Principle functionality
  const handleNewPrinciple = () => {
    setEditingPrinciple(null);
    setShowNewPrincipleModal(true);
  };

  // Save principle (create or update)
  const handleSavePrinciple = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const principleData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      status: formData.get('status') as string,
      impact: formData.get('impact') as string,
      compliance: parseInt(formData.get('compliance') as string)
    };

    try {
      let response;
      if (editingPrinciple) {
        // Update existing principle
        response = await fetch(`${API_BASE}/ea/principles/${editingPrinciple.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(principleData)
        });
      } else {
        // Create new principle
        response = await fetch(`${API_BASE}/ea/principles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(principleData)
        });
      }

      if (response.ok) {
        await fetchAllData(); // Refresh data
        setShowNewPrincipleModal(false);
        setEditingPrinciple(null);
        alert(editingPrinciple ? 'Principle updated successfully!' : 'Principle created successfully!');
      } else {
        alert('Failed to save principle');
      }
    } catch (error) {
      console.error('Error saving principle:', error);
      alert('Error saving principle');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'at-risk': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'ahead': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Architecture Strategy</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Define and manage enterprise architecture strategy, principles, and governance
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={handleNewPrinciple}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Principle
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-8">
            {['principles', 'goals', 'governance'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading EA data...</p>
            </div>
          </div>
        )}

        {/* Architecture Principles Tab */}
        {!loading && activeTab === 'principles' && (
          <div className="space-y-4">
            {architecturePrinciples.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400 mb-4">No architecture principles defined yet.</p>
                <button
                  onClick={handleNewPrinciple}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Principle
                </button>
              </div>
            ) : (
              architecturePrinciples.map((principle) => (
                <div
                  key={principle.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onDoubleClick={() => setSelectedPrinciple(principle)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {principle.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(principle.impact)}`}>
                        {principle.impact}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        {principle.category}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {principle.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditPrinciple(principle);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-400" />
                    </button>
                    <div className="text-xs text-gray-500 dark:text-gray-500 italic">
                      Double-click for details
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Compliance</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {principle.compliance}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          principle.compliance >= 90
                            ? 'bg-green-600'
                            : principle.compliance >= 70
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }`}
                        style={{ width: `${principle.compliance}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        )}

        {/* Strategic Goals Tab */}
        {!loading && activeTab === 'goals' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {strategicGoals.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">No strategic goals defined yet.</p>
              </div>
            ) : (
              strategicGoals.map((goal, idx) => (
                <div
                  key={goal.id || idx}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onDoubleClick={() => setSelectedGoal(goal)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {goal.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{goal.description}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{goal.timeline}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.status)}`}>
                    {goal.status}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {goal.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Initiatives</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{goal.initiatives}</div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Budget</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{goal.budget}</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-500 italic text-center">
                    Double-click for more details
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        )}

        {/* Governance Tab */}
        {!loading && activeTab === 'governance' && (
          <div className="space-y-4">
            {(() => {
              console.log('Rendering governance tab, committees:', governanceFramework.length, governanceFramework);
              return null;
            })()}
            {governanceFramework.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">No governance committees defined yet.</p>
              </div>
            ) : (
              governanceFramework.map((committee, idx) => (
                <div
                  key={committee.id || idx}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onDoubleClick={() => handleViewDetails(committee)}
                >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {committee.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {committee.description}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {committee.members} members
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        {committee.frequency}
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Last meeting: {committee.last_meeting}
                      </div>
                      {committee.chair_name && (
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Chair: {committee.chair_name}
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-500 italic">
                      Double-click for more details
                    </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(committee);
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* New Principle Modal */}
      {showNewPrincipleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingPrinciple ? 'Edit Principle' : 'Create New Principle'}
                </h2>
                <button
                  onClick={() => setShowNewPrincipleModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form className="p-6 space-y-4" onSubmit={handleSavePrinciple}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Principle Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingPrinciple?.name || ''}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Zero Trust Security"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  defaultValue={editingPrinciple?.description || ''}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the principle and its implementation..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select 
                    name="category"
                    defaultValue={editingPrinciple?.category || 'Technology'}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Security">Security</option>
                    <option value="Integration">Integration</option>
                    <option value="Data">Data</option>
                    <option value="Compliance">Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Impact Level *
                  </label>
                  <select 
                    name="impact"
                    defaultValue={editingPrinciple?.impact || 'high'}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status *
                </label>
                <select 
                  name="status"
                  defaultValue={editingPrinciple?.status || 'active'}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="review">Under Review</option>
                  <option value="deprecated">Deprecated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Compliance Target (%)
                </label>
                <input
                  type="number"
                  name="compliance"
                  min="0"
                  max="100"
                  defaultValue={editingPrinciple?.compliance || 90}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowNewPrincipleModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPrinciple ? 'Update Principle' : 'Create Principle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Committee Details Modal */}
      {selectedCommittee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCommittee.name}</h2>
                <button
                  onClick={() => setSelectedCommittee(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Overview Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Overview</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Members</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCommittee.members}</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                      <Target className="w-4 h-4" />
                      <span className="text-sm">Frequency</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCommittee.frequency}</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Last Meeting</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCommittee.last_meeting}</div>
                  </div>
                </div>
              </div>

              {/* Members List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Committee Members</h3>
                <div className="space-y-2">
                  {selectedCommittee.members_list && selectedCommittee.members_list.length > 0 ? (
                    selectedCommittee.members_list.map((member: any, idx: number) => (
                      <div key={member.id || idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {member.name.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {member.role}
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          member.status === 'active' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {member.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No members data available</p>
                  )}
                </div>
              </div>

              {/* Recent Decisions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Decisions</h3>
                <div className="space-y-3">
                  {selectedCommittee.recent_decisions && selectedCommittee.recent_decisions.length > 0 ? (
                    selectedCommittee.recent_decisions.map((decision: any, idx: number) => (
                      <div key={decision.id || idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{decision.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            decision.status === 'approved'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : decision.status === 'rejected'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                          }`}>
                            {decision.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {decision.description}
                        </p>
                        <div className="text-xs text-gray-500 dark:text-gray-500">
                          Decision Date: {decision.decision_date ? new Date(decision.decision_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Pending'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No recent decisions</p>
                  )}
                </div>
              </div>

              {/* Upcoming Meetings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Meetings</h3>
                <div className="space-y-2">
                  {selectedCommittee.upcoming_meetings && selectedCommittee.upcoming_meetings.length > 0 ? (
                    selectedCommittee.upcoming_meetings.map((meeting: any, idx: number) => {
                      const meetingDate = new Date(meeting.meeting_date);
                      const daysUntil = Math.ceil((meetingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <div key={meeting.id || idx} className={`flex items-center justify-between p-3 rounded-lg border ${
                          daysUntil <= 7 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                        }`}>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{meeting.title}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {meetingDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} at {meetingDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            daysUntil <= 7
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {daysUntil > 0 ? `In ${daysUntil} days` : daysUntil === 0 ? 'Today' : 'Past'}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming meetings scheduled</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setSelectedCommittee(null)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Principle Details Modal */}
      {selectedPrinciple && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPrinciple.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(selectedPrinciple.impact)}`}>
                    {selectedPrinciple.impact} Impact
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPrinciple(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedPrinciple.description}</p>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Category</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedPrinciple.category}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white capitalize">{selectedPrinciple.status}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Compliance</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedPrinciple.compliance}%</div>
                </div>
              </div>

              {/* Compliance Progress */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Compliance Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Current Compliance Level</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedPrinciple.compliance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        selectedPrinciple.compliance >= 90
                          ? 'bg-green-600'
                          : selectedPrinciple.compliance >= 70
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                      }`}
                      style={{ width: `${selectedPrinciple.compliance}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                    <span>Non-compliant (0%)</span>
                    <span>Partially (70%)</span>
                    <span>Fully Compliant (100%)</span>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Impact Areas</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Security & Compliance</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>System Architecture</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Development Practices</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Implementation Status</h3>
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Created: {selectedPrinciple.created_at ? new Date(selectedPrinciple.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Last Updated: {selectedPrinciple.updated_at ? new Date(selectedPrinciple.updated_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedPrinciple(null);
                  handleEditPrinciple(selectedPrinciple);
                }}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setSelectedPrinciple(null)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Details Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedGoal.title}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedGoal.status)}`}>
                    {selectedGoal.status}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedGoal(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedGoal.description}</p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Timeline</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedGoal.timeline}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Initiatives</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedGoal.initiatives}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Budget</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{selectedGoal.budget}</div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Progress Tracking</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Overall Completion</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{selectedGoal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-blue-600"
                      style={{ width: `${selectedGoal.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                    <span>Started (0%)</span>
                    <span>In Progress (50%)</span>
                    <span>Complete (100%)</span>
                  </div>
                </div>
              </div>

              {/* Key Initiatives */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Key Initiatives</h3>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">Initiative {i}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Supporting strategic objective {i}</div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Owner</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedGoal.owner || 'Architecture Team'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Last Updated</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedGoal.updated_at ? new Date(selectedGoal.updated_at).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setSelectedGoal(null)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
