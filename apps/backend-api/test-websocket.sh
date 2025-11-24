#!/bin/bash

# WebSocket Gateway Test Script
# This script helps you test the WebSocket Gateway quickly

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║           WebSocket Gateway Test Script                      ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Redis is running
check_redis() {
    echo -n "Checking Redis connection... "
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Redis is running${NC}"
        return 0
    else
        echo -e "${RED}✗ Redis is not running${NC}"
        echo
        echo "Please start Redis first:"
        echo "  docker run -d -p 6379:6379 redis:7-alpine"
        echo "  OR"
        echo "  docker-compose -f docker-compose.ws.yml up redis -d"
        return 1
    fi
}

# Check if WebSocket Gateway is running
check_ws_gateway() {
    echo -n "Checking WebSocket Gateway... "
    if nc -z localhost 8080 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ WebSocket Gateway is running on port 8080${NC}"
        return 0
    else
        echo -e "${YELLOW}! WebSocket Gateway is not running${NC}"
        echo
        echo "Start the gateway with:"
        echo "  npm run dev:ws"
        return 1
    fi
}

# Check if dependencies are installed
check_dependencies() {
    echo -n "Checking dependencies... "
    if [ ! -d "node_modules" ]; then
        echo -e "${RED}✗ node_modules not found${NC}"
        echo
        echo "Please install dependencies:"
        echo "  npm install"
        return 1
    fi
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    return 0
}

# Function to show menu
show_menu() {
    echo
    echo "Choose an option:"
    echo "  1) Start WebSocket Gateway (development mode)"
    echo "  2) Run test client"
    echo "  3) Run test data publisher"
    echo "  4) Run both test client and publisher"
    echo "  5) Check status"
    echo "  6) View WebSocket Gateway logs (Docker)"
    echo "  7) Stop all Docker services"
    echo "  0) Exit"
    echo
}

# Start WebSocket Gateway
start_gateway() {
    echo
    echo "Starting WebSocket Gateway in development mode..."
    echo "Press Ctrl+C to stop"
    echo
    npm run dev:ws
}

# Run test client
run_client() {
    echo
    echo "Starting test client..."
    echo "Press Ctrl+C to stop"
    echo
    tsx src/websocket/client-example.ts
}

# Run test publisher
run_publisher() {
    echo
    echo "Starting test data publisher..."
    echo "Press Ctrl+C to stop"
    echo
    tsx src/websocket/test-publisher.ts
}

# Run both client and publisher
run_both() {
    echo
    echo "Starting test publisher and client in background..."
    echo

    # Start publisher in background
    tsx src/websocket/test-publisher.ts &
    PUBLISHER_PID=$!
    echo "Test publisher started (PID: $PUBLISHER_PID)"

    # Wait a bit for publisher to start
    sleep 2

    # Start client
    echo "Starting test client..."
    tsx src/websocket/client-example.ts

    # Cleanup on exit
    kill $PUBLISHER_PID 2>/dev/null || true
}

# Check status
check_status() {
    echo
    check_redis
    check_ws_gateway
    check_dependencies
    echo

    # Check for processes
    echo "Active processes:"
    ps aux | grep -E "ws-gateway|test-publisher|client-example" | grep -v grep | head -5 || echo "  No WebSocket processes found"

    echo
    echo "Docker containers:"
    docker ps --filter "name=ws-gateway" --filter "name=redis" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "  No Docker containers found"
}

# View Docker logs
view_logs() {
    echo
    echo "Viewing WebSocket Gateway logs (press Ctrl+C to stop)..."
    echo
    docker logs -f ws-gateway 2>/dev/null || {
        echo -e "${RED}Container 'ws-gateway' not found${NC}"
        echo "Start with: docker-compose -f docker-compose.ws.yml up -d"
    }
}

# Stop Docker services
stop_docker() {
    echo
    echo "Stopping Docker services..."
    docker-compose -f docker-compose.ws.yml down
    echo -e "${GREEN}✓ Docker services stopped${NC}"
}

# Main script
main() {
    # Initial checks
    check_dependencies || exit 1
    check_redis || {
        echo
        read -p "Do you want to start Redis with Docker? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker run -d -p 6379:6379 --name redis-test redis:7-alpine
            sleep 2
            check_redis || exit 1
        else
            exit 1
        fi
    }

    # Show menu loop
    while true; do
        show_menu
        read -p "Enter choice: " choice

        case $choice in
            1) start_gateway ;;
            2) run_client ;;
            3) run_publisher ;;
            4) run_both ;;
            5) check_status ;;
            6) view_logs ;;
            7) stop_docker ;;
            0) echo "Goodbye!"; exit 0 ;;
            *) echo -e "${RED}Invalid option${NC}" ;;
        esac
    done
}

# Run main
main
