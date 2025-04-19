import { useEffect } from "react";
import { Expense, insertExpenseSchema } from "@shared/schema";
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
const formSchema = insertExpenseSchema.omit({ id: true }).extend({
  // Use date objects for the form instead of strings
  date: z.date(),
  // Format for financial inputs
  amount: z.string()
    .min(1, "Amount is required")
    .refine(val => !isNaN(Number(val.replace(/,/g, ''))), "Must be a valid number"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEditExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseToEdit: Expense | null;
}

export default function AddEditExpenseDialog({ 
  open, 
  onOpenChange, 
  expenseToEdit 
}: AddEditExpenseDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Common expense categories
  const expenseCategories = [
    "Housing", "Utilities", "Food", "Transportation", 
    "Medical", "Insurance", "Entertainment", "Education",
    "Shopping", "Investments", "Travel", "Debt", "Other"
  ];

  // Setup form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userId: 1, // Default user ID
      category: "",
      amount: "",
      date: new Date(),
      isRecurring: false,
      recurrenceFrequency: "monthly",
      notes: "",
    },
  });

  // Load existing Expense data when editing
  useEffect(() => {
    if (expenseToEdit) {
      form.reset({
        userId: expenseToEdit.userId,
        category: expenseToEdit.category,
        amount: String(expenseToEdit.amount),
        date: new Date(expenseToEdit.date),
        isRecurring: expenseToEdit.isRecurring,
        recurrenceFrequency: expenseToEdit.recurrenceFrequency || "monthly",
        notes: expenseToEdit.notes || "",
      });
    } else {
      form.reset({
        userId: 1, // Default user ID
        category: "",
        amount: "",
        date: new Date(),
        isRecurring: false,
        recurrenceFrequency: "monthly",
        notes: "",
      });
    }
  }, [expenseToEdit, user, form]);

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
      
      const res = await apiRequest("POST", "/api/expenses", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add expense: ${error.message}`,
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
      
      const res = await apiRequest("PUT", `/api/expenses/${expenseToEdit?.id}`, formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update expense: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  // Default user ID 
  const defaultUserId = 1;
  
  function onSubmit(values: FormValues) {
    // Always use the default user ID
    values.userId = defaultUserId;
    
    if (expenseToEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{expenseToEdit ? "Edit Expense" : "Add New Expense"}</DialogTitle>
          <DialogDescription>
            Enter details about your expense.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      placeholder="e.g., 5000" 
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
                    <FormLabel>Recurring Expense</FormLabel>
                    <FormDescription>
                      Is this a recurring expense?
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
                {expenseToEdit ? "Update" : "Add"} Expense
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
