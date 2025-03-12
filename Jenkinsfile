@Library('Shared') _
pipeline {
    agent {label 'Node'}

    environment {
        SONAR_HOME = tool "sonarqube"
    }

    parameters {
        string(name: 'DOCKER_TAG', defaultValue:'', description: 'Setting Docker image for latest push')
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
        stage('Docker: Build Images') {
            steps {
                script {
                    dockerBuild("meet-app", "${params.DOCKER_TAG}")
                }
            }
        }
        stage('Docker: Tag & Push to Docker Hub') {
            steps {
                script {
                    dockerPush('docker-creds', 'meet-app', "${params.DOCKER_TAG}")
                }
            }
        }
    }
    post {
        success {
            archiveArtifacts artifacts: '*.xml', followSymlinks: false
            build job: "Meet-CD", parameters: [
                string(name: "DOCKER_TAG", value: "${params.DOCKER_TAG}")
            ]
        }
    }
}