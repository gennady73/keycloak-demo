# Environment setup
1. Docker images
   ```bash
   podman pull docker.io/gennady73/keycloak-host-ha1:7.6.4-demo
   podman pull docker.io/gennady73/keycloak-db:latest
   ```
2. Network 
- Create network.
  The Docker uses same syntax. 
    ```bash
    podman network create rh-sso-net
    ```
- Get the gateway IP.
  The Docker uses same syntax. 
    ```bash
    podman network inspect rh-sso-net
    ```

- Proxy server.
  Edit [haproxy.standalone.cfg](containers/haproxy/haproxy.standalone.cfg) file as following
    ```bash
    ...
    resolvers mydns
    nameserver gateway <gateway IP>:53
    ...
    ```

- Run the whole system.
  The Docker uses same syntax. From [containers](containers) directory
    ```bash
    podman-compose up
    ```
- Shutdown  
    The Docker uses same syntax. From [containers](containers) directory
    ```bash
    podman-compose down -v
    ```