'use client';

import { useState } from 'react';
import { AuditLog } from '../types/admin.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NativeSelect } from '@/components/ui/native-select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Eye, RefreshCw, Terminal } from 'lucide-react';

interface AuditLogsTableProps {
  initialLogs: AuditLog[];
  onRefresh: () => void;
}

export function AuditLogsTable({ initialLogs, onRefresh }: AuditLogsTableProps) {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = initialLogs.filter((log) => {
    const matchSearch =
      !search ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.entityType?.toLowerCase().includes(search.toLowerCase()) ||
      log.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      log.userId?.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'ALL' || log.action?.toUpperCase().includes(actionFilter);
    return matchSearch && matchAction;
  });

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('POST')) {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">{action}</Badge>
      );
    }
    if (act.includes('UPDATE') || act.includes('PATCH') || act.includes('PUT')) {
      return <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">{action}</Badge>;
    }
    if (act.includes('DELETE') || act.includes('REMOVE')) {
      return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">{action}</Badge>;
    }
    return <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">{action}</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Filter audit logs by action, entity, user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-950/80 border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <NativeSelect
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-zinc-950/80 border-zinc-800 text-sm text-zinc-200"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">CREATE / ADD</option>
            <option value="UPDATE">UPDATE / EDIT</option>
            <option value="DELETE">DELETE / REMOVE</option>
          </NativeSelect>

          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            className="border-zinc-800 bg-zinc-950/80 hover:bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-950/60">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 font-semibold">Timestamp</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Action</TableHead>
              <TableHead className="text-zinc-400 font-semibold">Entity</TableHead>
              <TableHead className="text-zinc-400 font-semibold">User</TableHead>
              <TableHead className="text-right text-zinc-400 font-semibold">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={5} className="text-center py-8 text-zinc-500">
                  No audit logs recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} className="border-zinc-800/60 hover:bg-zinc-900/40">
                  <TableCell className="text-xs text-zinc-400 font-mono">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-200 font-medium">
                      <span>{log.entityType}</span>
                      {log.entityId && (
                        <span className="text-zinc-500 font-mono">({log.entityId})</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-zinc-300">
                    {log.userEmail || log.userId || 'System'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setSelectedLog(log)}
                      className="h-8 w-8 text-zinc-400 hover:text-orange-400 hover:bg-orange-500/10"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Details JSON Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-400">
              <Terminal className="w-5 h-5" /> Audit Log Detail
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Log ID: <span className="font-mono text-zinc-300">{selectedLog?.id}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
              <div>
                <span className="text-zinc-500 block">Action:</span>
                <span className="font-semibold text-zinc-200">{selectedLog?.action}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Entity:</span>
                <span className="font-semibold text-zinc-200">{selectedLog?.entityType}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">User:</span>
                <span className="font-semibold text-zinc-200">
                  {selectedLog?.userEmail || selectedLog?.userId || 'System'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">IP Address:</span>
                <span className="font-mono text-zinc-300">
                  {selectedLog?.ipAddress || '127.0.0.1'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-zinc-400 font-semibold mb-1 block">Payload Details:</span>
              <pre className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-60">
                {selectedLog?.details
                  ? typeof selectedLog.details === 'string'
                    ? selectedLog.details
                    : JSON.stringify(selectedLog.details, null, 2)
                  : '// No additional payload details'}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
