
locals {
    domain_base = var.domain_base != "" ? var.domain_base : "${var.app}.storacha.network"
    domain_name = terraform.workspace == "prod" ? local.domain_base : "${terraform.workspace}.${local.domain_base}"
}

resource "aws_cloudwatch_event_rule" "hourly_backup" {
  name = "${terraform.workspace}-${var.app}-hourly-backup-rule"
  schedule_expression = "rate(1 hour)"
}

resource "aws_iam_role" "hourly_backup" {
 name               = "${terraform.workspace}-${var.app}-hourly-backup-role"
 assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

resource "aws_sqs_queue" "hourly_backup_deadletter" {
  name = "${terraform.workspace}-${var.app}-hourly-backup-deadletter"
}


data "aws_iam_policy_document" "assume_role" {
 statement {
   effect  = "Allow"
   actions = ["sts:AssumeRole"]


   principals {
     type        = "Service"
     identifiers = ["events.amazonaws.com"]
   }
 }
}
resource "aws_iam_policy" "hourly_backup" {
 name   =  "${terraform.workspace}-${var.app}-hourly-backup-policy"
 policy = data.aws_iam_policy_document.assume_eventbridge_role.json
}


data "aws_iam_policy_document" "assume_eventbridge_role" {
 statement {
   effect  = "Allow"
   actions = ["events:InvokeApiDestination"]


   resources = [aws_cloudwatch_event_api_destination.hourly_backup.arn]
 }
 statement {
  effect = "Allow"
  actions = ["sqs:SendMessage"]

  resources = [aws_sqs_queue.hourly_backup_deadletter.arn]
 }
}

resource "aws_cloudwatch_event_target" "hourly_backup" {
  rule = aws_cloudwatch_event_rule.hourly_backup.name
  arn  = aws_cloudwatch_event_api_destination.hourly_backup.arn
  role_arn = aws_iam_role.hourly_backup.arn 
  dead_letter_config {
    arn = aws_sqs_queue.hourly_backup_deadletter.arn
  }
}

resource "aws_cloudwatch_event_connection" "hourly_backup" {
  name               = "${terraform.workspace}-${var.app}-hourly-backup-connection"
  description        = "A connection description"
  authorization_type = "BASIC"

  auth_parameters {
    basic {
      username = "user"
      password = random_password.backup_password.result
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