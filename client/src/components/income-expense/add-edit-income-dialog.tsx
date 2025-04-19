import { useEffect } from "react";
import { Income, insertIncomeSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
const formSchema = insertIncomeSchema.omit({ id: true }).extend({
  // Use date objects for the form instead of strings
  date: z.date(),
  // Format for financial inputs
  amount: z.string()
    .min(1, "Amount is required")
    .refine(val => !isNaN(Number(val.replace(/,/g, ''))), "Must be a valid number"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEditIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incomeToEdit: Income | null;
}

export default function AddEditIncomeDialog({ 
  open, 
  onOpenChange, 
  incomeToEdit 
}: AddEditIncomeDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Setup form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: user?.id,
      source: "",
      amount: "",
      date: new Date(),
      isRecurring: false,
      recurrenceFrequency: "monthly",
      notes: "",
    },
  });

  // Load existing Income data when editing
  useEffect(() => {
    if (incomeToEdit) {
      form.reset({
        userId: incomeToEdit.userId,
        source: incomeToEdit.source,
        amount: String(incomeToEdit.amount),
        date: new Date(incomeToEdit.date),
        isRecurring: incomeToEdit.isRecurring,
        recurrenceFrequency: incomeToEdit.recurrenceFrequency || "monthly",
        notes: incomeToEdit.notes || "",
      });
    } else {
      form.reset({
        userId: user?.id,
        source: "",
        amount: "",
        date: new Date(),
        isRecurring: false,
        recurrenceFrequency: "monthly",
        notes: "",
      });
    }
  }, [incomeToEdit, user, form]);

  // Show/hide recurrence frequency field based on isRecurring
  const isRecurring = form.watch("isRecurring");

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Format the dates and numeric values for API
      const formattedData = {
        ...data,
        date: format(data.date, 'yyyy-MM-dd'),
        amount: Number(data.amount.replace(/,/g, '')),
      };
      
      const res = await apiRequest("POST", "/api/incomes", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Income has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/incomes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add income: ${error.message}`,
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
        date: format(data.date, 'yyyy-MM-dd'),
        amount: Number(data.amount.replace(/,/g, '')),
      };
      
      const res = await apiRequest("PUT", `/api/incomes/${incomeToEdit?.id}`, formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Income has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/incomes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update income: ${error.message}`,
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
    
    if (incomeToEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{incomeToEdit ? "Edit Income" : "Add New Income"}</DialogTitle>
          <DialogDescription>
            Enter details about your income source.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Income Source</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Salary, Freelance, Rent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., 50000" 
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
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
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
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Recurring Income</FormLabel>
                    <FormDescription>
                      Is this a recurring income source?
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {isRecurring && (
              <FormField
                control={form.control}
                name="recurrenceFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="half-yearly">Half-yearly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <textarea
                      className="w-full min-h-[80px] p-3 rounded-md border border-gray-300"
                      placeholder="Any additional notes..."
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
                {incomeToEdit ? "Update" : "Add"} Income
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
