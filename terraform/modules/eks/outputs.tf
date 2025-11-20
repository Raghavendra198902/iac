output "cluster_id" {
  description = "EKS cluster ID"
  value       = aws_eks_cluster.main.id
}

output "cluster_arn" {
  description = "EKS cluster ARN"
  value       = aws_eks_cluster.main.arn
}

output "cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = aws_eks_cluster.main.endpoint
}

output "cluster_security_group_id" {
  description = "Security group ID attached to the EKS cluster"
  value       = aws_security_group.cluster.id
}

output "node_security_group_id" {
  description = "Security group ID attached to the EKS nodes"
  value       = aws_security_group.node.id
}

output "cluster_certificate_authority_data" {
  description = "Base64 encoded certificate data required to communicate with the cluster"
  value       = aws_eks_cluster.main.certificate_authority[0].data
  sensitive   = true
}

output "cluster_oidc_issuer_url" {
  description = "The URL on the EKS cluster OIDC Issuer"
  value       = try(aws_eks_cluster.main.identity[0].oidc[0].issuer, "")
}

output "oidc_provider_arn" {
  description = "ARN of the OIDC Provider for EKS"
  value       = aws_iam_openid_connect_provider.cluster.arn
}

output "node_groups" {
  description = "Outputs from EKS node groups"
  value = {
    for k, v in aws_eks_node_group.main : k => {
      id     = v.id
      arn    = v.arn
      status = v.status
    }
  }
}

output "cluster_version" {
  description = "The Kubernetes server version for the cluster"
  value       = aws_eks_cluster.main.version
}

output "kubeconfig" {
  description = "kubectl config file contents for this EKS cluster"
  value = templatefile("${path.module}/kubeconfig.tpl", {
    cluster_name                         = aws_eks_cluster.main.name
    cluster_endpoint                     = aws_eks_cluster.main.endpoint
    cluster_certificate_authority_data   = aws_eks_cluster.main.certificate_authority[0].data
  })
  sensitive = true
}
