import { useState, useEffect } from "react";
import { FixedDeposit, insertGoalSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { addMonths, format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Create a form schema for goals with validations
const formSchema = insertGoalSchema.omit({ id: true }).extend({
  // Use date objects for the form instead of strings
  targetDate: z.date(),
  // Format for financial inputs
  targetAmount: z.string()
    .min(1, "Target amount is required")
    .refine(val => !isNaN(Number(val.replace(/,/g, ''))), "Must be a valid number"),
  currentAmount: z.string()
    .refine(val => !isNaN(Number(val.replace(/,/g, ''))), "Must be a valid number"),
});

type FormValues = z.infer<typeof formSchema>;

interface SetGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fd: FixedDeposit | null;
}

export default function SetGoalDialog({ open, onOpenChange, fd }: SetGoalDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [suggestedMonthlyContribution, setSuggestedMonthlyContribution] = useState<number>(0);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: user?.id,
      name: "",
      targetAmount: "",
      currentAmount: "",
      targetDate: addMonths(new Date(), 12), // Default 1 year from now
      notes: "",
    }
  });
  
  // Load FD data when available
  useEffect(() => {
    if (fd) {
      // Calculate the maturity amount if it exists
      const maturityAmount = fd.maturityAmount ? Number(fd.maturityAmount) : 
        (Number(fd.principalAmount) + (fd.interestAmount ? Number(fd.interestAmount) : 0));
      
      form.reset({
        userId: user?.id,
        name: "", // User will provide
        targetAmount: "", // User will provide
        currentAmount: String(maturityAmount),
        targetDate: addMonths(new Date(), 12), // Default 1 year from now
        notes: `Initial amount from FD ${fd.fdNumber} (${fd.bankName})`,
      });
    }
  }, [fd, user, form]);

  // Calculate suggested monthly contribution when inputs change
  const targetAmount = form.watch("targetAmount");
  const currentAmount = form.watch("currentAmount");
  const targetDate = form.watch("targetDate");
  
  useEffect(() => {
    const targetNum = Number(targetAmount.replace(/,/g, ''));
    const currentNum = Number(currentAmount.replace(/,/g, ''));
    
    if (!isNaN(targetNum) && !isNaN(currentNum) && targetDate) {
      // Calculate months between now and target date
      const now = new Date();
      const months = (targetDate.getFullYear() - now.getFullYear()) * 12 + 
                     (targetDate.getMonth() - now.getMonth());
      
      if (months > 0) {
        // Calculate how much is needed monthly
        const amountNeeded = targetNum - currentNum;
        if (amountNeeded > 0) {
          const monthly = amountNeeded / months;
          setSuggestedMonthlyContribution(monthly);
        } else {
          setSuggestedMonthlyContribution(0);
        }
      }
    }
  }, [targetAmount, currentAmount, targetDate]);

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Update the FD to inactive if it was reinvested
      if (fd) {
        await apiRequest("PUT", `/api/fixed-deposits/${fd.id}`, {
          isActive: false,
          notes: fd.notes ? `${fd.notes} - Used for goal "${data.name}" on ${format(new Date(), 'yyyy-MM-dd')}` : `Used for goal "${data.name}" on ${format(new Date(), 'yyyy-MM-dd')}`
        });
      }
      
      // Format the dates and numeric values for API
      const formattedData = {
        ...data,
        targetDate: format(data.targetDate, 'yyyy-MM-dd'),
        targetAmount: Number(data.targetAmount.replace(/,/g, '')),
        currentAmount: Number(data.currentAmount.replace(/,/g, ''))
      };
      
      const res = await apiRequest("POST", "/api/goals", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Financial goal has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fixed-deposits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create goal: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  function onSubmit(values: FormValues) {
    createGoalMutation.mutate(values);
  }

  if (!fd) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create a Financial Goal</DialogTitle>
          <DialogDescription>
            Use the maturity amount from your FD {fd.fdNumber} to start a new financial goal.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Vacation, New Car, Education" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Amount (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="500000" 
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
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Amount (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="100000" 
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
                    <FormDescription>
                      Amount from maturing FD
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="targetDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
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
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    When do you want to achieve this goal?
                  </FormDescription>
                  <FormMessage />
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
                      placeholder="Additional notes about this goal..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {suggestedMonthlyContribution > 0 && (
              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-primary mb-2">Suggested Monthly Savings</h4>
                <p className="text-sm text-gray-700">
                  To reach your target of ₹{Number(targetAmount.replace(/,/g, '') || 0).toLocaleString('en-IN')} by {format(targetDate, "MMM yyyy")}, 
                  you should save approximately:
                </p>
                <p className="text-xl font-bold text-primary mt-2">
                  ₹{Math.ceil(suggestedMonthlyContribution).toLocaleString('en-IN')} per month
                </p>
              </div>
            )}

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
                disabled={createGoalMutation.isPending}
              >
                {createGoalMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Goal
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
