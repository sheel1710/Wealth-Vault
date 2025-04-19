import { useState, useEffect } from "react";
import { FixedDeposit } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { addMonths, addYears, format } from "date-fns";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const formSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  principalAmount: z.string().min(1, "Principal amount is required"),
  interestRate: z.string().min(1, "Interest rate is required"),
  tenure: z.number().min(1, "Tenure must be at least 1"),
  tenureType: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface ReinvestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fd: FixedDeposit | null;
}

export default function ReinvestDialog({ open, onOpenChange, fd }: ReinvestDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Calculate projected values
  const [projectedValue, setProjectedValue] = useState<number>(0);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bankName: "",
      principalAmount: "",
      interestRate: "7.0", // Default value
      tenure: 12,
      tenureType: "months",
    }
  });
  
  // Load FD data when available
  useEffect(() => {
    if (fd) {
      // Calculate the maturity amount if it exists
      const maturityAmount = fd.maturityAmount ? Number(fd.maturityAmount) : 
        (Number(fd.principalAmount) + (fd.interestAmount ? Number(fd.interestAmount) : 0));
      
      form.reset({
        bankName: fd.bankName,
        principalAmount: String(maturityAmount),
        interestRate: "7.0", // New rate (default)
        tenure: 12, // New default tenure
        tenureType: "months",
      });
    }
  }, [fd, form]);

  // Watch form values to calculate projected value
  const principalAmount = form.watch("principalAmount");
  const interestRate = form.watch("interestRate");
  const tenure = form.watch("tenure");
  const tenureType = form.watch("tenureType");
  
  // Calculate projected value when inputs change
  useEffect(() => {
    const principal = Number(principalAmount.replace(/,/g, ''));
    const rate = Number(interestRate);
    
    if (!isNaN(principal) && !isNaN(rate) && tenure > 0) {
      // Convert tenure to years for calculation
      const tenureInYears = tenureType === "months" ? tenure / 12 : tenure;
      
      // Simple interest calculation
      const interest = (principal * rate * tenureInYears) / 100;
      const projectedAmount = principal + interest;
      
      setProjectedValue(projectedAmount);
    } else {
      setProjectedValue(0);
    }
  }, [principalAmount, interestRate, tenure, tenureType]);

  // Create a new FD mutation
  const createNewFDMutation = useMutation({
    mutationFn: async (data: any) => {
      // Close the current FD if needed
      if (fd) {
        await apiRequest("PUT", `/api/fixed-deposits/${fd.id}`, {
          isActive: false,
          notes: fd.notes ? `${fd.notes} - Reinvested on ${format(new Date(), 'yyyy-MM-dd')}` : `Reinvested on ${format(new Date(), 'yyyy-MM-dd')}`
        });
      }
      
      // Create a new FD with reinvested amount
      const principal = Number(data.principalAmount.replace(/,/g, ''));
      const rate = Number(data.interestRate);
      const tenureInYears = data.tenureType === "months" ? data.tenure / 12 : data.tenure;
      const interest = (principal * rate * tenureInYears) / 100;
      
      const startDate = new Date();
      let maturityDate;
      if (data.tenureType === "months") {
        maturityDate = addMonths(startDate, data.tenure);
      } else {
        maturityDate = addYears(startDate, data.tenure);
      }
      
      const newFD = {
        userId: user?.id,
        fdNumber: `RE${fd?.fdNumber || 'NEW'}`,
        bankName: data.bankName,
        principalAmount: principal,
        interestRate: rate,
        tenure: data.tenure,
        tenureType: data.tenureType,
        startDate: format(startDate, 'yyyy-MM-dd'),
        maturityDate: format(maturityDate, 'yyyy-MM-dd'),
        interestAmount: interest,
        maturityAmount: principal + interest,
        isActive: true,
        notes: fd ? `Reinvested from FD ${fd.fdNumber}` : "New investment"
      };
      
      const res = await apiRequest("POST", "/api/fixed-deposits", newFD);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Fixed deposit has been reinvested successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fixed-deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to reinvest: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  function onSubmit(values: FormValues) {
    createNewFDMutation.mutate(values);
  }

  if (!fd) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reinvest Maturing FD</DialogTitle>
          <DialogDescription>
            Your FD {fd.fdNumber} from {fd.bankName} is maturing soon. Reinvest it for continued growth.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="principalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maturity Amount to Reinvest (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/,/g, '');
                        if (!isNaN(Number(rawValue)) || rawValue === '') {
                          const formattedValue = rawValue === '' 
                            ? '' 
                            : Number(rawValue).toLocaleString('en-IN');
                          field.onChange(formattedValue);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="interestRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Interest Rate (%)</FormLabel>
                  <div className="flex space-x-4 items-center">
                    <FormControl className="flex-1">
                      <Input {...field} />
                    </FormControl>
                    <span className="text-sm font-medium">
                      {field.value}%
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="tenure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tenure: {field.value} {form.getValues("tenureType")}</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={form.getValues("tenureType") === "months" ? 60 : 10}
                        step={form.getValues("tenureType") === "months" ? 1 : 1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tenureType"
                render={({ field }) => (
                  <FormItem>
                    <Select 
                      value={field.value} 
                      onValueChange={(value) => {
                        field.onChange(value);
                        
                        // Reset tenure to appropriate value when changing type
                        if (value === "years" && form.getValues("tenure") > 10) {
                          form.setValue("tenure", 5);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select tenure type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Projected Returns</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Principal</p>
                  <p className="text-lg font-semibold text-text-dark">
                    ₹{Number(principalAmount.replace(/,/g, '') || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Projected Value</p>
                  <p className="text-lg font-semibold text-primary">
                    ₹{projectedValue.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Interest Earned</p>
                  <p className="text-base font-medium text-success">
                    ₹{(projectedValue - Number(principalAmount.replace(/,/g, '') || 0)).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Annual Return</p>
                  <p className="text-base font-medium text-warning">
                    {Number(interestRate)}%
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createNewFDMutation.isPending}
              >
                {createNewFDMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Reinvest FD
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
