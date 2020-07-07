@Library(value='kids-first/aws-infra-jenkins-shared-libraries', changelog=false) _
ecs_service_type_1_standard {
    projectName            = "disease-express-web"
    orgFullName            = "d3b-center"
    org                    = "d3b"
    account                = "chopd3bPrd"
    environments           = "dev,prd"
    docker_image_type      = "debian"
    entrypoint_command     = "pushstate-server -d dist -p 80"
    deploy_scripts_version = "master"
    container_port         = "80"
    health_check_path      = "/"
    external_config_repo   = "false"
    dependencies           = "ecr"
    internal_app           = "false"
    quick_deploy           = "true"
    friendly_dns_name      = "disease-express"
}