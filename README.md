# UI Internal TypeScript

A modern TypeScript React application for managing internal user interface components with a focus on network management, device monitoring, rewards systems, and wallet functionality.

## Features

- **Dashboard Management**: Comprehensive dashboard with analytics and monitoring
- **Network Management**: Device configuration, monitoring, and statistics
- **Rewards System**: Create, edit, and manage reward programs
- **Wallet Management**: Payment processing and transaction tracking
- **Coupon System**: Radius voucher creation and management
- **Modern UI**: Built with React, TypeScript, and shadcn/ui components
- **Type Safety**: Full TypeScript implementation with strict type checking

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker and Docker Compose (for containerized deployment)

### Local Development

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ui-internal-ts/ui
   ```

2. **Create environment file**

   ```bash
   cp .example .env.local
   # Edit .env.local with your configuration
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Deployment

1. **Create environment file**

   ```bash
   cp .example .env.local
   # Edit .env.local with your configuration
   ```

2. **Run the setup script**

   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Access the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ui-internal-ts/
├── ui/                          # Frontend application
│   ├── src/
│   │   ├── app/                # Next.js app router pages
│   │   │   ├── dashboard/      # Dashboard pages
│   │   │   ├── network/        # Network management pages
│   │   │   ├── rewards/        # Rewards system pages
│   │   │   └── wallet/         # Wallet management pages
│   │   ├── components/         # React components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── dashboard/     # Dashboard components
│   │   │   ├── devices/       # Device management components
│   │   │   ├── rewards/       # Rewards components
│   │   │   ├── wallet/        # Wallet components
│   │   │   └── coupons/       # Coupon management components
│   │   ├── lib/               # Utility functions and API calls
│   │   └── hooks/             # Custom React hooks
│   └── public/                # Static assets
├── Dockerfile                  # Docker configuration
├── docker-compose.yml          # Docker Compose configuration
├── setup.sh                    # Automated setup script
└── README.md                   # This file
```

## Key Technologies

- **Frontend**: React 19, TypeScript, Next.js 15
- **UI Components**: shadcn/ui, Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Notifications**: Sonner
- **Charts**: Recharts
- **Icons**: Lucide React, Tabler Icons
- **Drag & Drop**: @dnd-kit
- **Tables**: TanStack Table
- **Forms**: React Hook Form with Zod validation

## Environment Variables

Create a `.env.local` file in the `ui/` directory with the following variables:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api/v1
```

```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Rebuild without cache
docker-compose build --no-cache

# Access container shell
docker-compose exec ui-internal-ts sh
```

## Development/Contribution Guidelines

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Use Prettier for code formatting
- Write meaningful component and function names
- Add JSDoc comments for complex functions

### Component Structure

- Keep components small and focused
- Use composition over inheritance
- Implement proper TypeScript interfaces
- Handle loading and error states
- Use React.memo for performance optimization when needed

### State Management

- Use React Context for global state
- Keep component state local when possible
- Use custom hooks for reusable logic
- Implement proper error boundaries

## API Integration

The application integrates with various APIs for:

- **Device Management**: CRUD operations for network devices
- **User Management**: Authentication and user data
- **Rewards System**: Reward creation and management
- **Wallet Operations**: Payment processing and transactions
- **Network Monitoring**: Real-time device statistics

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

```

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**

   ```bash
   # Kill the process using port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Docker permission issues**

   ```bash
   # Add user to docker group
   sudo usermod -aG docker $USER
   # Log out and back in
   ```

3. **Environment variables not loading**
   - Ensure `.env.local` is in the correct location
   - Restart the development server
   - Check for typos in variable names

## Support

For issues and questions, please contact the development team or create an issue in the repository.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.
