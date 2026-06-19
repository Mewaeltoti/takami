"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Patient } from "@/types";
import { Search, Edit, Trash2, User, Calendar, Phone, AlertTriangle, RefreshCw } from "lucide-react";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit State
  const [editPatient, setEditPatient] = useState<Patient | null>(null);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState<number | "">("");
  const [editGender, setEditGender] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete State
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchPatients = async (query = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/patients?search=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error("Failed to load patients list.");
      }
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const delayDebounceFn = setTimeout(() => {
      fetchPatients(search);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Open Edit Dialog
  const handleOpenEdit = (patient: Patient) => {
    setEditPatient(patient);
    setEditName(patient.fullName);
    setEditAge(patient.age);
    setEditGender(patient.gender);
    setEditPhone(patient.phone || "");
    setEditError(null);
    setIsEditDialogOpen(true);
  };

  // Submit Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPatient) return;
    if (!editName.trim()) {
      setEditError("Full name is required");
      return;
    }
    if (!editAge || Number(editAge) <= 0) {
      setEditError("Age must be a positive number");
      return;
    }
    if (!editGender) {
      setEditError("Gender is required");
      return;
    }

    setIsSaving(true);
    setEditError(null);
    try {
      const response = await fetch(`/api/patients/${editPatient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: editName.trim(),
          age: Number(editAge),
          gender: editGender,
          phone: editPhone.trim() || null,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update patient profile.");
      }

      const updated = await response.json();
      setPatients((prev) => prev.map((p) => (p.id === editPatient.id ? updated : p)));
      setIsEditDialogOpen(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Error saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Open Delete Dialog
  const handleOpenDelete = (patient: Patient) => {
    setDeletePatient(patient);
    setDeleteError(null);
    setIsDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletePatient) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch(`/api/patients/${deletePatient.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to delete patient profile.");
      }

      setPatients((prev) => prev.filter((p) => p.id !== deletePatient.id));
      setIsDeleteDialogOpen(false);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Error deleting profile");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container py-8 px-4 md:px-8 mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Directory</h1>
          <p className="text-slate-500">Search and manage patient demographic profiles.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search patients by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <Card className="shadow-sm border-slate-100">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead className="w-[100px]">Age</TableHead>
                <TableHead className="w-[120px]">Gender</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead className="text-right w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    No patients found matching the search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-slate-500 text-xs">#{patient.id}</TableCell>
                    <TableCell className="font-semibold text-slate-900">{patient.fullName}</TableCell>
                    <TableCell className="text-slate-600">{patient.age}</TableCell>
                    <TableCell className="text-slate-600">{patient.gender}</TableCell>
                    <TableCell className="text-slate-600">{patient.phone || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(patient)}
                          className="h-8 w-8 text-slate-500 hover:text-slate-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDelete(patient)}
                          className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSaveEdit}>
            <DialogHeader>
              <DialogTitle>Edit Patient Profile</DialogTitle>
              <DialogDescription>
                Modify patient demographic records. Click save to store the changes.
              </DialogDescription>
            </DialogHeader>

            {editError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg my-4">
                {editError}
              </div>
            )}

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Age</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      type="number"
                      value={editAge}
                      onChange={(e) => setEditAge(e.target.value !== "" ? Number(e.target.value) : "")}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Gender</label>
                  <Select value={editGender} onValueChange={setEditGender}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <div className="flex items-center gap-3 text-red-600 mb-2">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
              <DialogTitle className="text-lg">Delete Patient Profile?</DialogTitle>
            </div>
            <DialogDescription className="text-slate-600">
              Are you sure you want to delete the profile of{" "}
              <strong className="text-slate-900">{deletePatient?.fullName}</strong>? This action
              cannot be undone and will permanently delete all associated consultation and visit history.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg my-2">
              {deleteError}
            </div>
          )}

          <DialogFooter className="gap-2 mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-slate-200">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
