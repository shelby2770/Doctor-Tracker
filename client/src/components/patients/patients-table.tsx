"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { formatDate, getInitials } from "@/lib/utils";
import type { Patient } from "@/lib/types";

interface PatientsTableProps {
  patients: Patient[];
  showDoctor?: boolean;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

function doctorName(patient: Patient): string {
  if (typeof patient.doctor === "string") return "—";
  return patient.doctor?.name ?? "—";
}

function RowActions({
  patient,
  onEdit,
  onDelete,
}: {
  patient: Patient;
  onEdit: (p: Patient) => void;
  onDelete: (p: Patient) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onEdit(patient)}
        className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-surface-100 hover:text-surface-700 focus-ring"
        title="Edit"
        aria-label="Edit patient"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDelete(patient)}
        className="rounded-lg p-2 text-surface-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-ring"
        title="Delete"
        aria-label="Delete patient"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function PatientsTable({
  patients,
  showDoctor = true,
  onEdit,
  onDelete,
}: PatientsTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100 text-left text-xs font-semibold uppercase tracking-wide text-surface-400">
              <th className="px-5 py-3">Patient</th>
              <th className="px-5 py-3">Age / Gender</th>
              <th className="px-5 py-3">Condition</th>
              <th className="px-5 py-3">Status</th>
              {showDoctor ? <th className="px-5 py-3">Doctor</th> : null}
              <th className="px-5 py-3">Added</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {patients.map((patient) => (
              <tr key={patient._id} className="transition-colors hover:bg-surface-50/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">
                      {getInitials(patient.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-surface-900">
                        {patient.name}
                      </p>
                      <p className="truncate text-xs text-surface-400">{patient.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-surface-600">
                  {patient.age} · {patient.gender}
                </td>
                <td className="px-5 py-3">
                  <Badge tone="neutral">{patient.condition}</Badge>
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={patient.status} />
                </td>
                {showDoctor ? (
                  <td className="px-5 py-3 text-surface-600">{doctorName(patient)}</td>
                ) : null}
                <td className="px-5 py-3 text-surface-500">
                  {formatDate(patient.createdAt)}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end">
                    <RowActions patient={patient} onEdit={onEdit} onDelete={onDelete} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-surface-100 md:hidden">
        {patients.map((patient) => (
          <div key={patient._id} className="flex items-start gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-700">
              {getInitials(patient.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-medium text-surface-900">{patient.name}</p>
                <StatusBadge status={patient.status} />
              </div>
              <p className="truncate text-xs text-surface-400">{patient.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="neutral">{patient.condition}</Badge>
                <span className="text-xs text-surface-500">
                  {patient.age} · {patient.gender}
                </span>
              </div>
              {showDoctor ? (
                <p className="mt-2 text-xs text-surface-500">
                  Doctor: {doctorName(patient)}
                </p>
              ) : null}
            </div>
            <RowActions patient={patient} onEdit={onEdit} onDelete={onDelete} />
          </div>
        ))}
      </div>
    </>
  );
}
