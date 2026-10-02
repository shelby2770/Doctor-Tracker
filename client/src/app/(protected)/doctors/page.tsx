"use client";

import { Plus, Stethoscope } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DoctorFilters, type DoctorFilterState } from "@/components/doctors/doctor-filters";
import { DoctorFormModal } from "@/components/doctors/doctor-form-modal";
import { DoctorsTable } from "@/components/doctors/doctors-table";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import {
  useCreateDoctor,
  useDeleteDoctor,
  useDoctorFilterOptions,
  useDoctors,
  useUpdateDoctor,
} from "@/hooks/queries/use-doctors";
import { useDebounce } from "@/hooks/use-debounce";
import { getApiErrorMessage } from "@/lib/api";
import type { DoctorValues } from "@/lib/schemas";
import type { Doctor } from "@/lib/types";

const DEFAULT_FILTERS: DoctorFilterState = {
  search: "",
  specialization: "",
  hospital: "",
  startDate: "",
  endDate: "",
  sort: "newest",
};

export default function DoctorsPage() {
  const [filters, setFilters] = useState<DoctorFilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(filters.search, 400);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Doctor | null>(null);

  const { data, isLoading, isError } = useDoctors({
    page,
    limit: 10,
    search: debouncedSearch,
    specialization: filters.specialization,
    hospital: filters.hospital,
    startDate: filters.startDate,
    endDate: filters.endDate,
    sort: filters.sort,
  });
  const { data: options } = useDoctorFilterOptions();

  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();
  const deleteDoctor = useDeleteDoctor();

  const patch = (p: Partial<DoctorFilterState>) => {
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
  const openEdit = (doctor: Doctor) => {
    setEditing(doctor);
    setFormOpen(true);
  };

  const handleSubmit = async (values: DoctorValues) => {
    try {
      if (editing) {
        await updateDoctor.mutateAsync({ id: editing._id, input: values });
        toast.success("Doctor updated");
      } else {
        await createDoctor.mutateAsync(values);
        toast.success("Doctor created");
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
      await deleteDoctor.mutateAsync(deleteTarget._id);
      toast.success("Doctor deleted");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const doctors = data?.data ?? [];
  const hasFilters =
    !!debouncedSearch ||
    !!filters.specialization ||
    !!filters.hospital ||
    !!filters.startDate ||
    !!filters.endDate;

  return (
    <div>
      <PageHeader
        title="Doctors"
        description="Create, search and manage doctor records."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add doctor
          </Button>
        }
      />

      <DoctorFilters
        value={filters}
        onChange={patch}
        onClear={clear}
        specializations={options?.specializations ?? []}
        hospitals={options?.hospitals ?? []}
      />

      <Card className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : isError ? (
          <EmptyState
            icon={Stethoscope}
            title="Couldn't load doctors"
            description="Please make sure the API server is running."
          />
        ) : doctors.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title={hasFilters ? "No doctors match your filters" : "No doctors yet"}
            description={
              hasFilters
                ? "Try adjusting or clearing your filters."
                : "Add your first doctor to get started."
            }
            action={
              hasFilters ? (
                <Button variant="outline" onClick={clear}>
                  Clear filters
                </Button>
              ) : (
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Add doctor
                </Button>
              )
            }
          />
        ) : (
          <>
            <DoctorsTable doctors={doctors} onEdit={openEdit} onDelete={setDeleteTarget} />
            {data ? <Pagination meta={data.meta} onPageChange={setPage} /> : null}
          </>
        )}
      </Card>

      <DoctorFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        doctor={editing}
        isSubmitting={createDoctor.isPending || updateDoctor.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete doctor"
        message={
          deleteTarget
            ? `Delete ${deleteTarget.name}? This will also remove all of their patient records. This action cannot be undone.`
            : ""
        }
        isLoading={deleteDoctor.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
