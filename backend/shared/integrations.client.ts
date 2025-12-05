import axios from 'axios';

/**
 * ServiceNow Integration Client
 */

interface ServiceNowConfig {
  instanceUrl: string;
  username: string;
  password: string;
}

interface IncidentData {
  short_description: string;
  description: string;
  urgency?: number;
  impact?: number;
  category?: string;
  assignment_group?: string;
}

interface ChangeRequestData {
  short_description: string;
  description: string;
  type: string;
  risk: string;
  impact: string;
  justification: string;
  implementation_plan: string;
  backout_plan: string;
  test_plan: string;
}

export class ServiceNowClient {
  private config: ServiceNowConfig;
  private baseUrl: string;

  constructor(config: ServiceNowConfig) {
    this.config = config;
    this.baseUrl = `${config.instanceUrl}/api/now`;
  }

  private getAuthHeaders() {
    const auth = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  async createIncident(data: IncidentData): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/table/incident`,
        data,
        { headers: this.getAuthHeaders() }
      );
      console.log(`✅ ServiceNow incident created: ${response.data.result.number}`);
      return response.data.result;
    } catch (error: any) {
      console.error('Failed to create ServiceNow incident:', error.message);
      throw error;
    }
  }

  async createChangeRequest(data: ChangeRequestData): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/table/change_request`,
        data,
        { headers: this.getAuthHeaders() }
      );
      console.log(`✅ ServiceNow change request created: ${response.data.result.number}`);
      return response.data.result;
    } catch (error: any) {
      console.error('Failed to create ServiceNow change request:', error.message);
      throw error;
    }
  }

  async updateIncident(sysId: string, data: Partial<IncidentData>): Promise<any> {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/table/incident/${sysId}`,
        data,
        { headers: this.getAuthHeaders() }
      );
      console.log(`✅ ServiceNow incident updated: ${sysId}`);
      return response.data.result;
    } catch (error: any) {
      console.error('Failed to update ServiceNow incident:', error.message);
      throw error;
    }
  }

  async getIncident(sysId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/table/incident/${sysId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.result;
    } catch (error: any) {
      console.error('Failed to get ServiceNow incident:', error.message);
      throw error;
    }
  }

  async syncCMDB(configItem: any): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/table/cmdb_ci`,
        configItem,
        { headers: this.getAuthHeaders() }
      );
      console.log(`✅ CMDB item synced: ${response.data.result.sys_id}`);
      return response.data.result;
    } catch (error: any) {
      console.error('Failed to sync CMDB:', error.message);
      throw error;
    }
  }
}

/**
 * Jira Integration Client
 */

interface JiraConfig {
  host: string;
  username: string;
  apiToken: string;
}

interface JiraIssueData {
  project: string;
  summary: string;
  description: string;
  issueType: string;
  priority?: string;
  labels?: string[];
  assignee?: string;
}

export class JiraClient {
  private config: JiraConfig;
  private baseUrl: string;

  constructor(config: JiraConfig) {
    this.config = config;
    this.baseUrl = `${config.host}/rest/api/3`;
  }

  private getAuthHeaders() {
    const auth = Buffer.from(`${this.config.username}:${this.config.apiToken}`).toString('base64');
    return {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  async createIssue(data: JiraIssueData): Promise<any> {
    try {
      const payload = {
        fields: {
          project: { key: data.project },
          summary: data.summary,
          description: {
            type: 'doc',
            version: 1,
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: data.description }]
            }]
          },
          issuetype: { name: data.issueType },
          ...(data.priority && { priority: { name: data.priority } }),
          ...(data.labels && { labels: data.labels }),
          ...(data.assignee && { assignee: { name: data.assignee } }),
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/issue`,
        payload,
        { headers: this.getAuthHeaders() }
      );

      console.log(`✅ Jira issue created: ${response.data.key}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create Jira issue:', error.message);
      throw error;
    }
  }

  async updateIssue(issueKey: string, data: Partial<JiraIssueData>): Promise<any> {
    try {
      const payload = {
        fields: {
          ...(data.summary && { summary: data.summary }),
          ...(data.description && {
            description: {
              type: 'doc',
              version: 1,
              content: [{
                type: 'paragraph',
                content: [{ type: 'text', text: data.description }]
              }]
            }
          }),
          ...(data.priority && { priority: { name: data.priority } }),
          ...(data.labels && { labels: data.labels }),
        }
      };

      await axios.put(
        `${this.baseUrl}/issue/${issueKey}`,
        payload,
        { headers: this.getAuthHeaders() }
      );

      console.log(`✅ Jira issue updated: ${issueKey}`);
      return true;
    } catch (error: any) {
      console.error('Failed to update Jira issue:', error.message);
      throw error;
    }
  }

  async addComment(issueKey: string, comment: string): Promise<any> {
    try {
      const payload = {
        body: {
          type: 'doc',
          version: 1,
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: comment }]
          }]
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/issue/${issueKey}/comment`,
        payload,
        { headers: this.getAuthHeaders() }
      );

      console.log(`✅ Comment added to Jira issue: ${issueKey}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to add comment to Jira:', error.message);
      throw error;
    }
  }

  async transitionIssue(issueKey: string, transitionId: string): Promise<any> {
    try {
      await axios.post(
        `${this.baseUrl}/issue/${issueKey}/transitions`,
        { transition: { id: transitionId } },
        { headers: this.getAuthHeaders() }
      );

      console.log(`✅ Jira issue transitioned: ${issueKey}`);
      return true;
    } catch (error: any) {
      console.error('Failed to transition Jira issue:', error.message);
      throw error;
    }
  }

  async getIssue(issueKey: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/issue/${issueKey}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to get Jira issue:', error.message);
      throw error;
    }
  }
}

/**
 * Slack Integration Client
 */

interface SlackConfig {
  webhookUrl: string;
  botToken?: string;
}

export class SlackClient {
  private config: SlackConfig;

  constructor(config: SlackConfig) {
    this.config = config;
  }

  async sendMessage(message: string, channel?: string): Promise<any> {
    try {
      const payload = {
        text: message,
        ...(channel && { channel }),
      };

      const response = await axios.post(this.config.webhookUrl, payload);
      console.log('✅ Slack message sent');
      return response.data;
    } catch (error: any) {
      console.error('Failed to send Slack message:', error.message);
      throw error;
    }
  }

  async sendRichMessage(blocks: any[], channel?: string): Promise<any> {
    try {
      const payload = {
        blocks,
        ...(channel && { channel }),
      };

      const response = await axios.post(this.config.webhookUrl, payload);
      console.log('✅ Slack rich message sent');
      return response.data;
    } catch (error: any) {
      console.error('Failed to send Slack rich message:', error.message);
      throw error;
    }
  }

  async sendAlert(severity: string, title: string, description: string): Promise<any> {
    const colors: { [key: string]: string } = {
      critical: '#FF0000',
      high: '#FF6600',
      medium: '#FFA500',
      low: '#FFFF00',
      info: '#00FF00',
    };

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🚨 ${title}`,
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Severity:*\n${severity.toUpperCase()}`,
          },
          {
            type: 'mrkdwn',
            text: `*Time:*\n${new Date().toISOString()}`,
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Description:*\n${description}`,
        },
      },
    ];

    return this.sendRichMessage(blocks);
  }
}

// Initialize clients
let serviceNowClient: ServiceNowClient | null = null;
let jiraClient: JiraClient | null = null;
let slackClient: SlackClient | null = null;

export const initIntegrations = () => {
  // ServiceNow
  if (process.env.SERVICENOW_URL && process.env.SERVICENOW_USERNAME && process.env.SERVICENOW_PASSWORD) {
    serviceNowClient = new ServiceNowClient({
      instanceUrl: process.env.SERVICENOW_URL,
      username: process.env.SERVICENOW_USERNAME,
      password: process.env.SERVICENOW_PASSWORD,
    });
    console.log('✅ ServiceNow integration initialized');
  }

  // Jira
  if (process.env.JIRA_URL && process.env.JIRA_USERNAME && process.env.JIRA_API_TOKEN) {
    jiraClient = new JiraClient({
      host: process.env.JIRA_URL,
      username: process.env.JIRA_USERNAME,
      apiToken: process.env.JIRA_API_TOKEN,
    });
    console.log('✅ Jira integration initialized');
  }

  // Slack
  if (process.env.SLACK_WEBHOOK_URL) {
    slackClient = new SlackClient({
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      botToken: process.env.SLACK_BOT_TOKEN,
    });
    console.log('✅ Slack integration initialized');
  }
};

export const getServiceNow = () => serviceNowClient;
export const getJira = () => jiraClient;
export const getSlack = () => slackClient;
