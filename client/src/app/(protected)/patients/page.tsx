"use client";

import { Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PatientFilters, type PatientFilterState } from "@/components/patients/patient-filters";
import { PatientFormModal } from "@/components/patients/patient-form-modal";
import { PatientsTable } from "@/components/patients/patients-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import { useDoctors } from "@/hooks/queries/use-doctors";
import {
  useCreatePatient,
  useDeletePatient,
  usePatientFilterOptions,
  usePatients,
  useUpdatePatient,
} from "@/hooks/queries/use-patients";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiErrorMessage } from "@/lib/api";
import type { PatientValues } from "@/lib/schemas";
import type { Patient } from "@/lib/types";

const DEFAULT_FILTERS: PatientFilterState = {
  search: "",
  status: "",
  condition: "",
  startDate: "",
  endDate: "",
  sort: "newest",
};

export default function PatientsPage() {
  const [filters, setFilters] = useState<PatientFilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(filters.search, 400);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);

  const { data, isLoading, isError } = usePatients({
    page,
    limit: 10,
    search: debouncedSearch,
    status: filters.status,
    condition: filters.condition,
    startDate: filters.startDate,
    endDate: filters.endDate,
    sort: filters.sort,
  });
  const { data: options } = usePatientFilterOptions();

  // All doctors (for the "assigned doctor" dropdown in the form).
  const { data: doctorsData } = useDoctors({ limit: 1000, sort: "name_asc" });
  const doctorOptions = useMemo(
    () => (doctorsData?.data ?? []).map((d) => ({ id: d._id, name: d.name })),
    [doctorsData],
  );

  const createPatient = useCreatePatient();
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
        await createPatient.mutateAsync(values);
        toast.success("Patient created");
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
      toast.success("Patient deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const patients = data?.data ?? [];
  const hasFilters =
    !!debouncedSearch ||
    !!filters.status ||
    !!filters.condition ||
    !!filters.startDate ||
    !!filters.endDate;

  return (
    <div>
      <PageHeader
        title="Patients"
        description="Browse, search and manage all patient records."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add patient
          </Button>
        }
      />

      <PatientFilters
        value={filters}
        onChange={patch}
        onClear={clear}
        conditions={options?.conditions ?? []}
      />

      <Card className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : isError ? (
          <EmptyState
            icon={Users}
            title="Couldn't load patients"
            description="Please make sure the API server is running."
          />
        ) : patients.length === 0 ? (
          <EmptyState
            icon={Users}
            title={hasFilters ? "No patients match your filters" : "No patients yet"}
            description={
              hasFilters
                ? "Try adjusting or clearing your filters."
                : "Add your first patient to get started."
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
              showDoctor
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
        requireDoctor
        doctorOptions={doctorOptions}
        isSubmitting={createPatient.isPending || updatePatient.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete patient"
        message={
          deleteTarget
            ? `Delete ${deleteTarget.name}? This action cannot be undone.`
            : ""
        }
        isLoading={deletePatient.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
