#!/bin/bash

# Setup Java 20 environment for the backend
export JAVA_20_HOME=$(/usr/libexec/java_home -v20)
export JAVA_HOME=$JAVA_20_HOME

echo "Java environment setup complete:"
echo "JAVA_20_HOME: $JAVA_20_HOME"
echo "JAVA_HOME: $JAVA_HOME"
echo "Java version: $(java --version | head -n1)"

# Run Spring Boot application with dev profile
echo ""
echo "Starting Spring Boot application with dev profile..."
mvn spring-boot:run -Dspring-boot.run.profiles=dev