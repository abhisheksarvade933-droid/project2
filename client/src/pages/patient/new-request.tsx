import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigation } from '@/components/layout/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/auth';
import { ORGAN_TYPES, PRIORITY_LEVELS } from '@shared/schema';
import { ArrowLeft, Plus } from 'lucide-react';

const requestSchema = z.object({
  organType: z.enum(['heart', 'kidney', 'liver', 'lung', 'pancreas', 'cornea']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  medicalReason: z.string().min(10, 'Please provide detailed medical reason'),
  doctorNotes: z.string().optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

export default function NewRequest() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      organType: undefined,
      priority: 'medium',
      medicalReason: '',
      doctorNotes: '',
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      const response = await apiRequest('POST', '/api/organ-requests', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organ-requests'] });
      toast({
        title: "Request submitted successfully",
        description: "Your organ request has been submitted for review.",
      });
      setLocation('/patient');
    },
    onError: (error: any) => {
      toast({
        title: "Request failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RequestFormData) => {
    createRequestMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="new-request-page">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/patient')}
                className="mr-4"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold">New Organ Request</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Submit Organ Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-newRequest">
                    <FormField
                      control={form.control}
                      name="organType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organ Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-organType">
                                <SelectValue placeholder="Select organ type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {ORGAN_TYPES.map((organ) => (
                                <SelectItem key={organ} value={organ}>
                                  {organ.charAt(0).toUpperCase() + organ.slice(1)}
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
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority Level *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-priority">
                                <SelectValue placeholder="Select priority level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PRIORITY_LEVELS.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level.charAt(0).toUpperCase() + level.slice(1)}
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
                      name="medicalReason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical Reason *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Please provide detailed medical reason for this organ request..."
                              className="min-h-[120px]"
                              {...field}
                              data-testid="textarea-medicalReason"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="doctorNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any additional medical notes or information..."
                              className="min-h-[80px]"
                              {...field}
                              data-testid="textarea-doctorNotes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-4">
                      <Button 
                        type="submit" 
                        disabled={createRequestMutation.isPending}
                        className="flex-1"
                        data-testid="button-submit"
                      >
                        {createRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setLocation('/patient')}
                        data-testid="button-cancel"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}