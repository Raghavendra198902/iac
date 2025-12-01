; NSIS Script for CMDB System Monitor
; Builds Windows installer on Linux!

;--------------------------------
; Include Modern UI
!include "MUI2.nsh"

;--------------------------------
; General

; Name and file
Name "CMDB System Monitor"
OutFile "dist/nsis/SystemMonitor-Setup-1.0.0.exe"

; Default installation folder
InstallDir "$PROGRAMFILES64\CMDB System Monitor"

; Get installation folder from registry if available
InstallDirRegKey HKCU "Software\CMDB\SystemMonitor" "InstallDir"

; Request application privileges
RequestExecutionLevel admin

; Compression
SetCompressor /SOLID lzma

; Version Information
VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "CMDB System Monitor"
VIAddVersionKey "CompanyName" "CMDB Project"
VIAddVersionKey "FileDescription" "System monitoring tool for CMDB"
VIAddVersionKey "FileVersion" "1.0.0"
VIAddVersionKey "ProductVersion" "1.0.0"
VIAddVersionKey "LegalCopyright" "Copyright © 2025 CMDB Project"

;--------------------------------
; Interface Settings

!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"

; Welcome page
!define MUI_WELCOMEPAGE_TITLE "Welcome to CMDB System Monitor Setup"
!define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of CMDB System Monitor.$\r$\n$\r$\nSystem Monitor collects and displays system information including CPU, memory, disk, and network statistics.$\r$\n$\r$\nClick Next to continue."

;--------------------------------
; Pages

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

;--------------------------------
; Languages

!insertmacro MUI_LANGUAGE "English"

;--------------------------------
; Version Information Display
!define MUI_FINISHPAGE_SHOWREADME ""
!define MUI_FINISHPAGE_SHOWREADME_NOTCHECKED
!define MUI_FINISHPAGE_SHOWREADME_TEXT "Create Desktop Shortcut"
!define MUI_FINISHPAGE_SHOWREADME_FUNCTION CreateDesktopShortcut

;--------------------------------
; Installer Sections

Section "CMDB System Monitor (required)" SecMain

  SectionIn RO
  
  ; Set output path to the installation directory
  SetOutPath "$INSTDIR"
  
  ; Put files there
  File "system-monitor.ps1"
  File "system-monitor.bat"
  File "README_SYSTEM_MONITOR.md"
  
  ; Create additional files
  FileOpen $0 "$INSTDIR\VERSION.txt" w
  FileWrite $0 "CMDB System Monitor$\r$\n"
  FileWrite $0 "Version: 1.0.0$\r$\n"
  FileWrite $0 "Release Date: November 26, 2025$\r$\n"
  FileClose $0
  
  ; Store installation folder
  WriteRegStr HKCU "Software\CMDB\SystemMonitor" "InstallDir" $INSTDIR
  WriteRegStr HKCU "Software\CMDB\SystemMonitor" "Version" "1.0.0"
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  ; Create Start Menu shortcuts
  CreateDirectory "$SMPROGRAMS\CMDB System Monitor"
  CreateShortcut "$SMPROGRAMS\CMDB System Monitor\System Monitor.lnk" "$INSTDIR\system-monitor.bat" "" "$INSTDIR\system-monitor.bat" 0
  CreateShortcut "$SMPROGRAMS\CMDB System Monitor\Uninstall.lnk" "$INSTDIR\Uninstall.exe" "" "$INSTDIR\Uninstall.exe" 0
  CreateShortcut "$SMPROGRAMS\CMDB System Monitor\README.lnk" "$INSTDIR\README_SYSTEM_MONITOR.md"
  
  ; Add to Add/Remove Programs
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBSystemMonitor" "DisplayName" "CMDB System Monitor"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBSystemMonitor" "DisplayVersion" "1.0.0"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBSystemMonitor" "Publisher" "CMDB Project"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBSystemMonitor" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBSystemMonitor" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBSystemMonitor" "DisplayIcon" "$INSTDIR\system-monitor.bat,0"
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBSystemMonitor" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBSystemMonitor" "NoRepair" 1
  
  ; Success message
  DetailPrint "Installation completed successfully!"
  
SectionEnd

;--------------------------------
; Desktop Shortcut Function
Function CreateDesktopShortcut
  CreateShortcut "$DESKTOP\CMDB System Monitor.lnk" "$INSTDIR\system-monitor.bat" "" "$INSTDIR\system-monitor.bat" 0
FunctionEnd

;--------------------------------
; Uninstaller Section

Section "Uninstall"

  ; Remove files and uninstaller
  Delete "$INSTDIR\system-monitor.ps1"
  Delete "$INSTDIR\system-monitor.bat"
  Delete "$INSTDIR\README_SYSTEM_MONITOR.md"
  Delete "$INSTDIR\VERSION.txt"
  Delete "$INSTDIR\Uninstall.exe"

  ; Remove shortcuts
  Delete "$SMPROGRAMS\CMDB System Monitor\System Monitor.lnk"
  Delete "$SMPROGRAMS\CMDB System Monitor\Uninstall.lnk"
  Delete "$SMPROGRAMS\CMDB System Monitor\README.lnk"
  Delete "$DESKTOP\CMDB System Monitor.lnk"
  RMDir "$SMPROGRAMS\CMDB System Monitor"

  ; Remove directories
  RMDir "$INSTDIR"

  ; Remove registry keys
  DeleteRegKey HKCU "Software\CMDB\SystemMonitor"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBSystemMonitor"

SectionEnd

;--------------------------------
; Descriptions

  ; Language strings
  LangString DESC_SecMain ${LANG_ENGLISH} "CMDB System Monitor application files"

  ; Assign language strings to sections
  !insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
    !insertmacro MUI_DESCRIPTION_TEXT ${SecMain} $(DESC_SecMain)
  !insertmacro MUI_FUNCTION_DESCRIPTION_END
