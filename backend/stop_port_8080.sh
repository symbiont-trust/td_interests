#!/bin/bash

# Script to stop any process running on port 8080

echo "Checking for processes running on port 8080..."

# Find process using port 8080
PID=$(lsof -ti:8080)

if [ -z "$PID" ]; then
    echo "No process found running on port 8080"
else
    echo "Found process $PID running on port 8080"
    echo "Stopping process..."
    kill $PID
    
    # Wait a moment and check if it stopped
    sleep 2
    
    # Check if process still exists
    if kill -0 $PID 2>/dev/null; then
        echo "Process still running, force killing..."
        kill -9 $PID
    fi
    
    # Verify port is free
    NEW_PID=$(lsof -ti:8080)
    if [ -z "$NEW_PID" ]; then
        echo "✅ Port 8080 is now free"
    else
        echo "❌ Port 8080 is still in use by process $NEW_PID"
    fi
fi