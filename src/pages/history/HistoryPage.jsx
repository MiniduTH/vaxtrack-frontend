import { useState, useEffect } from 'react';
import { getHistory } from '../../api/recordApi';
import { formatDate } from '../../utils/formatters';
import { Card, CardHeader, CardTitle, CardBody, Spinner, EmptyState } from '../../components/common';

const HistoryPage = () => {
  const [historyData, setHistoryData] = useState({ self: null, dependents: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('self'); // 'self' or dependentName

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getHistory();
        setHistoryData(response.data || { self: null, dependents: [] });
      } catch (err) {
        setError('Failed to load vaccination history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-50 text-danger-700 p-4 rounded-xl border border-danger-200">
        {error}
      </div>
    );
  }

  const { self, dependents } = historyData;

  const renderTimeline = (records) => {
    if (!records || records.length === 0) {
      return <EmptyState title="No history found" description="No vaccination records available for this profile." />;
    }

    return (
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent dark:before:via-slate-700">
        {records.map((record, index) => (
          <div key={record._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            {/* Timeline dot */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-primary-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            
            {/* Card */}
            <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] hover:-translate-y-1 transition-transform">
              <CardBody className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-lg text-slate-900 dark:text-white">
                    {/* Assuming vaccineId is an object if populated, but backend might just send ID. Adjust safely */}
                    {typeof record.vaccineId === 'object' ? record.vaccineId?.name : 'Vaccine ' + record.vaccineId?.substring(0, 5)}
                  </div>
                  <time className="text-xs font-medium text-primary-600 dark:text-primary-400">
                    {formatDate(record.dateAdministered)}
                  </time>
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <p><span className="font-medium text-slate-800 dark:text-slate-200">Hospital:</span> {record.hospitalId?.name || 'Unknown'}</p>
                  <p><span className="font-medium text-slate-800 dark:text-slate-200">Next Dose:</span> {record.nextDoseDate ? formatDate(record.nextDoseDate) : 'N/A'}</p>
                </div>
              </CardBody>
            </Card>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Vaccination History
      </h1>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-xl bg-slate-100 dark:bg-slate-800/50 p-1 mb-6 max-w-2xl">
        <button
          onClick={() => setActiveTab('self')}
          className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors focus:outline-none ${
            activeTab === 'self'
              ? 'bg-white dark:bg-slate-700 text-primary-700 dark:text-primary-400 shadow'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          My History
        </button>
        {dependents?.map((dep) => (
          <button
            key={dep.dependentName}
            onClick={() => setActiveTab(dep.dependentName)}
            className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors focus:outline-none ${
              activeTab === dep.dependentName
                ? 'bg-white dark:bg-slate-700 text-primary-700 dark:text-primary-400 shadow'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {dep.dependentName}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-8">
        {activeTab === 'self' && self && (
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400 px-3 py-1 rounded-full text-sm">
                {self.count} Records
              </span>
            </h2>
            {renderTimeline(self.records)}
          </div>
        )}
        
        {dependents?.map((dep) => (
          activeTab === dep.dependentName && (
            <div key={dep.dependentName}>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className="bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-400 px-3 py-1 rounded-full text-sm">
                  {dep.count} Records
                </span>
              </h2>
              {renderTimeline(dep.records)}
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
