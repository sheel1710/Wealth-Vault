import { useState } from "react";
import { FixedDeposit } from "@shared/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Package } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import ReinvestDialog from "../maturity/reinvest-dialog";
import SetGoalDialog from "../maturity/set-goal-dialog";

interface UpcomingMaturitiesProps {
  maturities: FixedDeposit[];
  isLoading: boolean;
}

export default function UpcomingMaturities({ maturities, isLoading }: UpcomingMaturitiesProps) {
  const [reinvestDialogOpen, setReinvestDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [selectedFD, setSelectedFD] = useState<FixedDeposit | null>(null);

  const handleReinvest = (fd: FixedDeposit) => {
    setSelectedFD(fd);
    setReinvestDialogOpen(true);
  };

  const handleSetGoal = (fd: FixedDeposit) => {
    setSelectedFD(fd);
    setGoalDialogOpen(true);
  };

  const getDaysToMaturity = (maturityDate: string) => {
    const today = new Date();
    const mDate = new Date(maturityDate);
    return differenceInDays(mDate, today);
  };

  return (
    <>
      <Card>
        <CardHeader className="p-6 border-b border-gray-200">
          <CardTitle>Upcoming Maturities</CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : maturities.length > 0 ? (
            <div className="space-y-4">
              {maturities.map((fd) => (
                <div key={fd.id} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center bg-warning bg-opacity-10 text-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-text-dark">
                          {fd.bankName} FD
                        </p>
                        <p className="text-xs text-gray-500">
                          Matures in {getDaysToMaturity(fd.maturityDate)} days
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-text-dark">
                        ₹{Number(fd.principalAmount).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-success">
                        +₹{Number(fd.interestAmount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    <Button 
                      className="px-3 py-2 bg-primary text-white text-sm rounded-md flex-1 flex items-center justify-center"
                      onClick={() => handleReinvest(fd)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reinvest
                    </Button>
                    <Button 
                      variant="outline"
                      className="px-3 py-2 text-text-dark text-sm rounded-md flex-1 flex items-center justify-center"
                      onClick={() => handleSetGoal(fd)}
                    >
                      <Package className="h-4 w-4 mr-1" />
                      Set Goal
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-medium text-gray-500">No Upcoming Maturities</h3>
              <p className="text-xs text-gray-400 mt-1">You don't have any FDs maturing in the next 30 days.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ReinvestDialog 
        open={reinvestDialogOpen} 
        onOpenChange={setReinvestDialogOpen} 
        fd={selectedFD} 
      />
      
      <SetGoalDialog 
        open={goalDialogOpen} 
        onOpenChange={setGoalDialogOpen} 
        fd={selectedFD} 
      />
    </>
  );
}
