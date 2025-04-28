terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.86.0"
    }
    archive = {
      source = "hashicorp/archive"
    }
  }
  backend "s3" {
    bucket = "storacha-terraform-state"
    region = "us-west-2"
    encrypt = true
  }
}

provider "aws" {
  allowed_account_ids = [var.allowed_account_id]
  default_tags {
    
    tags = {
      "Environment" = terraform.workspace
      "ManagedBy"   = "OpenTofu"
      Owner         = "storacha"
      Team          = "Storacha Engineering"
      Organization  = "Storacha"
      Project       = "${var.app}"
    }
  }
}

# CloudFront is a global service. Certs must be created in us-east-1, where the core ACM infra lives
provider "aws" {
  region = "us-east-1"
  alias = "acm"
}

resource "random_password" "session_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

module "app" {
  source = "github.com/storacha/storoku//app"
  private_key = var.private_key
  private_key_env_var = "SERVER_IDENTITY_PRIVATE_KEY"
  httpport = 3000
  principal_mapping = var.principal_mapping
  did = var.did
  app = var.app
  appState = var.app
  environment = terraform.workspace
  deployment_env_vars = [
    {
      name= "SESSION_COOKIE_NAME"
      value = "bsky-backups-${terraform.workspace}"
    }
  ]
  image_tag = var.image_tag
  create_db = true
  secrets = {
    "SESSION_PASSWORD" = random_password.session_password.result
  }
  queues = [ {
    name = "backups"
  }]
  providers = {
    aws = aws
    aws.acm = aws.acm
  }
  env_files = var.env_files
  domain_base = var.domain_base
}

locals {
    domain_base = var.domain_base != "" ? var.domain_base : "${var.app}.storacha.network"
    domain_name = terraform.workspace == "prod" ? local.domain_base : "${terraform.workspace}.${local.domain_base}"
}

resource "aws_cloudwatch_event_rule" "hourly_backup" {
  name = "${terraform.workspace}-${var.app}-hourly-backup-rule"
  schedule_expression = "rate(1 hour)"
}

resource "aws_cloudwatch_event_target" "hourly_backup" {
  rule = aws_cloudwatch_event_rule.hourly_backup.name
  arn  = aws_cloudwatch_event_api_destination.hourly_backup.arn
  // TODO: I think we need to specify a role_arn here
  // role_arn = 
}

resource "aws_cloudwatch_event_connection" "hourly_backup" {
  name               = "${terraform.workspace}-${var.app}-hourly-backup-connection"
  description        = "A connection description"
  authorization_type = "BASIC"

  auth_parameters {
    basic {
      username = "user"
      password = "Pass1234!"
    }
  }
}

resource "aws_cloudwatch_event_api_destination" "hourly_backup" {
  name = "${terraform.workspace}-${var.app}-hourly-backup-endpoint"
  description = "hourly backup endpoint"
  invocation_endpoint = "https://${local.domain_name}/api/backups/hourly"
  http_method = "POST"
  invocation_rate_limit_per_second = 20
  connection_arn = aws_cloudwatch_event_connection.hourly_backup.arn
}