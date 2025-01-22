"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { TfiNewWindow } from "react-icons/tfi";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSession } from "next-auth/react";
import axios from "axios";

type Facility = {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  primaryContact: string;
};

type Patient = {
  id: number;
  firstName: string;
  lastName: string;
  dob: string;
  email: string;
  facility: Facility;
  gender: string;
  race: string;
  KetissuedOn: string | null;
  KetexpiresOn: string | null;
};

type NewPatient = {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  KetissuedOn: string;
  KetexpiresOn: string;
  race: string;
  email: string;
};

export default function PatientListSection({ user }: any) {
  const facilityId = user?.facilityId;

  const [patients, setPatients] = useState<Patient[]>([]);

  console.log("Patients:", patients);

  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [newPatient, setNewPatient] = useState<NewPatient>({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    KetissuedOn: "",
    KetexpiresOn: "",
    race: "Not Specified",
    email: "",
  });
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  console.log("Session:");

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    try {
      setLoading(true);
      const response = await fetch("/api/patients");
      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }
      const data: Patient[] = await response.json();
      console.log("Fetched patients data:", data);
      // Filter patients for the "Demo" facility
      // const demoFacilityPatients = data.filter(
      //   (patient) => patient.facility?.name === "Demo"
      // );

      const demoFacilityPatients = data.filter(
        (patient: any) => patient?.facilityId === facilityId
      );

      console.log("Demo facility patients:", demoFacilityPatients);
      setPatients(data);
      setFilteredPatients(demoFacilityPatients); // Initialize the filtered list

      setLoading(false);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Unable to load patients. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  const filteredPatientsData = useMemo(() => {
    return patients.filter((patient) =>
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, []);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedPatients(filteredPatients.map((patient) => patient.id));
    } else {
      setSelectedPatients([]);
    }
  };

  const handleSelectPatient = (patientId: number) => {
    setSelectedPatients((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleDeleteSelected = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    try {
      for (const patientId of selectedPatients) {
        const response = await fetch(`/api/patients?id=${patientId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to delete patient with ID ${patientId}`
          );
        }
      }

      // Refresh the patient list
      await fetchPatients();

      // Reset states
      setSelectedPatients([]);
      setShowDeleteConfirmation(false);

      // Show success toast
      toast.success("Patient(s) deleted successfully!");
    } catch (error) {
      console.error("Error deleting patients:", error);

      // Show error in popup
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete patient(s). Please try again."
      );

      // Show error toast
      toast.error("Failed to delete patient(s). Please try again.");
    }
  };

  const validateForm = () => {
    if (!newPatient.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!newPatient.lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!newPatient.dob) {
      setError("Date of birth is required");
      return false;
    }
    if (!newPatient.gender) {
      setError("Gender is required");
      return false;
    }
    if (!newPatient.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!newPatient.race) {
      setError("Race is required");
      return false;
    }
    return true;
  };

  // In handleAddPatient function:

  const handleAddPatient = async () => {
    setError(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/create-patients", {
        ...newPatient,
        KetissuedOn: newPatient.KetissuedOn || null,
        KetexpiresOn: newPatient.KetexpiresOn || null,

        facilityEmail: user?.email,
      });

      const createdPatient = response.data;

      setPatients((prev) => [...prev, createdPatient]);
      setSuccess(true);
      setShowPopup(false);
      setNewPatient({
        firstName: "",
        lastName: "",
        dob: "",
        gender: "",
        KetissuedOn: "",
        KetexpiresOn: "",
        race: "Not Specified",
        email: "",
      });

      toast.success("Patient added successfully!");
      await fetchPatients();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to add patient";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setFilteredPatients(patients); // Show all patients if the search term is empty
    } else {
      const lowerCaseTerm = term.toLowerCase();
      const filtered = patients.filter(
        (patient) =>
          patient.firstName.toLowerCase().includes(lowerCaseTerm) ||
          patient.lastName.toLowerCase().includes(lowerCaseTerm)
      );
      setFilteredPatients(filtered);
    }
  };

  return (
    <div className="p-10 max-w-[60rem] mx-auto">
      <ToastContainer position="top-center" autoClose={3000} />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-1/3 focus:outline-none"
        />
        <div>
          {selectedPatients.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className=" text-black border px-4 py-2 rounded-xl hover:bg-gray-200 text-sm transition mr-4"
            >
              Delete Selected
            </button>
          )}
          <button
            onClick={() => setShowPopup(true)}
            className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm hover:bg-black transition"
          >
            Add Patient
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <p className="text-green-500 text-center mb-4">
          Patient added successfully!
        </p>
      )}

      {/* Add Patient Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl transform transition-transform scale-95 hover:scale-100">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Add Patient
              </h2>
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    label: "First Name",
                    name: "firstName",
                    type: "text",
                    required: true,
                  },
                  {
                    label: "Last Name",
                    name: "lastName",
                    type: "text",
                    required: true,
                  },
                  {
                    label: "Date of Birth",
                    name: "dob",
                    type: "date",
                    required: true,
                  },
                  {
                    label: "Gender",
                    name: "gender",
                    type: "select",
                    required: true,
                    options: ["Male", "Female", "Other", "Prefer not to say"],
                  },
                 
                
                  {
                    label: "Race",
                    name: "race",
                    type: "select",
                    required: true,
                    options: [
                      "White",
                      "Black",
                      "Asian",
                      "Hispanic",
                      "Native American",
                      "Pacific Islander",
                      "Not Specified",
                    ],
                  },
                  {
                    label: "Email",
                    name: "email",
                    type: "email",
                    required: true,
                  },
                ].map(({ label, name, type, required, options }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-600">
                      {label}
                      {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {type === "select" ? (
                      <select
                        required={required}
                        value={newPatient[name as keyof NewPatient]}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            [name as keyof NewPatient]: e.target.value,
                          })
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-700 focus:border-purple-700"
                      >
                        <option value="">{`Select ${label}`}</option>
                        {options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={type}
                        required={required}
                        value={newPatient[name as keyof NewPatient]}
                        onChange={(e) =>
                          setNewPatient({
                            ...newPatient,
                            [name as keyof NewPatient]: e.target.value,
                          })
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-purple-700 focus:border-purple-700"
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className=" text-black border px-4 py-2 rounded-xl hover:bg-gray-200 text-sm transition "
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleAddPatient}
                  disabled={isSubmitting}
                  className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm hover:bg-black transition"
                >
                  {isSubmitting ? "Adding..." : "Add Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-700 rounded-full animate-spin"></div>
        </div>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead className="text-gray-700">
            <tr>
              <th className="border-b border-gray-300 px-4 py-2 text-left">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedPatients.length === filteredPatients.length}
                />
              </th>
              <th className="border-b border-gray-300 px-4 py-2 text-left">
                First Name
              </th>
              <th className="border-b border-gray-300 px-4 py-2 text-left">
                Last Name
              </th>
              <th className="border-b border-gray-300 px-4 py-2 text-left">
                Date of Birth
              </th>
              <th className="border-b border-gray-300 px-4 py-2 text-left">
                Email
              </th>
              <th className="border-b border-gray-300 px-4 py-2 text-center"></th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50 transition">
                <td className="border-b border-gray-300 px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selectedPatients.includes(patient.id)}
                    onChange={() => handleSelectPatient(patient.id)}
                  />
                </td>
                <td className="border-b border-gray-300 px-4 py-2">
                  {patient.firstName}
                </td>
                <td className="border-b border-gray-300 px-4 py-2">
                  {patient.lastName}
                </td>
                <td className="border-b border-gray-300 px-4 py-2">
                  {new Date(patient.dob).toLocaleDateString()}
                </td>
                <td className="border-b border-gray-300 px-4 py-2">
                  {patient.email}
                </td>
                <td className="border-b border-gray-300 px-4 pb-2 text-center">
                  <Link
                    href={`/patients/${patient.id}`}
                    className="text-blue-500 hover:underline text-sm"
                    title="View Details"
                  >
                    <TfiNewWindow className="text-gray-500 text-lg inline-block align-middle" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Delete Confirmation Popup */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p>
              Are you sure you want to delete{" "}
              {selectedPatients.length === 1
                ? "this patient"
                : `${selectedPatients.length} patients`}
              ?
            </p>

            {/* Show error message */}
            {error && <p className="text-red-500 mt-4">{error}</p>}

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm hover:bg-black transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className=" text-red-600 border px-4 py-2 rounded-xl hover:bg-gray-200 text-sm transition mr-4 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
