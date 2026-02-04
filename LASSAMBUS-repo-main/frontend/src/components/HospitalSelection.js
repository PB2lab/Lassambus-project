import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Bed, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { hospitalsAPI, incidentsAPI } from '@/lib/api';

export default function HospitalSelection({ incidentId, onComplete }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const data = await hospitalsAPI.getAll();
      const availableHospitals = data.filter((h) => h.available_beds > 0);
      setHospitals(availableHospitals);
    } catch (error) {
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHospital = async (hospitalId) => {
    const selectedHospital = hospitals.find(h => h.id === hospitalId);
    try {
      await incidentsAPI.update(incidentId, {
        transfer_to_hospital: true,
        hospital_id: hospitalId,
      });
      
      toast.success(
        `Hospital notified for reservation. Contact them on ${selectedHospital.phone}`,
        { duration: 5000 }
      );
      
      // Close modal immediately
      onComplete();
    } catch (error) {
      toast.error('Failed to update incident');
    }
  };

  if (loading) {
    return <p className="text-center py-8 text-slate-400">Loading hospitals...</p>;
  }

  if (hospitals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400 mb-4">No hospitals with available beds at the moment.</p>
        <Button onClick={onComplete} variant="outline">
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="hospital-list">
      {hospitals.map((hospital) => (
        <Card key={hospital.id} className="bg-slate-700 border-slate-600" data-testid="hospital-card">
          <CardHeader>
            <CardTitle className="text-white text-lg">{hospital.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2 text-slate-300">
              <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm">{hospital.address}</p>
                <Badge variant="outline" className="mt-1">
                  {hospital.lga}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="h-4 w-4" />
              <p className="text-sm">{hospital.phone}</p>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Bed className="h-4 w-4" />
              <p className="text-sm">
                <span className="font-semibold text-green-400">{hospital.available_beds}</span> beds available
              </p>
            </div>

            <div className="flex items-start gap-2 text-slate-300">
              <Stethoscope className="h-4 w-4 mt-1 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {hospital.expertise.map((exp) => (
                  <Badge key={exp} variant="secondary" className="text-xs">
                    {exp}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              data-testid={`select-hospital-${hospital.id}`}
              onClick={() => handleSelectHospital(hospital.id)}
              className="w-full mt-3 bg-[#108A00] hover:bg-[#0D6F00] text-white font-semibold rounded-full h-12"
            >
              Select Hospital
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button
        data-testid="skip-hospital-button"
        onClick={onComplete}
        variant="outline"
        className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
      >
        Skip for Now
      </Button>
    </div>
  );
}
