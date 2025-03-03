@Library('Shared') _
pipeline {
    agent {label 'Node'}

    environment {
        SONAR_HOME = tool "sonarqube"
    }

    stages {
        stage('Clean Workspace') {
            steps {
                script {
                    cleanWs()
                }
            }
        }
        stage('Git: Code Checkout') {
            steps {
                script {
                    gitCheckout("https://github.com/rcheeez/meet.git", "dev")
                }
            }
        }
        stage('Trivy: Filesystem Scan') {
            steps {
                script {
                    trivyScan()
                }
            }
        }

        stage('OWASP: Dependency Check') {
            steps {
                script {
                    owaspDependency()
                }
            }
        }
        stage('SonarQube: Code Analysis') {
            steps {
                script {
                    sonarQubeScan("sonarqube", "meetapp", "meetapp")
                }
            }
        }
        stage('SonarQube: Quality Gate') {
            steps {
                script {
                    sonarQubeQualityGate()
                }
            }
        }
    }
}