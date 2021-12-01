sudo apt-get update -y
sudo apt-get install git -y
sudo apt-get install docker.io -y

git clone https://github.com/Draco-Climbing/reviews-API.git

# installing docker compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose version

# start docker
sudo service docker start
sudo usermod -a -G docker ubuntu