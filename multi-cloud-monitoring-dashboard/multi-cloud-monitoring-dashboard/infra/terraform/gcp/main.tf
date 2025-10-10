resource "google_project" "project" {
  name       = "Multi Cloud Monitoring Dashboard"
  project_id = var.project_id
  org_id     = var.org_id
  billing_account = var.billing_account
}

resource "google_compute_network" "vpc_network" {
  name                    = "${var.project_id}-vpc"
  auto_create_subnetworks = "false"
}

resource "google_compute_subnetwork" "subnetwork" {
  name          = "${var.project_id}-subnet"
  ip_cidr_range = var.subnet_cidr
  region        = var.region
  network       = google_compute_network.vpc_network.name
}

resource "google_compute_instance" "instance" {
  count        = var.instance_count
  name         = "${var.project_id}-instance-${count.index}"
  machine_type = var.machine_type
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = var.boot_disk_image
    }
  }

  network_interface {
    network    = google_compute_network.vpc_network.name
    subnetwork = google_compute_subnetwork.subnetwork.name

    access_config {
      // Ephemeral IP
    }
  }

  metadata_startup_script = file("startup-script.sh")
}

output "instance_ips" {
  value = google_compute_instance.instance.*.network_interface[0].access_config[0].nat_ip
}