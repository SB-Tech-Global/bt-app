import DashboardSummary from '../../components/DashboardSummary';

export default function DashboardPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">Dashboard</h1>
        <p className="text-gray-200">Welcome to your business tracker dashboard. Here you can see a summary of your business activity.</p>
      </div>
      <DashboardSummary />
    </div>
  );
} 