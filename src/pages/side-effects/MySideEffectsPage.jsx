import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { getMySideEffects, reportSideEffect } from '../../api/sideEffectApi';
import { getMyRecords } from '../../api/recordApi';
import { formatDate } from '../../utils/formatters';
import { Card, CardHeader, CardTitle, CardBody, Spinner, EmptyState, Button, SeverityBadge } from '../../components/common';

const MySideEffectsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For the report form
  const [myRecords, setMyRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const successTimerRef = useRef(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Load user's previous reports and vaccination records
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const reportsData = await getMySideEffects();
        // Backend returns { success, count, data: [...] }
        const reportsArray = Array.isArray(reportsData)
          ? reportsData
          : Array.isArray(reportsData?.data)
          ? reportsData.data
          : [];
        setReports(reportsArray);
        
        // Fetch vaccination records for the dropdown
        setLoadingRecords(true);
        const recordsData = await getMyRecords();
        // Backend returns { success, count, data: [...] }
        const recordsArray = Array.isArray(recordsData)
          ? recordsData
          : Array.isArray(recordsData?.data)
          ? recordsData.data
          : [];
        setMyRecords(recordsArray);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load side-effect reports.');
      } finally {
        setLoading(false);
        setLoadingRecords(false);
      }
    };
    fetchData();
  }, []);

  // Cleanup success timer on unmount
  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Split comma-separated symptoms into array
      const symptomsArray = data.symptoms.split(',').map(s => s.trim()).filter(s => s);
      
      const payload = {
        recordId: data.recordId,
        symptoms: symptomsArray,
        severity: data.severity,
      };

      const newReportResponse = await reportSideEffect(payload);
      
      // Prepend the new report to the list
      // Backend returns { success, message, data: { sideEffect } }
      const newReport = newReportResponse?.data ?? newReportResponse;
      setReports((prev) => [newReport, ...prev]);
      
      setSubmitSuccess(true);
      reset();
      
      // Auto-hide success message, clearing any existing timer
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit side effect report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Side-Effects Reporting
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Report Form Column */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Report a Side Effect</CardTitle>
            </CardHeader>
            <CardBody>
              {submitSuccess && (
                <div className="mb-4 bg-success-50 text-success-700 p-3 rounded-lg border border-success-200 text-sm">
                  Report submitted successfully!
                </div>
              )}
              {submitError && (
                <div className="mb-4 bg-danger-50 text-danger-700 p-3 rounded-lg border border-danger-200 text-sm">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Vaccination Record
                  </label>
                  {loadingRecords ? (
                    <div className="py-2 text-sm text-slate-500">Loading records...</div>
                  ) : (
                    <select
                      {...register('recordId', { required: 'Please select a vaccination record' })}
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white ${
                        errors.recordId ? 'border-danger-500' : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <option value="">-- Select a record --</option>
                      {myRecords.map((record) => (
                        <option key={record._id} value={record._id}>
                          {record.vaccineId?.name || 'Vaccine'} - {formatDate(record.dateAdministered)} ({record.dependentName || 'Self'})
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.recordId && <p className="mt-1 text-xs text-danger-500">{errors.recordId.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Symptoms (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fever, Headache, Nausea"
                    {...register('symptoms', { required: 'At least one symptom is required' })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white ${
                      errors.symptoms ? 'border-danger-500' : 'border-slate-300 dark:border-slate-700'
                    }`}
                  />
                  {errors.symptoms && <p className="mt-1 text-xs text-danger-500">{errors.symptoms.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Severity
                  </label>
                  <select
                    {...register('severity', { required: 'Severity is required' })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>

                <Button type="submit" variant="primary" className="w-full mt-4" disabled={isSubmitting || myRecords.length === 0}>
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>

        {/* Previous Reports Column */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Previous Reports</CardTitle>
            </CardHeader>
            <CardBody>
              {loading ? (
                <div className="py-12 flex justify-center"><Spinner /></div>
              ) : error ? (
                <div className="text-danger-500 text-sm">{error}</div>
              ) : reports.length === 0 ? (
                <EmptyState title="No reports yet" description="You haven't submitted any side-effect reports." />
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report._id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <SeverityBadge severity={report.severity} />
                          <span className="text-xs text-slate-500">{formatDate(report.dateReported)}</span>
                        </div>
                        <p className="text-sm text-slate-900 dark:text-white mb-2">
                          <strong>Symptoms:</strong> {report.symptoms.join(', ')}
                        </p>
                        <p className="text-xs text-slate-500">
                          <strong>Vaccine:</strong> {report.recordId?.vaccineId?.name || 'Unknown'} | 
                          <strong> Patient:</strong> {report.recordId?.dependentName || 'Self'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
        
      </div>
    </div>
  );
};

export default MySideEffectsPage;
