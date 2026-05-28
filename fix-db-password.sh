#!/bin/bash

# Load environment variables from .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

echo "Attempting to reset PostgreSQL password for user $POSTGRES_USER to match .env..."

# Run the ALTER USER command inside the running DB container
docker exec -it ldp_vault_db psql -U postgres -d $POSTGRES_DB -c "ALTER USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';"

if [ $? -eq 0 ]; then
    echo "Password reset successfully!"
    echo "Now trying prisma migration again..."
    docker exec -it ldp_vault_backend npx prisma migrate deploy
else
    echo "Failed to reset password. Make sure the container 'ldp_vault_db' is running."
fi
