; CMDB Agent Windows Installer Script
; Requires Inno Setup: https://jrsoftware.org/isinfo.php

#define MyAppName "CMDB Agent"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "IAC Dharma"
#define MyAppURL "https://github.com/yourusername/iac-dharma"
#define MyAppExeName "cmdb-agent.exe"

[Setup]
AppId={{8F7B3C2D-9E4A-4B6F-8C5D-1A2B3C4D5E6F}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
LicenseFile=LICENSE
OutputDir=dist
OutputBaseFilename=cmdb-agent-setup-{#MyAppVersion}
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
SetupIconFile=assets\icon.ico
UninstallDisplayIcon={app}\{#MyAppExeName}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "startupicon"; Description: "Start CMDB Agent on system startup"; GroupDescription: "Additional options:"; Flags: unchecked

[Files]
Source: "dist\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "node_modules\*"; DestDir: "{app}\node_modules"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "README.md"; DestDir: "{app}"; Flags: ignoreversion isreadme
Source: "config.example.json"; DestDir: "{app}"; Flags: ignoreversion

[Dirs]
Name: "{app}\logs"; Permissions: users-full

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Configure CMDB Agent"; Filename: "notepad.exe"; Parameters: "{app}\config.json"
Name: "{group}\View Logs"; Filename: "explorer.exe"; Parameters: "{app}\logs"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\setup-config.bat"; Description: "Configure CMDB Agent"; Flags: postinstall shellexec skipifsilent
Filename: "{app}\{#MyAppExeName}"; Description: "Start CMDB Agent"; Flags: postinstall nowait skipifsilent

[UninstallRun]
Filename: "taskkill"; Parameters: "/F /IM node.exe /T"; Flags: runhidden

[Registry]
Root: HKLM; Subkey: "Software\{#MyAppPublisher}\{#MyAppName}"; Flags: uninsdeletekeyifempty
Root: HKLM; Subkey: "Software\{#MyAppPublisher}\{#MyAppName}"; ValueType: string; ValueName: "InstallPath"; ValueData: "{app}"
Root: HKLM; Subkey: "Software\{#MyAppPublisher}\{#MyAppName}"; ValueType: string; ValueName: "Version"; ValueData: "{#MyAppVersion}"

; Auto-start on Windows startup (if task selected)
Root: HKCU; Subkey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "{#MyAppName}"; ValueData: """{app}\{#MyAppExeName}"""; Flags: uninsdeletevalue; Tasks: startupicon

[Code]
var
  ConfigPage: TInputQueryWizardPage;
  
procedure InitializeWizard;
begin
  ConfigPage := CreateInputQueryPage(wpSelectTasks,
    'CMDB Configuration', 'Enter your CMDB API details',
    'Please provide the CMDB API URL and API Key for this agent.');
  
  ConfigPage.Add('API URL:', False);
  ConfigPage.Values[0] := 'http://localhost:3000/api/cmdb';
  
  ConfigPage.Add('API Key:', False);
  ConfigPage.Values[1] := '';
  
  ConfigPage.Add('Agent Name:', False);
  ConfigPage.Values[2] := GetComputerNameString;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ConfigFile: String;
  ConfigContent: TStringList;
begin
  if CurStep = ssPostInstall then
  begin
    ConfigFile := ExpandConstant('{app}\config.json');
    ConfigContent := TStringList.Create;
    try
      ConfigContent.Add('{');
      ConfigContent.Add('  "apiUrl": "' + ConfigPage.Values[0] + '",');
      ConfigContent.Add('  "apiKey": "' + ConfigPage.Values[1] + '",');
      ConfigContent.Add('  "agentId": "agent-' + GetComputerNameString + '",');
      ConfigContent.Add('  "agentName": "' + ConfigPage.Values[2] + '",');
      ConfigContent.Add('  "syncInterval": 300000,');
      ConfigContent.Add('  "discoveryInterval": 3600000,');
      ConfigContent.Add('  "logLevel": "info"');
      ConfigContent.Add('}');
      ConfigContent.SaveToFile(ConfigFile);
    finally
      ConfigContent.Free;
    end;
  end;
end;
