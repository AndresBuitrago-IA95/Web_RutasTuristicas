@echo off
REM ===================================
REM Script para ejecutar Spring Boot con Maven Wrapper
REM ===================================

echo ====================================
echo Configurando variables de entorno...
echo ====================================

REM Variables de Maven
set MAVEN_OPTS=-Xmx512m -XX:MaxPermSize=256m

REM Variables de la aplicación (opcional, ya están en application.properties)
set SERVER_PORT=8080
set SPRING_PROFILES_ACTIVE=dev

echo.
echo Variables configuradas:
echo - JAVA_HOME: %JAVA_HOME%
echo - MAVEN_OPTS: %MAVEN_OPTS%
echo - SERVER_PORT: %SERVER_PORT%
echo.

echo ====================================
echo Iniciando aplicación Spring Boot...
echo ====================================
echo.

REM Ejecutar Maven Wrapper
.\mvnw.cmd spring-boot:run

pause
