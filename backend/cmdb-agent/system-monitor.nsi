; NSIS Installer Script for CMDB System Monitor
; Builds on Linux with makensis command
; Creates professional Windows installer with Start Menu, Desktop shortcuts, and uninstaller

;--------------------------------
; Include Modern UI
!include "MUI2.nsh"

;--------------------------------
; General Configuration
Name "CMDB System Monitor"
OutFile "dist/SystemMonitor-Setup.exe"
InstallDir "$PROGRAMFILES64\CMDB\SystemMonitor"
InstallDirRegKey HKLM "Software\CMDB\SystemMonitor" "Install_Dir"
RequestExecutionLevel admin
ShowInstDetails show
ShowUnInstDetails show

; Version Information
VIProductVersion "1.0.0.0"
VIAddVersionKey "ProductName" "CMDB System Monitor"
VIAddVersionKey "CompanyName" "CMDB Enterprise"
VIAddVersionKey "FileDescription" "CMDB System Monitor Installer"
VIAddVersionKey "FileVersion" "1.0.0.0"
VIAddVersionKey "ProductVersion" "1.0.0"
VIAddVersionKey "LegalCopyright" "Copyright © 2024"

;--------------------------------
; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Header\nsis.bmp"
!define MUI_WELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\win.bmp"

;--------------------------------
; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

;--------------------------------
; Languages
!insertmacro MUI_LANGUAGE "English"

;--------------------------------
; Installer Sections

Section "CMDB System Monitor (required)" SecMain
  SectionIn RO
  
  ; Set output path to installation directory
  SetOutPath "$INSTDIR"
  
  ; Copy main files
  File "system-monitor.ps1"
  File "system-monitor.bat"
  File "README.md"
  
  ; Create LICENSE.txt if it doesn't exist
  IfFileExists "LICENSE.txt" +2 0
  FileOpen $0 "$INSTDIR\LICENSE.txt" w
  FileClose $0
  
  ; Write registry keys for uninstaller
  WriteRegStr HKLM "Software\CMDB\SystemMonitor" "Install_Dir" "$INSTDIR"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBSystemMonitor" "DisplayName" "CMDB System Monitor"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBSystemMonitor" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBSystemMonitor" "DisplayIcon" "$INSTDIR\system-monitor.bat"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBSystemMonitor" "Publisher" "CMDB Enterprise"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBSystemMonitor" "DisplayVersion" "1.0.0"
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBSystemMonitor" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBSystemMonitor" "NoRepair" 1
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\uninstall.exe"
  
SectionEnd

Section "Start Menu Shortcuts" SecStartMenu
  CreateDirectory "$SMPROGRAMS\CMDB System Monitor"
  CreateShortcut "$SMPROGRAMS\CMDB System Monitor\System Monitor.lnk" "$INSTDIR\system-monitor.bat" "" "" 0
  CreateShortcut "$SMPROGRAMS\CMDB System Monitor\Uninstall.lnk" "$INSTDIR\uninstall.exe" "" "" 0
  CreateShortcut "$SMPROGRAMS\CMDB System Monitor\README.lnk" "$INSTDIR\README.md" "" "" 0
SectionEnd

Section "Desktop Shortcut" SecDesktop
  CreateShortcut "$DESKTOP\CMDB System Monitor.lnk" "$INSTDIR\system-monitor.bat" "" "" 0
SectionEnd

Section "Add to PATH" SecPath
  ; Add to system PATH
  EnVar::AddValue "PATH" "$INSTDIR"
  Pop $0
SectionEnd

;--------------------------------
; Descriptions

LangString DESC_SecMain ${LANG_ENGLISH} "Core CMDB System Monitor files (required)."
LangString DESC_SecStartMenu ${LANG_ENGLISH} "Add shortcuts to Start Menu."
LangString DESC_SecDesktop ${LANG_ENGLISH} "Add shortcut to Desktop."
LangString DESC_SecPath ${LANG_ENGLISH} "Add installation directory to system PATH."

!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SecMain} $(DESC_SecMain)
  !insertmacro MUI_DESCRIPTION_TEXT ${SecStartMenu} $(DESC_SecStartMenu)
  !insertmacro MUI_DESCRIPTION_TEXT ${SecDesktop} $(DESC_SecDesktop)
  !insertmacro MUI_DESCRIPTION_TEXT ${SecPath} $(DESC_SecPath)
!insertmacro MUI_FUNCTION_DESCRIPTION_END

;--------------------------------
; Uninstaller Section

Section "Uninstall"
  
  ; Remove files
  Delete "$INSTDIR\system-monitor.ps1"
  Delete "$INSTDIR\system-monitor.bat"
  Delete "$INSTDIR\README.md"
  Delete "$INSTDIR\LICENSE.txt"
  Delete "$INSTDIR\uninstall.exe"
  
  ; Remove shortcuts
  Delete "$SMPROGRAMS\CMDB System Monitor\*.*"
  Delete "$DESKTOP\CMDB System Monitor.lnk"
  RMDir "$SMPROGRAMS\CMDB System Monitor"
  
  ; Remove directories
  RMDir "$INSTDIR"
  
  ; Remove registry keys
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\CMDBSystemMonitor"
  DeleteRegKey HKLM "Software\CMDB\SystemMonitor"
  
  ; Remove from PATH
  EnVar::DeleteValue "PATH" "$INSTDIR"
  Pop $0
  
SectionEnd
