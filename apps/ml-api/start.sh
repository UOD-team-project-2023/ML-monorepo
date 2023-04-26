#!/bin/bash

cd /opt/monitorLizard/ML-Api

if [ -d "venv" ] 
then
    echo "venv found." 
else
    echo "creating venv."
    python3 -m venv venv
fi


git pull
source venv/bin/activate
pip3 install -r requirements.txt
prisma generate
python3 main.py
