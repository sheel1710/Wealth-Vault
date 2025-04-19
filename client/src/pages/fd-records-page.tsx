import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import SidebarNav from "@/components/layout/sidebar-nav";
import TopNav from "@/components/layout/top-nav";
import MobileNav from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FixedDeposit } from "@shared/schema";
import AddEditFDDialog from "@/components/fd-records/add-edit-fd-dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export default function FDRecordsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [editFD, setEditFD] = useState<FixedDeposit | null>(null);

  // Fetch FDs data
  const { data: fds, isLoading } = useQuery<FixedDeposit[]>({
    queryKey: ["/api/fixed-deposits"],
  });

  // Delete FD mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/fixed-deposits/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "FD deleted",
        description: "Fixed deposit has been removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fixed-deposits"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete FD: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (fd: FixedDeposit) => {
    setEditFD(fd);
    setOpenAddDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this fixed deposit?")) {
      deleteMutation.mutate(id);
    }
  };

  const getFDStatus = (fd: FixedDeposit) => {
    if (!fd.isActive) return { label: "Closed", color: "bg-gray-200 text-gray-800" };
    
    const today = new Date();
    const maturityDate = new Date(fd.maturityDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    if (maturityDate <= today) {
      return { label: "Matured", color: "bg-danger-light text-danger" };
    } else if (maturityDate <= thirtyDaysFromNow) {
      return { label: "Maturing Soon", color: "bg-warning bg-opacity-10 text-warning" };
    } else {
      return { label: "Active", color: "bg-success bg-opacity-10 text-success" };
    }
  };

  return (
    <div className="flex h-screen bg-neutral">
      {/* Sidebar (Desktop) */}
      <SidebarNav />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <TopNav title="FD Records" />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-neutral p-4">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-text-dark">Fixed Deposit Records</h2>
              <p className="text-sm text-gray-500">Manage all your fixed deposit records</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-2">
              <Button variant="outline" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button className="flex items-center" onClick={() => {
                setEditFD(null);
                setOpenAddDialog(true);
              }}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New FD
              </Button>
            </div>
          </div>

          {/* FD Records Table */}
          <Card>
            <CardHeader>
              <CardTitle>Fixed Deposit Records</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>FD Number</TableHead>
                      <TableHead>Bank</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Interest Rate</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Maturity Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fds && fds.length > 0 ? (
                      fds.map((fd) => {
                        const status = getFDStatus(fd);
                        return (
                          <TableRow key={fd.id}>
                            <TableCell className="font-medium">{fd.fdNumber}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary bg-opacity-10 text-primary">
                                  {fd.bankName.substring(0, 2).toUpperCase()}
                                </div>
                                <span className="ml-3">{fd.bankName}</span>
                              </div>
                            </TableCell>
                            <TableCell>₹{Number(fd.principalAmount).toLocaleString('en-IN')}</TableCell>
                            <TableCell>{fd.interestRate}%</TableCell>
                            <TableCell>{format(new Date(fd.startDate), 'dd MMM, yyyy')}</TableCell>
                            <TableCell>{format(new Date(fd.maturityDate), 'dd MMM, yyyy')}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                                {status.label}
                              </span>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(fd)}>Edit</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDelete(fd.id)}>Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6">
                          No fixed deposits found. Add your first one!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
      
      {/* Add/Edit FD Dialog */}
      <AddEditFDDialog 
        open={openAddDialog} 
        onOpenChange={setOpenAddDialog} 
        fdToEdit={editFD}
      />
    </div>
  );
}
