#!/bin/bash

# Define variables
SERVICE_NAME="mld"
URL="http://192.168.60.114:8001/file/client.zip"
INSTALL_DIR="/opt/MonitorLizardDaemon"
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"
SERVICE_USER="monitorlizarddaemon"
SERVICE_GROUP="monitorlizarddaemon"


# Check if Python is installed, and if not, download and install it
if ! command -v python3 &> /dev/null
then
    echo "Python3 is not installed. Installing now."
    apt-get update
    apt-get install python3
else
    echo "Python3 is already installed."
fi

# Create a system user for the service
useradd --system --no-create-home --user-group $SERVICE_USER

# Create installation directory
mkdir -p $INSTALL_DIR

# Download the zip file from URL and extract to installation directory
wget -O "$INSTALL_DIR/$SERVICE_NAME.zip" $URL
unzip -o "$INSTALL_DIR/$SERVICE_NAME.zip" -d $INSTALL_DIR
rm "$INSTALL_DIR/$SERVICE_NAME.zip"

# Set ownership and permissions for installation directory
chown -R $SERVICE_USER:$SERVICE_GROUP $INSTALL_DIR
chmod -R 755 $INSTALL_DIR

# Create the service file
cat << EOF > $SERVICE_FILE
[Unit]
Description=Monitor Lizard Daemon

[Service]
ExecStart=/bin/bash $INSTALL_DIR/start.sh
WorkingDirectory=$INSTALL_DIR
Restart=always
User=$SERVICE_USER

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd to pick up new service file
systemctl daemon-reload

# Enable the service to start on boot
systemctl enable $SERVICE_NAME.service

# Start the service
systemctl start $SERVICE_NAME.service
