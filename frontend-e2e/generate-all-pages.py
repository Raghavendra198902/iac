#!/usr/bin/env python3
"""
Generate all remaining E2E frontend page components
This script creates comprehensive React components with glassmorphism design
"""

import os
import json

BASE_PATH = "/home/rrd/iac/frontend-e2e/src/pages"

# Page templates with configurations
PAGES_CONFIG = {
    "Security": [
        {
            "filename": "SecurityCompliance.tsx",
            "title": "Compliance Management",
            "gradient": "from-red-400 via-orange-400 to-yellow-400",
            "bg": "from-slate-900 via-red-900 to-slate-900"
        },
        {
            "filename": "SecurityAudit.tsx",
            "title": "Audit Logs",
            "gradient": "from-red-400 via-orange-400 to-yellow-400",
            "bg": "from-slate-900 via-red-900 to-slate-900"
        },
        {
            "filename": "SecurityAccess.tsx",
            "title": "Access Control",
            "gradient": "from-red-400 via-orange-400 to-yellow-400",
            "bg": "from-slate-900 via-red-900 to-slate-900"
        }
    ],
    "Cost": [
        {
            "filename": "index.tsx",
            "title": "Cost Dashboard",
            "gradient": "from-green-400 via-emerald-400 to-teal-400",
            "bg": "from-slate-900 via-green-900 to-slate-900"
        },
        {
            "filename": "CostAnalytics.tsx",
            "title": "Cost Analytics",
            "gradient": "from-green-400 via-emerald-400 to-teal-400",
            "bg": "from-slate-900 via-green-900 to-slate-900"
        },
        {
            "filename": "CostBudget.tsx",
            "title": "Budget Management",
            "gradient": "from-green-400 via-emerald-400 to-teal-400",
            "bg": "from-slate-900 via-green-900 to-slate-900"
        },
        {
            "filename": "CostOptimization.tsx",
            "title": "Cost Optimization",
            "gradient": "from-green-400 via-emerald-400 to-teal-400",
            "bg": "from-slate-900 via-green-900 to-slate-900"
        }
    ],
    "DevOps": [
        {
            "filename": "index.tsx",
            "title": "DevOps Dashboard",
            "gradient": "from-purple-400 via-pink-400 to-red-400",
            "bg": "from-slate-900 via-purple-900 to-slate-900"
        },
        {
            "filename": "DevOpsPipelines.tsx",
            "title": "CI/CD Pipelines",
            "gradient": "from-purple-400 via-pink-400 to-red-400",
            "bg": "from-slate-900 via-purple-900 to-slate-900"
        },
        {
            "filename": "DevOpsContainers.tsx",
            "title": "Container Management",
            "gradient": "from-purple-400 via-pink-400 to-red-400",
            "bg": "from-slate-900 via-purple-900 to-slate-900"
        },
        {
            "filename": "DevOpsGit.tsx",
            "title": "Git Operations",
            "gradient": "from-purple-400 via-pink-400 to-red-400",
            "bg": "from-slate-900 via-purple-900 to-slate-900"
        }
    ],
    "EA": [
        {
            "filename": "index.tsx",
            "title": "Enterprise Architecture",
            "gradient": "from-indigo-400 via-purple-400 to-pink-400",
            "bg": "from-slate-900 via-indigo-900 to-slate-900"
        },
        {
            "filename": "EABusiness.tsx",
            "title": "Business Architecture",
            "gradient": "from-indigo-400 via-purple-400 to-pink-400",
            "bg": "from-slate-900 via-indigo-900 to-slate-900"
        },
        {
            "filename": "EAApplication.tsx",
            "title": "Application Portfolio",
            "gradient": "from-indigo-400 via-purple-400 to-pink-400",
            "bg": "from-slate-900 via-indigo-900 to-slate-900"
        },
        {
            "filename": "EAData.tsx",
            "title": "Data Architecture",
            "gradient": "from-indigo-400 via-purple-400 to-pink-400",
            "bg": "from-slate-900 via-indigo-900 to-slate-900"
        },
        {
            "filename": "EATechnology.tsx",
            "title": "Technology Stack",
            "gradient": "from-indigo-400 via-purple-400 to-pink-400",
            "bg": "from-slate-900 via-indigo-900 to-slate-900"
        },
        {
            "filename": "EASecurity.tsx",
            "title": "Security Architecture",
            "gradient": "from-indigo-400 via-purple-400 to-pink-400",
            "bg": "from-slate-900 via-indigo-900 to-slate-900"
        },
        {
            "filename": "EAIntegration.tsx",
            "title": "Integration Strategy",
            "gradient": "from-indigo-400 via-purple-400 to-pink-400",
            "bg": "from-slate-900 via-indigo-900 to-slate-900"
        }
    ],
    "Projects": [
        {
            "filename": "index.tsx",
            "title": "Projects Dashboard",
            "gradient": "from-blue-400 via-cyan-400 to-teal-400",
            "bg": "from-slate-900 via-blue-900 to-slate-900"
        },
        {
            "filename": "ProjectsList.tsx",
            "title": "All Projects",
            "gradient": "from-blue-400 via-cyan-400 to-teal-400",
            "bg": "from-slate-900 via-blue-900 to-slate-900"
        },
        {
            "filename": "ProjectDetail.tsx",
            "title": "Project Details",
            "gradient": "from-blue-400 via-cyan-400 to-teal-400",
            "bg": "from-slate-900 via-blue-900 to-slate-900"
        },
        {
            "filename": "ProjectsCollaboration.tsx",
            "title": "Team Collaboration",
            "gradient": "from-blue-400 via-cyan-400 to-teal-400",
            "bg": "from-slate-900 via-blue-900 to-slate-900"
        }
    ],
    "CMDB": [
        {
            "filename": "index.tsx",
            "title": "CMDB Dashboard",
            "gradient": "from-yellow-400 via-orange-400 to-red-400",
            "bg": "from-slate-900 via-yellow-900 to-slate-900"
        },
        {
            "filename": "CMDBAssets.tsx",
            "title": "Asset Inventory",
            "gradient": "from-yellow-400 via-orange-400 to-red-400",
            "bg": "from-slate-900 via-yellow-900 to-slate-900"
        },
        {
            "filename": "CMDBConfigItems.tsx",
            "title": "Configuration Items",
            "gradient": "from-yellow-400 via-orange-400 to-red-400",
            "bg": "from-slate-900 via-yellow-900 to-slate-900"
        },
        {
            "filename": "CMDBRelationships.tsx",
            "title": "CI Relationships",
            "gradient": "from-yellow-400 via-orange-400 to-red-400",
            "bg": "from-slate-900 via-yellow-900 to-slate-900"
        }
    ],
    "AI": [
        {
            "filename": "index.tsx",
            "title": "AI Insights",
            "gradient": "from-pink-400 via-purple-400 to-indigo-400",
            "bg": "from-slate-900 via-pink-900 to-slate-900"
        },
        {
            "filename": "AIModels.tsx",
            "title": "ML Models",
            "gradient": "from-pink-400 via-purple-400 to-indigo-400",
            "bg": "from-slate-900 via-pink-900 to-slate-900"
        },
        {
            "filename": "AIAutomation.tsx",
            "title": "Automation Workflows",
            "gradient": "from-pink-400 via-purple-400 to-indigo-400",
            "bg": "from-slate-900 via-pink-900 to-slate-900"
        },
        {
            "filename": "AIPredictive.tsx",
            "title": "Predictive Analytics",
            "gradient": "from-pink-400 via-purple-400 to-indigo-400",
            "bg": "from-slate-900 via-pink-900 to-slate-900"
        }
    ],
    "Integrations": [
        {
            "filename": "index.tsx",
            "title": "Integrations Dashboard",
            "gradient": "from-cyan-400 via-blue-400 to-purple-400",
            "bg": "from-slate-900 via-cyan-900 to-slate-900"
        },
        {
            "filename": "IntegrationsAPI.tsx",
            "title": "API Management",
            "gradient": "from-cyan-400 via-blue-400 to-purple-400",
            "bg": "from-slate-900 via-cyan-900 to-slate-900"
        },
        {
            "filename": "IntegrationsWebhooks.tsx",
            "title": "Webhook Configuration",
            "gradient": "from-cyan-400 via-blue-400 to-purple-400",
            "bg": "from-slate-900 via-cyan-900 to-slate-900"
        },
        {
            "filename": "IntegrationsServices.tsx",
            "title": "Third-Party Services",
            "gradient": "from-cyan-400 via-blue-400 to-purple-400",
            "bg": "from-slate-900 via-cyan-900 to-slate-900"
        }
    ],
    "Reports": [
        {
            "filename": "index.tsx",
            "title": "Reports Dashboard",
            "gradient": "from-emerald-400 via-teal-400 to-cyan-400",
            "bg": "from-slate-900 via-emerald-900 to-slate-900"
        },
        {
            "filename": "ReportsBuilder.tsx",
            "title": "Report Builder",
            "gradient": "from-emerald-400 via-teal-400 to-cyan-400",
            "bg": "from-slate-900 via-emerald-900 to-slate-900"
        },
        {
            "filename": "ReportsScheduled.tsx",
            "title": "Scheduled Reports",
            "gradient": "from-emerald-400 via-teal-400 to-cyan-400",
            "bg": "from-slate-900 via-emerald-900 to-slate-900"
        },
        {
            "filename": "ReportsExport.tsx",
            "title": "Data Export",
            "gradient": "from-emerald-400 via-teal-400 to-cyan-400",
            "bg": "from-slate-900 via-emerald-900 to-slate-900"
        }
    ],
    "Admin": [
        {
            "filename": "index.tsx",
            "title": "Admin Dashboard",
            "gradient": "from-red-400 via-pink-400 to-purple-400",
            "bg": "from-slate-900 via-red-900 to-slate-900"
        },
        {
            "filename": "AdminSystem.tsx",
            "title": "System Configuration",
            "gradient": "from-red-400 via-pink-400 to-purple-400",
            "bg": "from-slate-900 via-red-900 to-slate-900"
        },
        {
            "filename": "AdminLicense.tsx",
            "title": "License Management",
            "gradient": "from-red-400 via-pink-400 to-purple-400",
            "bg": "from-slate-900 via-red-900 to-slate-900"
        },
        {
            "filename": "AdminBackup.tsx",
            "title": "Backup & Restore",
            "gradient": "from-red-400 via-pink-400 to-purple-400",
            "bg": "from-slate-900 via-red-900 to-slate-900"
        }
    ]
}

# Utility pages (in root pages directory)
UTILITY_PAGES = [
    {
        "filename": "Profile.tsx",
        "title": "User Profile",
        "gradient": "from-blue-400 via-purple-400 to-pink-400"
    },
    {
        "filename": "Settings.tsx",
        "title": "Settings",
        "gradient": "from-gray-400 via-gray-500 to-gray-600"
    },
    {
        "filename": "Search.tsx",
        "title": "Search Results",
        "gradient": "from-cyan-400 via-blue-400 to-indigo-400"
    },
    {
        "filename": "Notifications.tsx",
        "title": "Notifications",
        "gradient": "from-yellow-400 via-orange-400 to-red-400"
    },
    {
        "filename": "Help.tsx",
        "title": "Help & Documentation",
        "gradient": "from-green-400 via-teal-400 to-cyan-400"
    },
    {
        "filename": "Unauthorized.tsx",
        "title": "403 - Unauthorized",
        "gradient": "from-red-400 via-orange-400 to-yellow-400"
    },
    {
        "filename": "NotFound.tsx",
        "title": "404 - Not Found",
        "gradient": "from-purple-400 via-pink-400 to-red-400"
    }
]

def generate_page_template(config, folder=None):
    """Generate a React component page template"""
    component_name = config["filename"].replace(".tsx", "").replace("index", f"{folder}Dashboard" if folder else "Home")
    
    return f'''import React from 'react';
import {{ ChartBarIcon, CubeIcon, Cog6ToothIcon }} from '@heroicons/react/24/outline';

const {component_name}: React.FC = () => {{
  return (
    <div className="min-h-screen bg-gradient-to-br {config["bg"]} relative overflow-hidden">
      {{/* Animated Background */}}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
        <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
      </div>

      {{/* Floating Particles */}}
      {{[...Array(20)].map((_, i) => (
        <div
          key={{i}}
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
          style={{{{
            left: `${{Math.random() * 100}}%`,
            top: `${{Math.random() * 100}}%`,
            animationDelay: `${{Math.random() * 5}}s`,
            animationDuration: `${{5 + Math.random() * 10}}s`
          }}}}
        ></div>
      ))}}

      <div className="relative z-10 p-8">
        {{/* Header */}}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r {config["gradient"]} bg-clip-text text-transparent mb-2">
            {config["title"]}
          </h1>
          <p className="text-gray-300">Comprehensive management and analytics</p>
        </div>

        {{/* Content Cards */}}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <ChartBarIcon className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Analytics</h3>
            <p className="text-gray-300">View detailed analytics and insights</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <CubeIcon className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Resources</h3>
            <p className="text-gray-300">Manage your resources efficiently</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <Cog6ToothIcon className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Configuration</h3>
            <p className="text-gray-300">Configure system settings</p>
          </div>
        </div>

        {{/* Main Content */}}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6">Overview</h2>
          <p className="text-gray-300 mb-4">
            This is the {config["title"]} page. Add your content and functionality here.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-white font-semibold mb-2">Feature 1</h4>
              <p className="text-gray-400 text-sm">Description of feature</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h4 className="text-white font-semibold mb-2">Feature 2</h4>
              <p className="text-gray-400 text-sm">Description of feature</p>
            </div>
          </div>
        </div>
      </div>

      <style>{{`
        @keyframes float {{
          0%, 100% {{ transform: translateY(0px); }}
          50% {{ transform: translateY(-20px); }}
        }}
        .animate-float {{
          animation: float linear infinite;
        }}
        .animation-delay-2000 {{
          animation-delay: 2s;
        }}
      `}}</style>
    </div>
  );
}};

export default {component_name};
'''

def main():
    """Main function to generate all pages"""
    created_files = []
    
    # Create folder-based pages
    for folder, pages in PAGES_CONFIG.items():
        folder_path = os.path.join(BASE_PATH, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        for page_config in pages:
            file_path = os.path.join(folder_path, page_config["filename"])
            content = generate_page_template(page_config, folder)
            
            with open(file_path, 'w') as f:
                f.write(content)
            
            created_files.append(file_path)
            print(f"Created: {file_path}")
    
    # Create utility pages
    for page_config in UTILITY_PAGES:
        file_path = os.path.join(BASE_PATH, page_config["filename"])
        page_config["bg"] = "from-slate-900 via-gray-900 to-slate-900"
        content = generate_page_template(page_config)
        
        with open(file_path, 'w') as f:
            f.write(content)
        
        created_files.append(file_path)
        print(f"Created: {file_path}")
    
    print(f"\\n✅ Successfully created {len(created_files)} page components!")
    
    # Create summary file
    summary = {
        "total_pages": len(created_files),
        "pages_by_category": {
            folder: len(pages) for folder, pages in PAGES_CONFIG.items()
        },
        "utility_pages": len(UTILITY_PAGES),
        "files": created_files
    }
    
    summary_path = os.path.join(BASE_PATH, "..", "pages-generation-summary.json")
    with open(summary_path, 'w') as f:
        json.dump(summary, f, indent=2)
    
    print(f"\\n📄 Summary saved to: {summary_path}")

if __name__ == "__main__":
    main()
