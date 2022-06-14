# Dapr Bindings - Sample Orders Database

This quickstart uses a specific sample database called `postgres` to back up orders data.  

The database is implemented using the official base [`postgres`](https://hub.docker.com/_/postgres) container image as a base and customizing it to initialize using the SQL script in `orders.sql`.  For convience, building, running, and setting of customizable environment variables (e.g. DB name and password) is handled in the `docker-compose.yaml` file.  

To start the database simply run the following in this folder:
```bash
docker compose up
```

To explore the database using the interactive CLI run:
```bash
docker exec -i -t postgres psql --username postgres  -p 5432 -h localhost --no-password
```

At the prompt change to the `orders` table with:
```bash
\c tables;
```

Explore data using:
```bash
select * from orders
```

To clean up, CTRL-C the terminal or run:
```bash
docker compose down
```
