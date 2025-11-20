; CMDB Agent NSIS Installer Script
; Requires NSIS: https://nsis.sourceforge.io/

!define PRODUCT_NAME "CMDB Agent"
!define PRODUCT_VERSION "1.0.0"
!define PRODUCT_PUBLISHER "IAC Dharma"
!define PRODUCT_WEB_SITE "https://github.com/yourusername/iac-dharma"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\cmdb-agent.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKLM"

SetCompressor lzma

; MUI 2.0 compatible
!include "MUI2.nsh"

; MUI Settings
!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"

; Welcome page
!insertmacro MUI_PAGE_WELCOME
; License page
!insertmacro MUI_PAGE_LICENSE "LICENSE"
; Directory page
!insertmacro MUI_PAGE_DIRECTORY
; Custom page for configuration
Page custom ConfigPage ConfigPageLeave
; Instfiles page
!insertmacro MUI_PAGE_INSTFILES
; Finish page
!define MUI_FINISHPAGE_RUN "$INSTDIR\cmdb-agent-win.exe"
!define MUI_FINISHPAGE_SHOWREADME "$INSTDIR\README.md"
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_INSTFILES

; Language files
!insertmacro MUI_LANGUAGE "English"

; Variables
Var Dialog
Var ApiUrlText
Var ApiUrl
Var ApiKeyText
Var ApiKey
Var AgentNameText
Var AgentName

; Installer attributes
Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "dist\cmdb-agent-setup-${PRODUCT_VERSION}.exe"
InstallDir "$PROGRAMFILES64\CMDB Agent"
InstallDirRegKey HKLM "${PRODUCT_DIR_REGKEY}" ""
ShowInstDetails show
ShowUnInstDetails show

; Configuration page
Function ConfigPage
  !insertmacro MUI_HEADER_TEXT "Configuration" "Enter your CMDB API details"
  
  nsDialogs::Create 1018
  Pop $Dialog
  
  ${If} $Dialog == error
    Abort
  ${EndIf}
  
  ; API URL
  ${NSD_CreateLabel} 0 0 100% 12u "CMDB API URL:"
  Pop $0
  
  ${NSD_CreateText} 0 15u 100% 12u "http://localhost:3000/api/cmdb"
  Pop $ApiUrlText
  
  ; API Key
  ${NSD_CreateLabel} 0 35u 100% 12u "API Key:"
  Pop $0
  
  ${NSD_CreateText} 0 50u 100% 12u ""
  Pop $ApiKeyText
  
  ; Agent Name
  ${NSD_CreateLabel} 0 70u 100% 12u "Agent Name:"
  Pop $0
  
  ${NSD_CreateText} 0 85u 100% 12u "$COMPUTERNAME"
  Pop $AgentNameText
  
  nsDialogs::Show
FunctionEnd

Function ConfigPageLeave
  ${NSD_GetText} $ApiUrlText $ApiUrl
  ${NSD_GetText} $ApiKeyText $ApiKey
  ${NSD_GetText} $AgentNameText $AgentName
FunctionEnd

; Main install section
Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  SetOverwrite ifnewer
  
  ; Copy executable
  File "dist\cmdb-agent-win.exe"
  
  ; Copy documentation
  File "README.md"
  File /oname=LICENSE.txt "LICENSE"
  
  ; Copy example config
  File "config.example.json"
  
  ; Create logs directory
  CreateDirectory "$INSTDIR\logs"
  
  ; Create config.json with user input
  FileOpen $0 "$INSTDIR\config.json" w
  FileWrite $0 "{$\r$\n"
  FileWrite $0 '  "apiUrl": "$ApiUrl",$\r$\n'
  FileWrite $0 '  "apiKey": "$ApiKey",$\r$\n'
  FileWrite $0 '  "agentId": "agent-$COMPUTERNAME",$\r$\n'
  FileWrite $0 '  "agentName": "$AgentName",$\r$\n'
  FileWrite $0 '  "syncInterval": 300000,$\r$\n'
  FileWrite $0 '  "discoveryInterval": 3600000,$\r$\n'
  FileWrite $0 '  "logLevel": "info"$\r$\n'
  FileWrite $0 "}$\r$\n"
  FileClose $0
  
  ; Create start menu shortcuts
  CreateDirectory "$SMPROGRAMS\CMDB Agent"
  CreateShortCut "$SMPROGRAMS\CMDB Agent\CMDB Agent.lnk" "$INSTDIR\cmdb-agent-win.exe"
  CreateShortCut "$SMPROGRAMS\CMDB Agent\Configure.lnk" "notepad.exe" "$INSTDIR\config.json"
  CreateShortCut "$SMPROGRAMS\CMDB Agent\View Logs.lnk" "explorer.exe" "$INSTDIR\logs"
  CreateShortCut "$SMPROGRAMS\CMDB Agent\README.lnk" "$INSTDIR\README.md"
  CreateShortCut "$SMPROGRAMS\CMDB Agent\Uninstall.lnk" "$INSTDIR\uninst.exe"
  
  ; Create desktop shortcut (optional)
  CreateShortCut "$DESKTOP\CMDB Agent.lnk" "$INSTDIR\cmdb-agent-win.exe"
SectionEnd

; Post-install section
Section -Post
  WriteUninstaller "$INSTDIR\uninst.exe"
  WriteRegStr HKLM "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\cmdb-agent-win.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayName" "$(^Name)"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninst.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\cmdb-agent-win.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
SectionEnd

; Uninstaller section
Function un.onUninstSuccess
  HideWindow
  MessageBox MB_ICONINFORMATION|MB_OK "$(^Name) was successfully removed from your computer."
FunctionEnd

Function un.onInit
  MessageBox MB_ICONQUESTION|MB_YESNO|MB_DEFBUTTON2 "Are you sure you want to completely remove $(^Name) and all of its components?" IDYES +2
  Abort
FunctionEnd

Section Uninstall
  ; Stop the agent if running
  nsExec::ExecToLog 'taskkill /F /IM cmdb-agent-win.exe'
  
  ; Delete files
  Delete "$INSTDIR\cmdb-agent-win.exe"
  Delete "$INSTDIR\config.json"
  Delete "$INSTDIR\config.example.json"
  Delete "$INSTDIR\README.md"
  Delete "$INSTDIR\LICENSE.txt"
  Delete "$INSTDIR\uninst.exe"
  
  ; Delete shortcuts
  Delete "$SMPROGRAMS\CMDB Agent\*.*"
  Delete "$DESKTOP\CMDB Agent.lnk"
  
  ; Remove directories
  RMDir "$SMPROGRAMS\CMDB Agent"
  RMDir /r "$INSTDIR\logs"
  RMDir "$INSTDIR"
  
  ; Delete registry keys
  DeleteRegKey ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}"
  DeleteRegKey HKLM "${PRODUCT_DIR_REGKEY}"
  
  SetAutoClose true
SectionEnd
