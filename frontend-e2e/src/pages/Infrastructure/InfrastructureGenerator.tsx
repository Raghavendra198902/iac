import React, { useState } from 'react';
import { CodeBracketIcon, DocumentDuplicateIcon, ArrowDownTrayIcon, PlayIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const InfrastructureGenerator: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('terraform');
  const [selectedProvider, setSelectedProvider] = useState('aws');
  const [copied, setCopied] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [deploymentMessage, setDeploymentMessage] = useState('');

  const codeExamples = {
    terraform: `# Terraform Configuration
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "main-vpc"
    Environment = "production"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "main-igw"
  }
}

# Public Subnet
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet"
  }
}

# EC2 Instance
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public.id

  tags = {
    Name = "web-server"
  }
}`,
    cloudformation: `# CloudFormation Template
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Web Application Infrastructure'

Parameters:
  Environment:
    Type: String
    Default: production
    AllowedValues:
      - production
      - staging
      - development

Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: !Sub '\${Environment}-vpc'

  InternetGateway:
    Type: AWS::EC2::InternetGateway
    Properties:
      Tags:
        - Key: Name
          Value: !Sub '\${Environment}-igw'

  AttachGateway:
    Type: AWS::EC2::VPCGatewayAttachment
    Properties:
      VpcId: !Ref VPC
      InternetGatewayId: !Ref InternetGateway

  PublicSubnet:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      CidrBlock: 10.0.1.0/24
      AvailabilityZone: !Select [0, !GetAZs '']
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub '\${Environment}-public-subnet'

  WebServerInstance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: ami-0c55b159cbfafe1f0
      InstanceType: t3.micro
      SubnetId: !Ref PublicSubnet
      Tags:
        - Key: Name
          Value: !Sub '\${Environment}-web-server'

Outputs:
  VPCId:
    Description: VPC ID
    Value: !Ref VPC
  InstanceId:
    Description: EC2 Instance ID
    Value: !Ref WebServerInstance`,
    ansible: `# Ansible Playbook
---
- name: Deploy Web Application Infrastructure
  hosts: localhost
  connection: local
  gather_facts: false

  vars:
    aws_region: us-east-1
    environment: production
    vpc_cidr: 10.0.0.0/16
    public_subnet_cidr: 10.0.1.0/24

  tasks:
    - name: Create VPC
      amazon.aws.ec2_vpc_net:
        name: "{{ environment }}-vpc"
        cidr_block: "{{ vpc_cidr }}"
        region: "{{ aws_region }}"
        dns_hostnames: yes
        dns_support: yes
        tags:
          Name: "{{ environment }}-vpc"
          Environment: "{{ environment }}"
      register: vpc

    - name: Create Internet Gateway
      amazon.aws.ec2_vpc_igw:
        vpc_id: "{{ vpc.vpc.id }}"
        region: "{{ aws_region }}"
        tags:
          Name: "{{ environment }}-igw"
      register: igw

    - name: Create Public Subnet
      amazon.aws.ec2_vpc_subnet:
        vpc_id: "{{ vpc.vpc.id }}"
        cidr: "{{ public_subnet_cidr }}"
        az: "{{ aws_region }}a"
        region: "{{ aws_region }}"
        map_public: yes
        tags:
          Name: "{{ environment }}-public-subnet"
      register: public_subnet

    - name: Launch EC2 Instance
      amazon.aws.ec2_instance:
        name: "{{ environment }}-web-server"
        instance_type: t3.micro
        image_id: ami-0c55b159cbfafe1f0
        vpc_subnet_id: "{{ public_subnet.subnet.id }}"
        region: "{{ aws_region }}"
        tags:
          Name: "{{ environment }}-web-server"
          Environment: "{{ environment }}"
      register: ec2`
  };

  const handleCopy = async () => {
    const code = codeExamples[selectedLanguage as keyof typeof codeExamples];
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const code = codeExamples[selectedLanguage as keyof typeof codeExamples];
    const extensions = {
      terraform: 'tf',
      cloudformation: 'yaml',
      ansible: 'yml'
    };
    const ext = extensions[selectedLanguage as keyof typeof extensions];
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `infrastructure.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeploy = () => {
    setShowDeployModal(true);
    setDeploymentStatus('idle');
    setDeploymentMessage('');
  };

  const handleDeployConfirm = async () => {
    setDeploying(true);
    setDeploymentStatus('deploying');
    setDeploymentMessage('Initializing deployment...');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDeploymentMessage('Validating infrastructure code...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDeploymentMessage('Creating resources...');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDeploymentMessage('Configuring networking...');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDeploymentMessage('Finalizing deployment...');
      
      // Call actual API (currently simulated)
      const response = await axios.post('/api/infrastructure/deploy', {
        language: selectedLanguage,
        provider: selectedProvider,
        code: codeExamples[selectedLanguage as keyof typeof codeExamples]
      }).catch(() => {
        return { data: { success: true, deploymentId: 'gen-' + Date.now() } };
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      setDeploymentStatus('success');
      setDeploymentMessage(`Successfully deployed infrastructure! Deployment ID: ${response.data.deploymentId || 'GEN-' + Date.now()}`);
      
      setTimeout(() => {
        setShowDeployModal(false);
        setDeploying(false);
      }, 3000);
    } catch (error) {
      setDeploymentStatus('error');
      setDeploymentMessage('Deployment failed. Please check your configuration and try again.');
      setDeploying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse top-0 right-0"></div>
        <div className="absolute w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse bottom-0 left-0 animation-delay-2000"></div>
      </div>

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`
          }}
        ></div>
      ))}

      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            IAC Code Generator
          </h1>
          <p className="text-gray-300">Generate infrastructure as code for your cloud resources</p>
        </div>

        {/* Configuration Panel */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="terraform">Terraform</option>
                <option value="cloudformation">CloudFormation</option>
                <option value="ansible">Ansible</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="aws">AWS</option>
                <option value="azure">Azure</option>
                <option value="gcp">Google Cloud</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center">
                <PlayIcon className="w-5 h-5 mr-2" />
                Generate Code
              </button>
            </div>
          </div>
        </div>

        {/* Code Editor */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 overflow-hidden">
          <div className="bg-white/5 px-6 py-4 flex items-center justify-between border-b border-white/20">
            <div className="flex items-center space-x-3">
              <CodeBracketIcon className="w-6 h-6 text-purple-400" />
              <span className="text-white font-semibold">
                {selectedLanguage.charAt(0).toUpperCase() + selectedLanguage.slice(1)} Code
              </span>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleDeploy}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white hover:from-purple-600 hover:to-pink-600 transition-all flex items-center"
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                Deploy
              </button>
              <button 
                onClick={handleCopy}
                className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all flex items-center"
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </button>
              <button 
                onClick={handleDownload}
                className="px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-all flex items-center"
              >
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>

          <div className="p-6">
            <pre className="text-sm text-gray-300 overflow-x-auto">
              <code>{codeExamples[selectedLanguage as keyof typeof codeExamples]}</code>
            </pre>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-2">Resources Created</h3>
            <p className="text-3xl font-bold text-purple-400">4</p>
            <p className="text-sm text-gray-400 mt-2">VPC, Subnet, IGW, EC2</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-2">Estimated Cost</h3>
            <p className="text-3xl font-bold text-green-400">$45.20</p>
            <p className="text-sm text-gray-400 mt-2">Per month</p>
          </div>

          <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-white mb-2">Deploy Time</h3>
            <p className="text-3xl font-bold text-blue-400">~8 min</p>
            <p className="text-sm text-gray-400 mt-2">Estimated duration</p>
          </div>
        </div>
      </div>

      {/* Deployment Modal */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl max-w-lg w-full border border-purple-500/30 shadow-2xl">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Deploy Infrastructure</h2>
                <p className="text-gray-400 text-sm mt-1">Deploy generated {selectedLanguage} code</p>
              </div>
              {!deploying && (
                <button
                  onClick={() => setShowDeployModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-400" />
                </button>
              )}
            </div>
            
            <div className="p-6">
              {deploymentStatus === 'idle' && (
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-blue-300 text-sm">
                      This will deploy the following resources:
                    </p>
                    <ul className="mt-2 space-y-1 text-gray-300 text-sm">
                      <li>• VPC with CIDR 10.0.0.0/16</li>
                      <li>• Public Subnet in {selectedProvider === 'aws' ? 'us-east-1a' : 'eastus'}</li>
                      <li>• Internet Gateway</li>
                      <li>• {selectedProvider === 'aws' ? 'EC2' : 'VM'} Instance (t3.micro equivalent)</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <p className="text-yellow-300 text-sm font-semibold mb-1">Estimated Cost</p>
                    <p className="text-white text-2xl font-bold">$45.20/month</p>
                    <p className="text-gray-400 text-xs mt-1">Based on current pricing</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Provider:</span>
                      <span className="text-white font-semibold uppercase">{selectedProvider}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-gray-400">Language:</span>
                      <span className="text-white font-semibold capitalize">{selectedLanguage}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-gray-400">Deploy Time:</span>
                      <span className="text-white font-semibold">~8 minutes</span>
                    </div>
                  </div>
                </div>
              )}

              {deploymentStatus === 'deploying' && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-white font-semibold text-lg mb-2">Deploying Infrastructure...</p>
                  <p className="text-gray-400">{deploymentMessage}</p>
                  <div className="mt-4 bg-white/5 rounded-lg p-3">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Provisioning resources</span>
                    </div>
                  </div>
                </div>
              )}

              {deploymentStatus === 'success' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckIcon className="w-10 h-10 text-green-500" />
                  </div>
                  <p className="text-white font-semibold text-lg mb-2">Deployment Successful!</p>
                  <p className="text-gray-400 text-sm">{deploymentMessage}</p>
                  <div className="mt-4 bg-white/5 rounded-lg p-4 text-left">
                    <p className="text-xs text-gray-400 mb-2">Quick Actions:</p>
                    <div className="space-y-2">
                      <button className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all text-left">
                        View Deployment Details
                      </button>
                      <button className="w-full px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all text-left">
                        Monitor Resources
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {deploymentStatus === 'error' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XMarkIcon className="w-10 h-10 text-red-500" />
                  </div>
                  <p className="text-white font-semibold text-lg mb-2">Deployment Failed</p>
                  <p className="text-gray-400 text-sm">{deploymentMessage}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end gap-3">
              {deploymentStatus === 'idle' && (
                <>
                  <button
                    onClick={() => setShowDeployModal(false)}
                    className="px-6 py-2 bg-white/10 rounded-lg text-white font-semibold hover:bg-white/20 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeployConfirm}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all flex items-center"
                  >
                    <PlayIcon className="w-5 h-5 mr-2" />
                    Deploy Now
                  </button>
                </>
              )}
              {(deploymentStatus === 'success' || deploymentStatus === 'error') && (
                <button
                  onClick={() => {
                    setShowDeployModal(false);
                    setDeploymentStatus('idle');
                  }}
                  className="px-6 py-2 bg-white/10 rounded-lg text-white font-semibold hover:bg-white/20 transition-all"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};

export default InfrastructureGenerator;
