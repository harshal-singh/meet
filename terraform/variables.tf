variable "aws_region" {
  description = "The AWS region to deploy resources"
  type        = string
  default     = "ap-south-1"  # Update as needed
}

variable "ec2_ssh_key_name" {
  description = "Name of the SSH key pair for EC2 instances"
  type        = string
  default     = "meet-key"  
}

variable "ami_id" {
  description = "AMI ID for the EC2 instances"
  type        = string
  default     = "ami-00bb6a80f01f03502"  # Update as needed
}

variable "instance_types" {
  description = "List of instance types for EC2 instances"
  type        = list(string)
  default     = ["t2.medium", "t2.large"]
}

variable "instance_names" {
  description = "List of instance names"
  type        = list(string)
  default     = ["jenkins-server", "jenkins-agent"]
}

variable "eks_cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "meet-cluster" 
}

variable "eks_node_group_name" {
  description = "Name of the EKS node group"
  type        = string
  default     = "meet-node-group"
}

variable "eks_cluster_policy_arn" {
  description = "ARN of the EKS cluster policy"
  type        = string
  default     = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

variable "eks_node_policy_arn" {
  description = "ARN of the EKS node policy"
  type        = string
  default     = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}


variable "eks_cni_policy_arn" {
  description = "ARN of the EKS CNI policy"
  type        = string
  default     = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  
}
