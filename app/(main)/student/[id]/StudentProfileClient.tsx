'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Calendar,
  Phone,
  User,
  Clock,
  AlertCircle,
  Home,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  RefreshCw,
  TrendingUp,
  KeyRound,
  IndianRupee,
  ArrowRight,
  ChevronRight,
  Layers,
  BadgeCheck,
  Ban,
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { toast } from 'sonner';
import EditStudentDialog from '@/components/students/EditStudentDialog';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StudentData {
  id: string;
  name: string;
  gender: string;
  phoneNumber: string;
  address: string | null;
  lockerNumber: number | null;
  memberId: number | null;
  createdAt: string;
  subscriptions: SubscriptionData[];
  assignments: AssignmentData[];
}

interface AssignmentData {
  id: string;
  seat: { id: string; seatNo: number; floor: { id: string; name: string } };
  shift: { id: string; name: string };
}

interface SubscriptionData {
  id: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  discount: number;
  amountPaid: number;
  status: 'ACTIVE' | 'EXPIRED' | 'UPCOMING';
  floorName: string;
  seatNo: number;
  shiftName: string[];
}

interface StudentProfileData {
  student: StudentData;
}

// ─── Update Dues Dialog ───────────────────────────────────────────────────────

interface UpdateDuesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: SubscriptionData;
  studentId: string;
  onSuccess: () => void;
}

function UpdateDuesDialog({
  open,
  onOpenChange,
  subscription,
  studentId,
  onSuccess,
}: UpdateDuesDialogProps) {
  const finalAmount = subscription.totalAmount - (subscription.discount || 0);
  const dues = finalAmount - subscription.amountPaid;
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (parsed > dues) {
      toast.error(`Amount cannot exceed outstanding dues of ₹${dues}`);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `/api/students/${studentId}/subscriptions/${subscription.id}/dues`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amountPaid: parsed }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update dues');
      }

      toast.success(`₹${parsed} payment recorded successfully`);
      setAmount('');
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <IndianRupee className="size-5 text-amber-600" />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Clear outstanding dues for Seat #{subscription.seatNo} —{' '}
            {subscription.floorName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Summary Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted/40 rounded-lg p-3 text-center border border-border">
              <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wide mb-1">
                Total
              </p>
              <p className="text-base font-bold text-foreground">
                ₹{finalAmount}
              </p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-center border border-emerald-200/50">
              <p className="text-[10px] font-bold uppercase text-emerald-700 tracking-wide mb-1">
                Paid
              </p>
              <p className="text-base font-bold text-emerald-600">
                ₹{subscription.amountPaid}
              </p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-200/50">
              <p className="text-[10px] font-bold uppercase text-amber-700 tracking-wide mb-1">
                Due
              </p>
              <p className="text-base font-bold text-amber-600">₹{dues}</p>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <Label htmlFor="dues-amount" className="text-sm font-semibold">
              Payment Amount (₹)
            </Label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="dues-amount"
                type="number"
                min={1}
                max={dues}
                placeholder={`Max ₹${dues}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 pt-1">
              {[dues, Math.ceil(dues / 2)].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className="text-xs px-2.5 py-1 rounded-md bg-muted border border-border hover:bg-muted/80 font-semibold transition-colors"
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !amount}
            className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <CheckCircle2 className="size-4" />
            {loading ? 'Recording...' : 'Record Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function getDaysLeft(endDate: string) {
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);
  return Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function StatusBadge({ status }: { status: SubscriptionData['status'] }) {
  const map = {
    ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    EXPIRED: 'bg-red-100 text-red-700 border-red-300',
    UPCOMING: 'bg-blue-100 text-blue-700 border-blue-300',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border',
        map[status]
      )}
    >
      {status}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StudentProfileClient() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id as string;

  const [data, setData] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duesDialog, setDuesDialog] = useState<SubscriptionData | null>(null);

  const fetchStudentData = useCallback(async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/students/${studentId}`);
      if (!res.ok) throw new Error('Failed to fetch student data');
      const result = await res.json();
      if (result.success && result.data) {
        const s = result.data;
        setData({
          student: {
            id: s.id,
            name: s.name,
            gender: s.gender,
            phoneNumber: s.phoneNumber,
            address: s.address,
            lockerNumber: s.lockerNumber,
            memberId: s.memberId,
            createdAt: s.createdAt,
            subscriptions: s.subscriptions || [],
            assignments: s.assignments || [],
          },
        });
      } else {
        throw new Error(result.message || 'Failed to fetch student data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const handleDelete = async () => {
    if (!data?.student.id) return;
    if (
      !confirm(
        'Are you sure you want to delete this student? This action cannot be undone.'
      )
    )
      return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/students/${data.student.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Student deleted successfully');
        router.push('/student');
      } else {
        toast.error('Failed to delete student');
      }
    } catch {
      toast.error('An error occurred');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <StudentProfileSkeleton />;

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 pt-24">
        <div className="max-w-6xl mx-auto">
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="pt-6 flex items-center gap-3">
              <AlertCircle className="text-destructive shrink-0" />
              <div>
                <p className="font-semibold text-destructive">Error</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Student not found</p>
      </div>
    );

  const { student } = data;
  const activeSub = student.subscriptions.find((s) => s.status === 'ACTIVE');
  const totalPaid = student.subscriptions.reduce(
    (a, s) => a + s.amountPaid,
    0
  );
  const totalDues = student.subscriptions.reduce(
    (a, s) => a + ((s.totalAmount - (s.discount || 0)) - s.amountPaid),
    0
  );

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 pt-24">

        {/* Breadcrumb */}
        <div className="mb-5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/"><Home className="w-4 h-4" /></Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/student">Students</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{student.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* ── Hero Banner ─────────────────────────────────────────────────── */}
        <div className="relative mb-6 rounded-2xl overflow-hidden border border-border bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg">
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)',
            }}
          />

          <div className="relative p-5 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Left: Identity */}
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="size-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-2xl font-bold text-white backdrop-blur-sm">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-xl font-bold tracking-tight">
                      {student.name}
                    </h1>
                    {activeSub ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full px-2 py-0.5">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide bg-red-500/20 text-red-300 border border-red-500/30 rounded-full px-2 py-0.5">
                        <Ban className="size-3" />
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/60">
                    <span className="flex items-center gap-1.5">
                      <BadgeCheck className="size-3.5 text-white/40" />
                      ID: {student.memberId ?? 'Pending'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="size-3.5 text-white/40" />
                      {student.phoneNumber}
                    </span>
                    {activeSub && (
                      <span className="flex items-center gap-1.5">
                        <Layers className="size-3.5 text-white/40" />
                        Seat #{activeSub.seatNo} · {activeSub.floorName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowEditDialog(true)}
                  className="gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
                >
                  <Edit2 className="size-3.5" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="gap-1.5 bg-red-600/80 hover:bg-red-600 text-white border-none"
                >
                  <Trash2 className="size-3.5" />
                  {deleting ? 'Deleting…' : 'Delete'}
                </Button>
              </div>
            </div>

            {/* Stat Strip */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Subscriptions', value: student.subscriptions.length, color: 'text-white' },
                {
                  label: 'Active',
                  value: student.subscriptions.filter((s) => s.status === 'ACTIVE').length,
                  color: 'text-emerald-400',
                },
                { label: 'Total Paid', value: `₹${totalPaid}`, color: 'text-white' },
                {
                  label: 'Total Dues',
                  value: `₹${totalDues}`,
                  color: totalDues > 0 ? 'text-amber-400' : 'text-emerald-400',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                >
                  <p className="text-[10px] uppercase font-bold tracking-wider text-white/40 mb-1">
                    {stat.label}
                  </p>
                  <p className={cn('text-xl font-bold', stat.color)}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Grid ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* ── Left Column ─────────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Personal Info */}
            <Card className="border border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border px-4 py-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <User className="size-4 text-muted-foreground" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border">
                {[
                  { label: 'Full Name', value: student.name, mono: false },
                  { label: 'Gender', value: student.gender, mono: false },
                  { label: 'Phone', value: student.phoneNumber, mono: true },
                  student.address
                    ? { label: 'Address', value: student.address, mono: false }
                    : null,
                ]
                  .filter(Boolean)
                  .map((row) => (
                    <div key={row!.label} className="px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">
                        {row!.label}
                      </p>
                      <p
                        className={cn(
                          'text-sm font-semibold text-foreground capitalize',
                          row!.mono && 'font-mono'
                        )}
                      >
                        {row!.value}
                      </p>
                    </div>
                  ))}

                {student.lockerNumber && (
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
                      Locker
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-primary/30 bg-primary/5 text-primary text-sm font-bold">
                      <KeyRound className="size-3.5" />#{student.lockerNumber}
                    </div>
                  </div>
                )}

                <div className="px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">
                    Member Since
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {new Date(student.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="border border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border px-4 py-3">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <TrendingUp className="size-4 text-muted-foreground" />
                  Subscription Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 grid grid-cols-2 gap-2">
                {[
                  {
                    label: 'Total',
                    value: student.subscriptions.length,
                    cls: 'bg-muted/40 border-border text-foreground',
                  },
                  {
                    label: 'Active',
                    value: student.subscriptions.filter((s) => s.status === 'ACTIVE').length,
                    cls: 'bg-emerald-50 border-emerald-200/60 text-emerald-700',
                  },
                  {
                    label: 'Expired',
                    value: student.subscriptions.filter((s) => s.status === 'EXPIRED').length,
                    cls: 'bg-red-50 border-red-200/60 text-red-700',
                  },
                  {
                    label: 'Upcoming',
                    value: student.subscriptions.filter((s) => s.status === 'UPCOMING').length,
                    cls: 'bg-blue-50 border-blue-200/60 text-blue-700',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      'rounded-lg border p-3 flex flex-col items-center justify-center text-center',
                      item.cls
                    )}
                  >
                    <span className="text-2xl font-bold">{item.value}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wide mt-0.5 opacity-70">
                      {item.label}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* ── Right Column ────────────────────────────────────────────── */}
          <div className="md:col-span-2 space-y-4">

            {/* Active Subscription Card */}
            {activeSub ? (
              <ActiveSubscriptionCard
                sub={activeSub}
                onUpdateDues={() => setDuesDialog(activeSub)}
              />
            ) : (
              <Card className="border-2 border-dashed border-amber-300 bg-amber-50/50">
                <CardContent className="p-5 flex items-start gap-3">
                  <XCircle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-900 mb-0.5">
                      No Active Subscription
                    </p>
                    <p className="text-sm text-amber-700">
                      This student does not have an active subscription.
                    </p>
                    <Button size="sm" className="mt-3 h-8 text-xs">
                      Create Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subscription History */}
            <Card className="border border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border px-4 py-3">
                <CardTitle className="text-sm font-bold flex items-center justify-between text-foreground">
                  <span className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    Subscription History
                  </span>
                  <Badge variant="outline" className="text-xs font-bold">
                    {student.subscriptions.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {student.subscriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No subscriptions yet</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-0.5">
                    {student.subscriptions.map((sub) => {
                      const finalAmount = sub.totalAmount - (sub.discount || 0);
                      const due = finalAmount - sub.amountPaid;
                      const daysLeft = getDaysLeft(sub.endDate);
                      return (
                        <div
                          key={sub.id}
                          className={cn(
                            'group relative rounded-xl border p-3.5 transition-all hover:shadow-md',
                            sub.status === 'ACTIVE'
                              ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50'
                              : sub.status === 'UPCOMING'
                              ? 'border-blue-200 bg-blue-50/30 hover:bg-blue-50'
                              : 'border-border bg-muted/10 hover:bg-muted/20'
                          )}
                        >
                          {/* Row 1: Seat + Status + Amount */}
                          <div className="flex items-start justify-between mb-2.5">
                            <div>
                              <p className="font-bold text-sm text-foreground">
                                Seat #{sub.seatNo}
                                <span className="text-muted-foreground font-normal mx-1">·</span>
                                {sub.floorName}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <StatusBadge status={sub.status} />
                                {sub.status === 'ACTIVE' && daysLeft <= 7 && (
                                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                                    {daysLeft}d left
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex flex-col items-end gap-0.5">
                                <p className="text-[11px] text-muted-foreground font-medium">₹{sub.totalAmount}</p>
                                {sub.discount > 0 && (
                                  <p className="text-[11px] text-destructive font-semibold">-₹{sub.discount}</p>
                                )}
                              </div>
                              <p className={cn(
                                'text-sm font-bold mt-1',
                                due === 0 ? 'text-emerald-600' : 'text-amber-600'
                              )}>
                                {due === 0 ? '✓ Cleared' : `₹${due} due`}
                              </p>
                            </div>
                          </div>

                          {/* Row 2: Dates */}
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium mb-2.5">
                            <Calendar className="size-3" />
                            {new Date(sub.startDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: '2-digit',
                            })}
                            <ArrowRight className="size-3" />
                            {new Date(sub.endDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: '2-digit',
                            })}
                          </div>

                          {/* Row 3: Shifts + Update Dues */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex gap-1 flex-wrap">
                              {sub.shiftName.map((shift, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border bg-background capitalize"
                                >
                                  {shift}
                                </span>
                              ))}
                            </div>
                            {due > 0 && (
                              <button
                                onClick={() => setDuesDialog(sub)}
                                className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 hover:bg-amber-200 transition-colors rounded-full px-2.5 py-1 flex items-center gap-1"
                              >
                                <IndianRupee className="size-3" />
                                Settle ₹{due}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {data && (
        <EditStudentDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          student={{
            id: student.id,
            memberId: student.memberId?.toString() || null,
            name: student.name,
            gender: student.gender,
            phoneNumber: student.phoneNumber,
            lockerNumber: student.lockerNumber,
            address: student.address,
            subscriptions: [],
          }}
          onSuccess={fetchStudentData}
        />
      )}

      {/* Update Dues Dialog */}
      {duesDialog && (
        <UpdateDuesDialog
          open={!!duesDialog}
          onOpenChange={(open) => !open && setDuesDialog(null)}
          subscription={duesDialog}
          studentId={student.id}
          onSuccess={fetchStudentData}
        />
      )}
    </div>
  );
}

// ─── Active Subscription Card ─────────────────────────────────────────────────

function ActiveSubscriptionCard({
  sub,
  onUpdateDues,
}: {
  sub: SubscriptionData;
  onUpdateDues: () => void;
}) {
  const finalAmount = sub.totalAmount - (sub.discount || 0);
  const dues = finalAmount - sub.amountPaid;
  const daysLeft = getDaysLeft(sub.endDate);
  const progress = Math.round((sub.amountPaid / finalAmount) * 100);

  return (
    <Card className="border-2 border-emerald-300/60 shadow-sm overflow-hidden bg-linear-to-br from-emerald-50/60 to-white">
      <CardHeader className="bg-emerald-50/80 border-b border-emerald-200/50 px-4 py-3">
        <CardTitle className="text-sm font-bold flex items-center justify-between text-foreground">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            Current Subscription
          </span>
          <StatusBadge status="ACTIVE" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">

        {/* Seat / Floor / Shift */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Seat', value: `#${sub.seatNo}` },
            { label: 'Floor', value: sub.floorName },
            {
              label: 'Shifts',
              value:
                sub.shiftName.length > 0
                  ? sub.shiftName.join(', ')
                  : '—',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white border border-emerald-200/50 rounded-lg px-3 py-2.5 text-center"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
                {item.label}
              </p>
              <p className="text-sm font-bold text-foreground capitalize truncate">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Dates + Days Remaining */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white border border-emerald-200/50 rounded-lg px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
              Start
            </p>
            <p className="text-xs font-semibold text-foreground">
              {new Date(sub.startDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="bg-white border border-emerald-200/50 rounded-lg px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
              End
            </p>
            <p className="text-xs font-semibold text-emerald-600">
              {new Date(sub.endDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <div
            className={cn(
              'rounded-lg px-3 py-2.5 border text-center',
              daysLeft <= 3
                ? 'bg-red-50 border-red-200'
                : daysLeft <= 7
                ? 'bg-amber-50 border-amber-200'
                : 'bg-emerald-50 border-emerald-200'
            )}
          >
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
              Remaining
            </p>
            <p
              className={cn(
                'text-lg font-bold',
                daysLeft <= 3
                  ? 'text-red-600'
                  : daysLeft <= 7
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              )}
            >
              {Math.max(0, daysLeft)}d
            </p>
          </div>
        </div>

        {/* Payment Section */}
        <div className="rounded-xl border border-border bg-white p-3.5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Payment Summary
          </p>
          
          {/* Price Breakdown */}
          <div className="bg-muted/30 rounded-lg p-2.5 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Original Total</span>
              <span className="font-semibold">₹{sub.totalAmount}</span>
            </div>
            {sub.discount > 0 && (
              <div className="flex justify-between border-t border-border pt-1.5">
                <span className="text-destructive font-medium">Discount</span>
                <span className="font-bold text-destructive">-₹{sub.discount}</span>
              </div>
            )}
            <div className={cn(
              'flex justify-between border-t pt-1.5 font-bold',
              sub.discount > 0 && 'border-border'
            )}>
              <span className="text-primary">Final Amount</span>
              <span className="text-primary">₹{finalAmount}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>₹{sub.amountPaid} paid</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  progress === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                )}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>₹0</span>
              <span>₹{finalAmount}</span>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="rounded-lg border border-border bg-slate-50 p-2 text-center">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide mb-1">Amount</p>
              <p className="text-sm font-bold text-foreground">₹{finalAmount}</p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-center">
              <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-wide mb-1">Paid</p>
              <p className="text-sm font-bold text-emerald-600">₹{sub.amountPaid}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-center">
              <p className={cn(
                'text-[10px] font-bold uppercase tracking-wide mb-1',
                dues === 0 ? 'text-emerald-700' : 'text-amber-700'
              )}>
                {dues === 0 ? 'Status' : 'Due'}
              </p>
              <p className={cn(
                'text-sm font-bold',
                dues === 0 ? 'text-emerald-600' : 'text-amber-600'
              )}>
                {dues === 0 ? '✓ Cleared' : `₹${dues}`}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 h-9 text-sm">
            <RefreshCw className="size-3.5" />
            Renew
          </Button>
          {dues > 0 && (
            <Button
              variant="outline"
              onClick={onUpdateDues}
              className="flex-1 gap-1.5 h-9 text-sm border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <IndianRupee className="size-3.5" />
              Settle Dues
            </Button>
          )}
          <Button variant="ghost" className="h-9 px-3 text-sm" asChild>
            <Link href="#">
              Details <ChevronRight className="size-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function StudentProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 pt-24">
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}