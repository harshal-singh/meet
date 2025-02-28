@Library('shared-library') _
pipeline {
    agent {label "node"}

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
                    owaspDependencyCheck()
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