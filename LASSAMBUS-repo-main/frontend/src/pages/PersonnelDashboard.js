import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Ambulance, LogOut, MapPin, User, Activity } from 'lucide-react';
import { toast } from 'sonner';
import HospitalSelection from '@/components/HospitalSelection';
import { incidentsAPI } from '@/lib/api';

const LAGOS_LGAS = [
  'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa',
  'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye',
  'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland',
  'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'
];

export default function PersonnelDashboard({ user, token, onLogout }) {
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_age: '',
    patient_sex: '',
    location: '',
    lga: '',
    description: '',
    action_taken: '',
  });
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [currentIncidentId, setCurrentIncidentId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        patient_age: formData.patient_age ? parseInt(formData.patient_age) : null,
        transfer_to_hospital: false,
      };

      const response = await incidentsAPI.create(payload);

      setCurrentIncidentId(response.id);
      toast.success('Incident report saved successfully!');
      setShowTransferModal(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save incident');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferDecision = (transferToHospital) => {
    setShowTransferModal(false);
    if (transferToHospital) {
      setShowHospitalModal(true);
    } else {
      resetForm();
    }
  };

  const handleHospitalSelected = () => {
    setShowHospitalModal(false);
    resetForm();
    setTimeout(() => {
      toast.info('Report completed. Ready for next incident.', { duration: 3000 });
    }, 500);
  };

  const resetForm = () => {
    setFormData({
      patient_name: '',
      patient_age: '',
      patient_sex: '',
      location: '',
      lga: '',
      description: '',
      action_taken: '',
    });
    setCurrentIncidentId(null);
  };

  return (
    <div className="min-h-screen bg-slate-900" data-testid="personnel-dashboard">
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[#038B5C] flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">LASAMBUS</h1>
              <p className="text-xs text-slate-400">Personnel Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{user.full_name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
            <Button
              data-testid="logout-button"
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="text-slate-300 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <Card className="bg-slate-800 border-slate-700" data-testid="incident-report-form">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Incident Report Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="patient_name" className="text-slate-200 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Patient Name *
                </Label>
                <Input
                  id="patient_name"
                  data-testid="patient-name-input"
                  type="text"
                  placeholder="Enter patient's full name"
                  value={formData.patient_name}
                  onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                  required
                  className="bg-slate-900 border-slate-600 text-white h-12"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient_age" className="text-slate-200">
                    Patient Age
                  </Label>
                  <Input
                    id="patient_age"
                    data-testid="patient-age-input"
                    type="number"
                    placeholder="Age"
                    value={formData.patient_age}
                    onChange={(e) => setFormData({ ...formData, patient_age: e.target.value })}
                    className="bg-slate-900 border-slate-600 text-white h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="patient_sex" className="text-slate-200">
                    Sex *
                  </Label>
                  <select
                    id="patient_sex"
                    data-testid="patient-sex-select"
                    value={formData.patient_sex}
                    onChange={(e) => setFormData({ ...formData, patient_sex: e.target.value })}
                    required
                    className="w-full h-12 bg-slate-900 border border-slate-600 text-white rounded-lg px-3"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-slate-200 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location *
                </Label>
                <Input
                  id="location"
                  data-testid="location-input"
                  type="text"
                  placeholder="Street address or landmark"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="bg-slate-900 border-slate-600 text-white h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lga" className="text-slate-200">
                  Local Government Area *
                </Label>
                <select
                  id="lga"
                  data-testid="lga-select"
                  value={formData.lga}
                  onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                  required
                  className="w-full h-12 bg-slate-900 border border-slate-600 text-white rounded-lg px-3"
                >
                  <option value="">Select LGA</option>
                  {LAGOS_LGAS.map((lga) => (
                    <option key={lga} value={lga}>
                      {lga}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-200 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Description of Emergency *
                </Label>
                <Textarea
                  id="description"
                  data-testid="description-textarea"
                  placeholder="Describe the emergency situation"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={4}
                  className="bg-slate-900 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action_taken" className="text-slate-200">
                  Action Taken *
                </Label>
                <Textarea
                  id="action_taken"
                  data-testid="action-taken-textarea"
                  placeholder="Describe actions taken by ambulance personnel"
                  value={formData.action_taken}
                  onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
                  required
                  rows={4}
                  className="bg-slate-900 border-slate-600 text-white"
                />
              </div>

              <Button
                type="submit"
                data-testid="submit-incident-button"
                className="w-full h-14 bg-[#038B5C] hover:bg-[#02764E] text-white font-semibold text-lg rounded-full"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Submit Incident Report'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md" data-testid="transfer-modal">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Transfer to Hospital?</DialogTitle>
            <DialogDescription className="text-slate-300">
              Does the patient need to be transferred to a hospital?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              data-testid="transfer-yes-button"
              onClick={() => handleTransferDecision(true)}
              className="h-16 bg-[#108A00] hover:bg-[#0D6F00] text-white font-bold text-lg rounded-full"
            >
              Yes
            </Button>
            <Button
              data-testid="transfer-no-button"
              onClick={() => handleTransferDecision(false)}
              className="h-16 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-full"
            >
              No
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showHospitalModal} onOpenChange={setShowHospitalModal}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="hospital-selection-modal">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Available Hospitals</DialogTitle>
            <DialogDescription className="text-slate-300">
              Select a hospital to transfer the patient
            </DialogDescription>
          </DialogHeader>
          <HospitalSelection
            incidentId={currentIncidentId}
            onComplete={handleHospitalSelected}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
