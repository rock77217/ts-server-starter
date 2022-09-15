## Getting Started
1. Build docker image
    ```bash
    docker-compose --env-file ./config/.local.env build
    ```
2. yarn
    ```bash
    cd ts-server; yarn
    ```
3. Run docker container
    ```bash
    cd ..
    docker-compose --env-file ./config/.local.env down -v
    docker-compose --env-file ./config/.local.env up --scale redis_sentinel=3 -d --force-recreate
    ```
4. Get admin token ID
    ```curl
    curl -k --location --request GET 'https://{ServerUrl}/adm/init_adm'
    ```
    And you will get a UUID
5. Init admin with Token ID
    ```curl
    curl -k --location --request PATCH 'https://{ServerUrl}/adm/activate' --header 'apiKey: {UUID}'
    ```

## Commands
- Monitor log
    ```bash
    docker logs -f ts-server
    ```
- Restart all and recreate container
    ```bash
    docker-compose --env-file ./config/.local.env down -v; docker-compose --env-file ./config/.local.env up --scale redis_sentinel=3 -d --force-recreate
    ```

## Troubleshooting
- PM2 error: Error: ENOSPC: System limit for number of file watchers reached
    ```bash
    echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
    ```
