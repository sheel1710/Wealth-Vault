import { useState } from "react";
import { FixedDeposit } from "@shared/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Filter, Download } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";

interface FDRecordsTableProps {
  fixedDeposits: FixedDeposit[];
  isLoading: boolean;
  limit?: number;
}

export default function FDRecordsTable({ 
  fixedDeposits, 
  isLoading,
  limit = 4 
}: FDRecordsTableProps) {
  const [, navigate] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  
  const getFDStatus = (fd: FixedDeposit) => {
    if (!fd.isActive) return { label: "Closed", color: "bg-red-100 text-red-800 ring-1 ring-red-600/10" };
    
    const today = new Date();
    const maturityDate = new Date(fd.maturityDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    if (maturityDate <= today) {
      return { label: "Matured", color: "bg-orange-100 text-orange-800 ring-1 ring-orange-600/10" };
    } else if (maturityDate <= thirtyDaysFromNow) {
      return { label: "Maturing Soon", color: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-600/10" };
    } else {
      return { label: "Active", color: "bg-green-100 text-green-800 ring-1 ring-green-600/10" };
    }
  };

  const showAllRecords = () => {
    navigate("/fd-records");
  };

  // Use the passed limit to only show a subset of records on dashboard
  const displayedFDs = fixedDeposits.slice(0, limit);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-gray-200">
        <CardTitle>Fixed Deposit Records</CardTitle>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon">
            <Filter className="h-5 w-5 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon">
            <Download className="h-5 w-5 text-gray-500" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>FD Number</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Interest Rate</TableHead>
                  <TableHead>Maturity Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedFDs.length > 0 ? (
                  displayedFDs.map((fd) => {
                    const status = getFDStatus(fd);
                    return (
                      <TableRow key={fd.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{fd.fdNumber}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              fd.bankName.toLowerCase().includes('axis') ? 'bg-[#97144C] text-white' :
                              fd.bankName.toLowerCase().includes('hdfc') ? 'bg-[#004C8F] text-white' :
                              fd.bankName.toLowerCase().includes('icici') ? 'bg-[#F37B20] text-white' :
                              fd.bankName.toLowerCase().includes('sbi') ? 'bg-[#11437B] text-white' :
                              fd.bankName.toLowerCase().includes('kotak') ? 'bg-[#EA2227] text-white' :
                              'bg-gray-600 text-white'
                            }`}>
                              {fd.bankName.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-text-dark">{fd.bankName}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>₹{Number(fd.principalAmount).toLocaleString('en-IN')}</TableCell>
                        <TableCell>{fd.interestRate}%</TableCell>
                        <TableCell>{format(new Date(fd.maturityDate), 'dd MMM, yyyy')}</TableCell>
                        <TableCell>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-primary">
                            <Eye className="h-5 w-5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6">
                      No fixed deposits found. Add your first one!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        
        {fixedDeposits.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{Math.min(limit, fixedDeposits.length)}</span> of <span className="font-medium">{fixedDeposits.length}</span> records
              </div>
              <div className="flex space-x-2">
                {fixedDeposits.length > limit && (
                  <Button variant="outline" size="sm" onClick={showAllRecords}>
                    View All
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
