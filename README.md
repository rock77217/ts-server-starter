## Getting Started

* #### All configs at ./config/.local.env

1. Build docker image
    ```bash
    docker-compose build
    ```
2. yarn
    ```bash
    cd ts_server; yarn
    ```
3. Run docker container
    ```bash
    cd ..
    docker-compose down -v
    docker-compose up --force-recreate
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
    docker logs -f ts_service-ts_server-1
    ```
- Restart all and recreate container
    ```bash
    docker-compose down -v; docker-compose up --scale redis_sentinel=3 -d --force-recreate
    ```

## Troubleshooting
- PM2 error: Error: ENOSPC: System limit for number of file watchers reached
    ```bash
    echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
    ```
