import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, LogOut, Activity, Users, MapPin, Download } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { incidentsAPI } from '@/lib/api';

export default function AdminDashboard({ user, token, onLogout }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchIncidents();
  }, [currentPage]);

  useEffect(() => {
    // Reset to page 1 when filter changes
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    // Apply filter and pagination
    const filtered = allIncidents.filter((inc) => {
      if (filter === 'transferred') return inc.transfer_to_hospital;
      if (filter === 'not_transferred') return !inc.transfer_to_hospital;
      return true;
    });
    
    const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    setTotalPages(total || 1);
    
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    setIncidents(filtered.slice(start, end));
  }, [allIncidents, filter, currentPage]);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      // Fetch all incidents (we'll paginate client-side after filtering)
      // In production, you'd want server-side pagination with filters
      let allData = [];
      let skip = 0;
      let hasMore = true;
      
      while (hasMore) {
        const data = await incidentsAPI.getAll({ skip, limit: 100 });
        allData = [...allData, ...data];
        hasMore = data.length === 100;
        skip += 100;
      }
      
      setAllIncidents(allData);
    } catch (error) {
      toast.error('Failed to fetch incidents');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'ID',
      'Date',
      'Personnel',
      'Patient Name',
      'Age',
      'Sex',
      'Location',
      'LGA',
      'Description',
      'Action Taken',
      'Transferred',
    ];

    // Export filtered incidents, not just current page
    const filtered = allIncidents.filter((inc) => {
      if (filter === 'transferred') return inc.transfer_to_hospital;
      if (filter === 'not_transferred') return !inc.transfer_to_hospital;
      return true;
    });

    const rows = filtered.map((inc) => [
      inc.id,
      format(new Date(inc.created_at), 'yyyy-MM-dd HH:mm'),
      inc.personnel_name,
      inc.patient_name,
      inc.patient_age || 'N/A',
      inc.patient_sex,
      inc.location,
      inc.lga,
      inc.description,
      inc.action_taken,
      inc.transfer_to_hospital ? 'Yes' : 'No',
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lasambus-incidents-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Export successful!');
  };

  const stats = {
    total: allIncidents.length,
    transferred: allIncidents.filter((i) => i.transfer_to_hospital).length,
    notTransferred: allIncidents.filter((i) => !i.transfer_to_hospital).length,
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-dashboard">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-[#038B5C] flex items-center justify-center">
              <span className="text-white font-bold text-2xl">L</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">LASAMBUS Admin</h1>
              <p className="text-sm text-slate-600">Incident Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              data-testid="export-button"
              onClick={exportToCSV}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
              <p className="text-xs text-slate-600">Administrator</p>
            </div>
            <Button
              data-testid="admin-logout-button"
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-900"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-emerald-200 bg-emerald-50" data-testid="total-incidents-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-900">Total Incidents</CardTitle>
              <Activity className="h-5 w-5 text-[#038B5C]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50" data-testid="transferred-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Transferred</CardTitle>
              <MapPin className="h-5 w-5 text-[#108A00]" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{stats.transferred}</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-slate-50" data-testid="field-treated-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-900">Field Treated</CardTitle>
              <Users className="h-5 w-5 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stats.notTransferred}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">All Incident Reports</CardTitle>
              <div className="flex gap-2">
                <Button
                  data-testid="filter-all-button"
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  data-testid="filter-transferred-button"
                  variant={filter === 'transferred' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('transferred')}
                >
                  Transferred
                </Button>
                <Button
                  data-testid="filter-field-button"
                  variant={filter === 'not_transferred' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('not_transferred')}
                >
                  Field Treated
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-slate-600">Loading incidents...</p>
            ) : incidents.length === 0 ? (
              <p className="text-center py-8 text-slate-600">No incidents found</p>
            ) : (
              <>
                <div className="space-y-4">
                  {incidents.map((incident) => (
                  <Card key={incident.id} className="border-slate-200" data-testid="incident-card">
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Date & Time</p>
                          <p className="font-medium text-slate-900">
                            {format(new Date(incident.created_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Personnel</p>
                          <p className="font-medium text-slate-900">{incident.personnel_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Patient</p>
                          <p className="font-medium text-slate-900">
                            {incident.patient_name} ({incident.patient_sex}
                            {incident.patient_age ? `, ${incident.patient_age}y` : ''})
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Location</p>
                          <p className="font-medium text-slate-900">
                            {incident.location}, {incident.lga}
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-slate-600">Emergency Description</p>
                          <p className="text-slate-900">{incident.description}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-slate-600">Action Taken</p>
                          <p className="text-slate-900">{incident.action_taken}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Status</p>
                          <Badge
                            variant={incident.transfer_to_hospital ? 'default' : 'secondary'}
                            className="mt-1"
                          >
                            {incident.transfer_to_hospital ? 'Transferred to Hospital' : 'Treated on Field'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
                    <div className="text-sm text-slate-600">
                      Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, stats.total)} of {stats.total} incidents
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        data-testid="pagination-prev"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="min-w-[40px]"
                              data-testid={`pagination-page-${pageNum}`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        data-testid="pagination-next"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
