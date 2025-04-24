variable "app" {
  description = "The name of the application"
  type        = string
}

variable "allowed_account_id" {
  description = "account id used for AWS"
  type = string
}

variable "cloudflare_zone_id" {
  description = "zone id for cloudflare dns records"
  type        = string
}

variable "domain_base" {
  type = string
  default = ""
}