pipeline {
    agent any

    environment {
        FRONTEND_DIR = "/var/www/ay-lms-frontend-staging"
    }

    stages {

        stage('Deploy build folder') {
            steps {
                sh '''
                rm -rf ${FRONTEND_DIR}/build
                cp -r build ${FRONTEND_DIR}/
                '''
            }
        }

        stage('Reload Nginx') {
            steps {
                sh '''
                sudo systemctl reload nginx
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Frontend deployed successfully (prebuilt)"
        }
        failure {
            echo "❌ Frontend deployment failed"
        }
    }
}

