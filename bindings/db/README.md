# Dapr Bindings - Sample Orders Database

This quickstart uses a specific sample database to back up orders data.  

The database is implemented using the base `postgres` container image and customizing it to initialize using the SQL script in `orders.sql`.  Last for convience the build, setting of environment variables like DB name and password is handled in the `docker-compose.yaml` file.  

To start the database simply run the following in this folder:
`docker compose up`

To explore the database using the interactive CLI run:
`docker exec -i -t postgres psql --username postgres  -p 5432 -h localhost --no-password`

At the prompt change to the `orders` table with:
`\c tables;`

Explore data using:
`select * from orders`

To clean up, CTRL-C the terminal or run:
`docker compose down`
