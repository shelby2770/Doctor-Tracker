"use client";

import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Plus,
  Stethoscope,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PatientFilters, type PatientFilterState } from "@/components/patients/patient-filters";
import { PatientFormModal } from "@/components/patients/patient-form-modal";
import { PatientsTable } from "@/components/patients/patients-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { FullPageSpinner } from "@/components/ui/spinner";
import { useAddDoctorPatient, useDoctor, useDoctorPatients } from "@/hooks/queries/use-doctors";
import {
  useDeletePatient,
  usePatientFilterOptions,
  useUpdatePatient,
} from "@/hooks/queries/use-patients";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiErrorMessage } from "@/lib/api";
import type { PatientValues } from "@/lib/schemas";
import { getInitials } from "@/lib/utils";
import type { Patient } from "@/lib/types";

const DEFAULT_FILTERS: PatientFilterState = {
  search: "",
  status: "",
  condition: "",
  startDate: "",
  endDate: "",
  sort: "newest",
};

export default function DoctorDetailPage() {
  const params = useParams<{ id: string }>();
  const doctorId = params.id;

  const [filters, setFilters] = useState<PatientFilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(filters.search, 400);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);

  const { data: doctor, isLoading: doctorLoading, isError: doctorError } =
    useDoctor(doctorId);

  const { data, isLoading } = useDoctorPatients(doctorId, {
    page,
    limit: 8,
    search: debouncedSearch,
    status: filters.status,
    condition: filters.condition,
    startDate: filters.startDate,
    endDate: filters.endDate,
    sort: filters.sort,
  });
  const { data: options } = usePatientFilterOptions();

  const addPatient = useAddDoctorPatient(doctorId);
  const updatePatient = useUpdatePatient();
  const deletePatient = useDeletePatient();

  const patch = (p: Partial<PatientFilterState>) => {
    setFilters((f) => ({ ...f, ...p }));
    setPage(1);
  };
  const clear = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (patient: Patient) => {
    setEditing(patient);
    setFormOpen(true);
  };

  const handleSubmit = async (values: PatientValues) => {
    try {
      if (editing) {
        await updatePatient.mutateAsync({ id: editing._id, input: values });
        toast.success("Patient updated");
      } else {
        await addPatient.mutateAsync(values);
        toast.success("Patient added");
      }
      setFormOpen(false);
      setEditing(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePatient.mutateAsync(deleteTarget._id);
      toast.success("Patient removed");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (doctorLoading) return <FullPageSpinner label="Loading doctor…" />;
  if (doctorError || !doctor) {
    return (
      <Card>
        <EmptyState
          icon={Stethoscope}
          title="Doctor not found"
          description="This doctor may have been removed."
          action={
            <Link href="/doctors">
              <Button variant="outline">Back to doctors</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  const patients = data?.data ?? [];
  const hasFilters =
    !!debouncedSearch ||
    !!filters.status ||
    !!filters.condition ||
    !!filters.startDate ||
    !!filters.endDate;

  return (
    <div>
      <Link
        href="/doctors"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-surface-500 transition-colors hover:text-surface-800 focus-ring"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to doctors
      </Link>

      {/* Doctor info card */}
      <Card className="mb-6 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-700">
              {getInitials(doctor.name)}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-surface-900">{doctor.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge tone="primary">{doctor.specialization}</Badge>
                <span className="inline-flex items-center gap-1 text-sm text-surface-500">
                  <Users className="h-3.5 w-3.5" />
                  {doctor.patientCount ?? 0} patients
                </span>
              </div>
            </div>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add patient
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-surface-100 pt-5 text-sm sm:grid-cols-3">
          <div className="flex items-center gap-2 text-surface-600">
            <Building2 className="h-4 w-4 text-surface-400" />
            {doctor.hospital}
          </div>
          <div className="flex items-center gap-2 text-surface-600">
            <Phone className="h-4 w-4 text-surface-400" />
            {doctor.phone}
          </div>
          <div className="flex items-center gap-2 text-surface-600">
            <Mail className="h-4 w-4 text-surface-400" />
            <span className="truncate">{doctor.email}</span>
          </div>
        </div>
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-surface-400">
        Patients
      </h2>

      <PatientFilters
        value={filters}
        onChange={patch}
        onClear={clear}
        conditions={options?.conditions ?? []}
      />

      <Card className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : patients.length === 0 ? (
          <EmptyState
            icon={Users}
            title={hasFilters ? "No matching patients" : "No patients yet"}
            description={
              hasFilters
                ? "Try adjusting or clearing your filters."
                : "Add the first patient under this doctor."
            }
            action={
              hasFilters ? (
                <Button variant="outline" onClick={clear}>
                  Clear filters
                </Button>
              ) : (
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Add patient
                </Button>
              )
            }
          />
        ) : (
          <>
            <PatientsTable
              patients={patients}
              showDoctor={false}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
            {data ? <Pagination meta={data.meta} onPageChange={setPage} /> : null}
          </>
        )}
      </Card>

      <PatientFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        patient={editing}
        requireDoctor={false}
        isSubmitting={addPatient.isPending || updatePatient.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove patient"
        message={
          deleteTarget
            ? `Remove ${deleteTarget.name} from this doctor's patient list? This action cannot be undone.`
            : ""
        }
        confirmLabel="Remove"
        isLoading={deletePatient.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
