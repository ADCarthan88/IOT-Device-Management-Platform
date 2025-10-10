resource "aws_s3_bucket" "monitoring_dashboard" {
  bucket = "my-multi-cloud-monitoring-dashboard"
  acl    = "private"

  tags = {
    Name        = "Monitoring Dashboard Bucket"
    Environment = "Dev"
  }
}

resource "aws_ec2_instance" "monitoring_instance" {
  ami           = "ami-0c55b159cbfafe1f0" # Replace with a valid AMI ID
  instance_type = "t2.micro"

  tags = {
    Name        = "Monitoring Dashboard Instance"
    Environment = "Dev"
  }
}

resource "aws_security_group" "monitoring_sg" {
  name        = "monitoring_dashboard_sg"
  description = "Allow HTTP and SSH traffic"

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

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}