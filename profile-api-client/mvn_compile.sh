#!/bin/bash

# Setup Java 20 environment for the profile-api-client
export JAVA_20_HOME=$(/usr/libexec/java_home -v20)
export JAVA_HOME=$JAVA_20_HOME

echo "Java environment setup complete:"
echo "JAVA_20_HOME: $JAVA_20_HOME"
echo "JAVA_HOME: $JAVA_HOME"
echo "Java version: $(java --version | head -n1)"

# Run Maven with the correct Java version
echo ""
echo "Running Maven compilation..."
mvn clean compile