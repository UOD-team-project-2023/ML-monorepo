# Define variables for the Python executable and download URL
$ipPort = "<IP>:<PORT>" # Replace with the IP and port of your Monitor Lizard instance
$downloadUrl = "http://$ipPort/file/client.zip"
$pythonDownloadURL = "https://www.python.org/ftp/python/3.10.0/python-3.10.0-amd64.exe"
$pythonExe = "python.exe"
$serviceName = "Monitor Lizard Probe"
$serviceDesc = "Monitor Lizard Probe"
$installDir = "C:\Program Files\Monitor Lizard Daemon"
$nssmDir =  "C:\Program Files\Monitor Lizard Daemon\nssm"
$logDir = "C:\Program Files\Monitor Lizard Daemon\logs"
$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
$ErrorActionPreference = "Stop"
# Define the task name, description, and command
$taskName = "MonitorLizardUpdate"
$taskDesc = "Update MonitorLizard every 24 hours at 3am"
$taskCommand = "Start-Process powershell.exe -Verb RunAs -ArgumentList '-ExecutionPolicy Bypass -Command (Invoke-WebRequest -Uri ''http://$ipPort/install.ps1'' -UseBasicParsing | Invoke-Expression)'"

# Check if Python is installed, and if not, download and install it
if (-not (Test-Path $pythonExe)) {
    echo "Python not found. Installing Python 3.10."
    Invoke-WebRequest -Uri $pythonDownloadURL -OutFile "$env:TEMP\python-3.10.0-amd64.exe"
    Start-Process -FilePath "$env:TEMP\python-3.10.0-amd64.exe" -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait
} else {
    echo "Python found."
}

# Download and extract the application zip file
echo "Downloading client zip."
Invoke-WebRequest -Uri $downloadUrl -OutFile "$env:TEMP\client.zip"

if ($service.Length -gt 0) {
   echo "Existing service found. Stopping service."
   Stop-Service -Name $serviceName -Force
}

echo "Extracting client zip."
Expand-Archive -Path "$env:TEMP\client.zip" -DestinationPath $installDir -Force -ErrorAction SilentlyContinue

cd $nssmDir

if($service -eq $null)
{
    # Create the service
    echo "Creating service."
    ./nssm.exe install $serviceName "$installDir\start.bat"
    ./nssm.exe set $serviceName Description $serviceDesc
    ./nssm.exe set $serviceName Start SERVICE_AUTO_START
    ./nssm.exe set $serviceName AppExit Default Exit
    ./nssm.exe set $serviceName AppStdout "$logDir\service.log"
} 

# Create the trigger for the scheduled task
$trigger = New-ScheduledTaskTrigger -Daily -At 3am

# Create the action for the scheduled task
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $taskCommand

# Register the scheduled task with the Task Scheduler
Register-ScheduledTask -TaskName $taskName -Description $taskDesc -Trigger $trigger -Action $action -RunLevel Highest

# Start the service
echo "Starting service."
./nssm.exe start $serviceName