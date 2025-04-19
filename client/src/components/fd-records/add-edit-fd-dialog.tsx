import { useState, useEffect } from "react";
import { FixedDeposit, insertFDSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { format, addMonths, addYears, differenceInMonths } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";

// Create a form schema with validations
const formSchema = insertFDSchema.omit({ id: true }).extend({
  // Use date objects for the form instead of strings
  startDate: z.date(),
  maturityDate: z.date(),
  // Format for financial inputs
  principalAmount: z.string()
    .min(1, "Principal amount is required")
    .refine(val => !isNaN(Number(val.replace(/,/g, ''))), "Must be a valid number"),
  interestRate: z.string()
    .min(1, "Interest rate is required")
    .refine(val => !isNaN(Number(val.replace(/,/g, ''))), "Must be a valid number"),
  interestAmount: z.string().optional(),
  maturityAmount: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEditFDDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fdToEdit: FixedDeposit | null;
}

export default function AddEditFDDialog({ open, onOpenChange, fdToEdit }: AddEditFDDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [autoCalculateMaturity, setAutoCalculateMaturity] = useState(true);
  const [autoCalculateInterest, setAutoCalculateInterest] = useState(true);

  // Setup form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: user?.id,
      fdNumber: "",
      bankName: "",
      principalAmount: "",
      interestRate: "",
      tenure: 12,
      tenureType: "months",
      startDate: new Date(),
      maturityDate: addMonths(new Date(), 12),
      interestAmount: "",
      maturityAmount: "",
      isActive: true,
      notes: "",
    },
  });

  // Load existing FD data when editing
  useEffect(() => {
    if (fdToEdit) {
      form.reset({
        userId: fdToEdit.userId,
        fdNumber: fdToEdit.fdNumber,
        bankName: fdToEdit.bankName,
        principalAmount: String(fdToEdit.principalAmount),
        interestRate: String(fdToEdit.interestRate),
        tenure: fdToEdit.tenure,
        tenureType: fdToEdit.tenureType,
        startDate: new Date(fdToEdit.startDate),
        maturityDate: new Date(fdToEdit.maturityDate),
        interestAmount: fdToEdit.interestAmount ? String(fdToEdit.interestAmount) : undefined,
        maturityAmount: fdToEdit.maturityAmount ? String(fdToEdit.maturityAmount) : undefined,
        isActive: fdToEdit.isActive,
        notes: fdToEdit.notes || "",
      });
      
      // Disable auto calculations for edit mode (assume user knows what they're doing)
      setAutoCalculateMaturity(false);
      setAutoCalculateInterest(false);
    } else {
      form.reset({
        userId: user?.id,
        fdNumber: "",
        bankName: "",
        principalAmount: "",
        interestRate: "",
        tenure: 12,
        tenureType: "months",
        startDate: new Date(),
        maturityDate: addMonths(new Date(), 12),
        interestAmount: "",
        maturityAmount: "",
        isActive: true,
        notes: "",
      });
      
      // Reset auto calculations
      setAutoCalculateMaturity(true);
      setAutoCalculateInterest(true);
    }
  }, [fdToEdit, user, form]);

  // Watch form values for calculations
  const startDate = form.watch("startDate");
  const tenure = form.watch("tenure");
  const tenureType = form.watch("tenureType");
  const principalAmount = form.watch("principalAmount");
  const interestRate = form.watch("interestRate");

  // Auto-calculate maturity date based on start date and tenure
  useEffect(() => {
    if (autoCalculateMaturity && startDate && tenure) {
      let maturityDate;
      if (tenureType === "months") {
        maturityDate = addMonths(new Date(startDate), tenure);
      } else {
        maturityDate = addYears(new Date(startDate), tenure);
      }
      form.setValue("maturityDate", maturityDate);
    }
  }, [startDate, tenure, tenureType, autoCalculateMaturity, form]);

  // Auto-calculate interest and maturity amounts
  useEffect(() => {
    if (autoCalculateInterest && principalAmount && interestRate && tenure) {
      const principal = Number(principalAmount.replace(/,/g, ''));
      const rate = Number(interestRate.replace(/,/g, ''));
      
      if (!isNaN(principal) && !isNaN(rate)) {
        // Simple interest calculation: P * R * T / 100
        // Where T is in years
        const tenureInYears = tenureType === "months" ? tenure / 12 : tenure;
        const interest = (principal * rate * tenureInYears) / 100;
        const maturity = principal + interest;
        
        form.setValue("interestAmount", interest.toFixed(2));
        form.setValue("maturityAmount", maturity.toFixed(2));
      }
    }
  }, [principalAmount, interestRate, tenure, tenureType, autoCalculateInterest, form]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Format the dates and numeric values for API
      const formattedData = {
        ...data,
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        maturityDate: format(data.maturityDate, 'yyyy-MM-dd'),
        principalAmount: Number(data.principalAmount.replace(/,/g, '')),
        interestRate: Number(data.interestRate.replace(/,/g, '')),
        interestAmount: data.interestAmount ? Number(data.interestAmount.replace(/,/g, '')) : null,
        maturityAmount: data.maturityAmount ? Number(data.maturityAmount.replace(/,/g, '')) : null,
      };
      
      const res = await apiRequest("POST", "/api/fixed-deposits", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Fixed deposit has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fixed-deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create FD: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      // Format the dates and numeric values for API
      const formattedData = {
        ...data,
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        maturityDate: format(data.maturityDate, 'yyyy-MM-dd'),
        principalAmount: Number(data.principalAmount.replace(/,/g, '')),
        interestRate: Number(data.interestRate.replace(/,/g, '')),
        interestAmount: data.interestAmount ? Number(data.interestAmount.replace(/,/g, '')) : null,
        maturityAmount: data.maturityAmount ? Number(data.maturityAmount.replace(/,/g, '')) : null,
      };
      
      const res = await apiRequest("PUT", `/api/fixed-deposits/${fdToEdit?.id}`, formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Fixed deposit has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fixed-deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update FD: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  function onSubmit(values: FormValues) {
    // Add the user ID if not already set
    if (!values.userId && user) {
      values.userId = user.id;
    }
    
    if (fdToEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  // Calculate tenure from start and maturity dates
  function updateTenureFromDates() {
    const start = new Date(form.getValues("startDate"));
    const maturity = new Date(form.getValues("maturityDate"));
    
    const monthDiff = differenceInMonths(maturity, start);
    
    if (monthDiff % 12 === 0 && monthDiff >= 12) {
      // If it's a clean number of years, use years
      form.setValue("tenure", monthDiff / 12);
      form.setValue("tenureType", "years");
    } else {
      // Otherwise use months
      form.setValue("tenure", monthDiff);
      form.setValue("tenureType", "months");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{fdToEdit ? "Edit Fixed Deposit" : "Add New Fixed Deposit"}</DialogTitle>
          <DialogDescription>
            Enter the details of your fixed deposit to track it easily.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fdNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FD Number</FormLabel>
                    <FormControl>
                      <Input placeholder="FD123456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input placeholder="HDFC Bank" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="principalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Principal Amount (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="100000" 
                        {...field} 
                        onChange={(e) => {
                          // Format the number with commas
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
                    <FormLabel>Interest Rate (%)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="7.5" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormField
                  control={form.control}
                  name="tenure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenure</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(parseInt(e.target.value) || 0);
                            }}
                          />
                        </FormControl>
                        
                        <FormField
                          control={form.control}
                          name="tenureType"
                          render={({ field }) => (
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-[110px]">
                                <SelectValue placeholder="Months" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="months">Months</SelectItem>
                                <SelectItem value="years">Years</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center space-x-2 mt-2">
                  <Switch 
                    id="auto-maturity" 
                    checked={autoCalculateMaturity}
                    onCheckedChange={setAutoCalculateMaturity}
                  />
                  <Label htmlFor="auto-maturity" className="text-xs text-gray-500">
                    Auto-calculate maturity date
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              // Update maturity date if auto-calculate is on
                              if (autoCalculateMaturity) {
                                const tenure = form.getValues("tenure");
                                const tenureType = form.getValues("tenureType");
                                
                                if (date && tenure) {
                                  let maturityDate;
                                  if (tenureType === "months") {
                                    maturityDate = addMonths(date, tenure);
                                  } else {
                                    maturityDate = addYears(date, tenure);
                                  }
                                  form.setValue("maturityDate", maturityDate);
                                }
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maturityDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Maturity Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="pl-3 text-left font-normal"
                            >
                              {field.value ? (
                                format(field.value, "PP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              // If auto-calculate maturity is off, update the tenure
                              if (!autoCalculateMaturity && date) {
                                updateTenureFromDates();
                              }
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interestAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Amount (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="7500" 
                        {...field} 
                        value={field.value || ""}
                        onChange={(e) => {
                          // Format the number with commas
                          const rawValue = e.target.value.replace(/,/g, '');
                          if (!isNaN(Number(rawValue)) || rawValue === '') {
                            const formattedValue = rawValue === '' 
                              ? '' 
                              : Number(rawValue).toLocaleString('en-IN');
                            field.onChange(formattedValue);
                            
                            // Update maturity amount if auto-calculate
                            if (autoCalculateInterest) {
                              const principal = form.getValues("principalAmount");
                              const principalNum = Number(principal.replace(/,/g, ''));
                              const interestNum = Number(rawValue);
                              
                              if (!isNaN(principalNum) && !isNaN(interestNum)) {
                                const maturity = principalNum + interestNum;
                                form.setValue("maturityAmount", maturity.toFixed(2));
                              }
                            }
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
                name="maturityAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maturity Amount (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="107500" 
                        {...field} 
                        value={field.value || ""}
                        onChange={(e) => {
                          // Format the number with commas
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
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="auto-interest" 
                checked={autoCalculateInterest}
                onCheckedChange={setAutoCalculateInterest}
              />
              <Label htmlFor="auto-interest" className="text-sm text-gray-500">
                Auto-calculate interest and maturity amounts
              </Label>
            </div>

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active FD</FormLabel>
                    <FormDescription>
                      Mark as inactive if the FD is closed or broken
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <textarea
                      className="w-full min-h-[80px] p-3 rounded-md border border-gray-300"
                      placeholder="Any additional notes about this FD..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {fdToEdit ? "Update" : "Create"} FD
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
