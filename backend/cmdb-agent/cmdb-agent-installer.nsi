; NSIS Installer Script for CMDB Agent
; Creates a Windows .exe installer that can be built on Linux
;
; Build command: makensis cmdb-agent-installer.nsi
; Or: apt-get install nsis && makensis cmdb-agent-installer.nsi

;--------------------------------
; General Attributes
Name "CMDB Agent"
OutFile "dist/CMDBAgent-Setup-1.0.0.exe"
InstallDir "$PROGRAMFILES64\CMDB Agent"
InstallDirRegKey HKLM "Software\IAC Dharma\CMDB Agent" "InstallPath"
RequestExecutionLevel admin
Unicode True

;--------------------------------
; Version Information
VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "CMDB Agent"
VIAddVersionKey "CompanyName" "IAC Dharma"
VIAddVersionKey "LegalCopyright" "© 2025 IAC Dharma"
VIAddVersionKey "FileDescription" "CMDB Agent Installer"
VIAddVersionKey "FileVersion" "1.0.0.0"
VIAddVersionKey "ProductVersion" "1.0.0.0"

;--------------------------------
; Modern UI
!include "MUI2.nsh"

; UI Settings
!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"

; Welcome page
!insertmacro MUI_PAGE_WELCOME

; License page
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"

; Directory page
!insertmacro MUI_PAGE_DIRECTORY

; Instfiles page
!insertmacro MUI_PAGE_INSTFILES

; Finish page
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_TEXT "Start CMDB Agent Service"
!define MUI_FINISHPAGE_RUN_FUNCTION "LaunchService"
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Language
!insertmacro MUI_LANGUAGE "English"

;--------------------------------
; Installer Sections

Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  SetOverwrite on
  
  ; Create the agent script
  FileOpen $0 "$INSTDIR\cmdb-agent.ps1" w
  FileWrite $0 "# CMDB Agent Main Script$\r$\n"
  FileWrite $0 "$$version = '1.0.0'$\r$\n"
  FileWrite $0 "$$serverUrl = 'http://192.168.1.9:3001'$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "Write-Host 'CMDB Agent v' $$version ' running...'$\r$\n"
  FileWrite $0 "Write-Host 'Server: ' $$serverUrl$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "while ($$true) {$\r$\n"
  FileWrite $0 "    try {$\r$\n"
  FileWrite $0 "        $$hostname = $$env:COMPUTERNAME$\r$\n"
  FileWrite $0 "        $$os = (Get-WmiObject Win32_OperatingSystem).Caption$\r$\n"
  FileWrite $0 "        $$memory = [math]::Round((Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)$\r$\n"
  FileWrite $0 "        $$cpu = (Get-WmiObject Win32_Processor).Name$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "        $$data = @{$\r$\n"
  FileWrite $0 "            hostname = $$hostname$\r$\n"
  FileWrite $0 "            os = $$os$\r$\n"
  FileWrite $0 "            memory = '$$memory GB'$\r$\n"
  FileWrite $0 "            cpu = $$cpu$\r$\n"
  FileWrite $0 "            version = $$version$\r$\n"
  FileWrite $0 "            timestamp = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')$\r$\n"
  FileWrite $0 "        }$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "        $$json = ConvertTo-Json $$data$\r$\n"
  FileWrite $0 "        Invoke-RestMethod -Uri '$$serverUrl/api/agents/heartbeat' -Method POST -Body $$json -ContentType 'application/json' -ErrorAction SilentlyContinue$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "        Write-Host '[' (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') '] Heartbeat sent'$\r$\n"
  FileWrite $0 "    }$\r$\n"
  FileWrite $0 "    catch {$\r$\n"
  FileWrite $0 "        Write-Host '[' (Get-Date -Format 'yyyy-MM-dd HH:mm:ss') '] Error: ' $$_$\r$\n"
  FileWrite $0 "    }$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "    Start-Sleep -Seconds 60$\r$\n"
  FileWrite $0 "}$\r$\n"
  FileClose $0
  
  ; Create uninstaller script
  FileOpen $0 "$INSTDIR\uninstall-service.ps1" w
  FileWrite $0 "Unregister-ScheduledTask -TaskName 'CMDBAgent' -Confirm:$$false -ErrorAction SilentlyContinue$\r$\n"
  FileClose $0
  
  ; Create version file
  FileOpen $0 "$INSTDIR\VERSION.txt" w
  FileWrite $0 "1.0.0$\r$\n"
  FileClose $0
  
  ; Create README
  FileOpen $0 "$INSTDIR\README.txt" w
  FileWrite $0 "CMDB Agent v1.0.0$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "Installation Path: $INSTDIR$\r$\n"
  FileWrite $0 "Server URL: http://192.168.1.9:3001$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "Service is installed as Scheduled Task: CMDBAgent$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "To check status:$\r$\n"
  FileWrite $0 "  Get-ScheduledTaskInfo -TaskName CMDBAgent$\r$\n"
  FileWrite $0 "$\r$\n"
  FileWrite $0 "To uninstall:$\r$\n"
  FileWrite $0 "  Run uninstall.exe or use Add/Remove Programs$\r$\n"
  FileClose $0
  
  ; Install service
  nsExec::ExecToLog 'powershell -ExecutionPolicy Bypass -Command "$$action = New-ScheduledTaskAction -Execute \"powershell.exe\" -Argument \"-ExecutionPolicy Bypass -NoProfile -File $INSTDIR\cmdb-agent.ps1\"; $$trigger = New-ScheduledTaskTrigger -AtStartup; $$principal = New-ScheduledTaskPrincipal -UserId \"SYSTEM\" -LogonType ServiceAccount -RunLevel Highest; $$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1); Register-ScheduledTask -TaskName \"CMDBAgent\" -Action $$action -Trigger $$trigger -Principal $$principal -Settings $$settings -Force"'
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\uninstall.exe"
  
  ; Write registry keys
  WriteRegStr HKLM "Software\IAC Dharma\CMDB Agent" "InstallPath" "$INSTDIR"
  WriteRegStr HKLM "Software\IAC Dharma\CMDB Agent" "Version" "1.0.0"
  WriteRegStr HKLM "Software\IAC Dharma\CMDB Agent" "ServerURL" "http://192.168.1.9:3001"
  
  ; Add to Add/Remove Programs
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBAgent" "DisplayName" "CMDB Agent"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBAgent" "DisplayVersion" "1.0.0"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBAgent" "Publisher" "IAC Dharma"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBAgent" "UninstallString" "$INSTDIR\uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBAgent" "InstallLocation" "$INSTDIR"
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBAgent" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBAgent" "NoRepair" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBAgent" "EstimatedSize" 1024
SectionEnd

;--------------------------------
; Uninstaller Section

Section "Uninstall"
  ; Stop and remove service
  nsExec::ExecToLog 'powershell -ExecutionPolicy Bypass -File "$INSTDIR\uninstall-service.ps1"'
  
  ; Remove files
  Delete "$INSTDIR\cmdb-agent.ps1"
  Delete "$INSTDIR\uninstall-service.ps1"
  Delete "$INSTDIR\VERSION.txt"
  Delete "$INSTDIR\README.txt"
  Delete "$INSTDIR\uninstall.exe"
  
  ; Remove directory
  RMDir "$INSTDIR"
  
  ; Remove registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBAgent"
  DeleteRegKey HKLM "Software\IAC Dharma\CMDB Agent"
SectionEnd

;--------------------------------
; Functions

Function LaunchService
  nsExec::ExecToLog 'powershell -Command "Start-ScheduledTask -TaskName CMDBAgent"'
FunctionEnd

Function .onInit
  ; Initialization
FunctionEnd
