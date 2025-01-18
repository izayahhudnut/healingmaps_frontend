'use client';
import { useEffect, useState } from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { IoMdAdd, IoMdClose } from 'react-icons/io';
import { ArrowUpRight, AlertCircle, Loader2 } from 'lucide-react';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { FaCannabis } from 'react-icons/fa';
import { FaExclamationTriangle, FaCopy, FaFlask } from "react-icons/fa";
import { FaPerson } from 'react-icons/fa6';
import { GiMedicines, GiDna1 } from "react-icons/gi";
import { CgPill } from "react-icons/cg";
import { FaMapMarker } from "react-icons/fa";
import { SiMicrogenetics } from "react-icons/si";
import { IconType } from 'react-icons';
import { GiChestnutLeaf } from "react-icons/gi";


interface Medication {
  drugName: string;
  genericName: string;
  medispanID: string;
  routableDrugName: string;
}

interface LifeStyle {
  alcohol?: string;
  food?: string;
}

type CitationData = {
  referenceAuthors: string;
  referenceID: number;
  referenceName: string;
  referencePublicationDate: string;
  referencePublicationInformation: string;
};

interface TestResult {
  ADRScore: number;
  EfficacyScore: number;
  Explanations: string[];  

}


interface PatientSummary {
  DrugRiskSummary: string;
  DuplicateTherapySummary: string;
  GeneticRiskSummary: string;
  InductionRiskSummary: string;
  RiskFactorSummary: string;
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
  lifeStyle: LifeStyle;
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

interface AssessmentData {
  Drugs: Drug[];
  drugsByLocation: {
    [key: string]: {
      drugName: string;
      alertScore: number;
    }
  };
  PatientSummary: PatientSummary;
  TestResults: TestResult[];
}

const getLocationDescription = (location: number) => {
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
};

const AlertBox = ({ title, content, icon: Icon }: { title: string; content: string; icon: IconType }) => (
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

const QuadrantBox = ({ title, drug }: { title: string; drug: Drug | null }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!drug) {
    return (
      <div className="border rounded-lg p-2 shadow-sm bg-white h-56 w-full" />
    );
  }

  return (
    <>
      <div className="border rounded-lg p-2 shadow-sm bg-white h-56 w-full cursor-pointer"
        onClick={() => setIsModalOpen(true)}>
        <div className="border boder-green p-2 rounded space-y-1 relative group">
          <div className="flex gap-2">
            <span className="font-bold text-black">{drug.drugName}</span>
          </div>
          <div className="flex flex-row space-x-2">
            {drug.geneticInteraction && drug.geneticInteraction.aDRScore > 0 && (
              <GiMedicines size={10} className="text-black" />
            )}
            {drug.singleDrugRisk !== undefined && drug.singleDrugRisk > 0 && (
              <CgPill size={10} className="text-black" />
            )}
            {drug.geneticInteractionAlertScore !== undefined && drug.geneticInteractionAlertScore > 0 && (
              <SiMicrogenetics size={10} className="text-black" />
            )}
            {drug.lifeStyle && (drug.lifeStyle.food || drug.lifeStyle.alcohol) && (
              <FaPerson size={10} className="text-black" />
            )}
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-gray-600">Alert score: {drug.alertScore}</p>
            <div className="w-24 h-1 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(drug.alertScore / 35) * 100}%` }} />
            </div>
          </div>
          <div className="absolute inset-0 bg-white bg-opacity-90 text-gray-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded">
            <p className="text-sm text-center px-2">Total aggregated alert score for this medication. Range 0-35 35 being the higherst level of alert</p>
          </div>
        </div>
      </div>

      {isModalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-2xl m-4 relative z-100">
      <button onClick={() => setIsModalOpen(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
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
              {drug.fourSquareLocation === 1 && "Higher Risk of ADR"}
              {drug.fourSquareLocation === 2 && "Lower Benefit & Higher Risk"}
              {drug.fourSquareLocation === 3 && "Higher Benefit & Lower Risk"}
              {drug.fourSquareLocation === 4 && "Lower Benefit & Lower Risk"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 border-b pb-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Alert Score: {drug.alertScore}</span>
            <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full"
                style={{ width: `${(drug.alertScore / 35) * 100}%` }} />
            </div>
          </div>

          <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1 bg-opacity-50">
            <GiChestnutLeaf className="text-black" />
            <span className="text-sm text-gray-700">{drug.InInAlertScore || '0'}</span>
          </div>
          <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1 bg-opacity-50">
            <GiMedicines className="text-black" />
            <span className="text-sm text-gray-700">{drug.drugInteractionRiskScore || '0'}</span>
          </div>
          <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1 bg-opacity-50">
            <CgPill className="text-black" />
            <span className="text-sm text-gray-700">{drug.singleDrugRisk || '0'}</span>
          </div>
          <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1 bg-opacity-50">
            <SiMicrogenetics className="text-black" />
            <span className="text-sm text-gray-700">{drug.geneticInteractionAlertScore ?? '0'}</span>
          </div>
          {drug.lifeStyle && (drug.lifeStyle.food || drug.lifeStyle.alcohol) && (
            <div className="flex items-center space-x-1 bg-gray-100 rounded-xl p-1 bg-opacity-50">
              <FaPerson className="text-black" />
            </div>
          )}
        </div>

        <div className="space-y-4 pb-4">
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
            ? `Cannabis interaction indicated - evidence level ${drug.inductionInhibitionInteraction.InSeverity}`
            : 'No Cannabis interaction indicated'}
        </p>
      </div>
    </div>

                {drug.inductionInhibitionInteraction && drug.inductionInhibitionInteraction.InPrescribingExplanation && (
  <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-start border-b pb-3">
    <span className="font-medium text-xs text-gray-700">
      Cannabis Interaction
    </span>
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
                {drug.interactionList && drug.interactionList.length > 0 && (
        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-start border-b pb-3">
          <span className="font-medium text-xs text-gray-700">
            Medication Interaction
          </span>
          <GiMedicines size={12} className="justify-self-start" />
          <span className="text-xs text-gray-500 col-span-2">
            {drug.interactionList[0].interactionSimple || 'No interaction details available'}
          </span>
        </div>
      )}
      {drug.lifeStyle?.food && (
        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-start border-b pb-3">
          <span className="font-medium text-xs text-gray-700">
            Lifestyle
          </span>
          <FaPerson size={12} className="justify-self-start" />
          <span className="text-xs text-gray-500 col-span-2">
            {drug.lifeStyle.food}
          </span>
        </div>
      )}

                {drug.conditionList && drug.conditionList.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Applicable Conditions</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {drug.conditionList.map((condition, index) => (
                        <li key={index} className="text-xs text-gray-500 ">
                          {condition.conditionName}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function QuickCheckSection() {
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isKetamineOpen, setIsKetamineOpen] = useState(true);
  const [isMedicationOpen, setIsMedicationOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'Details' | 'Citation'>('Details');
  const [expandedDrugs, setExpandedDrugs] = useState<{ [key: string]: boolean }>({});
  const [selectedKetamine, setSelectedKetamine] = useState<'Ketamine' | null>(null);
  const [medicationQuery, setMedicationQuery] = useState('');
  const [medications, setMedications] = useState<Medication[]>([]);
  const [savedMedications, setSavedMedications] = useState<Medication[]>([]);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [replacementPopupOpen, setReplacementPopupOpen] = useState(false);
  const [drugToReplace, setDrugToReplace] = useState<Drug | null>(null);
  const [citations, setCitations] = useState<{[key: string]: CitationData}>({});
  const [citationsLoading, setCitationsLoading] = useState(false);



  const [selectedCannabinoids, setSelectedCannabinoids] = useState<{
    thc: boolean;
    cbd: boolean;
  }>({ thc: false, cbd: false });

  const handleReplaceMedication = (drug: Drug) => {
    setDrugToReplace(drug);
    setReplacementPopupOpen(true);
    setMedicationQuery('');
    setMedications([]);
  };

  const handleClearMedicationSelection = () => {
    setSavedMedications([]);
    setAssessmentData(null);
  };


  const handleCannabinoidSelection = async (cannabinoid: 'thc' | 'cbd') => {
    const updatedSelection = {
      ...selectedCannabinoids,
      [cannabinoid]: !selectedCannabinoids[cannabinoid]
    };
    setSelectedCannabinoids(updatedSelection);

    if (cannabinoid === 'cbd' || (cannabinoid === 'thc' && updatedSelection.thc)) {
      await generateReport(updatedSelection);
    }
  };

  const generateReport = async (cannabinoids: { thc: boolean; cbd: boolean }) => {
    setIsLoading(true);

    try {
      const replacements = savedMedications.map((med) => ({
        newDrug: med.medispanID,
      }));

      if (cannabinoids.cbd) {
        replacements.push({ newDrug: "203391" });
      }

      // Add THC logic here if needed in the future

      const requestBody = {
        SpecimenID: '2401.00055',
        replacements,
      };

      const response = await fetch('/api/generateReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        const processedData = processAssessmentData(data);
        setAssessmentData(processedData);
      } else {
        console.error('Failed to generate report:', await response.text());
        setAssessmentData(null);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setAssessmentData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmReplacement = async (newMedication: Medication) => {
    if (!drugToReplace) return;

    const updatedSavedMedications = savedMedications.filter(
      (med) => med.medispanID !== drugToReplace.medispanID
    );

    const newSavedMedications = [...updatedSavedMedications, newMedication];
    setSavedMedications(newSavedMedications);

    setReplacementPopupOpen(false);
    setDrugToReplace(null);
    setMedicationQuery('');
    setMedications([]);
    setIsLoading(true);

    try {
      const replacements = newSavedMedications.map((med) => ({
        newDrug: med.medispanID,
      }));

      const requestBody = {
        SpecimenID: '2401.00055',
        replacements,
      };

      const response = await fetch('/api/generateReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        const processedData = processAssessmentData(data);
        setAssessmentData(processedData);
      } else {
        console.error('Failed to generate report:', await response.text());
        setAssessmentData(null);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setAssessmentData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const countRisks = (patientSummary: PatientSummary | undefined) => {
    if (!patientSummary) return 0;
    return Object.values(patientSummary).filter(summary => summary && summary.trim() !== '').length;
  };


  const handleClearKetamineSelection = () => {
    setSelectedKetamine(null);
  };

  const fetchMedications = async (query: string): Promise<void> => {
    if (!query) {
      setMedications([]);
      return;
    }

    try {
      const response = await fetch(`/api/medication?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setMedications(data);
      } else {
        console.error('Failed to fetch medications:', response.status);
        setMedications([]);
      }
    } catch (error) {
      console.error('Error fetching medications:', error);
      setMedications([]);
    }
  };

  const toggleDrugExpansion = (drugName: string) => {
    setExpandedDrugs((prev) => ({
      ...prev,
      [drugName]: !prev[drugName],
    }));
  };

  const processAssessmentData = (apiResponse: any): AssessmentData => {
    // Filter out CBD from the Drugs array if it's present
    const filteredDrugs = apiResponse.Drugs.filter((drug: Drug) => drug.medispanID !== "203391");
  
    const drugsByLocation = filteredDrugs.reduce((acc: any, drug: any) => {
      const location = getLocationDescription(drug.fourSquareLocation);
      if (location) {
        acc[location] = {
          drugName: drug.drugName,
          alertScore: drug.alertScore,
        };
      }
      return acc;
    }, {});
  
    return {
      Drugs: filteredDrugs,
      drugsByLocation,
      PatientSummary: apiResponse.PatientSummary,
      TestResults: apiResponse.TestResults || [] // Include TestResults with a default empty array
    };
  };

  const handleAddMedication = async (medication: Medication) => {
    const updatedSavedMedications = [...savedMedications, medication];
    setSavedMedications(updatedSavedMedications);
    setMedicationQuery('');
    setMedications([]);
    setIsLoading(true);

    try {
      const replacements = updatedSavedMedications.map((med) => ({
        newDrug: med.medispanID,
      }));

      const requestBody = {
        SpecimenID: '2401.00055',
        replacements,
      };

      const response = await fetch('/api/generateReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        const processedData = processAssessmentData(data);
        setAssessmentData(processedData);
      } else {
        console.error('Failed to generate report:', await response.text());
        setAssessmentData(null);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setAssessmentData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMedication = async (index: number) => {
    const updatedSavedMedications = savedMedications.filter((_, i) => i !== index);
    setSavedMedications(updatedSavedMedications);

    if (updatedSavedMedications.length === 0) {
      setAssessmentData(null);
      return;
    }

    setIsLoading(true);

    try {
      const replacements = updatedSavedMedications.map((med) => ({
        newDrug: med.medispanID,
      }));

      const requestBody = {
        SpecimenID: '2401.00055',
        replacements,
      };

      const response = await fetch('/api/generateReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        const processedData = processAssessmentData(data);
        setAssessmentData(processedData);
      } else {
        console.error('Failed to generate report:', await response.text());
        setAssessmentData(null);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setAssessmentData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getDrugForQuadrant = (location: string): Drug | null => {
    if (!assessmentData?.drugsByLocation) return null;
    const drugInfo = assessmentData.drugsByLocation[location];
    if (!drugInfo) return null;
    
    const fullDrugInfo = assessmentData.Drugs.find(drug => drug.drugName === drugInfo.drugName);
    return fullDrugInfo || null;
  };

  useEffect(() => {
    const fetchCitations = async () => {
      if (!assessmentData?.TestResults) return;
      
      setCitationsLoading(true);
      
      try {
        // Get all unique explanation IDs
        const explanationIds = assessmentData.TestResults
          .flatMap(result => result.Explanations || [])
          .filter(id => id); // Filter out any null/undefined
        
        // Remove duplicates
        const uniqueIds = [...new Set(explanationIds)];
        
        // Fetch citations in parallel
        const fetchPromises = uniqueIds.map(async (id) => {
          if (citations[id]) return; // Skip if already fetched
          
          try {
            const response = await fetch('/api/getReference', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                explanationId: id
              })
            });
  
            if (!response.ok) {
              throw new Error(`Failed to fetch citation ${id}`);
            }
  
            const data = await response.json();
            setCitations(prev => ({
              ...prev,
              [id]: data[0] // API returns array with single result
            }));
          } catch (err) {
            console.error(`Error fetching citation ${id}:`, err);
          }
        });
  
        await Promise.all(fetchPromises);
        
      } catch (err) {
        console.error('Error fetching citations:', err);
      } finally {
        setCitationsLoading(false); 
      }
    };

    fetchCitations();
  }, [assessmentData]); 


  return (
    <div className="py-4 space-y-6 max-w-[60rem] mx-auto">
      {replacementPopupOpen && drugToReplace && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <h3 className="text-lg font-bold mb-4">Replace {drugToReplace.drugName}</h3>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search for medication"
                value={medicationQuery}
                onChange={(e) => {
                  setMedicationQuery(e.target.value);
                  fetchMedications(e.target.value);
                }}
                className="w-full p-2 border rounded-full border-black focus:outline-none focus:ring-0"
              />
            </div>
            {medications.length > 0 && (
              <div className="max-h-60 overflow-y-auto mb-4 border rounded-xl p-2">
                {medications.map((med, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleConfirmReplacement(med)}
                  >
                    {med.drugName}
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-gray-200 rounded-md mr-2"
                onClick={() => setReplacementPopupOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <h1 className="underline text-blue-600">Medication Quick Check</h1>
        <p className="text-gray-500">/ Information Not Saved</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Alerts Section */}
          <div className="border-b border-gray-300 pb-7">
            <div className="flex items-center">
              <h2 className="font-bold text-sm text-gray-800 mr-1">Alerts</h2>
              {assessmentData?.PatientSummary && countRisks(assessmentData.PatientSummary) > 0 && (
                <span className="bg-purple-100 text-purple-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
                  {countRisks(assessmentData.PatientSummary)}
                </span>
              )}
              <button
                className="text-gray-500 focus:outline-none"
                onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              >
                {isAlertsOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
              </button>
            </div>

            {isAlertsOpen && (
              <div className="space-y-4 mt-4">
                {assessmentData?.PatientSummary ? (
                  <>
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
                  </>
                ) : (
                  <p className="text-sm text-gray-400 mt-2">
                    {isLoading ? "Loading alerts..." : "No alerts available"}
                  </p>
                )}
              </div>
            )}
          </div>

                   {/* Cannabis Section */}
      <div className="border-b border-gray-300 pb-7">
        <div className="flex items-center">
          <div className="flex items-center justify-between w-full mb-2">
            <div className="flex">
              <h2 className="font-bold text-sm text-gray-800 mr-1">Cannabis</h2>
              <button
                className="text-gray-500 focus:outline-none"
                onClick={() => setSelectedCannabinoids({ thc: false, cbd: false })}
              >
                <IoIosArrowUp />
              </button>
            </div>
            <span
              className={`text-purple-500 cursor-pointer underline font-bold text-sm ${
                !selectedCannabinoids.thc && !selectedCannabinoids.cbd ? 'opacity-10' : ''
              }`}
              onClick={() => setSelectedCannabinoids({ thc: false, cbd: false })}
            >
              Clear Selection
            </span>
          </div>
        </div>
        <div className="mt-2">
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className={`h-4 w-4 border-gray-300 rounded ${
                  selectedCannabinoids.thc ? 'accent-purple-600' : ''
                }`}
                checked={selectedCannabinoids.thc}
                onChange={() => handleCannabinoidSelection('thc')}
              />
              <span className="text-sm text-gray-700">THC</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className={`h-4 w-4 border-gray-300 rounded ${
                  selectedCannabinoids.cbd ? 'accent-purple-600' : ''
                }`}
                checked={selectedCannabinoids.cbd}
                onChange={() => handleCannabinoidSelection('cbd')}
              />
              <span className="text-sm text-gray-700">CBD</span>
            </label>
          </div>
        </div>
      </div>

          {/* Ketamine Section */}
          <div className="border-b border-gray-300 pb-7">
            <div className="flex items-center">
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex">
                  <h2 className="font-bold text-sm text-gray-800 mr-1">Ketamine</h2>
                  <button
                    className="text-gray-500 focus:outline-none"
                    onClick={() => setIsKetamineOpen(!isKetamineOpen)}
                  >
                    {isKetamineOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                  </button>
                </div>
                <span
                  className={`text-purple-500 cursor-pointer underline font-bold text-sm ${
                    selectedKetamine === null ? 'opacity-10' : ''
                  }`}
                  onClick={handleClearKetamineSelection}
                >
                  Clear Selection
                </span>
              </div>
            </div>
            {isKetamineOpen && (
              <div>
                <div className="mt-2 flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className={`h-4 w-4 border-gray-300 rounded ${
                        selectedKetamine ? 'accent-purple-600' : ''
                      }`}
                      checked={selectedKetamine !== null}
                      onChange={() => setSelectedKetamine(selectedKetamine ? null : 'Ketamine')}
                    />
                    <span className="text-sm text-gray-700">Include</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Medication Section */}
          <div className="border-b border-gray-300 pb-7">
            <div className="flex items-center">
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex">
                  <h2 className="font-bold text-sm text-gray-800 mr-1">Medication</h2>
                  {savedMedications.length > 0 && (
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
                      {savedMedications.length}
                    </span>
                  )}
                  <button
                    className="text-gray-500 focus:outline-none"
                    onClick={() => setIsMedicationOpen(!isMedicationOpen)}
                  >
                    {isMedicationOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
                  </button>
                </div>
                <span
                  className={`text-purple-500 cursor-pointer underline font-bold text-sm ${
                    savedMedications.length === 0 ? 'opacity-10' : ''
                  }`}
                  onClick={handleClearMedicationSelection}
                >
                  Clear Selection
                </span>
              </div>
            </div>
            {isMedicationOpen && (
              <div className="space-y-2">
                <div className="border border-gray-500 p-2 rounded-full items-center flex space-x-2 focus-within:border-purple-500 transition-colors duration-200">
                  <HiMagnifyingGlass className="text-purple-300" />
                  <input
                    type="text"
                    placeholder="Medication"
                    value={medicationQuery}
                    onChange={(e) => {
                      setMedicationQuery(e.target.value);
                      fetchMedications(e.target.value);
                    }}
                    className="w-full outline-none bg-transparent text-sm text-black"
                  />
                </div>

                {medications.length > 0 && (
                  <div className="mt-2 border rounded-xl max-h-60 overflow-y-auto">
                    {medications.map((med, index) => (
                      <div key={index} className="p-2 rounded text-sm hover:bg-purple-100 hover:bg-opacity-50 cursor-pointer flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800">{med.drugName || 'Unknown Name'}</p>
                        </div>
                        <button
                          className="text-white bg-purple-600 p-2 rounded-full shadow"
                          onClick={() => handleAddMedication(med)}
                        >
                          <IoMdAdd />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 space-x-2">
                  {savedMedications.map((med, index) => (
                    <div key={index} className="inline-block bg-gray-100 border p-2 rounded-full text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-800">
                          {med.routableDrugName.length > 12 ? `${med.routableDrugName.slice(0, 12)}...` : med.routableDrugName}
                        </span>
                        <button onClick={() => handleRemoveMedication(index)}>
                          <IoMdClose size={20} className="text-black" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assessment Section */}
        <div>
          <div className="border border-gray-300 rounded-lg shadow-sm bg-white">
            <div className="p-2 flex justify-between items-center">
              <h2 className="text-gray-800 font-medium text-md">Assessment</h2>
              <div className="inline-flex rounded-md space-x-3" role="group">
                <button
                  className={`px-2 py-1 bg-gray-200 bg-opacity-30 text-sm font-bold ${
                    selectedCannabinoids.thc ? 'bg-blue-50 text-purple-700 border-purple-700' : 'text-gray-900 bg-white opacity-20'
                  } rounded-lg`}
                  onClick={() => setSelectedCannabinoids(prev => ({ ...prev, thc: !prev.thc }))}
                >
                  THC
                </button>
                <button
                  className={`px-2 py-1 bg-gray-200 bg-opacity-30 text-sm font-bold ${
                    selectedCannabinoids.cbd ? 'bg-blue-50 text-purple-700 border-purple-700' : 'text-gray-900 bg-white opacity-20'
                  } rounded-lg`}
                  onClick={() => setSelectedCannabinoids(prev => ({ ...prev, cbd: !prev.cbd }))}
                >
                  CBD
                </button>
                <button
                  className={`px-2 py-1 bg-gray-200 bg-opacity-30 text-sm font-bold ${
                    selectedKetamine === 'Ketamine' ? 'bg-blue-50 text-purple-700 border-purple-700' : 'text-gray-900 bg-white opacity-20'
                  } rounded-lg`}
                  onClick={() => setSelectedKetamine(selectedKetamine ? null : 'Ketamine')}
                >
                  Ketamine
                </button>
              </div>
            </div>

            <div className="p-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : assessmentData ? (
                <div className="space-y-6">
                  <div className="relative w-full h-[500px]">
                    <div className="absolute left-0 top-0 bottom-0 flex items-center">
                      <div className="relative h-full flex items-center justify-center w-full">
                        <span className="-rotate-90 whitespace-nowrap text-gray-500 absolute -left-7 w-[500px] text-center z-10">
                          Lower Risk &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp; &nbsp; &nbsp;
                          &nbsp;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                          Higher Risk
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
                      <QuadrantBox
                        title="Higher Risk, Higher Benefit"
                        drug={getDrugForQuadrant('highRiskHighBenefit')}
                      />
                      <QuadrantBox
                        title="Higher Risk, Lower Benefit"
                        drug={getDrugForQuadrant('highRiskLowBenefit')}
                      />
                      <QuadrantBox
                        title="Lower Risk, Higher Benefit"
                        drug={getDrugForQuadrant('lowRiskHighBenefit')}
                      />
                      <QuadrantBox
                        title="Lower Risk, Lower Benefit"
                        drug={getDrugForQuadrant('lowRiskLowBenefit')}
                      />
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="transform text-center w-full flex items-center justify-center z-5 text-gray-500">
                        Higher Benefit
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        Lower Benefit
                      </span>
                    </div>
                  </div>

                  <div className="">
                    <div className="flex space-x-4 mb-4 w-full justify-between">
                      <button
                        className={`text-sm font-medium w-1/2 ${
                          activeTab === 'Details' ? 'text-purple-600 border-b border-purple-500' : 'text-gray-600'
                        }`}
                        onClick={() => setActiveTab('Details')}
                      >
                        Details
                      </button>
                      <button
                        className={`text-sm font-medium w-1/2 ${
                          activeTab === 'Citation' ? 'text-purple-600 border-b border-purple-500' : 'text-gray-600'
                        }`}
                        onClick={() => setActiveTab('Citation')}
                      >
                        Citation
                      </button>
                    </div>

                    {activeTab === 'Details' && assessmentData && (
                      <div className="">
                        <p className="text-gray-500 text-xs text-center">
                          Detailed medication information below. Click a medication to view more
                        </p>
                        {assessmentData.Drugs.map((drug) => (
                          <div key={drug.drugName} className="pt-4 border-b">
                            <div
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => toggleDrugExpansion(drug.drugName)}
                            >
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-sm text-black">{drug.drugName}</span>
                                {expandedDrugs[drug.drugName] ? (
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
                                {drug.geneticInteraction && drug.geneticInteraction.aDRScore > 0 && (
                                  <GiMedicines className="text-black" size={12} />
                                )}
                                {drug.geneticInteraction && drug.geneticInteraction.efficacyScore > 0 && (
                                  <CgPill className="text-black" size={12} />
                                )}
                                {drug.geneticInteractionAlertScore !== undefined && drug.geneticInteractionAlertScore > 0 && (
                                  <SiMicrogenetics className="text-black" size={12} />
                                )}
                                {drug.lifeStyle && (drug.lifeStyle.food || drug.lifeStyle.alcohol) && (
                                  <FaPerson className="text-black" size={12} />
                                )}
                              </div>
                            </div>
                            
                            {expandedDrugs[drug.drugName] && (
  <div className="mt-4 space-y-4 pb-4">
    <div className="flex items-center space-x-2 border-b pb-2">
      <div
        className={`p-2 rounded-full flex flex-row space-x-1 items-center ${
          drug.inductionInhibitionInteraction?.InSeverity === 'low'
            ? 'bg-purple-100'
            : 'bg-gray-100 bg-opacity-50'
        }`}
      >
        <FaCannabis />
        <p className="text-gray-700 text-xs">
          {drug.inductionInhibitionInteraction?.InSeverity === 'low'
            ? `Cannabis interaction indicated - evidence level ${drug.inductionInhibitionInteraction.InSeverity}`
            : 'No Cannabis interaction indicated'}
        </p>
      </div>
    </div>
    <div className="space-y-4 ">
    {drug.inductionInhibitionInteraction && drug.inductionInhibitionInteraction.InPrescribingExplanation && (
  <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-start border-b pb-3">
    <span className="font-medium text-xs text-gray-700">
      Cannabis Interaction
    </span>
    <GiMedicines size={12} className="justify-self-start" />
    <span className="text-xs text-gray-500 col-span-2 space-y-2">
      <p>{drug.inductionInhibitionInteraction.InPrescribingExplanation}</p>
      {drug.inductionInhibitionInteraction.InTheraputicRecommendation && (
        <>
          <p className="font-medium text-xs text-gray-700">Recommendation:</p>
          <p>{drug.inductionInhibitionInteraction.InTheraputicRecommendation}</p>
        </>
      )}
    </span>
  </div>
)}
      

      {drug.interactionList && drug.interactionList.length > 0 && (
        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-start border-b pb-3">
          <span className="font-medium text-xs text-gray-700">
            Medication Interaction
          </span>
          <GiMedicines size={12} className="justify-self-start" />
          <span className="text-xs text-gray-500 col-span-2">
            {drug.interactionList[0].interactionSimple || 'No interaction details available'}
          </span>
        </div>
      )}
      {drug.lifeStyle?.food && (
        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-start border-b pb-3">
          <span className="font-medium text-xs text-gray-700">
            Lifestyle
          </span>
          <FaPerson size={12} className="justify-self-start" />
          <span className="text-xs text-gray-500 col-span-2">
            {drug.lifeStyle.food}
          </span>
        </div>
      )}
    </div>
    <div className="flex justify-end space-x-4 mt-8">
      <button 
        className="px-4 py-2 text-red-600 border border-red-600 rounded-full text-xs font-bold"
        onClick={() => {
          const index = savedMedications.findIndex(med => med.medispanID === drug.medispanID);
          if (index !== -1) handleRemoveMedication(index);
        }}
      >
        Remove Med
      </button>
      <button 
        className="px-4 py-2 text-white bg-purple-600 rounded-full text-xs font-bold"
        onClick={() => handleReplaceMedication(drug)}
      >
        Replace Med
      </button>
    </div>
  </div>
)}
                          </div>
                        ))}
                      </div>
                    )}

{activeTab === 'Citation' && (
  <div className="space-y-4 p-4">
    {citationsLoading ? (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin"/>
      </div>
    ) : Object.entries(citations).length === 0 ? (
      <div className="text-center text-gray-500">
        No citations available
      </div>
    ) : (
      <div className="space-y-6">
        {Object.entries(citations).map(([id, citation]) => (
          <div key={id} className="border-b pb-4 last:border-b-0">
            <h3 className="font-medium text-sm text-gray-800 mb-2">
              Reference {id}
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Title:</span> {citation.referenceName}</p>
              <p><span className="font-medium">Authors:</span> {citation.referenceAuthors}</p>
              <p><span className="font-medium">Date:</span> {citation.referencePublicationDate}</p>
              <p><span className="font-medium">Source:</span> {citation.referencePublicationInformation}</p>
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
    </div>
  );
}