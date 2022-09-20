
# cleaning
docker image prune --force

# Build image
docker build . -t "node-rest-api"

# Run and bind to port 3000 
docker run --rm -p 3000:8080 node-rest-api
