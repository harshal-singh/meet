

resource "aws_default_vpc" "default_vpc" {

}

resource "aws_default_subnet" "default_subnet_1" {
  availability_zone = "ap-south-1a"
}

resource "aws_default_subnet" "default_subnet_2" {
  availability_zone = "ap-south-1b"
}

resource "aws_security_group" "default_sg" {
  name        = "default-sg"
  description = "Security group for meet application"
  vpc_id      = aws_default_vpc.default_vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 10000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 30000
    to_port     = 32767
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress  {
    from_port = 25
    to_port = 25
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress  {
    from_port = 465
    to_port = 465
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "default_sg"
  }
}

resource "aws_instance" "meet_instance" {
  count                   = 2
  ami                     = var.ami_id
  instance_type           = var.instance_types[count.index]
  subnet_id               = aws_default_subnet.default_subnet_1.id
  key_name                = var.ec2_ssh_key_name
  vpc_security_group_ids  = [aws_security_group.default_sg.id]
  associate_public_ip_address = true

  tags = {
    Name = var.instance_names[count.index]
  }
}


resource "aws_iam_role" "eks_cluster_role" {
   name = "eks-cluster-role"
   assume_role_policy = jsonencode({
     Version = "2012-10-17",
     Statement = [
       {
         Effect = "Allow",
         Principal = {
           Service = "eks.amazonaws.com"
         },
         Action = "sts:AssumeRole"
       }
     ]
   })
}

resource "aws_iam_role" "eks_node_role" {
  name = "eks-node-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "ec2.amazonaws.com"
          },
        Action = "sts:AssumeRole"
      }
    ]
  })        
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  role      = aws_iam_role.eks_cluster_role.name
  policy_arn = var.eks_cluster_policy_arn
}

resource "aws_eks_cluster" "eks_cluster" {
  name = var.eks_cluster_name
  role_arn = aws_iam_role.eks_cluster_role.arn

  vpc_config {
    subnet_ids = [aws_default_subnet.default_subnet_1.id, aws_default_subnet.default_subnet_2.id]
    security_group_ids = [aws_security_group.default_sg.id]
  }

  depends_on = [ 
    aws_iam_role_policy_attachment.eks_cluster_policy
   ]
}

resource "aws_iam_role_policy_attachment" "eks_worker_node_policy" {
  role = aws_iam_role.eks_node_role.name
  policy_arn = var.eks_node_policy_arn
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  role = aws_iam_role.eks_node_role.name
  policy_arn = var.eks_cni_policy_arn
}

resource "aws_eks_node_group" "eks_node_group" {
  cluster_name = aws_eks_cluster.eks_cluster.name
  node_group_name = var.eks_node_group_name
  node_role_arn = aws_iam_role.eks_node_role.arn
  subnet_ids = [aws_default_subnet.default_subnet_1.id, aws_default_subnet.default_subnet_2.id]
  
  scaling_config {
    desired_size = 2
    max_size = 2
    min_size = 2
  }

  remote_access {
    ec2_ssh_key = var.ec2_ssh_key_name
    source_security_group_ids = [aws_security_group.default_sg.id]
  }

  instance_types = [var.instance_types[0]]

  tags = {
    Name = var.eks_node_group_name
  }

  depends_on = [ 
    aws_eks_cluster.eks_cluster
   ]
}