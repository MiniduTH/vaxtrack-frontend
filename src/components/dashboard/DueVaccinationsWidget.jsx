import { useState, useEffect } from 'react';
import { getDueRecords } from '../../api/recordApi';
import { formatDate } from '../../utils/formatters';
import { Card, CardHeader, CardTitle, CardBody, Spinner, StatusBadge } from '../common';

const DueVaccinationsWidget = () => {
  const [data, setData] = useState({ upcoming: { records: [] }, overdue: { records: [] } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDue = async () => {
      try {
        const response = await getDueRecords();
        setData(response.data || { upcoming: { records: [] }, overdue: { records: [] } });
      } catch (err) {
        console.error('Failed to load due vaccinations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDue();
  }, []);

  if (loading) {
    return (
      <Card className="h-full">
        <CardBody className="flex justify-center items-center py-12">
          <Spinner />
        </CardBody>
      </Card>
    );
  }

  const { upcoming, overdue } = data;
  const hasRecords = upcoming.records.length > 0 || overdue.records.length > 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Due Vaccinations</CardTitle>
      </CardHeader>
      <CardBody className="flex-1 overflow-y-auto">
        {!hasRecords ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            You are all caught up on your vaccinations!
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overdue Section */}
            {overdue.records.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-danger-600 uppercase tracking-wider">Overdue</h4>
                {overdue.records.map(record => (
                  <div key={record._id} className="flex justify-between items-center p-3 bg-danger-50 dark:bg-danger-500/10 rounded-lg border border-danger-100 dark:border-danger-500/20">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {record.dependentName || 'Self'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Past due: {formatDate(record.nextDoseDate)}
                      </p>
                    </div>
                    <StatusBadge status="Error" text="Overdue" />
                  </div>
                ))}
              </div>
            )}

            {/* Upcoming Section */}
            {upcoming.records.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-primary-600 uppercase tracking-wider">Upcoming</h4>
                {upcoming.records.map(record => (
                  <div key={record._id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {record.dependentName || 'Self'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Due: {formatDate(record.nextDoseDate)}
                      </p>
                    </div>
                    <StatusBadge status="Pending" text="Soon" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default DueVaccinationsWidget;
