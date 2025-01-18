'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import 'react-toastify/dist/ReactToastify.css';
import { toast, ToastContainer } from 'react-toastify';

// Icons
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { IoMdAdd, IoMdClose } from 'react-icons/io';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { Loader2 } from 'lucide-react';
import { FaExclamationTriangle, FaCopy, FaFlask, FaTrash } from 'react-icons/fa';
import { FaPerson } from 'react-icons/fa6';
import { FaMapMarker } from 'react-icons/fa';
import { GiMedicines, GiDna1, GiChestnutLeaf } from 'react-icons/gi';
import { CgPill } from 'react-icons/cg';
import { SiMicrogenetics } from 'react-icons/si';

type Patient = {
  id: number;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  race: string;
  email: string;
  KetissuedOn: string | null;
  KetexpiresOn: string | null;
  thcInteraction: boolean;
  cbdInteraction: boolean;
  ketamineInteraction: boolean;
  facility: {
    id: number;
    name: string;
  } | null;
  alerts: Array<{
    id: number;
    title: string;
    description: string;
  }>;
  medications: Array<{
    id: number;
    medicationId: number;
    name: string;
  }>;
  notes: Array<{
    id: number;
    text: string;
    createdAt: string;
    title?: string; // if your API returns 'title', make sure to have it typed here
  }>;
};

interface Medication {
  drugName: string;
  genericName: string;
  medispanID: string;
  routableDrugName: string;
}

interface NoteItem {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

interface PatientSummary {
  DrugRiskSummary: string;
  DuplicateTherapySummary: string;
  GeneticRiskSummary: string;
  InductionRiskSummary: string;
  RiskFactorSummary: string;
}

interface AssessmentData {
  Drugs: Drug[];
  drugsByLocation: {
    [key: string]: {
      drugName: string;
      alertScore: number;
    };
  };
  PatientSummary: PatientSummary;
  TestResults: TestResult[];
}

interface Drug {
  drugName: string;
  genericName: string;
  medispanID: string;
  routableDrugName: string;
  alertScore: number;
  fourSquareLocation: number;
  fourSquareLocationDescription: string;
  singleDrugRisk?: number;
  lifeStyle: {
    alcohol?: string;
    food?: string;
  };
  InInAlertScore: string;
  interactionTotal: number;
  drugInteractionRiskScore: string | number;
  conditionList?: {
    conditionID: string;
    conditionName: string;
    knownCondition: boolean;
  }[];
  geneticInteraction?: {
    aDRScore: number;
    efficacyScore: number;
    evidenceStrength: number;
    explanations: string[];
    prescribingExplanation: string;
    resultConcern: string;
    resultExpectedPhenotype: string;
    resultImpact: string;
    severity: string;
    theraputicRecommendation: string;
  };
  geneticInteractionAlertScore?: number;
  MedispanType?: string;
  highestDrugToDrugEfficacy: number;
  highestDrugToDrugInteraction: number;
  inductionInhibitionInteraction: {
    InADRScore: number;
    InEfficacyScore: number;
    InPrescribingExplanation: string;
    InResultConcern: string;
    InResultExpectedPhenotype: string;
    InResultImpact: string;
    InSeverity: string;
    InTheraputicRecommendation: string;
    evidenceStrength: number;
  };
  ingredient: {
    ingredientName: string;
    mediSpanID: string;
  }[];
  interactionList?: {
    adrScore: number;
    efficacyScore: number;
    interactingDrugs: string[];
    interactionLevelText: string;
    interactionSimple: string;
  }[];
  contradition: string;
}

interface TestResult {
  ADRScore: number;
  EfficacyScore: number;
  Explanations: string[];
}

// -----------------------
// Helpers
// -----------------------
function getLocationDescription(location: number) {
  switch (location) {
    case 1:
      return 'highRiskHighBenefit';
    case 2:
      return 'highRiskLowBenefit';
    case 3:
      return 'lowRiskHighBenefit';
    case 4:
      return 'lowRiskLowBenefit';
    default:
      return '';
  }
}

function countRisks(summary: PatientSummary | undefined) {
  if (!summary) return 0;
  return Object.values(summary).filter((val) => val && val.trim() !== '').length;
}

function convertPatientSummaryToAlerts(summary?: PatientSummary) {
  if (!summary) return [];

  const alerts = [];

  if (summary.DrugRiskSummary) {
    alerts.push({
      title: 'Drug Risk',
      description: summary.DrugRiskSummary,
    });
  }
  if (summary.GeneticRiskSummary) {
    alerts.push({
      title: 'Genetic Risk',
      description: summary.GeneticRiskSummary,
    });
  }
  if (summary.RiskFactorSummary) {
    alerts.push({
      title: 'Risk Factor',
      description: summary.RiskFactorSummary,
    });
  }
  if (summary.DuplicateTherapySummary) {
    alerts.push({
      title: 'Duplicate Therapy',
      description: summary.DuplicateTherapySummary,
    });
  }
  if (summary.InductionRiskSummary) {
    alerts.push({
      title: 'Induction Risk',
      description: summary.InductionRiskSummary,
    });
  }

  return alerts;
}

// A small AlertBox component
function AlertBox({
  title,
  content,
  icon: Icon,
}: {
  title: string;
  content: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="border rounded-lg overflow-hidden flex flex-col">
      <div className="px-4 py-2 flex flex-row items-center">
        <Icon className="text-black mr-2" size={18} />
        <h3 className="text-sm text-gray-700">{title}</h3>
      </div>
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-700">{content}</p>
      </div>
    </div>
  );
}

// QuadrantBox for the four squares
function QuadrantBox({ drug }: { drug: Drug | null }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!drug) {
    return <div className="border rounded-lg p-2 shadow-sm bg-white h-56 w-full" />;
  }

  return (
    <>
      <div
        className="border rounded-lg p-2 shadow-sm bg-white h-56 w-full cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="border boder-green p-2 rounded space-y-1 relative group">
          <div className="flex gap-2">
            <span className="font-bold text-black">{drug.drugName}</span>
          </div>
          <div className="flex flex-row space-x-2">
            {drug.geneticInteraction?.aDRScore && drug.geneticInteraction.aDRScore > 0 && (
              <GiMedicines size={10} className="text-black" />
            )}
            {drug.singleDrugRisk !== undefined && drug.singleDrugRisk > 0 && (
              <CgPill size={10} className="text-black" />
            )}
            {drug.geneticInteractionAlertScore !== undefined &&
              drug.geneticInteractionAlertScore > 0 && (
                <SiMicrogenetics size={10} className="text-black" />
              )}
            {drug.lifeStyle && (drug.lifeStyle.food || drug.lifeStyle.alcohol) && (
              <FaPerson size={10} className="text-black" />
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-gray-600">Alert score: {drug.alertScore}</p>
            <div className="w-24 h-1 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(drug.alertScore / 35) * 100}%` }}
              />
            </div>
          </div>
          <div className="absolute inset-0 bg-white bg-opacity-90 text-gray-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded">
            <p className="text-sm text-center px-2">
              Total aggregated alert score. Range 0–35, 35 is the highest
            </p>
          </div>
        </div>
      </div>

      {/* Modal with details */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl m-4 relative z-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <IoMdClose size={24} />
            </button>

            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="text-lg font-bold text-black mb-2">{drug.drugName}</h3>
                {drug.MedispanType && (
                  <p className="text-sm font-bold text-gray-500">{drug.MedispanType}</p>
                )}
                <div className="inline-flex items-center bg-purple-100 bg-opacity-50 p-2 rounded-full mt-2 space-x-2 mb-2">
                  <FaMapMarker className="text-purple-800" />
                  <p className="text-gray-700 text-xs font-bold">
                    {drug.fourSquareLocation === 1 && 'Higher Risk of ADR'}
                    {drug.fourSquareLocation === 2 && 'Lower Benefit & Higher Risk'}
                    {drug.fourSquareLocation === 3 && 'Higher Benefit & Lower Risk'}
                    {drug.fourSquareLocation === 4 && 'Lower Benefit & Lower Risk'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 border-b pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Alert Score: {drug.alertScore}</span>
                  <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(drug.alertScore / 35) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1 bg-opacity-50">
                  <GiChestnutLeaf className="text-black" />
                  <span className="text-sm text-gray-700">{drug.InInAlertScore || '0'}</span>
                </div>
                <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1 bg-opacity-50">
                  <GiMedicines className="text-black" />
                  <span className="text-sm text-gray-700">
                    {drug.drugInteractionRiskScore || '0'}
                  </span>
                </div>
                <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1 bg-opacity-50">
                  <CgPill className="text-black" />
                  <span className="text-sm text-gray-700">{drug.singleDrugRisk || '0'}</span>
                </div>
                <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1 bg-opacity-50">
                  <SiMicrogenetics className="text-black" />
                  <span className="text-sm text-gray-700">
                    {drug.geneticInteractionAlertScore ?? '0'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 pb-4">
                {/* Example cannabis row */}
                <div className="flex items-center space-x-2 border-b pb-2">
                  <div
                    className={`p-2 rounded-full flex flex-row space-x-1 items-center ${
                      drug.inductionInhibitionInteraction?.InSeverity === 'low'
                        ? 'bg-purple-100'
                        : 'bg-gray-100 bg-opacity-50'
                    }`}
                  >
                    <GiChestnutLeaf />
                    <p className="text-gray-700 text-xs">
                      {drug.inductionInhibitionInteraction?.InSeverity === 'low'
                        ? `Cannabis interaction - evidence level ${drug.inductionInhibitionInteraction.InSeverity}`
                        : 'No Cannabis interaction'}
                    </p>
                  </div>
                </div>

                {drug.inductionInhibitionInteraction?.InPrescribingExplanation && (
                  <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-start border-b pb-3">
                    <span className="font-medium text-xs text-gray-700">Cannabis Interaction</span>
                    <GiMedicines size={12} className="justify-self-start" />
                    <span className="text-xs text-gray-500 col-span-2 space-y-2">
                      <p>{drug.inductionInhibitionInteraction.InPrescribingExplanation}</p>
                      {drug.inductionInhibitionInteraction.InTheraputicRecommendation && (
                        <>
                          <p className="font-medium">Recommendation:</p>
                          <p>{drug.inductionInhibitionInteraction.InTheraputicRecommendation}</p>
                        </>
                      )}
                    </span>
                  </div>
                )}

                {/* Additional interactions, lifestyle, etc. */}
                {/* ... */}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function PatientPage() {
  const params = useParams();
  const id = params?.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);

  // Expanders
  const [isPersonalInfoExpanded, setIsPersonalInfoExpanded] = useState(true);
  const [isAlertExpanded, setIsAlertExpanded] = useState(true);

  // Toggles
  const [thcChecked, setThcChecked] = useState(false);
  const [cbdChecked, setCbdChecked] = useState(false);
  const [ketamineChecked, setKetamineChecked] = useState(false);

  // Meds
  const [medicationQuery, setMedicationQuery] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [savedMedications, setSavedMedications] = useState<Medication[]>([]);

  // Assessment
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [isLoadingAssessment, setIsLoadingAssessment] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [expandedDrugs, setExpandedDrugs] = useState<{ [key: string]: boolean }>({});

  // Tabs
  const [activeTab, setActiveTab] = useState<'Details' | 'Citation'>('Details');

  // Citations
  const [citationsLoading, setCitationsLoading] = useState(false);
  const [citations, setCitations] = useState<{ [key: string]: any }>({});

  // Notes
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDescription, setNoteDescription] = useState('');
  const [expandedNotes, setExpandedNotes] = useState<{ [id: number]: boolean }>({});

  // Custom Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);

  // ----------------------------------
  //  Delete Confirmation
  // ----------------------------------
  function openDeleteModal(noteId: number) {
    setNoteToDelete(noteId);
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setNoteToDelete(null);
    setIsDeleteModalOpen(false);
  }

  async function handleConfirmDelete() {
    if (!noteToDelete) return;

    try {
      const response = await fetch(`/api/notes/${noteToDelete}`, { method: 'DELETE' });

      if (!response.ok) {
        // Check content-type to parse either JSON or text
        const contentType = response.headers.get('content-type') || '';
        let errorMsg = '';

        if (contentType.includes('application/json')) {
          const errorJson = await response.json();
          errorMsg = errorJson.error || 'Unknown error';
        } else {
          const errorText = await response.text();
          errorMsg = errorText || 'Unknown error';
        }
        console.error('Error deleting note:', errorMsg);
        toast.error(`Error deleting note: ${errorMsg}`);
        return;
      }

      // Success
      setNotes((prev) => prev.filter((n) => n.id !== noteToDelete));
      toast.success('Note deleted!');
    } catch (err) {
      console.error('Network error deleting note:', err);
      toast.error('Network error deleting note.');
    } finally {
      closeDeleteModal();
    }
  }

  // ----------------------------------
  //  Fetch Patient
  // ----------------------------------
  useEffect(() => {
    async function fetchPatient() {
      setIsLoading(true);
      setIsLoadingAssessment(true);

      try {
        console.log('Fetching patient data...');
        const response = await fetch(`/api/patients/${id}`);
        if (!response.ok) throw new Error('Failed to fetch patient data');

        const data = await response.json();
        console.log('Received patient data:', data);

        // Check facility, if needed
        if (data.facility?.id !== 2) {
          setError('You do not have permission to view this patient.');
          return;
        }

        // Convert meds
        const initMeds: Medication[] = data.medications.map((m: any) => ({
          drugName: m.name,
          genericName: '',
          medispanID: String(m.medicationId),
          routableDrugName: m.name,
        }));

        // Convert notes
        const dbNotes: NoteItem[] = data.notes.map((n: any) => ({
          id: n.id,
          title: n.title || '',
          description: n.text,
          createdAt: n.createdAt,
        }));

        // Set state
        setPatient(data);
        setThcChecked(data.thcInteraction);
        setCbdChecked(data.cbdInteraction);
        setKetamineChecked(data.ketamineInteraction);
        setSavedMedications(initMeds);
        setNotes(dbNotes);

        // Optionally load existing assessmentData from server (if stored)
        // e.g. if server returns `data.assessmentData`
        if (data.assessmentData) {
          setAssessmentData(data.assessmentData);
          console.log('Loaded existing assessmentData from server');
        }

        // If there are meds or interactions, auto-generate a new assessment
        // only if no stored assessmentData or you want to override
        if (
          initMeds.length > 0 ||
          data.thcInteraction ||
          data.cbdInteraction ||
          data.ketamineInteraction
        ) {
          console.log('Initial conditions met, generating report...');
          try {
            await generateReport(initMeds, data.thcInteraction, data.cbdInteraction, data.ketamineInteraction);
          } catch (reportError) {
            console.error('Error in initial report generation:', reportError);
            toast.error('Failed to generate initial assessment');
          }
        } else {
          console.log('No initial conditions for report generation');
          setIsLoadingAssessment(false);
        }
      } catch (err) {
        console.error('Error in patient fetch:', err);
        setError(err instanceof Error ? err.message : 'Error loading patient');
        toast.error('Failed to load patient data');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchPatient();
    }
  }, [id]);

  // ----------------------------------
  //  Generate chart
  // ----------------------------------
  async function generateReport(
    medications = savedMedications,
    thc = thcChecked,
    cbd = cbdChecked,
    ketamine = ketamineChecked
  ) {
    if (!patient) return;
    setIsLoadingAssessment(true);
    setIsGeneratingReport(true);

    try {
      const replacements = medications.map((med) => ({ newDrug: med.medispanID }));
      if (cbd) {
        replacements.push({ newDrug: '203391' }); // Example for CBD
      }

      const body = { patientID: patient.id, replacements };
      const resp = await fetch('/api/generateReport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const contentType = resp.headers.get('content-type') || '';
        let errorMsg = '';
        if (contentType.includes('application/json')) {
          const errorJson = await resp.json();
          errorMsg = errorJson.error || 'Unknown error';
        } else {
          const errorText = await resp.text();
          errorMsg = errorText || 'Unknown error';
        }
        console.error('Failed to generate report:', errorMsg);
        setAssessmentData(null);
        return;
      }

      const data = await resp.json();
      const locationMap: { [key: string]: { drugName: string; alertScore: number } } = {};

      if (data.Drugs && Array.isArray(data.Drugs)) {
        data.Drugs.forEach((drug: Drug) => {
          const locationKey = getLocationDescription(drug.fourSquareLocation);
          if (locationKey) {
            locationMap[locationKey] = {
              drugName: drug.drugName,
              alertScore: drug.alertScore,
            };
          }
        });
      }

      setAssessmentData({
        Drugs: data.Drugs || [],
        drugsByLocation: locationMap,
        PatientSummary: data.PatientSummary || {},
        TestResults: data.TestResults || [],
      });
    } catch (err) {
      console.error('Error generating chart:', err);
      setAssessmentData(null);
    } finally {
      setIsLoadingAssessment(false);
      setIsGeneratingReport(false);
    }
  }

  // auto-generate chart if editing
  useEffect(() => {
    if (isEditing) {
      generateReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedMedications, thcChecked, cbdChecked, ketamineChecked]);

  // ----------------------------------
  //  Save / Discard
  // ----------------------------------
  async function handleSave() {
    if (!patient) return;

    // Convert the dynamic summary to an array of system-generated alerts
    // that you'd like the server to store
    const newAssessmentAlerts = convertPatientSummaryToAlerts(assessmentData?.PatientSummary);

    const payload = {
      thcInteraction: thcChecked,
      cbdInteraction: cbdChecked,
      ketamineInteraction: ketamineChecked,
      medications: savedMedications,
      notes,
      // Include entire assessment data
      assessmentData,
      // Include an array of new auto-generated alerts
      generatedAlerts: newAssessmentAlerts,
    };

    try {
      const response = await fetch(`/api/patients/${patient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        let errorMsg = '';
        if (contentType.includes('application/json')) {
          const errorJson = await response.json();
          errorMsg = errorJson.error || 'Unknown error';
        } else {
          const errorText = await response.text();
          errorMsg = errorText || 'Unknown error';
        }
        console.error('Error saving changes:', errorMsg);
        toast.error(`Error saving profile: ${errorMsg}`);
        return;
      }

      // Success
      toast.success('Profile saved successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving changes:', err);
      toast.error('Network error saving profile.');
    }
  }

  function handleDiscard() {
    if (!patient) return;
    setThcChecked(patient.thcInteraction);
    setCbdChecked(patient.cbdInteraction);
    setKetamineChecked(patient.ketamineInteraction);

    // revert meds
    const initMeds: Medication[] = patient.medications.map((m) => ({
      drugName: m.name,
      genericName: '',
      medispanID: String(m.medicationId),
      routableDrugName: m.name,
    }));
    setSavedMedications(initMeds);

    // revert notes
    const revertNotes: NoteItem[] = patient.notes.map((n) => ({
      id: n.id,
      title: n.title || '(No title)',
      description: n.text,
      createdAt: n.createdAt,
    }));
    setNotes(revertNotes);

    setIsEditing(false);
  }

  // ----------------------------------
  //  Medication search
  // ----------------------------------
  async function fetchMedicationsAPI(query: string) {
    if (!query) {
      setMedications([]);
      return;
    }
    try {
      const resp = await fetch(`/api/medication?query=${encodeURIComponent(query)}`);
      if (resp.ok) {
        const data = await resp.json();
        setMedications(data);
      } else {
        setMedications([]);
      }
    } catch (err) {
      console.error('Error fetching meds:', err);
      setMedications([]);
    }
  }

  // ----------------------------------
  //  Add/remove meds
  // ----------------------------------
  function handleAddMedication(med: Medication) {
    if (!isEditing) return;
    setSavedMedications((prev) => [...prev, med]);
    setMedications([]);
  }

  function handleRemoveMedication(index: number) {
    if (!isEditing) return;
    setSavedMedications((prev) => prev.filter((_, i) => i !== index));
  }

  // ----------------------------------
  //  Quadrant helper
  // ----------------------------------
  function getDrugForQuadrant(location: string): Drug | null {
    if (!assessmentData) return null;
    const info = assessmentData.drugsByLocation[location];
    if (!info) return null;
    return assessmentData.Drugs.find((d) => d.drugName === info.drugName) || null;
  }

  // ----------------------------------
  //  Expand/collapse “Details”
  // ----------------------------------
  function toggleDrugExpansion(drugName: string) {
    setExpandedDrugs((prev) => ({
      ...prev,
      [drugName]: !prev[drugName],
    }));
  }

  // ----------------------------------
  //  Note creation
  // ----------------------------------
  function handleAddNote() {
    if (!noteTitle.trim()) return;
    const newNote: NoteItem = {
      id: Date.now(),
      title: noteTitle,
      description: noteDescription,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [...prev, newNote]);
    setNoteTitle('');
    setNoteDescription('');
  }

  function toggleNote(id: number) {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  // ----------------------------------
  //  Render
  // ----------------------------------
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-700 rounded-full animate-spin"></div>
      </div>
    );
  }
  if (error) {
    return <div className="p-8 text-red-600">Error: {error}</div>;
  }
  if (!patient) {
    return <div className="p-8">Patient not found</div>;
  }

  return (
    <>
      <ToastContainer position="top-right" />

      <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
        <div className="bg-white rounded-lg p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <a href="/patient-list" className="text-blue-600 text-xl hover:underline">
                Patients
              </a>
              <span className="mx-2">/</span>
              <span className="text-xl font-bold">
                {patient.firstName} {patient.lastName}
              </span>
            </div>
            {isEditing ? (
              <div className="space-x-4">
                <button
                  onClick={handleSave}
                  className="border bg-gray-800 text-white px-4 py-2 rounded-xl"
                >
                  Save
                </button>
                <button
                  onClick={handleDiscard}
                  className="text-black border px-4 py-2 rounded-xl hover:bg-gray-200"
                >
                  Discard
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-600 p-2 rounded hover:underline"
              >
                Edit
              </button>
            )}
          </div>

          {/* Personal Info */}
          <div className="border-b pb-4">
            <button
              onClick={() => setIsPersonalInfoExpanded(!isPersonalInfoExpanded)}
              className="w-full text-left text-lg font-semibold flex justify-between items-center"
            >
              Personal Info
              {isPersonalInfoExpanded ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </button>
            {isPersonalInfoExpanded && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <p>
                  <span className="text-gray-500">DOB:</span>
                  <br />
                  {new Date(patient.dob).toLocaleDateString()}
                </p>
                <p>
                  <span className="text-gray-500">Gender:</span>
                  <br />
                  {patient.gender}
                </p>
                <p>
                  <span className="text-gray-500">Race:</span>
                  <br />
                  {patient.race}
                </p>
                <p>
                  <span className="text-gray-500">Email:</span>
                  <br />
                  {patient.email}
                </p>
                <p>
                  <span className="text-gray-500">Facility:</span>
                  <br />
                  {patient.facility?.name || 'N/A'}
                </p>
                <p>
                  <span className="text-gray-500">Certificate Issued On:</span>
                  <br />
                  {patient.KetissuedOn ? new Date(patient.KetissuedOn).toLocaleDateString() : 'N/A'}
                </p>
                <p>
                  <span className="text-gray-500">Certificate Expires On:</span>
                  <br />
                  {patient.KetexpiresOn ? new Date(patient.KetexpiresOn).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            )}
          </div>

          {/* Alerts */}
          <div className="border-b pb-4">
            <button
              onClick={() => setIsAlertExpanded(!isAlertExpanded)}
              className="w-full text-left text-lg font-semibold flex justify-between items-center"
            >
              Alerts
              {isAlertExpanded ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </button>
            {isAlertExpanded && (
              <div className="mt-4 space-y-4">
                {patient.alerts.length === 0 &&
                (!assessmentData?.PatientSummary || countRisks(assessmentData.PatientSummary) === 0) ? (
                  <p className="text-sm text-gray-500">No alerts</p>
                ) : (
                  patient.alerts.map((a) => (
                    <div key={a.id} className="border-l-4 border-yellow-500 bg-yellow-100 p-4">
                      <h3 className="font-bold">{a.title}</h3>
                      <p>{a.description}</p>
                    </div>
                  ))
                )}

                {/* System-generated or "dynamic" alerts from assessmentData */}
                {assessmentData?.PatientSummary && countRisks(assessmentData.PatientSummary) > 0 && (
                  <div className="space-y-4">
                    {assessmentData.PatientSummary.DrugRiskSummary && (
                      <AlertBox
                        title="Drug Risk"
                        content={assessmentData.PatientSummary.DrugRiskSummary}
                        icon={GiMedicines}
                      />
                    )}
                    {assessmentData.PatientSummary.GeneticRiskSummary && (
                      <AlertBox
                        title="Genetic Risk"
                        content={assessmentData.PatientSummary.GeneticRiskSummary}
                        icon={GiDna1}
                      />
                    )}
                    {assessmentData.PatientSummary.RiskFactorSummary && (
                      <AlertBox
                        title="Risk Factor"
                        content={assessmentData.PatientSummary.RiskFactorSummary}
                        icon={FaExclamationTriangle}
                      />
                    )}
                    {assessmentData.PatientSummary.DuplicateTherapySummary && (
                      <AlertBox
                        title="Duplicate Therapy"
                        content={assessmentData.PatientSummary.DuplicateTherapySummary}
                        icon={FaCopy}
                      />
                    )}
                    {assessmentData.PatientSummary.InductionRiskSummary && (
                      <AlertBox
                        title="Induction Risk"
                        content={assessmentData.PatientSummary.InductionRiskSummary}
                        icon={FaFlask}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cannabis */}
          <div className="border-b pb-4">
            <h2 className="text-sm font-bold text-gray-800 mb-2">Cannabis</h2>
            {isEditing ? (
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 border-gray-300 rounded accent-purple-600"
                    checked={thcChecked}
                    onChange={() => setThcChecked(!thcChecked)}
                  />
                  <span className="text-sm text-gray-700">THC</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 border-gray-300 rounded accent-purple-600"
                    checked={cbdChecked}
                    onChange={() => setCbdChecked(!cbdChecked)}
                  />
                  <span className="text-sm text-gray-700">CBD</span>
                </label>
                <button
                  className="text-purple-500 underline text-xs"
                  onClick={() => {
                    setThcChecked(false);
                    setCbdChecked(false);
                  }}
                >
                  Clear
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-700 space-x-4">
                <span>THC: {thcChecked ? 'Yes' : 'No'}</span>
                <span>CBD: {cbdChecked ? 'Yes' : 'No'}</span>
              </p>
            )}
          </div>

          {/* Ketamine */}
          <div className="border-b pb-4">
            <h2 className="text-sm font-bold text-gray-800 mb-2">Ketamine</h2>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 border-gray-300 rounded accent-purple-600"
                    checked={ketamineChecked}
                    onChange={() => setKetamineChecked(!ketamineChecked)}
                  />
                  <span className="text-sm text-gray-700">Include</span>
                </label>
                <button
                  className={`text-purple-500 underline text-xs ${
                    !ketamineChecked ? 'opacity-30' : ''
                  }`}
                  onClick={() => setKetamineChecked(false)}
                >
                  Clear
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-700">
                Ketamine: {ketamineChecked ? 'Included' : 'Not Included'}
              </p>
            )}
          </div>

          {/* Medication */}
          <div className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-gray-800">Medication</h2>
                {savedMedications.length > 0 && (
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {savedMedications.length}
                  </span>
                )}
              </div>
              {isEditing && (
                <button
                  className={`text-purple-500 underline font-bold text-xs ${
                    savedMedications.length === 0 ? 'opacity-30' : ''
                  }`}
                  onClick={() => {
                    setSavedMedications([]);
                    setAssessmentData(null);
                  }}
                >
                  Clear All
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <div className="border border-gray-500 p-2 rounded-full flex space-x-2 focus-within:border-purple-500 transition-colors duration-200">
                  <HiMagnifyingGlass className="text-purple-300" />
                  <input
                    type="text"
                    placeholder="Medication"
                    value={medicationQuery}
                    onChange={(e) => {
                      setMedicationQuery(e.target.value);
                      fetchMedicationsAPI(e.target.value);
                    }}
                    className="w-full outline-none bg-transparent text-sm text-black"
                  />
                </div>
                {medications.length > 0 && (
                  <div className="mt-2 border rounded-xl max-h-60 overflow-y-auto">
                    {medications.map((m, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded text-sm hover:bg-purple-100 hover:bg-opacity-50 cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium text-gray-800">{m.drugName}</p>
                        </div>
                        <button
                          className="text-white bg-purple-600 p-2 rounded-full shadow"
                          onClick={() => handleAddMedication(m)}
                        >
                          <IoMdAdd />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-4">
                  {savedMedications.map((item, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center bg-gray-100 border p-2 rounded-full text-sm"
                    >
                      <span className="font-medium text-gray-800 mr-2">{item.routableDrugName}</span>
                      <IoMdClose
                        size={18}
                        className="text-black cursor-pointer"
                        onClick={() => handleRemoveMedication(idx)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {savedMedications.length === 0 ? (
                  <p className="text-sm text-gray-500">No medications</p>
                ) : (
                  savedMedications.map((item, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-200 text-gray-800 px-2 py-1 rounded-xl bg-opacity-50 text-sm"
                    >
                      {item.drugName}
                    </span>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Notes</h2>
            {isEditing && (
              <div className="mb-4 rounded">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    className="w-full mt-1 p-2 border rounded-xl shadow-sm"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    className="w-full mt-1 p-2 border rounded-xl shadow-sm"
                    rows={3}
                    value={noteDescription}
                    onChange={(e) => setNoteDescription(e.target.value)}
                  />
                </div>
                <button
                  className="bg-gray-800 text-white px-3 py-1 rounded-xl"
                  onClick={handleAddNote}
                >
                  Add Note
                </button>
              </div>
            )}

            {notes.length === 0 ? (
              <p className="text-sm text-gray-500">No notes</p>
            ) : (
              <div className="divide-y">
                {notes.map((note) => {
                  const isExpanded = !!expandedNotes[note.id];
                  return (
                    <div key={note.id} className="py-2">
                      <div className="flex justify-between items-center mb-1">
                        <div
                          className="flex items-center cursor-pointer"
                          onClick={() =>
                            setExpandedNotes((prev) => ({
                              ...prev,
                              [note.id]: !prev[note.id],
                            }))
                          }
                        >
                          <div className="flex flex-row items-center space-x-2">
                            <p className="font-medium text-sm text-gray-400">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </p>
                            <p className="font-bold">- {note.title}</p>
                          </div>

                          {isExpanded ? (
                            <IoIosArrowUp className="ml-2 text-gray-500" />
                          ) : (
                            <IoIosArrowDown className="ml-2 text-gray-500" />
                          )}
                        </div>

                        <FaTrash
                          className="text-red-500 text-opacity-50 hover:text-opacity-100 cursor-pointer"
                          onClick={() => openDeleteModal(note.id)}
                        />
                      </div>
                      {isExpanded && note.description && (
                        <div className="mt-2 text-sm text-gray-700">{note.description}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN => Chart */}
        <div>
          <div className="border border-gray-300 rounded-lg shadow-sm bg-white">
            <div className="p-2 flex justify-between items-center">
              <h2 className="text-gray-800 font-medium text-md">Assessment</h2>
            </div>

            <div className="p-2">
              {isLoadingAssessment ? (
                <div className="flex items-center justify-center h-[400px]">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : assessmentData ? (
                <div className="space-y-6">
                  {/* Quadrant chart */}
                  <div className="relative w-full h-[500px]">
                    <div className="absolute left-0 top-0 bottom-0 flex items-center">
                      <div className="relative h-full flex items-center justify-center w-full">
                        <span className="-rotate-90 whitespace-nowrap text-gray-500 absolute -left-7 w-[500px] text-center z-10">
                          Lower Risk &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Higher Risk
                        </span>
                      </div>
                    </div>

                    <div
                      className="absolute inset-0 ml-12"
                      style={{
                        background: 'radial-gradient(circle at center, rgb(233 213 255) 0%, transparent 70%)',
                      }}
                    />

                    <div className="grid grid-cols-2 gap-8 h-full relative z-10">
                      <QuadrantBox drug={getDrugForQuadrant('highRiskHighBenefit')} />
                      <QuadrantBox drug={getDrugForQuadrant('highRiskLowBenefit')} />
                      <QuadrantBox drug={getDrugForQuadrant('lowRiskHighBenefit')} />
                      <QuadrantBox drug={getDrugForQuadrant('lowRiskLowBenefit')} />
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="transform text-center w-full flex items-center justify-center z-5 text-gray-500">
                        Higher Benefit
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Lower Benefit
                      </span>
                    </div>
                  </div>

                  {/* Details / Citation tabs */}
                  <div>
                    <div className="flex space-x-4 mb-4 w-full justify-between">
                      <button
                        className={`text-sm font-medium w-1/2 ${
                          activeTab === 'Details'
                            ? 'text-purple-600 border-b border-purple-500'
                            : 'text-gray-600'
                        }`}
                        onClick={() => setActiveTab('Details')}
                      >
                        Details
                      </button>
                      <button
                        className={`text-sm font-medium w-1/2 ${
                          activeTab === 'Citation'
                            ? 'text-purple-600 border-b border-purple-500'
                            : 'text-gray-600'
                        }`}
                        onClick={() => setActiveTab('Citation')}
                      >
                        Citation
                      </button>
                    </div>

                    {activeTab === 'Details' && (
                      <div>
                        <p className="text-gray-500 text-xs text-center">
                          Detailed medication info. Click each to expand
                        </p>
                        {assessmentData.Drugs.map((drug) => {
                          const isExpandedDrug = expandedDrugs[drug.drugName];
                          return (
                            <div key={drug.drugName} className="pt-4 border-b">
                              <div
                                className="flex items-center justify-between cursor-pointer"
                                onClick={() => toggleDrugExpansion(drug.drugName)}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-sm text-black">{drug.drugName}</span>
                                  {isExpandedDrug ? (
                                    <IoIosArrowUp className="text-gray-500" />
                                  ) : (
                                    <IoIosArrowDown className="text-gray-500" />
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-700">
                                    Alert Score: {drug.alertScore}
                                  </span>
                                  <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-500 rounded-full"
                                      style={{ width: `${(drug.alertScore / 35) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>

                              {isExpandedDrug && (
                                <div className="mt-4 space-y-4 pb-4">
                                  {/* Additional details about this specific drug */}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {activeTab === 'Citation' && (
                      <div className="space-y-4 p-4">
                        {citationsLoading ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                          </div>
                        ) : Object.entries(citations).length === 0 ? (
                          <div className="text-center text-gray-500">No citations available</div>
                        ) : (
                          <div className="space-y-6">
                            {Object.entries(citations).map(([cid, c]) => (
                              <div key={cid} className="border-b pb-4 last:border-b-0">
                                <h3 className="font-medium text-sm text-gray-800 mb-2">
                                  Reference {cid}
                                </h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <p>
                                    <span className="font-medium">Title:</span> {c.referenceName}
                                  </p>
                                  <p>
                                    <span className="font-medium">Authors:</span> {c.referenceAuthors}
                                  </p>
                                  <p>
                                    <span className="font-medium">Date:</span>{' '}
                                    {c.referencePublicationDate}
                                  </p>
                                  <p>
                                    <span className="font-medium">Source:</span>{' '}
                                    {c.referencePublicationInformation}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-gray-500">
                  Add medication and Ketamine to view assessment
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-xs w-full relative">
            <h2 className="text-lg font-semibold mb-2">Delete Note?</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className="border bg-gray-800 text-white px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="text-black border px-4 py-2 text-red-600 rounded-xl hover:bg-gray-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
