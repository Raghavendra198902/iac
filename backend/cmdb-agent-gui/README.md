# CMDB Agent GUI

Desktop application for managing the CMDB monitoring agent.

## Features

- 🖥️ Cross-platform desktop application (Windows, Linux, macOS)
- 🎛️ Easy agent management (start/stop)
- 📊 Real-time metrics visualization (CPU, memory, disk, network)
- ⚙️ Configuration management
- 📝 Live log monitoring
- 🔔 System tray integration
- 🚀 Auto-start on system boot

## Development

Install dependencies:
```bash
npm install
```

Run in development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run electron:build
```

## Usage

1. **Configuration**: Configure API URL, API Key, and Agent ID in the Configuration tab
2. **Start Agent**: Click "Start Agent" button to begin monitoring
3. **Dashboard**: View real-time metrics and agent status
4. **Logs**: Monitor agent logs in real-time
5. **System Tray**: Application runs in system tray when minimized

## Configuration

The agent requires the following configuration:

- **API URL**: CMDB backend API endpoint (e.g., http://192.168.1.10:3000)
- **API Key**: Authentication key for CMDB API
- **Agent ID**: Unique identifier for this agent
- **Agent Name**: Human-readable name for the agent

## Auto-start

Enable "Auto-start agent on application launch" in configuration to automatically start monitoring when the application launches.

## Building

### Windows
```bash
npm run electron:build -- --win
```

### Linux
```bash
npm run electron:build -- --linux
```

### macOS
```bash
npm run electron:build -- --mac
```

## Tech Stack

- Electron 28
- React 19
- TypeScript 5
- Vite 7
- Tailwind CSS 3
- Lucide Icons
